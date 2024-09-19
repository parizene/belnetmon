import fs from "fs";
import iconv from "iconv-lite";
import path from "path";
const chalk = require("chalk");

import { validateCsvFile } from "../src/lib/csv/csv-helper";

const main = async () => {
  const dir = "./csv";
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fileName = file.name;
    const filePath = path.join(dir, fileName);
    const fileBuffer: Buffer = await fs.promises.readFile(filePath);
    const fileContent = iconv.decode(fileBuffer, "windows-1251");
    const errors = await validateCsvFile(fileName, fileContent);

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
