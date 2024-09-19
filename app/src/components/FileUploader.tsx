"use client";

import { cn } from "@/lib/utils";
import { ChangeEvent, useRef, useState } from "react";

import { FILE_NAME_PREFIXES, MAX_FILE_SIZE, MAX_FILES_COUNT } from "@/config";
import { FileValidationError } from "@/lib/csv/csv-helper";
import LoadingProgress from "./LoadingProgress";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

type FileValidationResult = {
  fileName: string;
  errors: FileValidationError[];
};

interface FileUploaderProps {
  onUploadSuccess: (data: FileValidationResult[]) => void;
  onFilesSelected: () => void;
  className?: string;
}

export default function FileUploader({
  onUploadSuccess,
  onFilesSelected,
  className = "",
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    onFilesSelected();

    if (!fileInput.files || fileInput.files.length === 0) {
      toast({
        title: "Error",
        description:
          "No files were uploaded. Please provide at least one CSV file.",
      });
      e.target.value = "";
      return;
    } else if (fileInput.files.length > MAX_FILES_COUNT) {
      toast({
        title: "Error",
        description: `You have uploaded too many files. The maximum number of allowed files is ${MAX_FILES_COUNT}.`,
      });
      e.target.value = "";
      return;
    }

    const maxFileSize = MAX_FILE_SIZE;
    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];

      if (file.size > maxFileSize) {
        toast({
          title: "Error",
          description: `File ${
            file.name
          } is too large. The maximum allowed size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          } MB.`,
        });
        e.target.value = "";
        return;
      }

      if (!file.name.endsWith(".csv") || file.type !== "text/csv") {
        toast({
          title: "Error",
          description: `File ${file.name} is not a valid CSV file. Please upload a valid CSV file.`,
        });
        e.target.value = "";
        return;
      }

      if (!FILE_NAME_PREFIXES.some((prefix) => file.name.startsWith(prefix))) {
        toast({
          title: "Error",
          description: `File ${file.name} has an invalid name. Please ensure it follows the required naming convention.`,
        });
        e.target.value = "";
        return;
      }
    }

    setLoading(true);

    const formData = new FormData();
    Array.from(fileInput.files).forEach((file) => {
      formData.append("files[]", file);
    });

    try {
      const res = await fetch("/api/validator", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        toast({
          title: "Error",
          description: `Upload failed: ${
            errorResponse.error || "An error occurred"
          }`,
        });
        return;
      }

      const response = await res.json();
      onUploadSuccess(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("", className)}>
      <div className="flex flex-row items-center justify-center">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          onClick={handleUploadButtonClick}
          disabled={loading}
        >
          Upload CSV files
        </Button>
      </div>
      {loading && <LoadingProgress className="mt-4" />}
    </div>
  );
}
