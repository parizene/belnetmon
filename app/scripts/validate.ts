import fs from "fs";
import path from "path";
const chalk = require("chalk");

import { validateCsvFile } from "../src/lib/csv/csv-helper";
import { FILE_NAME_PREFIXES } from "../src/config";

const main = async () => {
  const dir = "./csv";
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fileName = file.name;

    if (!FILE_NAME_PREFIXES.some((prefix) => fileName.startsWith(prefix))) {
      continue;
    }

    const filePath = path.join(dir, fileName);
    const fileBuffer: Buffer = await fs.promises.readFile(filePath);
    const errors = await validateCsvFile(fileName, fileBuffer);

    if (errors.length) {
      console.log(chalk.blue(`\n${file.name}`));
      errors.forEach((error) => {
        if (error.type === "row_validation") {
          console.log(
            chalk.red(
              `Errors [${error.errorColumns.join(", ")}] on line ${
                error.lineNumber
              }: ${JSON.stringify(error.row, null, 2)}`,
            ),
          );
        } else if (error.type === "parsing") {
          console.log(chalk.red(error.errorMsg));
        }
      });
    }
  }
};

main();
