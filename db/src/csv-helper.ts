import { parse } from "@fast-csv/parse";
import { format, isValid, parse as parseDate } from "date-fns";
import fs from "fs";

import { CsvDataModel } from "./csv-data-model";

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
        ...(index !== 0 ? [Number(part)] : Array.from(part).map(Number))
      );
    }
  });
  return result;
};

export const getCsvParseStream = () => {
  return parse({
    delimiter: ";",
    ignoreEmpty: true,
    trim: true,
    comment: "/",
    quote: null,
    headers: true,
  });
};

export const parseCsv = async (filePath: string): Promise<CsvDataModel[]> => {
  return new Promise((resolve, reject) => {
    const rows: CsvDataModel[] = [];
    fs.createReadStream(filePath)
      .pipe(getCsvParseStream())
      .on("error", reject)
      .on("data", (row: CsvDataModel) => rows.push(row))
      .on("end", () => resolve(rows));
  });
};
