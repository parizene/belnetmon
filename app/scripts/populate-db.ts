require("dotenv").config();

import fs from "fs";
import iconv from "iconv-lite";
import path from "path";
import { Client } from "pg";

import { Cell, PrismaClient } from "@prisma/client";
import { CsvDataModel } from "../src/lib/csv/csv-data-model";
import {
  getDate,
  getSectors,
  parseCsv,
  parseStringToNumber,
} from "../src/lib/csv/csv-helper";

if (!process.env.SCRIPTS_DATABASE_URL) {
  throw new Error(
    "SCRIPTS_DATABASE_URL is not defined in the environment variables.",
  );
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SCRIPTS_DATABASE_URL,
    },
  },
});

const db = new Client({
  connectionString: process.env.SCRIPTS_DATABASE_URL,
});

db.connect()
  .then(async () => {
    await populateDb();
    shutdown();
  })
  .catch((err) => {
    console.warn(err);
    shutdown(1);
  });

const shutdown = (exitCode = 0) => {
  db.end()
    .then(() => prisma.$disconnect())
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

const populateDb = async () => {
  const t1 = performance.now();

  const cells: Array<Omit<Cell, "id">> = [];

  const dir = "./csv";
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);

    let rows: Array<CsvDataModel | undefined> = [];
    try {
      const fileBuffer: Buffer = await fs.promises.readFile(filePath);
      const fileContent = iconv.decode(fileBuffer, "windows-1251");
      rows = await parseCsv(fileContent);
    } catch (error) {
      console.error(error);
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) {
        continue;
      }

      const isLteA1 = row.CB === "v";

      const match = row.REM.match(/\(A1 (\d+)\)/);
      const lteA1Cid = match ? parseStringToNumber(match[1]) : null;

      const isRanSharing = row.CB === "RAN Sharing";

      // GSM, DCS, 3G, U900
      // LTE: B20 (800), B3 (1800), B7 (2600)

      cells.push({
        operator: row.OPR,
        area: row.AREA,
        city: row.CITY,
        cb: isLteA1 || isRanSharing || row.CB === "" ? null : row.CB,
        lac: parseStringToNumber(row.LAC),
        cid: parseStringToNumber(row.CID),
        sectors_gsm_b20: getSectors(row.GSM),
        sectors_dcs: getSectors(row.DCS),
        lac_3g_b3: parseStringToNumber(row["3G L"]),
        cid_3g_b3: parseStringToNumber(row["3G C"]),
        sectors_3g_b3: getSectors(row["3G S"]),
        lac_u900_b7: parseStringToNumber(row["U-L"]),
        cid_u900_b7: parseStringToNumber(row.U900),
        sectors_u900_b7: getSectors(row["U-S"]),
        is_lte_a1: isLteA1,
        lte_a1_cid: lteA1Cid,
        is_ran_sharing: isRanSharing,
        date: getDate(row.DATE),
        address: row.ADDR,
        remark: row.REM,
        latitude: parseStringToNumber(row.OZIN),
        longitude: parseStringToNumber(row.OZIE),
      });
    }
  }

  try {
    await prisma.cell.createMany({
      data: cells,
    });
    console.info(
      `Successfully populated database in ${performance.now() - t1}ms`,
    );
  } catch (error) {
    console.error("Error during bulk insert:", error);
  }
};
