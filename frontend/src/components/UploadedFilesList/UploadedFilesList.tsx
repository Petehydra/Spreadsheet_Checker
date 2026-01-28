import { useState, useMemo, forwardRef } from "react";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import type { UploadedFile } from "../../hooks/useFileUpload";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFilesListProps {
  files: UploadedFile[];
  onRemoveFile: (id: string) => void;
}

const UploadedFilesList = forwardRef<HTMLElement, UploadedFilesListProps>(({ files, onRemoveFile }, ref) => {
  const { spreadsheets, selections, updateSelection } = useSpreadsheet();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, string | null>>({});

  // Get selected spreadsheet IDs
  const selectedSpreadsheetIds = useMemo(() => {
    return selections
      .filter(s => s.selectedSheets.length > 0)
      .map(s => s.spreadsheetId);
  }, [selections]);

  // Get sheets from selected spreadsheets
  const getAvailableSheets = (spreadsheetId: string) => {
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
    if (!spreadsheet) return [];
    
    return spreadsheet.sheets.map(sheet => ({
      spreadsheetId: spreadsheet.id,
      spreadsheetName: spreadsheet.fileName,
      sheetName: sheet.name,
      rowCount: sheet.metadata.rowCount,
      columnCount: sheet.metadata.columnCount
    }));
  };

  // Toggle spreadsheet selection
  const toggleSpreadsheet = (spreadsheetId: string) => {
    const selection = selections.find(s => s.spreadsheetId === spreadsheetId);
    const isCurrentlySelected = selection?.isSelected || false;
    
    // Toggle the spreadsheet selection state
    updateSelection(spreadsheetId, { 
      isSelected: !isCurrentlySelected,
      // Clear sheets when deselecting spreadsheet
      selectedSheets: !isCurrentlySelected ? [] : (selection?.selectedSheets || [])
    });
  };

  // Select single sheet (only one sheet can be selected at a time)
  const selectSheet = (spreadsheetId: string, sheetName: string) => {
    // Only allow one sheet to be selected - replace any existing selection
    updateSelection(spreadsheetId, { selectedSheets: [sheetName] });
  };

  const isSpreadsheetSelected = (spreadsheetId: string) => {
    const selection = selections.find(s => s.spreadsheetId === spreadsheetId);
    return selection?.isSelected || false;
  };

  const isSheetSelected = (spreadsheetId: string, sheetName: string) => {
    const selection = selections.find(s => s.spreadsheetId === spreadsheetId);
    return selection?.selectedSheets.includes(sheetName) || false;
  };

  const getSheetsDisplayText = (spreadsheetId: string) => {
    const selection = selections.find(s => s.spreadsheetId === spreadsheetId);
    const selectedSheets = selection?.selectedSheets || [];
    
    if (selectedSheets.length === 0) return "Select Sheet";
    
    // Show the selected sheet name (only one can be selected)
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
    const selectedSheetName = selectedSheets[0];
    return selectedSheetName || "Select Sheet";
  };

  // Convert column index to letter (0 = A, 1 = B, 25 = Z, 26 = AA, etc.)
  const indexToColumnLetter = (index: number): string => {
    let result = '';
    let num = index;
    do {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26) - 1;
    } while (num >= 0);
    return result;
  };

  // Get columns from selected sheets (only columns with actual data)
  const getAvailableColumns = (spreadsheetId: string) => {
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
    const selection = selections.find(s => s.spreadsheetId === spreadsheetId);
    
    if (!spreadsheet || !selection || selection.selectedSheets.length === 0) return [];
    
    const columns: Array<{ columnIndex: number; columnLetter: string; sheetName: string }> = [];
    
    selection.selectedSheets.forEach(sheetName => {
      const sheet = spreadsheet.sheets.find(s => s.name === sheetName);
      if (!sheet || sheet.rows.length === 0) return;
      
      // First, collect all header keys that exist in the actual row data
      const allDataKeys = new Set<string>();
      sheet.rows.forEach(row => {
        Object.keys(row.data).forEach(key => allDataKeys.add(key));
      });
      
      // Create a map from header keys to column indices
      // Start with column definitions
      const headerToIndex = new Map<string, number>();
      sheet.columns.forEach(col => {
        headerToIndex.set(col.header, col.index);
        // Also map trimmed versions
        if (col.header.trim() !== col.header) {
          headerToIndex.set(col.header.trim(), col.index);
        }
        // If header is empty string, also map to default format
        if (col.header === '' || col.header.trim() === '') {
          headerToIndex.set(`Column ${col.index + 1}`, col.index);
        }
      });
      
      // Map "Column X" format headers from data keys
      allDataKeys.forEach(headerKey => {
        const match = headerKey.match(/^Column (\d+)$/);
        if (match) {
          const colIndex = parseInt(match[1], 10) - 1;
          if (colIndex >= 0) {
            headerToIndex.set(headerKey, colIndex);
          }
        }
        // Also handle empty string headers - map them to their column index
        if (headerKey === '' || headerKey.trim() === '') {
          // Try to find which column index this empty header corresponds to
          const columnDef = sheet.columns.find(c => c.header === '' || c.header.trim() === '');
          if (columnDef) {
            headerToIndex.set(headerKey, columnDef.index);
            headerToIndex.set(`Column ${columnDef.index + 1}`, columnDef.index);
          }
        }
      });
      
      // Now check each column index up to the maximum
      const maxColIndex = Math.max(
        sheet.metadata.columnCount - 1,
        sheet.columns.length > 0 ? Math.max(...sheet.columns.map(c => c.index)) : -1,
        ...Array.from(headerToIndex.values())
      );
      
      // Iterate through all column indices
      for (let colIndex = 0; colIndex <= maxColIndex; colIndex++) {
        // Find all possible header keys for this column index
        const possibleHeaders = new Set<string>();
        
        // Add from column definition
        const columnDef = sheet.columns.find(c => c.index === colIndex);
        if (columnDef) {
          possibleHeaders.add(columnDef.header);
          possibleHeaders.add(columnDef.header.trim());
        }
        
        // Add default format
        possibleHeaders.add(`Column ${colIndex + 1}`);
        
        // Add any header keys that map to this index
        headerToIndex.forEach((index, header) => {
          if (index === colIndex) {
            possibleHeaders.add(header);
          }
        });
        
        // Check if any row has data in this column using any of the possible headers
        let hasData = false;
        
        for (const headerKey of possibleHeaders) {
          for (const row of sheet.rows) {
            // Check if this header key exists in row.data and has content
            if (headerKey in row.data) {
              const value = row.data[headerKey];
              
              // Check if value exists and has content (text, numbers, symbols, etc.)
              if (value !== null && value !== undefined && value !== '') {
                const stringValue = String(value).trim();
                if (stringValue !== '') {
                  hasData = true;
                  break;
                }
              }
            }
          }
          
          if (hasData) break;
        }
        
        // Include column if it has any data
        if (hasData) {
          columns.push({
            columnIndex: colIndex,
            columnLetter: indexToColumnLetter(colIndex),
            sheetName: sheet.name
          });
        }
      }
    });
    
    // Sort columns by sheet name and index to ensure consistent ordering
    return columns.sort((a, b) => {
      if (a.sheetName !== b.sheetName) {
        return a.sheetName.localeCompare(b.sheetName);
      }
      return a.columnIndex - b.columnIndex;
    });
  };

  const getColumnsDisplayText = (spreadsheetId: string) => {
    const columns = getAvailableColumns(spreadsheetId);
    const selectedCount = selections.find(s => s.spreadsheetId === spreadsheetId)?.selectedColumns.length || 0;
    if (selectedCount === 0) return "Select Columns";
    return `${selectedCount} column(s) selected`;
  };

  const setOpenDropdown = (fileId: string, dropdown: string | null) => {
    setOpenDropdowns(prev => ({ ...prev, [fileId]: dropdown }));
  };

  if (files.length === 0) return null;

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-8 py-8">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Selected Files ({files.length})
        </h2>
        <div className="space-y-4">
          {files.map((file) => {
            const spreadsheet = spreadsheets.find(s => s.id === file.id);
            const isSelected = spreadsheet ? isSpreadsheetSelected(file.id) : false;
            const openDropdown = openDropdowns[file.id] || null;
            
            return (
              <div key={file.id} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-b-0">
                {/* Checkbox */}
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => spreadsheet && toggleSpreadsheet(file.id)}
                    disabled={!spreadsheet}
                  />
                </div>
                
                {/* File Name */}
                <div className="flex-shrink-0 min-w-[200px]">
                  <p className="font-medium text-foreground text-sm">{file.name}</p>
                </div>
                
                {/* Dropdown 1: Sheets (only show if spreadsheet exists) */}
                {spreadsheet ? (
                  <>
                    <Popover 
                      open={openDropdown === 'sheets'} 
                      onOpenChange={(open) => setOpenDropdown(file.id, open ? 'sheets' : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={!isSelected}
                          className={cn(
                            "min-w-[180px] justify-between bg-white hover:bg-gray-50 text-foreground hover:text-yellow-500 border-black font-medium text-sm group",
                            getAvailableSheets(file.id).filter(s => isSheetSelected(s.spreadsheetId, s.sheetName)).length > 0 && "ring-2 ring-black ring-offset-2"
                          )}
                        >
                          <span className="truncate">{getSheetsDisplayText(file.id)}</span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 group-hover:text-yellow-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[350px] p-0" align="start" side="bottom" sideOffset={8}>
                        <div className="p-2">
                          <Label className="text-sm font-semibold px-2 py-1.5 block mb-2">Select Sheet</Label>
                          <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
                            {getAvailableSheets(file.id).map((sheet) => {
                              const sheetIsSelected = isSheetSelected(sheet.spreadsheetId, sheet.sheetName);
                              return (
                                <div
                                  key={`${sheet.spreadsheetId}-${sheet.sheetName}`}
                                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/25 cursor-pointer transition-all"
                                  onClick={() => selectSheet(sheet.spreadsheetId, sheet.sheetName)}
                                >
                                  <div className={cn(
                                    "w-4 h-4 rounded border-2 flex items-center justify-center",
                                    sheetIsSelected 
                                      ? "border-primary bg-primary" 
                                      : "border-gray-300"
                                  )}>
                                    {sheetIsSelected && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <Label className="text-sm font-normal cursor-pointer flex-1">
                                    {sheet.sheetName}
                                  </Label>
                                  <span className="text-xs text-muted-foreground">
                                    ({sheet.rowCount} rows × {sheet.columnCount} cols)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Dropdown 2: Columns */}
                    <Popover open={openDropdown === 'columns'} onOpenChange={(open) => setOpenDropdown(file.id, open ? 'columns' : null)}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={!isSelected}
                          className={cn(
                            "min-w-[180px] justify-between bg-white hover:bg-gray-50 text-foreground hover:text-yellow-500 border-black font-medium text-sm group",
                            getAvailableColumns(file.id).length > 0 && selections.find(s => s.spreadsheetId === file.id)?.selectedColumns.length && selections.find(s => s.spreadsheetId === file.id)?.selectedColumns.length! > 0 && "ring-2 ring-black ring-offset-2"
                          )}
                        >
                          <span className="truncate">{getColumnsDisplayText(file.id)}</span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 group-hover:text-yellow-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[350px] p-0" align="start" side="bottom" sideOffset={8}>
                        <div className="p-2">
                          <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                            <Label className="text-sm font-semibold block">Select Columns</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                updateSelection(file.id, { selectedColumns: [] });
                              }}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/25"
                            >
                              Deselect all
                            </Button>
                          </div>
                          {(() => {
                            const columns = getAvailableColumns(file.id);
                            const selection = selections.find(s => s.spreadsheetId === file.id);
                            
                            if (columns.length === 0) {
                              return (
                                <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                                  No columns with data available
                                </p>
                              );
                            }
                            
                            return (
                              <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
                                {columns.map((col) => {
                                  const isSelected = selection?.selectedColumns.some(c => 
                                    c.sheetName === col.sheetName && c.columnIndex === col.columnIndex
                                  ) || false;
                                  
                                  // Find the column definition to get header for storage
                                  const spreadsheet = spreadsheets.find(s => s.id === file.id);
                                  const sheet = spreadsheet?.sheets.find(s => s.name === col.sheetName);
                                  const columnDef = sheet?.columns.find(c => c.index === col.columnIndex);
                                  
                                  return (
                                    <div
                                      key={`${file.id}-${col.sheetName}-${col.columnIndex}`}
                                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/25 cursor-pointer transition-all"
                                      onClick={() => {
                                        const currentColumns = selection?.selectedColumns || [];
                                        const exists = currentColumns.some(c => 
                                          c.sheetName === col.sheetName && c.columnIndex === col.columnIndex
                                        );
                                        
                                        const newColumns = exists
                                          ? currentColumns.filter(c => !(c.sheetName === col.sheetName && c.columnIndex === col.columnIndex))
                                          : [...currentColumns, { 
                                              sheetName: col.sheetName, 
                                              columnIndex: col.columnIndex, 
                                              columnHeader: columnDef?.header || '' 
                                            }];
                                        
                                        updateSelection(file.id, { selectedColumns: newColumns });
                                      }}
                                    >
                                      <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center",
                                        isSelected 
                                          ? "border-primary bg-primary" 
                                          : "border-gray-300"
                                      )}>
                                        {isSelected && (
                                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                      <Label className="text-sm font-normal cursor-pointer flex-1">
                                        {col.columnLetter}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                ) : (
                  // Show disabled placeholders if spreadsheet not loaded yet
                  <>
                    <Button variant="outline" disabled className="min-w-[180px] bg-white hover:bg-gray-50 text-foreground hover:text-yellow-500 border-black opacity-50">Loading...</Button>
                    <Button variant="outline" disabled className="min-w-[180px] bg-white hover:bg-gray-50 text-foreground hover:text-yellow-500 border-black opacity-50">Coming Soon</Button>
                    <Button variant="outline" disabled className="min-w-[180px] bg-white hover:bg-gray-50 text-foreground hover:text-yellow-500 border-black opacity-50">Coming Soon</Button>
                  </>
                )}
                
                {/* Trash Icon */}
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="flex-shrink-0 p-2 text-muted-foreground hover:text-destructive transition-colors ml-auto"
                  aria-label="Remove file"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

UploadedFilesList.displayName = "UploadedFilesList";

export default UploadedFilesList;
