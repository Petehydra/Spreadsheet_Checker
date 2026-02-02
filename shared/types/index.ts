/**
 * Shared Types
 * 
 * Types that are used by both frontend and backend.
 * No framework-specific code should be placed here.
 */

export interface FileResult {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface UploadPayload {
  files: File[];
  spreadsheetId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

// Spreadsheet structure after parsing
export interface ParsedSpreadsheet {
  id: string;
  fileName: string;
  fileSize: number; // Original file size in bytes
  sheets: SpreadsheetSheet[];
  uploadedAt: string;
}

export interface SpreadsheetSheet {
  name: string;
  columns: ColumnDefinition[];
  rows: RowData[];
  metadata: SheetMetadata;
}

export interface ColumnDefinition {
  index: number;
  header: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'mixed';
}

export interface RowData {
  index: number;
  data: Record<string, any>;
}

export interface SheetMetadata {
  rowCount: number;
  columnCount: number;
  headerRowCount?: number; // Number of header rows (including merged ones), defaults to 1 if headers exist
}

// Selection state for comparison configuration
export interface SpreadsheetSelection {
  spreadsheetId: string;
  isSelected: boolean; // Whether the spreadsheet checkbox is checked
  selectedSheets: string[]; // Sheet names (only one can be selected)
  selectedColumns: ColumnSelection[];
  selectedRows: number[]; // Row indices
  hasHeader?: boolean | null; // Whether the spreadsheet has a header row (null = not set)
}

export interface ColumnSelection {
  sheetName: string;
  columnIndex: number;
  columnHeader: string;
}

// Comparison rule definitions
export type ComparisonElementType = 'column' | 'row';
export type ComparisonMethod = 'equals' | 'contains' | 'lookup' | 'validate';

export interface ComparisonRule {
  id: string;
  stepNumber: number;
  elementType: ComparisonElementType;
  method: ComparisonMethod;
  source: ComparisonSource;
  target: ComparisonTarget;
  storeResult?: boolean; // For multi-step workflows
}

export interface ComparisonSource {
  spreadsheetId: string;
  sheetName: string;
  elementType: ComparisonElementType;
  elementIdentifier: string | number; // Column index or row index
  /** When elementType is 'column': true = column has a header row (skip first value when comparing) */
  hasHeader?: boolean | null;
}

export interface ComparisonTarget {
  spreadsheetId: string;
  sheetName: string;
  elementType: ComparisonElementType;
  elementIdentifier: string | number;
  /** When elementType is 'column': true = column has a header row (skip first value when comparing) */
  hasHeader?: boolean | null;
}

// Results structure
export interface ComparisonResults {
  executedAt: string;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  details: RuleResult[];
}

export interface RuleResult {
  ruleId: string;
  stepNumber: number;
  status: 'passed' | 'failed' | 'error';
  matchCount: number;
  mismatchCount: number;
  errorMessage?: string;
  matches: ComparisonMatch[];
  mismatches: ComparisonMismatch[];
}

export interface ComparisonMatch {
  sourceValue: any;
  targetValue: any;
  /** Spreadsheet file name for the source (e.g. "Reference.xlsx") */
  sourceSpreadsheet?: string;
  /** Spreadsheet file name for the target */
  targetSpreadsheet?: string;
}

export interface ComparisonMismatch {
  sourceValue: any;
  targetValue: any;
  reason: string;
  /** Spreadsheet file name for the source */
  sourceSpreadsheet?: string;
  /** Spreadsheet file name for the target */
  targetSpreadsheet?: string;
}
