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
}

// Selection state for comparison configuration
export interface SpreadsheetSelection {
  spreadsheetId: string;
  selectedSheets: string[]; // Sheet names
  selectedColumns: ColumnSelection[];
  selectedRows: number[]; // Row indices
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
  elementIdentifier: string | number; // Column header or row index
}

export interface ComparisonTarget {
  spreadsheetId: string;
  sheetName: string;
  elementType: ComparisonElementType;
  elementIdentifier: string | number;
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
  sourceLocation: string;
  targetLocation: string;
}

export interface ComparisonMismatch {
  sourceValue: any;
  targetValue: any;
  sourceLocation: string;
  targetLocation: string;
  reason: string;
}
