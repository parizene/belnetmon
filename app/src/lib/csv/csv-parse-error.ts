export class CsvParseError extends Error {
  lineNumber: number;

  constructor(message: string, lineNumber: number) {
    super(`Error on line ${lineNumber}: ${message}`);
    this.lineNumber = lineNumber;
    this.name = "CsvParseError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CsvParseError);
    }
  }
}