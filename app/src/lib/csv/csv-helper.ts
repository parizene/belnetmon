import { parse } from "@fast-csv/parse";
import { format, isValid, parse as parseDate } from "date-fns";
import fs from "fs";

import { CsvDataModel } from "./csv-data-model";
import { CsvParseError } from "./csv-parse-error";

const isKindValid = (obj: CsvDataModel) => {
  if (!obj.KIND) {
    return true;
  }

  return "$" === obj.KIND;
};

const isOprValid = (obj: CsvDataModel) => {
  if (!obj.OPR) {
    return true;
  }

  return ["V", "M", "B", "4"].includes(obj.OPR);
};

const isAreaValid = (obj: CsvDataModel) => {
  if (!obj.AREA) {
    return true;
  }

  return [
    "BRO",
    "BR.",
    "GOO",
    "GO.",
    "GRO",
    "GR.",
    "MIO",
    "MI.",
    "MOO",
    "MO.",
    "VIO",
    "VI.",
  ].includes(obj.AREA);
};

const isDateValid = (obj: CsvDataModel) => {
  if (!obj.DATE) {
    return true;
  }

  return getDate(obj.DATE);
};

const isLocationValid = (
  obj: CsvDataModel,
): { isValid: boolean; errorColumns: string[] } => {
  const errorColumns: string[] = [];

  if (!obj.OZIN && !obj.OZIE) {
    return { isValid: true, errorColumns };
  }

  const latitude = parseStringToNumber(obj.OZIN);
  const longitude = parseStringToNumber(obj.OZIE);

  if (!latitude || latitude <= 51 || latitude >= 57) {
    errorColumns.push("OZIN");
  }

  if (!longitude || longitude <= 23 || longitude >= 33) {
    errorColumns.push("OZIE");
  }

  return { isValid: errorColumns.length === 0, errorColumns };
};

export function checkRowValidity(row: CsvDataModel): string[] {
  const errorColumns: string[] = [];

  if (!isKindValid(row)) {
    errorColumns.push("KIND");
  }

  if (!isOprValid(row)) {
    errorColumns.push("OPR");
  }

  if (!isAreaValid(row)) {
    errorColumns.push("AREA");
  }

  if (!isDateValid(row)) {
    errorColumns.push("DATE");
  }

  const locationCheck = isLocationValid(row);
  if (!locationCheck.isValid) {
    errorColumns.push(...locationCheck.errorColumns);
  }

  return errorColumns;
}

export const parseStringToNumber = (str: string): number | undefined => {
  const num = Number(str);
  return !str || Number.isNaN(num) ? undefined : num;
};

export const getDate = (dateText: string): string | undefined => {
  let parsedDate = parseDate(dateText, "dd.MM.yy", new Date());

  if (isValid(parsedDate)) {
    return format(parsedDate, "yyyy-MM-dd");
  }

  parsedDate = parseDate(dateText, "yyyy", new Date());

  if (isValid(parsedDate)) {
    return format(parsedDate, "yyyy-MM-dd");
  }
};

export const getSectors = (sectorsText: string): number[] => {
  const result: number[] = [];
  const parts = sectorsText.replace(/\s+/g, "").split(":");
  parts.forEach((part, index) => {
    if (part) {
      result.push(
        ...(index !== 0 ? [Number(part)] : Array.from(part).map(Number)),
      );
    }
  });
  return result;
};

export const getCsvParseStream = () => {
  return parse({
    delimiter: ";",
    trim: true,
    quote: null,
    headers: true,
  });
};

export const isValidRow = (row: CsvDataModel) => {
  const firstColumn = row.KIND;
  if (
    firstColumn &&
    (firstColumn.startsWith("/") || firstColumn.startsWith("\\"))
  ) {
    return false;
  }

  const isEmptyRow = Object.values(row).every((value) => value === "");
  if (isEmptyRow) {
    return false;
  }
  return true;
};

export const parseCsv = async (
  filePath: string,
): Promise<Array<CsvDataModel | undefined>> => {
  return new Promise((resolve, reject) => {
    const rows: Array<CsvDataModel | undefined> = [];
    let lineNumber = 1; // header
    const expectedColumnCount = 22;
    fs.createReadStream(filePath)
      .pipe(getCsvParseStream())
      .on("error", (error) => {
        reject(new CsvParseError(error.message, lineNumber + 1));
      })
      .on("headers", (headers: string[]) => {
        if (headers.length !== expectedColumnCount) {
          reject(
            new CsvParseError(
              `Unexpected Error: column header mismatch expected: ${expectedColumnCount} columns got: ${headers.length}`,
              lineNumber,
            ),
          );
        }
      })
      .on("data", (row: CsvDataModel) => {
        lineNumber++;

        if (isValidRow(row)) {
          rows.push(row);
        } else {
          rows.push(undefined);
        }
      })
      .on("end", () => resolve(rows));
  });
};
