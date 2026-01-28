import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { RuleBuilder } from "@/components/RuleBuilder";
import { RulesList } from "@/components/RulesList";
import { Button } from "@/components/ui/button";
import { useComparisonEngine } from "@/hooks/useComparisonEngine";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

export default function ComparisonConfig() {
  const { selections, comparisonRules } = useSpreadsheet();
  const { executeComparison, isExecuting } = useComparisonEngine();
  const navigate = useNavigate();
  
  const selectedCount = selections.reduce((acc, sel) => 
    acc + sel.selectedSheets.length, 0
  );
  
  if (selectedCount < 2) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-8">
          <Alert>
            <AlertDescription>
              Please select elements from at least 2 spreadsheets or sheets before configuring comparisons.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate('/selection')} 
            className="mt-4"
          >
            ← Back to Selection
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Configure Comparison Rules</h1>
        
        <p className="text-secondary-text mb-6">
          Build comparison rules using the spreadsheets, sheets, columns, and rows you selected.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Add New Rule</h2>
            <RuleBuilder />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Configured Rules ({comparisonRules.length})</h2>
            <RulesList />
          </div>
        </div>
        
        <div className="mt-8 flex gap-4">
          <Button 
            onClick={executeComparison} 
            disabled={comparisonRules.length === 0 || isExecuting}
            size="lg"
          >
            {isExecuting ? 'Executing...' : 'Execute Comparison'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/selection')}
          >
            ← Change Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
