import fs from "fs";
import path from "path";
const chalk = require("chalk");

import { CsvDataModel } from "./csv-data-model";
import {
  isAreaValid,
  isDateValid,
  isKindValid,
  isLocationValid,
  isOprValid,
  parseCsv,
} from "./csv-helper";

const main = async () => {
  const dir = "./csv";
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  const result: any = {};
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

    result[file.name] = {
      kindErrorsCount: 0,
      operatorErrorsCount: 0,
      areaErrorsCount: 0,
      dateErrorsCount: 0,
      locationErrorsCount: 0,
    };
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!isKindValid(row)) {
        result[file.name].kindErrorsCount++;
        console.log("isKindValid", i, row);
      }

      if (!isOprValid(row)) {
        result[file.name].operatorErrorsCount++;
        console.log("isOprValid", i, row);
      }

      if (!isAreaValid(row)) {
        result[file.name].areaErrorsCount++;
        console.log("isAreaValid", i, row);
      }

      if (!isDateValid(row)) {
        result[file.name].dateErrorsCount++;
        console.log("isDateValid", i, row);
      }

      if (!isLocationValid(row)) {
        result[file.name].locationErrorsCount++;
        console.log("isLocationValid", i, row);
      }
    }
  }

  const filteredResult: any = {};
  for (const fileName in result) {
    if (Object.values(result[fileName]).some((value) => value !== 0)) {
      filteredResult[fileName] = result[fileName];
    }
  }
  console.log(chalk.green(JSON.stringify(filteredResult, null, 2)));
};

main();
