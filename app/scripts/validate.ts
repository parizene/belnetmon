import fs from "fs";
const chalk = require("chalk");

import { validateCsvFile } from "../src/lib/csv/csv-helper";

const main = async () => {
  const dir = "./csv";
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const errors = await validateCsvFile(dir, file.name);

    if (errors.length) {
      console.log(chalk.blue(`\n${file.name}`));
      errors.forEach((error) => {
        if (error.row && error.errorColumns) {
          console.log(
            chalk.red(
              `Errors [${error.errorColumns.join(", ")}] on line ${
                error.lineNumber
              }: ${JSON.stringify(error.row, null, 2)}`,
            ),
          );
        } else if (error.errorMsg) {
          console.log(chalk.red(error.errorMsg));
        }
      });
    }
  }
};

main();
