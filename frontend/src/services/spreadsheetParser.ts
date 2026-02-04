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
        
        // Get the actual range of the worksheet to determine max columns and rows
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        // Physical column/row extent so we don't miss columns or rows outside !ref
        const maxCol = this.getPhysicalColumnCount(worksheet, range);
        const maxRowFromRange = this.getPhysicalRowCount(worksheet, range);
        
        // Convert to JSON with header: 1, but ensure we get all columns
        // Use blankRows: false and raw: false to preserve all cells
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          defval: '',
          blankrows: false,
          raw: false
        }) as any[][];
        
        // Pad all rows to match the actual column count from the range
        const paddedData = jsonData.map(row => {
          const padded = [...(row || [])];
          while (padded.length < maxCol) {
            padded.push(undefined);
          }
          return padded;
        });
        
        // Detect merged header rows
        const headerRowCount = this.detectHeaderRowCount(worksheet, paddedData);
        
        return this.parseSheet(sheetName, paddedData, maxRowFromRange, headerRowCount);
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
   * Compute physical column count so we don't miss columns outside !ref.
   * Uses the maximum of: (1) worksheet used range (!ref), (2) merge ranges (!merges), (3) cell keys.
   */
  private getPhysicalColumnCount(
    worksheet: XLSX.WorkSheet,
    range: { s: { r: number; c: number }; e: { r: number; c: number } }
  ): number {
    let maxCol = range.e.c + 1;
    const merges = worksheet['!merges'] as Array<{ s: { c: number }; e: { c: number } }> | undefined;
    if (merges && Array.isArray(merges)) {
      for (const m of merges) {
        maxCol = Math.max(maxCol, m.e.c + 1);
      }
    }
    const cellRefPattern = /^[A-Z]+[0-9]+$/i;
    for (const key of Object.keys(worksheet)) {
      if (key.startsWith('!')) continue;
      if (!cellRefPattern.test(key)) continue;
      try {
        const decoded = XLSX.utils.decode_range(key);
        maxCol = Math.max(maxCol, decoded.e.c + 1);
      } catch {
        // ignore invalid keys
      }
    }
    return maxCol;
  }

  /**
   * Compute physical row count so merged/empty rows are included.
   * Uses the maximum of: (1) worksheet used range (!ref), (2) merge ranges (!merges), (3) cell keys.
   */
  private getPhysicalRowCount(
    worksheet: XLSX.WorkSheet,
    range: { s: { r: number; c: number }; e: { r: number; c: number } }
  ): number {
    let maxRow = range.e.r + 1;

    // Merged ranges can extend beyond !ref; include their end row
    const merges = worksheet['!merges'] as Array<{ s: { r: number }; e: { r: number } }> | undefined;
    if (merges && Array.isArray(merges)) {
      for (const m of merges) {
        maxRow = Math.max(maxRow, m.e.r + 1);
      }
    }

    // Cell keys (e.g. A1, B14) may extend beyond !ref; include the max row from any key
    const cellRefPattern = /^[A-Z]+[0-9]+$/i;
    for (const key of Object.keys(worksheet)) {
      if (key.startsWith('!')) continue;
      if (!cellRefPattern.test(key)) continue;
      try {
        const decoded = XLSX.utils.decode_range(key);
        maxRow = Math.max(maxRow, decoded.e.r + 1);
      } catch {
        // ignore invalid keys
      }
    }

    return maxRow;
  }

  /**
   * Detect the number of merged rows at the top of the spreadsheet.
   * Only skips merged cells starting at row 0 (Excel row 1).
   * Returns the count of rows to skip (merged rows only).
   * If no merges start at row 0, returns 0 (no rows to skip).
   */
  private detectHeaderRowCount(worksheet: XLSX.WorkSheet, paddedData: any[][]): number {
    const merges = worksheet['!merges'] as Array<{ s: { r: number; c: number }; e: { r: number; c: number } }> | undefined;
    if (!merges || !Array.isArray(merges)) {
      return 0; // No merged cells detected, no rows to skip
    }
    
    // Find all merges that start at row 0 (Excel row 1)
    let maxMergedRow = -1;
    for (const merge of merges) {
      if (merge.s.r === 0) {
        // This merge starts at row 0, track how far it extends
        maxMergedRow = Math.max(maxMergedRow, merge.e.r);
      }
    }
    
    if (maxMergedRow === -1) {
      return 0; // No merges at row 0, no rows to skip
    }
    
    // Skip all merged rows (e.g., if rows 0-1 are merged, skip 2 rows)
    return maxMergedRow + 1;
  }
  
  /**
   * Parse a single sheet's data into structured format.
   * @param maxRowFromRange - Optional physical row count from worksheet range (includes empty/merged rows).
   *        When set, used for metadata.rowCount so the UI shows the correct row count even when
   *        sheet_to_json drops completely empty rows.
   */
  private parseSheet(name: string, rawData: any[][], maxRowFromRange?: number, headerRowCount: number = 1): SpreadsheetSheet {
    if (!rawData || rawData.length === 0) {
      return {
        name,
        columns: [],
        rows: [],
        metadata: {
          rowCount: maxRowFromRange ?? 0,
          columnCount: 0,
          headerRowCount
        }
      };
    }

    // Headers from first row (for row data keys)
    // headerRowCount is always >= 1 (detected merged headers or defaults to 1)
    const headers = rawData[0] || [];
    // Columns: only include a column if any cell in that column has content (any form of value)
    const columns = this.extractColumnsWithContent(rawData, headers);
    
    // Parse data rows: skip detected header rows (including merged ones)
    // headerRowCount tells us how many rows to skip (1 = single header, 2+ = merged headers)
    const rows = this.extractRows(rawData.slice(headerRowCount), headers);
    
    // Row count: use the larger of (1) parsed data length and (2) worksheet range row count.
    // This ensures that when the sheet has empty/merged rows (e.g. row 2 empty), the UI
    // still shows the correct physical row count (e.g. 14) even if sheet_to_json returns
    // fewer rows (e.g. 13) because it skips completely blank rows.
    const rowCountFromData = rawData.length;
    const actualRowCount = maxRowFromRange != null && maxRowFromRange > rowCountFromData
      ? maxRowFromRange
      : rowCountFromData;
    
    return {
      name,
      columns,
      rows,
      metadata: {
        rowCount: actualRowCount,
        columnCount: columns.length,
        headerRowCount
      }
    };
  }
  
  /**
   * Return true if a cell holds any form of content (value/syntax).
   */
  private cellHasContent(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  }

  /**
   * Extract column definitions only for columns that have at least one cell with content.
   * Scans every cell in each column; if any row has content there, the column is included.
   */
  private extractColumnsWithContent(rawData: any[][], headers: any[]): ColumnDefinition[] {
    const maxColIndex = Math.max(0, ...rawData.map(row => ((row && row.length) ? row.length : 0) - 1));
    const columns: ColumnDefinition[] = [];
    for (let colIndex = 0; colIndex <= maxColIndex; colIndex++) {
      const hasContent = rawData.some(row => this.cellHasContent((row || [])[colIndex]));
      if (!hasContent) continue;
      const header = headers[colIndex];
      let headerStr: string;
      if (header === null || header === undefined) {
        headerStr = `Column ${colIndex + 1}`;
      } else {
        const trimmed = String(header).trim();
        headerStr = trimmed === '' ? `Column ${colIndex + 1}` : trimmed;
      }
      columns.push({
        index: colIndex,
        header: headerStr,
        dataType: 'mixed'
      });
    }
    return columns;
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
          
          // Row is already padded to match headers length
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
