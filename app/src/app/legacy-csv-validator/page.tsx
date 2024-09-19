"use client";

import FileUploader from "@/components/FileUploader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { CsvDataModel } from "@/lib/csv/csv-data-model";
import { FileValidationError } from "@/lib/csv/csv-helper";
import React, { useCallback, useState } from "react";

type FileValidationResult = {
  fileName: string;
  errors: FileValidationError[];
};

const LegacyCsvValidator: React.FC = () => {
  const { toast } = useToast();
  const [uploadData, setUploadData] = useState<FileValidationResult[]>([]);

  const handleUploadSuccess = useCallback(
    (data: FileValidationResult[]) => {
      setUploadData(data);

      const filesWithErrors = data.filter((result) => result.errors.length > 0);

      if (filesWithErrors.length === 0) {
        toast({
          title: "Success",
          description: `All ${data.length} file(s) passed validation.`,
        });
      }
    },
    [toast],
  );

  const handleFilesSelected = useCallback(() => {
    setUploadData([]);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <FileUploader
        className="mx-4 my-8"
        onUploadSuccess={handleUploadSuccess}
        onFilesSelected={handleFilesSelected}
      />
      {uploadData.length > 0 && <ErrorTables data={uploadData} />}
    </div>
  );
};

const ErrorTables: React.FC<{ data: FileValidationResult[] }> = ({ data }) => {
  return (
    <>
      {data
        .filter((fileResult) => fileResult.errors.length > 0)
        .map((fileResult, index) => (
          <ErrorTable key={index} fileResult={fileResult} />
        ))}
    </>
  );
};

const ErrorTable: React.FC<{ fileResult: FileValidationResult }> = ({
  fileResult,
}) => {
  return (
    <div className="mb-8">
      <h2 className="mb-2 text-xl font-semibold">{fileResult.fileName}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Line Number</TableHead>
            {fileResult.errors.some((error) => error.type === "parsing") ? (
              <TableHead>Error Message</TableHead>
            ) : (
              <>
                <TableHead>Row Data</TableHead>
                <TableHead>Error Columns</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileResult.errors.map((error, errorIndex) => (
            <ErrorRow key={errorIndex} error={error} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ErrorRow: React.FC<{ error: FileValidationError }> = ({ error }) => {
  return (
    <TableRow>
      <TableCell>{error.lineNumber}</TableCell>
      {error.type === "parsing" ? (
        <TableCell>{error.errorMsg}</TableCell>
      ) : (
        <>
          <TableCell>
            {renderRowDataWithErrors(error.row, error.errorColumns)}
          </TableCell>
          <TableCell>{error.errorColumns.join(", ")}</TableCell>
        </>
      )}
    </TableRow>
  );
};

const renderRowDataWithErrors = (row: CsvDataModel, errorColumns: string[]) => {
  return (
    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {Object.entries(row).map(([key, value], index, array) => {
        const isError = errorColumns.includes(key);
        return (
          <React.Fragment key={key}>
            <span className={isError ? "text-red-600" : "inherit"}>
              {`${key}: ${JSON.stringify(value, null, 2)}`}
            </span>
            {index < array.length - 1 && ", "}
          </React.Fragment>
        );
      })}
    </pre>
  );
};

export default LegacyCsvValidator;
