import { useState, useCallback, DragEvent } from "react";

interface DragDropZoneProps {
  onFilesDropped: (files: File[]) => void;
  acceptedTypes?: string[];
}

const DragDropZone = ({ 
  onFilesDropped, 
  acceptedTypes = [".xlsx", ".xls", ".csv"] 
}: DragDropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return acceptedTypes.includes(ext);
    });

    if (validFiles.length > 0) {
      onFilesDropped(validFiles);
    }
  }, [onFilesDropped, acceptedTypes]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex-1 h-14 rounded-full flex items-center justify-center
        transition-all duration-200 cursor-pointer
        ${isDragOver 
          ? "bg-primary/30" 
          : "bg-primary/20 hover:bg-primary/25"
        }
      `}
    >
      <span className="text-sm font-medium text-foreground/70">
        Drag and drop here
      </span>
    </div>
  );
};

export default DragDropZone;
