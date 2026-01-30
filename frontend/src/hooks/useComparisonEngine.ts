import { useState } from "react";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { ComparisonEngine } from "@/services/comparisonEngine";
import { useToast } from "@/hooks/use-toast";
import type { ComparisonRule } from "../../../shared/types";

export function useComparisonEngine() {
  const [isExecuting, setIsExecuting] = useState(false);
  const { spreadsheets, comparisonRules, setResults } = useSpreadsheet();
  const { toast } = useToast();
  
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
      await new Promise(resolve => setTimeout(resolve, 100));
      const engine = new ComparisonEngine(spreadsheets);
      const results = engine.executeRules(comparisonRules);
      setResults(results);
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

  /** Run comparison with the given rules (e.g. built from Single mode form). Does not use context rules. */
  const executeComparisonWithRules = async (rules: ComparisonRule[]) => {
    if (rules.length === 0) {
      toast({
        title: 'No comparison defined',
        description: 'Please select spreadsheet, sheet, and column or row for source and at least one target.',
        variant: 'destructive'
      });
      return;
    }

    setIsExecuting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const engine = new ComparisonEngine(spreadsheets);
      const results = engine.executeRules(rules);
      setResults(results);
      toast({
        title: 'Comparison complete',
        description: `Executed ${results.totalRules} rule(s). ${results.passedRules} passed, ${results.failedRules} failed.`
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
  
  return { executeComparison, executeComparisonWithRules, isExecuting };
}
