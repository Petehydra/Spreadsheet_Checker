import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SpreadsheetProvider, useSpreadsheet } from './SpreadsheetContext';
import type { ParsedSpreadsheet } from '../../../shared/types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SpreadsheetProvider>{children}</SpreadsheetProvider>
);

describe('SpreadsheetContext', () => {
  const mockSpreadsheet: ParsedSpreadsheet = {
    id: 'test-1',
    fileName: 'test.xlsx',
    fileSize: 512,
    uploadedAt: '2026-01-28T00:00:00.000Z',
    sheets: [{
      name: 'Sheet1',
      columns: [{ index: 0, header: 'Column1', dataType: 'string' }],
      rows: [{ index: 0, data: { 'Column1': 'value1' } }],
      metadata: { rowCount: 1, columnCount: 1 }
    }]
  };
  
  describe('spreadsheet management', () => {
    it('should add spreadsheet to context', () => {
      const { result } = renderHook(() => useSpreadsheet(), { wrapper });
      
      act(() => {
        result.current.addSpreadsheet(mockSpreadsheet);
      });
      
      expect(result.current.spreadsheets).toHaveLength(1);
      expect(result.current.spreadsheets[0]).toEqual(mockSpreadsheet);
    });
    
    it('should remove spreadsheet from context', () => {
      const { result } = renderHook(() => useSpreadsheet(), { wrapper });
      
      act(() => {
        result.current.addSpreadsheet(mockSpreadsheet);
        result.current.removeSpreadsheet('test-1');
      });
      
      expect(result.current.spreadsheets).toHaveLength(0);
    });
    
    it('should clear all spreadsheets', () => {
      const { result } = renderHook(() => useSpreadsheet(), { wrapper });
      
      act(() => {
        result.current.addSpreadsheet(mockSpreadsheet);
        result.current.clearSpreadsheets();
      });
      
      expect(result.current.spreadsheets).toHaveLength(0);
    });
  });
  
  describe('selection management', () => {
    it('should initialize selection when spreadsheet is added', () => {
      const { result } = renderHook(() => useSpreadsheet(), { wrapper });
      
      act(() => {
        result.current.addSpreadsheet(mockSpreadsheet);
      });
      
      expect(result.current.selections).toHaveLength(1);
      expect(result.current.selections[0].spreadsheetId).toBe('test-1');
      expect(result.current.selections[0].selectedSheets).toEqual([]);
    });
    
    it('should update selection', () => {
      const { result } = renderHook(() => useSpreadsheet(), { wrapper });
      
      act(() => {
        result.current.addSpreadsheet(mockSpreadsheet);
        result.current.updateSelection('test-1', { selectedSheets: ['Sheet1'] });
      });
      
      expect(result.current.selections[0].selectedSheets).toEqual(['Sheet1']);
    });
  });
  
  describe('comparison rules management', () => {
    const mockRule: any = {
      id: 'rule-1',
      stepNumber: 1,
      elementType: 'column',
      method: 'equals',
      source: {
        spreadsheetId: 'test-1',
        sheetName: 'Sheet1',
        elementType: 'column',
        elementIdentifier: 0
      },
      target: {
        spreadsheetId: 'test-1',
        sheetName: 'Sheet1',
        elementType: 'column',
        elementIdentifier: 0
      }
    };
    
    it('should add comparison rule', () => {
      const { result } = renderHook(() => useSpreadsheet(), { wrapper });
      
      act(() => {
        result.current.addRule(mockRule);
      });
      
      expect(result.current.comparisonRules).toHaveLength(1);
      expect(result.current.comparisonRules[0]).toEqual(mockRule);
    });
    
    it('should remove comparison rule', () => {
      const { result } = renderHook(() => useSpreadsheet(), { wrapper });
      
      act(() => {
        result.current.addRule(mockRule);
        result.current.removeRule('rule-1');
      });
      
      expect(result.current.comparisonRules).toHaveLength(0);
    });
    
    it('should reorder comparison rules', () => {
      const mockRule2 = { ...mockRule, id: 'rule-2', stepNumber: 2 };
      const { result } = renderHook(() => useSpreadsheet(), { wrapper });
      
      act(() => {
        result.current.addRule(mockRule);
        result.current.addRule(mockRule2);
        result.current.reorderRules(['rule-2', 'rule-1']);
      });
      
      expect(result.current.comparisonRules[0].id).toBe('rule-2');
      expect(result.current.comparisonRules[1].id).toBe('rule-1');
      expect(result.current.comparisonRules[0].stepNumber).toBe(1);
      expect(result.current.comparisonRules[1].stepNumber).toBe(2);
    });
  });
});
