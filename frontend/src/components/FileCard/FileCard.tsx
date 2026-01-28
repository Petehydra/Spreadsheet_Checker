import { FileText, X } from "lucide-react";
import type { UploadedFile } from "../../hooks/useFileUpload";

interface FileCardProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

const FileCard = ({ file, onRemove }: FileCardProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-muted rounded-xl">
      <div className="flex-shrink-0">
        <FileText className="w-8 h-8 text-accent" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate text-sm">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
      </div>
      
      <button
        onClick={() => onRemove(file.id)}
        className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Remove file"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default FileCard;
