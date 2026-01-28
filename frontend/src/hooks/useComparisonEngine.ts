import { useState } from "react";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { ComparisonEngine } from "@/services/comparisonEngine";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useComparisonEngine() {
  const [isExecuting, setIsExecuting] = useState(false);
  const { spreadsheets, comparisonRules, setResults } = useSpreadsheet();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const executeComparison = async () => {
    if (comparisonRules.length === 0) {
      toast({
        title: 'No rules configured',
        description: 'Please add at least one comparison rule.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsExecuting(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const engine = new ComparisonEngine(spreadsheets);
      const results = engine.executeRules(comparisonRules);
      
      setResults(results);
      navigate('/results');
      
      toast({
        title: 'Comparison complete',
        description: `Executed ${results.totalRules} rules successfully.`
      });
    } catch (error) {
      toast({
        title: 'Comparison failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  return { executeComparison, isExecuting };
}
