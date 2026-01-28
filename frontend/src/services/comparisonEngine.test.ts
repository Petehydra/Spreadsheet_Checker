import { describe, it, expect } from 'vitest';
import { ComparisonEngine } from './comparisonEngine';
import type { ParsedSpreadsheet, ComparisonRule } from '../../../shared/types';

describe('ComparisonEngine', () => {
  const mockSpreadsheet1: ParsedSpreadsheet = {
    id: 'sheet-1',
    fileName: 'test1.xlsx',
    fileSize: 1024,
    uploadedAt: '2026-01-28T00:00:00.000Z',
    sheets: [{
      name: 'Sheet1',
      columns: [
        { index: 0, header: 'Name', dataType: 'string' },
        { index: 1, header: 'Value', dataType: 'number' }
      ],
      rows: [
        { index: 0, data: { 'Name': 'A', 'Value': 100 } },
        { index: 1, data: { 'Name': 'B', 'Value': 200 } }
      ],
      metadata: { rowCount: 2, columnCount: 2 }
    }]
  };
  
  const mockSpreadsheet2: ParsedSpreadsheet = {
    id: 'sheet-2',
    fileName: 'test2.xlsx',
    fileSize: 2048,
    uploadedAt: '2026-01-28T00:00:00.000Z',
    sheets: [{
      name: 'Sheet1',
      columns: [
        { index: 0, header: 'Name', dataType: 'string' },
        { index: 1, header: 'Amount', dataType: 'number' }
      ],
      rows: [
        { index: 0, data: { 'Name': 'A', 'Amount': 100 } },
        { index: 1, data: { 'Name': 'C', 'Amount': 300 } }
      ],
      metadata: { rowCount: 2, columnCount: 2 }
    }]
  };
  
  describe('executeRules', () => {
    it('should execute comparison rules and return results', () => {
      const engine = new ComparisonEngine([mockSpreadsheet1, mockSpreadsheet2]);
      
      const rules: ComparisonRule[] = [{
        id: 'rule-1',
        stepNumber: 1,
        elementType: 'column',
        method: 'equals',
        source: {
          spreadsheetId: 'sheet-1',
          sheetName: 'Sheet1',
          elementType: 'column',
          elementIdentifier: 0
        },
        target: {
          spreadsheetId: 'sheet-2',
          sheetName: 'Sheet1',
          elementType: 'column',
          elementIdentifier: 0
        }
      }];
      
      const results = engine.executeRules(rules);
      
      expect(results).toHaveProperty('executedAt');
      expect(results).toHaveProperty('totalRules', 1);
      expect(results).toHaveProperty('passedRules');
      expect(results).toHaveProperty('failedRules');
      expect(results).toHaveProperty('details');
      expect(Array.isArray(results.details)).toBe(true);
      expect(results.details.length).toBe(1);
    });
    
    it('should handle errors gracefully', () => {
      const engine = new ComparisonEngine([mockSpreadsheet1]);
      
      const invalidRule: ComparisonRule = {
        id: 'rule-invalid',
        stepNumber: 1,
        elementType: 'column',
        method: 'equals',
        source: {
          spreadsheetId: 'non-existent',
          sheetName: 'Sheet1',
          elementType: 'column',
          elementIdentifier: 0
        },
        target: {
          spreadsheetId: 'sheet-1',
          sheetName: 'Sheet1',
          elementType: 'column',
          elementIdentifier: 0
        }
      };
      
      const results = engine.executeRules([invalidRule]);
      
      expect(results.details[0].status).toBe('error');
      expect(results.details[0].errorMessage).toBeDefined();
    });
  });
  
  describe('comparison methods', () => {
    it('should support equals method', () => {
      const engine = new ComparisonEngine([mockSpreadsheet1, mockSpreadsheet2]);
      
      const rule: ComparisonRule = {
        id: 'rule-equals',
        stepNumber: 1,
        elementType: 'column',
        method: 'equals',
        source: {
          spreadsheetId: 'sheet-1',
          sheetName: 'Sheet1',
          elementType: 'column',
          elementIdentifier: 0
        },
        target: {
          spreadsheetId: 'sheet-2',
          sheetName: 'Sheet1',
          elementType: 'column',
          elementIdentifier: 0
        }
      };
      
      const results = engine.executeRules([rule]);
      const detail = results.details[0];
      
      expect(detail.matchCount).toBeGreaterThanOrEqual(0);
      expect(detail.mismatchCount).toBeGreaterThanOrEqual(0);
    });
  });
});
