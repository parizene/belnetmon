import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const chalk = require("chalk");

import { CsvDataModel } from "./csv-data-model";
import { getDate, getSectors, parseCsv } from "./csv-helper";
import { parseStringToNumber } from "./utils";

const prisma = new PrismaClient();

const main = async () => {
  const dir = "./csv";
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    console.log(chalk.blue(file.name));
    const filePath = path.join(dir, file.name);

    let rows: CsvDataModel[] = [];
    try {
      rows = await parseCsv(filePath);
      console.log(`parsed ${rows.length} rows`);
    } catch (error) {
      console.error(error);
    }

    await prisma.cell.createMany({
      data: rows.map((row) => ({
        operator: row.OPR,
        area: row.AREA,
        city: row.CITY,
        cb: row.CB,
        lac: parseStringToNumber(row.LAC),
        cid: parseStringToNumber(row.CID),
        sectors_gsm: getSectors(row.GSM),
        sectors_dcs: getSectors(row.DCS),
        lac_3g: parseStringToNumber(row["3G L"]),
        cid_3g: parseStringToNumber(row["3G C"]),
        sectors_3g: getSectors(row["3G S"]),
        lac_u900: parseStringToNumber(row["U-L"]),
        cid_u900: parseStringToNumber(row.U900),
        sectors_u900: getSectors(row["U-S"]),
        date: getDate(row.DATE),
        address: row.ADDR,
        remark: row.REM,
        latitude: parseStringToNumber(row.OZIN),
        longitude: parseStringToNumber(row.OZIE),
      })),
    });
  }

  const count = await prisma.cell.count();
  console.log(`populated ${count} cells`);
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
