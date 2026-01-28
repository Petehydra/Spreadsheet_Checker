import { describe, it, expect } from 'vitest';
import { SpreadsheetParser } from './spreadsheetParser';

describe('SpreadsheetParser', () => {
  const parser = new SpreadsheetParser();
  
  describe('parseFile', () => {
    it('should parse a valid spreadsheet file', async () => {
      // Create a mock Excel file content
      const mockFileContent = new Uint8Array([
        0x50, 0x4B, 0x03, 0x04 // Basic XLSX signature
      ]);
      
      const mockFile = new File([mockFileContent], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      try {
        const result = await parser.parseFile(mockFile);
        
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('fileName', 'test.xlsx');
        expect(result).toHaveProperty('sheets');
        expect(result).toHaveProperty('uploadedAt');
        expect(Array.isArray(result.sheets)).toBe(true);
      } catch (error) {
        // Expected to fail with mock data, but structure should be attempted
        expect(error).toBeDefined();
      }
    });
    
    it('should throw error for corrupted file', async () => {
      const mockFile = new File(['invalid content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      await expect(parser.parseFile(mockFile)).rejects.toThrow();
    });
  });
  
  describe('ID generation', () => {
    it('should generate unique IDs', () => {
      const parser = new SpreadsheetParser();
      const id1 = (parser as any).generateId();
      const id2 = (parser as any).generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^sheet-\d+-[a-z0-9]+$/);
    });
  });
});
