import * as XLSX from 'xlsx';
import type { 
  ParsedSpreadsheet, 
  SpreadsheetSheet, 
  ColumnDefinition, 
  RowData,
  SheetMetadata
} from '../../../shared/types';

/**
 * SpreadsheetParser Service
 * 
 * Handles client-side parsing of spreadsheet files (.xlsx, .xls, .csv)
 * using the xlsx library. All processing happens in the browser.
 */
export class SpreadsheetParser {
  /**
   * Parse a spreadsheet file and extract all sheets with their data
   */
  async parseFile(file: File): Promise<ParsedSpreadsheet> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const sheets: SpreadsheetSheet[] = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
        
        return this.parseSheet(sheetName, jsonData);
      });
      
      return {
        id: this.generateId(),
        fileName: file.name,
        fileSize: file.size,
        sheets,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to parse file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Parse a single sheet's data into structured format
   */
  private parseSheet(name: string, rawData: any[][]): SpreadsheetSheet {
    if (!rawData || rawData.length === 0) {
      return {
        name,
        columns: [],
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0
        }
      };
    }

    // Extract column headers from first row
    const headers = rawData[0] || [];
    const columns = this.extractColumns(headers);
    
    // Parse data rows (skip header row)
    const rows = this.extractRows(rawData.slice(1), headers);
    
    return {
      name,
      columns,
      rows,
      metadata: {
        rowCount: rows.length,
        columnCount: columns.length
      }
    };
  }
  
  /**
   * Extract column definitions with type detection
   */
  private extractColumns(headers: any[]): ColumnDefinition[] {
    return headers.map((header, index) => {
      // Convert header to string, handle empty headers and empty strings
      let headerStr: string;
      if (header === null || header === undefined) {
        headerStr = `Column ${index + 1}`;
      } else {
        const trimmed = String(header).trim();
        headerStr = trimmed === '' ? `Column ${index + 1}` : trimmed;
      }
      
      return {
        index,
        header: headerStr,
        dataType: 'mixed' // Type detection can be enhanced later
      };
    });
  }
  
  /**
   * Extract row data as structured objects
   */
  private extractRows(dataRows: any[][], headers: any[]): RowData[] {
    return dataRows
      .filter(row => row && row.some(cell => cell !== null && cell !== undefined && cell !== ''))
      .map((row, index) => {
        const data: Record<string, any> = {};
        
        headers.forEach((header, colIndex) => {
          // Convert header to string, handle empty headers and empty strings
          let headerKey: string;
          if (header === null || header === undefined) {
            headerKey = `Column ${colIndex + 1}`;
          } else {
            const trimmed = String(header).trim();
            headerKey = trimmed === '' ? `Column ${colIndex + 1}` : trimmed;
          }
          
          data[headerKey] = row[colIndex] !== undefined ? row[colIndex] : null;
        });
        
        return {
          index,
          data
        };
      });
  }
  
  /**
   * Generate unique ID for spreadsheet
   */
  private generateId(): string {
    return `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Detect data type of a value
   */
  private detectDataType(value: any): ColumnDefinition['dataType'] {
    if (value === null || value === undefined || value === '') {
      return 'mixed';
    }
    
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    
    if (typeof value === 'number') {
      return 'number';
    }
    
    if (typeof value === 'string') {
      // Check if it's a date string
      const dateRegex = /^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{2,4}/;
      if (dateRegex.test(value)) {
        return 'date';
      }
      return 'string';
    }
    
    return 'mixed';
  }
}
