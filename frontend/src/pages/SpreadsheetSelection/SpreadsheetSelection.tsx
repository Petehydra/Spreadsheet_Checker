import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { SpreadsheetCard } from "@/components/SpreadsheetCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

export default function SpreadsheetSelection() {
  const { spreadsheets, selections } = useSpreadsheet();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleContinue = () => {
    // Validate that at least 2 spreadsheets/sheets are selected
    const selectedCount = selections.reduce((acc, sel) => 
      acc + sel.selectedSheets.length, 0
    );
    
    if (selectedCount < 2) {
      toast({
        title: 'Insufficient selection',
        description: 'Please select elements from at least 2 different spreadsheets or sheets.',
        variant: 'destructive'
      });
      return;
    }
    
    navigate('/config');
  };
  
  if (spreadsheets.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-8">
          <div className="text-center py-12">
            <p className="text-lg text-secondary-text mb-4">
              No spreadsheets uploaded yet. Please upload files first.
            </p>
            <Button onClick={() => navigate('/')}>
              ← Back to Upload
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Select Spreadsheets to Compare</h1>
        
        <p className="text-secondary-text mb-8">
          Choose which spreadsheets, sheets, columns, and rows you want to compare.
          You must select elements from at least 2 different spreadsheets or sheets.
        </p>
        
        <div className="space-y-6">
          {spreadsheets.map(spreadsheet => (
            <SpreadsheetCard
              key={spreadsheet.id}
              spreadsheet={spreadsheet}
            />
          ))}
        </div>
        
        <div className="mt-8 flex gap-4">
          <Button onClick={handleContinue} size="lg">
            Continue to Comparison Configuration →
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            ← Back to Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
