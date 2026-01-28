import { useState, useCallback } from "react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export const useFileUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const validateFile = useCallback((file: File): boolean => {
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    return ACCEPTED_EXTENSIONS.includes(ext);
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(validateFile);
    
    const uploadedFiles: UploadedFile[] = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
  }, [validateFile]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    acceptedExtensions: ACCEPTED_EXTENSIONS,
  };
};
