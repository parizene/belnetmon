require("dotenv").config();

import { format } from "@fast-csv/format";
import fs from "fs";
import MultiStream from "multistream";
import path from "path";
import { Client } from "pg";
import { from as copyFrom } from "pg-copy-streams";
import { Transform } from "stream";

import {
  getCsvParseStream,
  getDate,
  getSectors,
  isValidRow,
  parseStringToNumber,
} from "../src/lib/csv/csv-helper";

const db = new Client({
  connectionString: process.env.POPULATE_DATABASE_URL,
});

db.connect()
  .then(async () => {
    await main();
    shutdown();
  })
  .catch((err) => {
    console.warn(err);
    shutdown(1);
  });

const shutdown = (exitCode = 0) => {
  db.end()
    .then(() => {
      process.exit(exitCode);
    })
    .catch((err) => {
      console.warn(err);
      process.exit(1);
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const getStream = (filename: string) => {
  const parseTransformStream = getCsvParseStream().transform((row: any) => {
    if (!isValidRow(row)) {
      return undefined;
    }

    const sectors_gsm = getSectors(row.GSM);
    const sectors_dcs = getSectors(row.DCS);
    const sectors_3g = getSectors(row["3G S"]);
    const sectors_u900 = getSectors(row["U-S"]);
    return {
      operator: row.OPR,
      area: row.AREA,
      city: row.CITY,
      cb: row.CB,
      lac: parseStringToNumber(row.LAC),
      cid: parseStringToNumber(row.CID),
      sectors_gsm: toPgArrayString(sectors_gsm),
      sectors_dcs: toPgArrayString(sectors_dcs),
      lac_3g: parseStringToNumber(row["3G L"]),
      cid_3g: parseStringToNumber(row["3G C"]),
      sectors_3g: toPgArrayString(sectors_3g),
      lac_u900: parseStringToNumber(row["U-L"]),
      cid_u900: parseStringToNumber(row.U900),
      sectors_u900: toPgArrayString(sectors_u900),
      date: getDate(row.DATE),
      address: row.ADDR,
      remark: row.REM,
      latitude: parseStringToNumber(row.OZIN),
      longitude: parseStringToNumber(row.OZIE),
    };
  });
  const formatStream = format({ headers: false, delimiter: ";" });
  return fs
    .createReadStream(filename)
    .pipe(parseTransformStream)
    .pipe(formatStream);
};

const toPgArrayString = (sectors: number[]) => {
  return "{" + sectors.join(",") + "}";
};

const addNewlineTransform = () =>
  new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk);
      callback();
    },
    flush(callback) {
      this.push("\n");
      callback();
    },
  });

const copy = async (sql: string) => {
  const t1 = performance.now();

  const dir = "./csv";
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  const csvFiles = files
    .filter((file) => file.isFile() && file.name.endsWith(".csv"))
    .map((file) => path.join(dir, file.name));
  const streams = csvFiles.map((filename) =>
    getStream(filename).pipe(addNewlineTransform()),
  );

  const combinedStream = new MultiStream(streams);
  const outputStream = db.query(copyFrom(sql));

  await new Promise((resolve, reject) => {
    combinedStream.pipe(outputStream).on("finish", resolve).on("error", reject);
  });

  console.info(`copy: ${performance.now() - t1}ms`);
};

const exists = async (): Promise<boolean> => {
  const res = await db.query(
    "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cell');",
  );
  return res.rows[0].exists;
};

const main = async () => {
  if (await exists()) {
    console.info("already exists");
    return;
  }

  try {
    await db.query("BEGIN");

    try {
      await db.query(`
        CREATE TABLE cell (
          id SERIAL PRIMARY KEY,
          operator TEXT NOT NULL,
          area TEXT NOT NULL,
          city TEXT,
          cb TEXT,
          lac INTEGER,
          cid INTEGER,
          sectors_gsm INTEGER[],
          sectors_dcs INTEGER[],
          lac_3g INTEGER,
          cid_3g INTEGER,
          sectors_3g INTEGER[],
          lac_u900 INTEGER,
          cid_u900 INTEGER,
          sectors_u900 INTEGER[],
          date DATE,
          address TEXT,
          remark TEXT,
          latitude REAL,
          longitude REAL,
          location geography(Point, 4326)
        );
      `);

      await db.query(`
        CREATE FUNCTION cell_location_fn() RETURNS TRIGGER AS
        $$
        BEGIN
          IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
            NEW.location := geography(ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326));
          ELSE
            NEW.location := NULL;
          END IF;
          RETURN NEW;
        END;
        $$
        LANGUAGE plpgsql;
      `);

      await db.query(`
        CREATE TRIGGER cell_location_tr
        BEFORE INSERT OR UPDATE OF latitude, longitude ON cell
        FOR EACH ROW EXECUTE FUNCTION cell_location_fn();
      `);

      try {
        await copy(`
          COPY cell (operator, area, city, cb, lac, cid, sectors_gsm, sectors_dcs, lac_3g, cid_3g, sectors_3g, lac_u900, cid_u900, sectors_u900, date, address, remark, latitude, longitude)
          FROM STDIN
          WITH CSV DELIMITER ';';
        `);
      } catch (error) {
        console.warn(error);
      }

      await db.query(
        "CREATE INDEX cell_location_idx ON cell USING GIST (location);",
      );

      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.warn(error);
  }
};
