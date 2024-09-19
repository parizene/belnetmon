import { NextRequest, NextResponse } from "next/server";

import { FILE_NAME_PREFIXES, MAX_FILE_SIZE, MAX_FILES_COUNT } from "@/config";
import { FileValidationError, validateCsvFile } from "@/lib/csv/csv-helper";

type FileValidationResult = {
  fileName: string;
  errors: FileValidationError[];
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files[]");

  if (!files.length) {
    return NextResponse.json(
      {
        success: false,
        error: "No files were uploaded. Please provide at least one CSV file.",
      },
      { status: 400 },
    );
  }

  if (files.length > MAX_FILES_COUNT) {
    return NextResponse.json(
      {
        success: false,
        error: `You have uploaded too many files. The maximum number of allowed files is ${MAX_FILES_COUNT}.`,
      },
      { status: 400 },
    );
  }

  const validationResults: FileValidationResult[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    const fileSizeError = validateFileSize(file);
    if (fileSizeError) {
      return NextResponse.json(
        { success: false, error: fileSizeError },
        { status: 400 },
      );
    }

    const fileTypeError = validateFileType(file);
    if (fileTypeError) {
      return NextResponse.json(
        { success: false, error: fileTypeError },
        { status: 400 },
      );
    }

    const fileNameError = validateFileName(file);
    if (fileNameError) {
      return NextResponse.json(
        { success: false, error: fileNameError },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const errors = await validateCsvFile(file.name, buffer);
    validationResults.push({ fileName: file.name, errors });
  }

  return NextResponse.json({
    success: true,
    data: validationResults,
  });
}

function validateFileSize(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return `File ${file.name} is too large. The maximum allowed size is ${
      MAX_FILE_SIZE / (1024 * 1024)
    } MB.`;
  }
  return null;
}

function validateFileType(file: File) {
  if (!file.name.endsWith(".csv") || file.type !== "text/csv") {
    return `File ${file.name} is not a valid CSV file. Please upload a valid CSV file.`;
  }
  return null;
}

function validateFileName(file: File) {
  if (!FILE_NAME_PREFIXES.some((prefix) => file.name.startsWith(prefix))) {
    return `File ${file.name} has an invalid name. Please ensure it follows the required naming convention.`;
  }
  return null;
}
