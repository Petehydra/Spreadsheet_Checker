import { forwardRef } from "react";
import type { UploadedFile } from "../../hooks/useFileUpload";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Info } from "lucide-react";

interface UploadedFilesListProps {
  files: UploadedFile[];
  onRemoveFile: (id: string) => void;
}

const UploadedFilesList = forwardRef<HTMLElement, UploadedFilesListProps>(({ files, onRemoveFile }, ref) => {
  if (files.length === 0) return null;

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-8 py-8">
      <div className="bg-card rounded-2xl shadow-sm border border-border">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="files" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Selected Files ({files.length})
                </h2>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm text-left">
                        There is no requirement to include all uploaded files in the comparison. For instance, you may upload five files while selecting only two for comparison.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-b-0">
                    {/* File Name */}
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{file.name}</p>
                    </div>
                    
                    {/* Trash Icon */}
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="flex-shrink-0 p-2 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove file"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
});

UploadedFilesList.displayName = "UploadedFilesList";

export default UploadedFilesList;
