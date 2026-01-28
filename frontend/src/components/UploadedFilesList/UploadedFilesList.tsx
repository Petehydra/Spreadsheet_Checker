import FileCard from "@/components/FileCard";
import type { UploadedFile } from "../../hooks/useFileUpload";

interface UploadedFilesListProps {
  files: UploadedFile[];
  onRemoveFile: (id: string) => void;
}

const UploadedFilesList = ({ files, onRemoveFile }: UploadedFilesListProps) => {
  if (files.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-8 py-8">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Selected Files ({files.length})
        </h2>
        <div className="space-y-3">
          {files.map((file) => (
            <FileCard key={file.id} file={file} onRemove={onRemoveFile} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UploadedFilesList;
