import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadedFilesList from "@/components/UploadedFilesList";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const Home = () => {
  const { addFiles, isUploading } = useFileUpload();
  const { spreadsheets, removeSpreadsheet } = useSpreadsheet();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection onFilesSelected={addFiles} isUploading={isUploading} />
      
      {spreadsheets.length > 0 && (
        <>
          <UploadedFilesList 
            files={spreadsheets.map(s => ({
              id: s.id,
              name: s.fileName,
              size: s.fileSize,
              type: 'spreadsheet',
              file: null as any // File object not needed after parsing
            }))} 
            onRemoveFile={removeSpreadsheet} 
          />
          
          <div className="container mx-auto px-8 py-4">
            {spreadsheets.length === 1 ? (
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <strong>Upload at least one more spreadsheet</strong> to start comparing. 
                  You currently have {spreadsheets.length} spreadsheet uploaded.
                </AlertDescription>
              </Alert>
            ) : spreadsheets.length >= 2 ? (
              <div className="space-y-4">
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Ready to compare!</strong> You have {spreadsheets.length} spreadsheets uploaded. 
                    Click the button below to select which elements to compare.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={() => navigate('/selection')}
                  size="lg"
                  className="w-full md:w-auto"
                  disabled={isUploading}
                >
                  Select Spreadsheets to Compare →
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
