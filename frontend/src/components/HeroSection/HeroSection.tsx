import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DragDropZone from "@/components/DragDropZone";
import IllustrationCard from "@/components/IllustrationCard";

interface HeroSectionProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
}

const HeroSection = ({ onFilesSelected, isUploading = false }: HeroSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <section className="pt-12 lg:pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6 max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Spreadsheet Checker
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The Spreadsheet Checker tool helps you quickly compare spreadsheets whether it's columns or rows.
            </p>
            
            {/* Upload controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col gap-2">
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={handleButtonClick}
                  className="w-full sm:w-auto"
                  disabled={isUploading}
                >
                  {isUploading ? 'Processing...' : 'Upload files'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground/70">*.csv *.xlsx</p>
              </div>
              <DragDropZone onFilesDropped={onFilesSelected} />
            </div>
          </div>

          {/* Right content - Illustration */}
          <IllustrationCard />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
