import { useState, useCallback } from "react";
import { SpreadsheetParser } from "@/services/spreadsheetParser";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { useToast } from "@/hooks/use-toast";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { addSpreadsheet } = useSpreadsheet();
  const { toast } = useToast();
  const parser = new SpreadsheetParser();

  const validateFile = useCallback((file: File): boolean => {
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    return ACCEPTED_EXTENSIONS.includes(ext);
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) {
      return;
    }

    const validFiles = newFiles.filter(validateFile);
    const invalidFiles = newFiles.filter(f => !validateFile(f));
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Invalid files',
        description: `${invalidFiles.length} file(s) were skipped. Please upload only .xlsx, .xls, or .csv files.`,
        variant: 'destructive'
      });
    }
    
    if (validFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let failureCount = 0;
    
    try {
      for (const file of validFiles) {
        try {
          const parsed = await parser.parseFile(file);
          addSpreadsheet(parsed);
          successCount++;
          
          toast({
            title: 'File uploaded',
            description: `${file.name} has been processed successfully. ${parsed.sheets.length} sheet(s) found.`
          });
        } catch (fileError) {
          failureCount++;
          toast({
            title: 'Upload failed',
            description: `Failed to process ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`,
            variant: 'destructive'
          });
        }
      }
      
      // Summary toast if multiple files
      if (validFiles.length > 1) {
        if (successCount > 0 && failureCount === 0) {
          toast({
            title: 'All files uploaded',
            description: `Successfully processed ${successCount} file(s).`
          });
        } else if (successCount > 0 && failureCount > 0) {
          toast({
            title: 'Partial upload',
            description: `Processed ${successCount} file(s) successfully, ${failureCount} failed.`,
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Upload error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, addSpreadsheet, parser, toast]);

  return {
    addFiles,
    isUploading,
    acceptedExtensions: ACCEPTED_EXTENSIONS,
  };
};
