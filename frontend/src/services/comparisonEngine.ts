import type { 
  ComparisonRule, 
  ComparisonResults, 
  ParsedSpreadsheet,
  RuleResult,
  ComparisonMatch,
  ComparisonMismatch,
  ComparisonSource,
  ComparisonTarget
} from '../../../shared/types';

/**
 * ComparisonEngine Service
 * 
 * Executes comparison rules against parsed spreadsheet data.
 * Supports: equals, contains, lookup, and validate methods.
 */
export class ComparisonEngine {
  constructor(private spreadsheets: ParsedSpreadsheet[]) {}

  /** Get spreadsheet file name by id for display in results tables. */
  private getSpreadsheetFileName(spreadsheetId: string): string {
    return this.spreadsheets.find(s => s.id === spreadsheetId)?.fileName ?? 'Unknown';
  }

  /**
   * Convert column index (0-based) to letter(s), e.g. 0 -> A, 26 -> AA
   */
  private columnIndexToLetter(index: number): string {
    let letter = '';
    let n = index;
    while (n >= 0) {
      letter = String.fromCharCode((n % 26) + 65) + letter;
      n = Math.floor(n / 26) - 1;
    }
    return letter;
  }
  
  /**
   * Execute all comparison rules in order
   */
  executeRules(rules: ComparisonRule[]): ComparisonResults {
    // Sort rules by step number
    const sortedRules = [...rules].sort((a, b) => a.stepNumber - b.stepNumber);
    
    const results: RuleResult[] = [];
    const intermediateStorage = new Map<string, any>();
    
    for (const rule of sortedRules) {
      try {
        const result = this.executeRule(rule, intermediateStorage);
        results.push(result);
        
        if (rule.storeResult) {
          intermediateStorage.set(rule.id, result);
        }
      } catch (error) {
        results.push({
          ruleId: rule.id,
          stepNumber: rule.stepNumber,
          status: 'error',
          matchCount: 0,
          mismatchCount: 0,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          matches: [],
          mismatches: []
        });
      }
    }
    
    return {
      executedAt: new Date().toISOString(),
      totalRules: rules.length,
      passedRules: results.filter(r => r.status === 'passed').length,
      failedRules: results.filter(r => r.status === 'failed' || r.status === 'error').length,
      details: results
    };
  }
  
  /**
   * Execute a single comparison rule
   */
  private executeRule(rule: ComparisonRule, storage: Map<string, any>): RuleResult {
    // Get source and target data
    const sourceData = this.getData(rule.source);
    const targetData = this.getData(rule.target);
    
    // Execute comparison based on method
    switch (rule.method) {
      case 'equals':
        return this.compareEquals(sourceData, targetData, rule);
      case 'contains':
        return this.compareContains(sourceData, targetData, rule);
      case 'lookup':
        return this.compareLookup(sourceData, targetData, rule, storage);
      case 'validate':
        return this.compareValidate(sourceData, targetData, rule);
      default:
        throw new Error(`Unknown comparison method: ${rule.method}`);
    }
  }
  
  /**
   * Get data from a spreadsheet source
   */
  private getData(source: ComparisonSource | ComparisonTarget): any[] {
    const spreadsheet = this.spreadsheets.find(s => s.id === source.spreadsheetId);
    if (!spreadsheet) {
      throw new Error(`Spreadsheet not found: ${source.spreadsheetId}`);
    }
    
    const sheet = spreadsheet.sheets.find(sh => sh.name === source.sheetName);
    if (!sheet) {
      throw new Error(`Sheet not found: ${source.sheetName}`);
    }
    
    if (source.elementType === 'column') {
      return this.getColumnData(sheet, source.elementIdentifier, source.hasHeader);
    } else {
      return this.getRowData(sheet, source.elementIdentifier);
    }
  }
  
  /**
   * Extract column data from a sheet.
   * Row counting is based on detected header rows from the spreadsheet metadata, not user input.
   * The parser excludes header rows from sheet.rows, so we calculate Excel row numbers based on
   * the detected headerRowCount from metadata.
   */
  private getColumnData(sheet: any, identifier: string | number, hasHeader?: boolean | null): any[] {
    const columnIndex = typeof identifier === 'number' 
      ? identifier 
      : sheet.columns.findIndex((c: any) => c.header === identifier);
    
    if (columnIndex === -1) {
      throw new Error(`Column not found: ${identifier}`);
    }
    
    const columnHeader = sheet.columns[columnIndex].header;
    const columnLetter = this.columnIndexToLetter(columnIndex);
    
    // sheet.rows contains data rows (header rows already excluded by parser)
    // If user indicates hasHeader = true, skip the first data row (treating it as a header)
    // If hasHeader = false or null, include all data rows
    const rowsToCompare = hasHeader === true ? sheet.rows.slice(1) : sheet.rows;
    
    const data = rowsToCompare.map((row: any) => ({
      value: row.data[columnHeader]
    }));
    
    return data;
  }
  
  /**
   * Extract row data from a sheet
   */
  private getRowData(sheet: any, identifier: string | number): any[] {
    const rowIndex = typeof identifier === 'number' 
      ? identifier 
      : parseInt(String(identifier));
    
    const row = sheet.rows.find((r: any) => r.index === rowIndex);
    if (!row) {
      throw new Error(`Row not found: ${identifier}`);
    }
    
    return Object.entries(row.data).map(([key, value]) => ({
      value
    }));
  }
  
  /**
   * Equals comparison: Check if source values exist in target (value-based, not row-by-row).
   * For columns: each value in the source column is checked against all values in the target column;
   * if found anywhere, it's a match and we report the exact column and row where it was found in the target.
   */
  private compareEquals(sourceData: any[], targetData: any[], rule: ComparisonRule): RuleResult {
    const matches: ComparisonMatch[] = [];
    const mismatches: ComparisonMismatch[] = [];
    const sourceSpreadsheet = this.getSpreadsheetFileName(rule.source.spreadsheetId);
    const targetSpreadsheet = this.getSpreadsheetFileName(rule.target.spreadsheetId);
    
    if (rule.elementType === 'column') {
      // Value-based column comparison: for each source value, check if it exists anywhere in the target column
      for (const sourceItem of sourceData) {
        const found = targetData.find((t: { value: any }) =>
          this.valuesEqual(sourceItem.value, t.value)
        );
        if (found) {
          matches.push({
            sourceValue: sourceItem.value,
            targetValue: found.value,
            sourceSpreadsheet,
            targetSpreadsheet
          });
        } else {
          mismatches.push({
            sourceValue: sourceItem.value,
            targetValue: 'N/A',
            reason: 'Value not found in target column',
            sourceSpreadsheet,
            targetSpreadsheet
          });
        }
      }
    } else {
      // For row comparisons, compare each cell in the row
      for (let i = 0; i < sourceData.length; i++) {
        const sourceItem = sourceData[i];
        const targetItem = targetData[i];
        
        if (!targetItem) {
          mismatches.push({
            sourceValue: sourceItem.value,
            targetValue: 'N/A',
            reason: 'Column not found in target row',
            sourceSpreadsheet,
            targetSpreadsheet
          });
          continue;
        }
        
        if (this.valuesEqual(sourceItem.value, targetItem.value)) {
          matches.push({
            sourceValue: sourceItem.value,
            targetValue: targetItem.value,
            sourceSpreadsheet,
            targetSpreadsheet
          });
        } else {
          mismatches.push({
            sourceValue: sourceItem.value,
            targetValue: targetItem.value,
            reason: 'Values do not match',
            sourceSpreadsheet,
            targetSpreadsheet
          });
        }
      }
    }
    
    const status = mismatches.length === 0 ? 'passed' : 'failed';
    
    return {
      ruleId: rule.id,
      stepNumber: rule.stepNumber,
      status,
      matchCount: matches.length,
      mismatchCount: mismatches.length,
      matches,
      mismatches
    };
  }
  
  /**
   * Contains comparison: Check if target contains source values
   */
  private compareContains(sourceData: any[], targetData: any[], rule: ComparisonRule): RuleResult {
    const matches: ComparisonMatch[] = [];
    const mismatches: ComparisonMismatch[] = [];
    const sourceSpreadsheet = this.getSpreadsheetFileName(rule.source.spreadsheetId);
    const targetSpreadsheet = this.getSpreadsheetFileName(rule.target.spreadsheetId);
    const targetValues = targetData.map(item => item.value);
    
    for (const sourceItem of sourceData) {
      const found = targetValues.some(targetValue => 
        this.valueContains(targetValue, sourceItem.value)
      );
      
      if (found) {
        const matchingTarget = targetData.find(t => 
          this.valueContains(t.value, sourceItem.value)
        );
        
        matches.push({
          sourceValue: sourceItem.value,
          targetValue: matchingTarget?.value,
          sourceSpreadsheet,
          targetSpreadsheet
        });
      } else {
        mismatches.push({
          sourceValue: sourceItem.value,
          targetValue: 'N/A',
          reason: 'Value not found in target',
          sourceSpreadsheet,
          targetSpreadsheet
        });
      }
    }
    
    const status = mismatches.length === 0 ? 'passed' : 'failed';
    
    return {
      ruleId: rule.id,
      stepNumber: rule.stepNumber,
      status,
      matchCount: matches.length,
      mismatchCount: mismatches.length,
      matches,
      mismatches
    };
  }
  
  /**
   * Lookup comparison: Find matching values across datasets
   */
  private compareLookup(sourceData: any[], targetData: any[], rule: ComparisonRule, storage: Map<string, any>): RuleResult {
    const matches: ComparisonMatch[] = [];
    const mismatches: ComparisonMismatch[] = [];
    const sourceSpreadsheet = this.getSpreadsheetFileName(rule.source.spreadsheetId);
    const targetSpreadsheet = this.getSpreadsheetFileName(rule.target.spreadsheetId);
    // Create a lookup map from target data
    const targetMap = new Map<string, any[]>();
    targetData.forEach(item => {
      const key = String(item.value).toLowerCase().trim();
      if (!targetMap.has(key)) {
        targetMap.set(key, []);
      }
      targetMap.get(key)?.push(item);
    });
    
    for (const sourceItem of sourceData) {
      const lookupKey = String(sourceItem.value).toLowerCase().trim();
      const matchingTargets = targetMap.get(lookupKey);
      
      if (matchingTargets && matchingTargets.length > 0) {
        matchingTargets.forEach(target => {
          matches.push({
            sourceValue: sourceItem.value,
            targetValue: target.value,
            sourceSpreadsheet,
            targetSpreadsheet
          });
        });
      } else {
        mismatches.push({
          sourceValue: sourceItem.value,
          targetValue: 'N/A',
          reason: 'No matching value found in target',
          sourceSpreadsheet,
          targetSpreadsheet
        });
      }
    }
    
    const status = mismatches.length === 0 ? 'passed' : 'failed';
    
    return {
      ruleId: rule.id,
      stepNumber: rule.stepNumber,
      status,
      matchCount: matches.length,
      mismatchCount: mismatches.length,
      matches,
      mismatches
    };
  }
  
  /**
   * Validate comparison: Check if source values meet validation criteria
   */
  private compareValidate(sourceData: any[], targetData: any[], rule: ComparisonRule): RuleResult {
    const matches: ComparisonMatch[] = [];
    const mismatches: ComparisonMismatch[] = [];
    const sourceSpreadsheet = this.getSpreadsheetFileName(rule.source.spreadsheetId);
    const targetSpreadsheet = this.getSpreadsheetFileName(rule.target.spreadsheetId);
    // Validation logic: Check if all source values are non-empty and valid
    for (const sourceItem of sourceData) {
      const isValid = sourceItem.value !== null && 
                     sourceItem.value !== undefined && 
                     sourceItem.value !== '';
      
      if (isValid) {
        matches.push({
          sourceValue: sourceItem.value,
          targetValue: 'Valid',
          sourceSpreadsheet,
          targetSpreadsheet
        });
      } else {
        mismatches.push({
          sourceValue: sourceItem.value,
          targetValue: 'Invalid',
          reason: 'Value is empty or invalid',
          sourceSpreadsheet,
          targetSpreadsheet
        });
      }
    }
    
    const status = mismatches.length === 0 ? 'passed' : 'failed';
    
    return {
      ruleId: rule.id,
      stepNumber: rule.stepNumber,
      status,
      matchCount: matches.length,
      mismatchCount: mismatches.length,
      matches,
      mismatches
    };
  }
  
  /**
   * Check if two values are equal (handling different types)
   */
  private valuesEqual(value1: any, value2: any): boolean {
    // Handle null/undefined
    if (value1 === value2) return true;
    if (value1 == null || value2 == null) return false;
    
    // Convert to strings and compare (case-insensitive, trimmed)
    const str1 = String(value1).toLowerCase().trim();
    const str2 = String(value2).toLowerCase().trim();
    
    return str1 === str2;
  }
  
  /**
   * Check if target value contains source value
   */
  private valueContains(targetValue: any, sourceValue: any): boolean {
    if (targetValue == null || sourceValue == null) return false;
    
    const target = String(targetValue).toLowerCase().trim();
    const source = String(sourceValue).toLowerCase().trim();
    
    return target.includes(source);
  }
}
