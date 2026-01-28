import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { 
  ParsedSpreadsheet, 
  ComparisonRule, 
  ComparisonResults,
  SpreadsheetSelection
} from '../../../shared/types';

interface SpreadsheetContextType {
  // Spreadsheet management
  spreadsheets: ParsedSpreadsheet[];
  addSpreadsheet: (spreadsheet: ParsedSpreadsheet) => void;
  removeSpreadsheet: (id: string) => void;
  clearSpreadsheets: () => void;
  
  // Selection management
  selections: SpreadsheetSelection[];
  updateSelection: (spreadsheetId: string, selection: Partial<SpreadsheetSelection>) => void;
  clearSelections: () => void;
  getSelectedSpreadsheets: () => ParsedSpreadsheet[];
  
  // Comparison rules management
  comparisonRules: ComparisonRule[];
  addRule: (rule: ComparisonRule) => void;
  updateRule: (id: string, updates: Partial<ComparisonRule>) => void;
  removeRule: (id: string) => void;
  reorderRules: (ruleIds: string[]) => void;
  clearRules: () => void;
  
  // Results management
  results: ComparisonResults | null;
  setResults: (results: ComparisonResults) => void;
  clearResults: () => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export function SpreadsheetProvider({ children }: { children: ReactNode }) {
  const [spreadsheets, setSpreadsheets] = useState<ParsedSpreadsheet[]>([]);
  const [selections, setSelections] = useState<SpreadsheetSelection[]>([]);
  const [comparisonRules, setComparisonRules] = useState<ComparisonRule[]>([]);
  const [results, setResults] = useState<ComparisonResults | null>(null);
  
  // Spreadsheet management
  const addSpreadsheet = useCallback((spreadsheet: ParsedSpreadsheet) => {
    setSpreadsheets(prev => [...prev, spreadsheet]);
    
    // Initialize empty selection for this spreadsheet
    setSelections(prev => [...prev, {
      spreadsheetId: spreadsheet.id,
      selectedSheets: [],
      selectedColumns: [],
      selectedRows: []
    }]);
  }, []);
  
  const removeSpreadsheet = useCallback((id: string) => {
    setSpreadsheets(prev => prev.filter(s => s.id !== id));
    setSelections(prev => prev.filter(s => s.spreadsheetId !== id));
    
    // Clear rules that reference this spreadsheet
    setComparisonRules(prev => prev.filter(rule => 
      rule.source.spreadsheetId !== id && rule.target.spreadsheetId !== id
    ));
  }, []);
  
  const clearSpreadsheets = useCallback(() => {
    setSpreadsheets([]);
    setSelections([]);
    setComparisonRules([]);
    setResults(null);
  }, []);
  
  // Selection management
  const updateSelection = useCallback((spreadsheetId: string, selection: Partial<SpreadsheetSelection>) => {
    setSelections(prev => {
      const existing = prev.find(s => s.spreadsheetId === spreadsheetId);
      
      if (!existing) {
        return [...prev, {
          spreadsheetId,
          selectedSheets: selection.selectedSheets || [],
          selectedColumns: selection.selectedColumns || [],
          selectedRows: selection.selectedRows || []
        }];
      }
      
      return prev.map(s => 
        s.spreadsheetId === spreadsheetId 
          ? { ...s, ...selection }
          : s
      );
    });
  }, []);
  
  const clearSelections = useCallback(() => {
    setSelections(spreadsheets.map(s => ({
      spreadsheetId: s.id,
      selectedSheets: [],
      selectedColumns: [],
      selectedRows: []
    })));
    setComparisonRules([]);
  }, [spreadsheets]);
  
  const getSelectedSpreadsheets = useCallback(() => {
    const selectedIds = selections
      .filter(s => s.selectedSheets.length > 0)
      .map(s => s.spreadsheetId);
    
    return spreadsheets.filter(s => selectedIds.includes(s.id));
  }, [spreadsheets, selections]);
  
  // Comparison rules management
  const addRule = useCallback((rule: ComparisonRule) => {
    setComparisonRules(prev => [...prev, rule]);
  }, []);
  
  const updateRule = useCallback((id: string, updates: Partial<ComparisonRule>) => {
    setComparisonRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  }, []);
  
  const removeRule = useCallback((id: string) => {
    setComparisonRules(prev => prev.filter(rule => rule.id !== id));
  }, []);
  
  const reorderRules = useCallback((ruleIds: string[]) => {
    setComparisonRules(prev => {
      const ruleMap = new Map(prev.map(r => [r.id, r]));
      return ruleIds
        .map(id => ruleMap.get(id))
        .filter((r): r is ComparisonRule => r !== undefined)
        .map((rule, index) => ({ ...rule, stepNumber: index + 1 }));
    });
  }, []);
  
  const clearRules = useCallback(() => {
    setComparisonRules([]);
  }, []);
  
  // Results management
  const handleSetResults = useCallback((newResults: ComparisonResults) => {
    setResults(newResults);
  }, []);
  
  const clearResults = useCallback(() => {
    setResults(null);
  }, []);
  
  const value: SpreadsheetContextType = {
    spreadsheets,
    addSpreadsheet,
    removeSpreadsheet,
    clearSpreadsheets,
    
    selections,
    updateSelection,
    clearSelections,
    getSelectedSpreadsheets,
    
    comparisonRules,
    addRule,
    updateRule,
    removeRule,
    reorderRules,
    clearRules,
    
    results,
    setResults: handleSetResults,
    clearResults
  };
  
  return (
    <SpreadsheetContext.Provider value={value}>
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheet must be used within SpreadsheetProvider');
  }
  return context;
}
