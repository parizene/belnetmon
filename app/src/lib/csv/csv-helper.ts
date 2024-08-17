import { parse } from "@fast-csv/parse";
import { isValid, parse as parseDate } from "date-fns";
import fs from "fs";

import { CsvDataModel } from "./csv-data-model";
import { CsvParseError } from "./csv-parse-error";

const isKindValid = (obj: CsvDataModel): boolean => {
  if (!obj.KIND) {
    return true;
  }

  return "$" === obj.KIND;
};

export const validOprValues = ["V", "M", "B", "4"];

const isOprValid = (obj: CsvDataModel): boolean => {
  if (!obj.OPR) {
    return true;
  }

  return validOprValues.includes(obj.OPR);
};

export const validAreaValues = [
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
];

const isAreaValid = (obj: CsvDataModel): boolean => {
  if (!obj.AREA) {
    return true;
  }

  return validAreaValues.includes(obj.AREA);
};

const isDateValid = (obj: CsvDataModel): boolean => {
  if (!obj.DATE) {
    return true;
  }

  return getDate(obj.DATE) !== null;
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

export function isLteCidValid(area: string, cid: string) {
  if (
    (area === "BR." && !cid.startsWith("1")) ||
    (area === "BRO" && !cid.startsWith("1")) ||
    (area === "VI." && !cid.startsWith("2")) ||
    (area === "VIO" && !cid.startsWith("2")) ||
    (area === "GO." && !cid.startsWith("3")) ||
    (area === "GOO" && !cid.startsWith("3")) ||
    (area === "GR." && !cid.startsWith("4")) ||
    (area === "GRO" && !cid.startsWith("4")) ||
    (area === "MO." && !cid.startsWith("6")) ||
    (area === "MOO" && !cid.startsWith("6")) ||
    (area === "MI." && !cid.startsWith("7")) ||
    (area === "MIO" && !cid.startsWith("7"))
  ) {
    return false;
  }
  return true;
}

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

export const parseStringToNumber = (str: string): number | null => {
  const num = Number(str);
  return !str || Number.isNaN(num) ? null : num;
};

export const getDate = (dateText: string): Date | null => {
  let parsedDate = parseDate(dateText, "dd.MM.yy", new Date());

  if (isValid(parsedDate)) {
    return parsedDate;
  }

  parsedDate = parseDate(dateText, "yyyy", new Date());

  if (isValid(parsedDate)) {
    return parsedDate;
  }

  return null;
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
