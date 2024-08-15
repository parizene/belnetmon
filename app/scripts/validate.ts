import fs from "fs";
import path from "path";
const chalk = require("chalk");

import { CsvDataModel } from "../src/lib/csv/csv-data-model";
import { checkRowValidity, parseCsv } from "../src/lib/csv/csv-helper";

const main = async () => {
  const dir = "./csv";
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);

    let rows: Array<CsvDataModel | undefined> = [];
    try {
      rows = await parseCsv(filePath);
    } catch (error) {
      console.log(chalk.red(error));
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) {
        continue;
      }

      const lineNumber = i + 2;

      const errorColumns = checkRowValidity(row);
      const error =
        errorColumns.length > 0 ? { lineNumber, row, errorColumns } : undefined;

      if (error) {
        console.log(chalk.blue(`\n${file.name}`));
        console.log(
          chalk.red(
            `Errors [${error.errorColumns.join(", ")}] on line ${
              error.lineNumber
            }: ${JSON.stringify(error.row, null, 2)}`,
          ),
        );
      }
    }
  }
};

main();
