export class CsvParseError extends Error {
  lineNumber: number;

  constructor(message: string, lineNumber: number) {
    super(message);
    this.lineNumber = lineNumber;
    this.name = "CsvParseError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CsvParseError);
    }
  }
}
