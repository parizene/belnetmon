import { parse } from "@fast-csv/parse";
import { isValid, parse as parseDate } from "date-fns";
import { Readable } from "stream";

import { CsvDataModel } from "./csv-data-model";
import { CsvParseError } from "./csv-parse-error";

export type ParsingError = {
  type: "parsing";
  lineNumber: number;
  errorMsg: string;
};

export type RowValidationError = {
  type: "row_validation";
  lineNumber: number;
  row: CsvDataModel;
  errorColumns: string[];
};

export type FileValidationError = ParsingError | RowValidationError;

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
  const errorColumns = new Set<string>();

  if (!isKindValid(row)) {
    errorColumns.add("KIND");
  }

  if (!isOprValid(row)) {
    errorColumns.add("OPR");
  }

  if (!isAreaValid(row)) {
    errorColumns.add("AREA");
  }

  if (!isDateValid(row)) {
    errorColumns.add("DATE");
  }

  const locationCheck = isLocationValid(row);
  if (!locationCheck.isValid) {
    locationCheck.errorColumns.forEach((col) => errorColumns.add(col));
  }

  if (row.OPR === "4") {
    if (getSectors(row.DCS).length) {
      errorColumns.add("DCS");
    }

    let cidGsm: string | undefined;
    const sectorsGsm = getSectors(row.GSM);
    if (sectorsGsm.length) {
      cidGsm = row.CID;

      if (!row.LAC || !cidGsm) {
        errorColumns.add("LAC");
        errorColumns.add("CID");
      }
      if (!isLteCidValid(row.AREA, cidGsm)) {
        errorColumns.add("CID");
      }
    }

    let cid3g: string | undefined;
    const sectors3g = getSectors(row["3G S"]);
    if (sectors3g.length) {
      cid3g = row["3G C"];

      if (!row["3G L"] || !cid3g) {
        errorColumns.add("3G L");
        errorColumns.add("3G C");
      }
      if (!isLteCidValid(row.AREA, cid3g)) {
        errorColumns.add("3G C");
      }
    }

    let cidU900: string | undefined;
    const sectorsU900 = getSectors(row["U-S"]);
    if (sectorsU900.length) {
      cidU900 = row.U900;

      if (!row["U-L"] || !cidU900) {
        errorColumns.add("U-L");
        errorColumns.add("U900");
      }
      if (!isLteCidValid(row.AREA, cidU900)) {
        errorColumns.add("U900");
      }
    }

    if (!areDefinedStringsEqual([cidGsm, cid3g, cidU900])) {
      errorColumns.add("CID");
      errorColumns.add("3G C");
      errorColumns.add("U900");
    }
  } else if (row.CB === "v") {
    errorColumns.add("OPR");
  }

  return Array.from(errorColumns);
}

function areDefinedStringsEqual(strings: Array<string | undefined>): boolean {
  const definedStrings = strings.filter(
    (str) => str !== undefined && str !== "",
  );
  if (definedStrings.length === 0) {
    return true;
  }

  return definedStrings.every((str) => str === definedStrings[0]);
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
  fileContent: string,
): Promise<Array<CsvDataModel | undefined>> => {
  return new Promise((resolve, reject) => {
    const rows: Array<CsvDataModel | undefined> = [];
    let lineNumber = 1; // header
    const expectedColumnCount = 22;
    Readable.from(fileContent)
      .pipe(getCsvParseStream())
      .on("error", (error) => {
        reject(new CsvParseError(error.message, lineNumber + 1));
      })
      .on("headers", (headers: string[]) => {
        if (headers.length !== expectedColumnCount) {
          reject(
            new CsvParseError(
              `Header row mismatch: expected ${expectedColumnCount} columns, but found ${headers.length} in the header. Please ensure the header row contains the correct number of columns.`,
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

export const validateCsvFile = async (
  fileName: string,
  fileContent: string,
): Promise<FileValidationError[]> => {
  const errors: FileValidationError[] = [];

  let rows: Array<CsvDataModel | undefined> = [];
  try {
    rows = await parseCsv(fileContent);
  } catch (error) {
    if (error instanceof Error && error.name === "CsvParseError") {
      const csvError = error as CsvParseError;
      errors.push({
        type: "parsing",
        lineNumber: csvError.lineNumber,
        errorMsg: csvError.message,
      });
    } else {
      console.error("Unexpected error type:", error);
      throw error;
    }
    return errors;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const lineNumber = i + 2;
    const errorColumns = new Set<string>(checkRowValidity(row));

    if (!isOprValidForFileName(fileName, row)) {
      errorColumns.add("OPR");
    }

    if (errorColumns.size) {
      errors.push({
        type: "row_validation",
        lineNumber,
        row,
        errorColumns: Array.from(errorColumns),
      });
    }
  }

  return errors;
};

const FILE_NAME_PREFIX_TO_OPR_MAP: { [key: string]: string } = {
  "4_": "4",
  b_: "B",
  m_: "M",
  v_: "V",
};

const isOprValidForFileName = (
  fileName: string,
  obj: CsvDataModel,
): boolean => {
  for (const prefix in FILE_NAME_PREFIX_TO_OPR_MAP) {
    if (
      fileName.startsWith(prefix) &&
      obj.OPR !== FILE_NAME_PREFIX_TO_OPR_MAP[prefix]
    ) {
      return false;
    }
  }
  return true;
};
