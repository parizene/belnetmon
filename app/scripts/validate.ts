import fs from "fs";
import path from "path";
const chalk = require("chalk");

import { CsvDataModel } from "../src/lib/csv/csv-data-model";
import {
  checkRowValidity,
  getSectors,
  isLteCidValid,
  parseCsv,
} from "../src/lib/csv/csv-helper";

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
      if (
        (file.name.startsWith("4_") && row.OPR !== "4") ||
        (file.name.startsWith("b_") && row.OPR !== "B") ||
        (file.name.startsWith("m_") && row.OPR !== "M") ||
        (file.name.startsWith("v_") && row.OPR !== "V")
      ) {
        errorColumns.push("OPR");
      }

      if (row.OPR === "4") {
        if (getSectors(row.DCS).length) {
          errorColumns.push("DCS");
        }

        let cidGsm: string | undefined;
        const sectorsGsm = getSectors(row.GSM);
        if (sectorsGsm.length) {
          cidGsm = row.CID;

          if (!row.LAC || !cidGsm) {
            errorColumns.push("LAC");
            errorColumns.push("CID");
          }
          if (!isLteCidValid(row.AREA, cidGsm)) {
            errorColumns.push("CID");
          }
        }

        let cid3g: string | undefined;
        const sectors3g = getSectors(row["3G S"]);
        if (sectors3g.length) {
          cid3g = row["3G C"];

          if (!row["3G L"] || !cid3g) {
            errorColumns.push("3G L");
            errorColumns.push("3G C");
          }
          if (!isLteCidValid(row.AREA, cid3g)) {
            errorColumns.push("3G C");
          }
        }

        let cidU900: string | undefined;
        const sectorsU900 = getSectors(row["U-S"]);
        if (sectorsU900.length) {
          cidU900 = row.U900;
          
          if (!row["U-L"] || !cidU900) {
            errorColumns.push("U-L");
            errorColumns.push("U900");
          }
          if (!isLteCidValid(row.AREA, cidU900)) {
            errorColumns.push("U900");
          }
        }

        if (!areDefinedStringsEqual([cidGsm, cid3g, cidU900])) {
          errorColumns.push("CID");
          errorColumns.push("3G C");
          errorColumns.push("U900");
        }
      } else if (row.CB === "v") {
        errorColumns.push("OPR");
      }

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

function areDefinedStringsEqual(strings: Array<string | undefined>): boolean {
  const definedStrings = strings.filter(
    (str) => str !== undefined && str !== "",
  );
  if (definedStrings.length === 0) {
    return true;
  }

  return definedStrings.every((str) => str === definedStrings[0]);
}

main();
