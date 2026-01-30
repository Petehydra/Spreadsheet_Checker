import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadedFilesList from "@/components/UploadedFilesList";
import ComparisonBuilder from "@/components/ComparisonBuilder";
import { ComparisonResultsView } from "@/components/ComparisonResultsView";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Home = () => {
  const { addFiles, isUploading } = useFileUpload();
  const { spreadsheets, removeSpreadsheet, results, comparisonRules } = useSpreadsheet();
  const filesListRef = useRef<HTMLElement>(null);
  const comparisonSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Auto-scroll to files list when 2+ spreadsheets are uploaded
  useEffect(() => {
    if (spreadsheets.length >= 2 && filesListRef.current && !hasScrolledRef.current) {
      setTimeout(() => {
        filesListRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        hasScrolledRef.current = true;
      }, 300);
    }
    if (spreadsheets.length < 2) {
      hasScrolledRef.current = false;
    }
  }, [spreadsheets.length]);

  // Scroll to results section when comparison completes (results appear on same page)
  useEffect(() => {
    if (results && resultsSectionRef.current) {
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [results]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection onFilesSelected={addFiles} isUploading={isUploading} />
      
      {spreadsheets.length > 0 && (
        <>
          <UploadedFilesList 
            ref={filesListRef}
            files={spreadsheets.map(s => ({
              id: s.id,
              name: s.fileName,
              size: s.fileSize,
              type: 'spreadsheet',
              file: null as any // File object not needed after parsing
            }))} 
            onRemoveFile={removeSpreadsheet} 
          />
          
          {spreadsheets.length === 1 && (
            <div className="container mx-auto px-8 py-4">
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <strong>Upload at least one more spreadsheet</strong> to start comparing. 
                  You currently have {spreadsheets.length} spreadsheet uploaded.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {spreadsheets.length >= 2 && (
            <div ref={comparisonSectionRef}>
              <ComparisonBuilder />
            </div>
          )}

          {results && (
            <div ref={resultsSectionRef}>
              <ComparisonResultsView
                results={results}
                comparisonRules={comparisonRules}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
