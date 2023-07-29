import { ParserOptionsArgs, parse } from "@fast-csv/parse";
import { isValid, parse as parseDate } from "date-fns";
import fs from "fs";

import { CsvDataModel } from "./csv-data-model";
import { parseStringToNumber } from "./utils";

export const isKindValid = (obj: CsvDataModel) => {
  if (!obj.KIND) {
    return true;
  }

  return "$" === obj.KIND;
};

export const isOprValid = (obj: CsvDataModel) => {
  if (!obj.OPR) {
    return true;
  }

  return ["V", "M", "B", "4"].includes(obj.OPR);
};

export const isAreaValid = (obj: CsvDataModel) => {
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

export const isDateValid = (obj: CsvDataModel) => {
  if (!obj.DATE) {
    return true;
  }

  return getDate(obj.DATE);
};

export const isLocationValid = (obj: CsvDataModel) => {
  if (!obj.OZIN && !obj.OZIE) {
    return true;
  }

  const latitude = parseStringToNumber(obj.OZIN);
  const longitude = parseStringToNumber(obj.OZIE);
  return (
    latitude &&
    longitude &&
    latitude > 51 &&
    latitude < 57 &&
    longitude > 23 &&
    longitude < 33
  );
};

export const getDate = (dateText: string): Date | undefined => {
  let parsedDate = parseDate(dateText, "dd.MM.yy", new Date());
  if (isValid(parsedDate)) {
    return parsedDate;
  }
  parsedDate = parseDate(dateText, "yyyy", new Date());
  if (isValid(parsedDate)) {
    return parsedDate;
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

export const parseCsv = async (filePath: string): Promise<CsvDataModel[]> => {
  return new Promise((resolve, reject) => {
    const rows: CsvDataModel[] = [];
    const options: ParserOptionsArgs = {
      delimiter: ";",
      ignoreEmpty: true,
      trim: true,
      comment: "/",
      quote: null,
      headers: true,
    };

    fs.createReadStream(filePath)
      .pipe(parse(options))
      .on("error", reject)
      .on("data", (row: CsvDataModel) => rows.push(row))
      .on("end", () => resolve(rows));
  });
};
