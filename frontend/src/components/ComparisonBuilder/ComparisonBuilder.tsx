import { useState, useRef, useMemo, useEffect } from "react";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonRow {
  id: string;
  spreadsheetId: string;
  sheetName: string;
  columnIndex: number | null;
  hasHeader: boolean | null;
  rowIndex: number | null;
}

const ComparisonBuilder = () => {
  const { spreadsheets } = useSpreadsheet();
  const [activeTab, setActiveTab] = useState("single");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [loadingColumns, setLoadingColumns] = useState<Record<string, boolean>>({});
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});
  const [sourceRow, setSourceRow] = useState<ComparisonRow>({
    id: "source",
    spreadsheetId: "",
    sheetName: "",
    columnIndex: null,
    hasHeader: null,
    rowIndex: null,
  });
  const [targetRows, setTargetRows] = useState<ComparisonRow[]>([
    {
      id: "target-1",
      spreadsheetId: "",
      sheetName: "",
      columnIndex: null,
      hasHeader: null,
      rowIndex: null,
    },
  ]);

  // When a spreadsheet is removed from the list, clear any row that was using it
  useEffect(() => {
    const ids = new Set(spreadsheets.map(s => s.id));

    setSourceRow(prev => {
      if (prev.spreadsheetId && !ids.has(prev.spreadsheetId)) {
        return {
          ...prev,
          spreadsheetId: "",
          sheetName: "",
          columnIndex: null,
          hasHeader: null,
          rowIndex: null,
        };
      }
      return prev;
    });

    setTargetRows(prev =>
      prev.map(row => {
        if (row.spreadsheetId && !ids.has(row.spreadsheetId)) {
          return {
            ...row,
            spreadsheetId: "",
            sheetName: "",
            columnIndex: null,
            hasHeader: null,
            rowIndex: null,
          };
        }
        return row;
      })
    );
  }, [spreadsheets]);

  // Convert column index to letter
  const indexToColumnLetter = (index: number): string => {
    let result = '';
    let num = index;
    do {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26) - 1;
    } while (num >= 0);
    return result;
  };

  // Get sheets for selected spreadsheet
  const getSheets = (spreadsheetId: string) => {
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
    return spreadsheet?.sheets || [];
  };

  // Get columns for selected sheet
  const getColumns = (spreadsheetId: string, sheetName: string): Array<{ index: number; letter: string }> => {
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
    const sheet = spreadsheet?.sheets.find(s => s.name === sheetName);
    
    if (!sheet) return [];
    
    // Return all columns that exist in the spreadsheet structure
    // The parser creates columns for all columns up to columnCount, so we return all of them
    // This includes columns with content in any row (header row or data rows)
    const columns: Array<{ index: number; letter: string }> = [];
    for (let i = 0; i < sheet.metadata.columnCount; i++) {
      columns.push({ index: i, letter: indexToColumnLetter(i) });
    }
    
    return columns;
  };

  // Get rows for selected sheet
  const getRows = (spreadsheetId: string, sheetName: string): Array<{ index: number }> => {
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
    const sheet = spreadsheet?.sheets.find(s => s.name === sheetName);
    
    if (!sheet) return [];
    
    // Return all rows based on the actual row count from the spreadsheet
    const rows = [];
    for (let i = 0; i < sheet.metadata.rowCount; i++) {
      rows.push({ index: i });
    }
    return rows;
  };

  // Check if columns/rows are loading for a given sheet
  const isColumnsLoading = (spreadsheetId: string, sheetName: string): boolean => {
    if (!spreadsheetId || !sheetName) return false;
    const key = `${spreadsheetId}-${sheetName}-columns`;
    return loadingColumns[key] || false;
  };

  const isRowsLoading = (spreadsheetId: string, sheetName: string): boolean => {
    if (!spreadsheetId || !sheetName) return false;
    const key = `${spreadsheetId}-${sheetName}-rows`;
    return loadingRows[key] || false;
  };

  // Trigger loading state when sheet is selected
  const handleSheetChange = (spreadsheetId: string, sheetName: string) => {
    if (!sheetName || !spreadsheetId) return;
    
    const columnsKey = `${spreadsheetId}-${sheetName}-columns`;
    const rowsKey = `${spreadsheetId}-${sheetName}-rows`;
    
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
    const sheet = spreadsheet?.sheets.find(s => s.name === sheetName);
    
    if (!sheet) return;
    
    // Set loading state immediately
    setLoadingColumns(prev => ({ ...prev, [columnsKey]: true }));
    setLoadingRows(prev => ({ ...prev, [rowsKey]: true }));
    
    // Compute columns asynchronously in chunks to allow UI updates
    const computeColumnsAsync = async () => {
      const columns: Array<{ index: number; letter: string }> = [];
      const chunkSize = 50; // Process 50 columns at a time
      
      for (let i = 0; i < sheet.metadata.columnCount; i += chunkSize) {
        // Yield to browser to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const end = Math.min(i + chunkSize, sheet.metadata.columnCount);
        for (let j = i; j < end; j++) {
          const columnDef = sheet.columns.find(c => c.index === j);
          const headerKey = columnDef?.header || `Column ${j + 1}`;
          
          let hasData = false;
          for (const row of sheet.rows) {
            const value = row.data[headerKey];
            if (value !== null && value !== undefined && value !== '' && String(value).trim() !== '') {
              hasData = true;
              break;
            }
          }
          
          if (hasData) {
            columns.push({ index: j, letter: indexToColumnLetter(j) });
          }
        }
      }
      
      setLoadingColumns(prev => ({ ...prev, [columnsKey]: false }));
    };
    
    // Compute rows asynchronously
    const computeRowsAsync = async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      getRows(spreadsheetId, sheetName);
      setLoadingRows(prev => ({ ...prev, [rowsKey]: false }));
    };
    
    // Start both computations
    computeColumnsAsync();
    computeRowsAsync();
  };

  const addTargetRow = () => {
    setTargetRows([
      ...targetRows,
      {
        id: `target-${Date.now()}`,
        spreadsheetId: "",
        sheetName: "",
        columnIndex: null,
        hasHeader: null,
        rowIndex: null,
      },
    ]);
    
    // Scroll to bottom after adding new row
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const removeTargetRow = (index: number) => {
    setTargetRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateSourceRow = (field: keyof ComparisonRow, value: any) => {
    setSourceRow(prev => {
      const updated = { ...prev, [field]: value };
      
      // If column is selected, clear row
      if (field === 'columnIndex' && value !== null) {
        updated.rowIndex = null;
      }
      // If column is cleared, clear hasHeader
      if (field === 'columnIndex' && value === null) {
        updated.hasHeader = null;
      }
      // If row is selected, clear column and hasHeader
      if (field === 'rowIndex' && value !== null) {
        updated.columnIndex = null;
        updated.hasHeader = null;
      }
      // If spreadsheet is cleared, clear all dependent fields
      if (field === 'spreadsheetId' && !value) {
        updated.sheetName = "";
        updated.columnIndex = null;
        updated.hasHeader = null;
        updated.rowIndex = null;
      }
      // If sheet is cleared, clear all dependent fields
      if (field === 'sheetName' && !value) {
        updated.columnIndex = null;
        updated.hasHeader = null;
        updated.rowIndex = null;
      }
      
      return updated;
    });
  };

  const updateTargetRow = (index: number, field: keyof ComparisonRow, value: any) => {
    setTargetRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // If column is selected, clear row
      if (field === 'columnIndex' && value !== null) {
        updated[index].rowIndex = null;
      }
      // If column is cleared, clear hasHeader
      if (field === 'columnIndex' && value === null) {
        updated[index].hasHeader = null;
      }
      // If row is selected, clear column and hasHeader
      if (field === 'rowIndex' && value !== null) {
        updated[index].columnIndex = null;
        updated[index].hasHeader = null;
      }
      // If spreadsheet is cleared, clear all dependent fields
      if (field === 'spreadsheetId' && !value) {
        updated[index].sheetName = "";
        updated[index].columnIndex = null;
        updated[index].hasHeader = null;
        updated[index].rowIndex = null;
      }
      // If sheet is cleared, clear all dependent fields
      if (field === 'sheetName' && !value) {
        updated[index].columnIndex = null;
        updated[index].hasHeader = null;
        updated[index].rowIndex = null;
      }
      
      return updated;
    });
  };

  const renderComparisonRow = (
    row: ComparisonRow,
    label: string,
    updateFn: (field: keyof ComparisonRow, value: any) => void
  ) => (
    <div className="flex items-center gap-3">
      <div className="flex-[2]">
        <Select
          key={`${row.id}-spreadsheet-${row.spreadsheetId}`}
          value={row.spreadsheetId || undefined}
          onValueChange={(value) => updateFn('spreadsheetId', value)}
        >
          <SelectTrigger className="h-10 bg-white text-left">
            <SelectValue placeholder="Choose spreadsheet" />
          </SelectTrigger>
          <SelectContent>
            {spreadsheets.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.fileName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Select
          key={`${row.id}-sheet-${row.sheetName}`}
          value={row.sheetName || undefined}
          onValueChange={(value) => {
            const newValue = value === "__clear__" ? "" : value;
            // Set loading state immediately so spinner shows as soon as sheet is selected
            if (newValue && row.spreadsheetId) {
              handleSheetChange(row.spreadsheetId, newValue);
            }
            updateFn('sheetName', newValue);
          }}
          disabled={!row.spreadsheetId}
        >
          <SelectTrigger className="h-10 bg-white text-left">
            <SelectValue placeholder="Sheet" />
          </SelectTrigger>
          <SelectContent>
            {row.sheetName && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 -mx-1 w-[calc(100%+0.5rem)] min-w-full bg-white border-b group hover:bg-red-600 focus:bg-red-600 data-[highlighted]:bg-red-600">
                <span className="text-red-600 italic group-hover:text-white group-focus:text-white group-data-[highlighted]:text-white">Clear selection</span>
              </SelectItem>
            )}
            {getSheets(row.spreadsheetId).map((sheet) => (
              <SelectItem key={sheet.name} value={sheet.name}>
                {sheet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Select
          key={`${row.id}-column-${row.columnIndex}`}
          value={row.columnIndex !== null ? String(row.columnIndex) : undefined}
          onValueChange={(value) => updateFn('columnIndex', value === "__clear__" ? null : (value ? parseInt(value) : null))}
          disabled={!row.sheetName || row.rowIndex !== null}
        >
          <SelectTrigger className={cn("h-10 bg-white text-left", row.rowIndex !== null && "opacity-50")}>
            {isColumnsLoading(row.spreadsheetId, row.sheetName) ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder="Columns" />
            )}
          </SelectTrigger>
          <SelectContent>
            {row.columnIndex !== null && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 -mx-1 w-[calc(100%+0.5rem)] min-w-full bg-white border-b group hover:bg-red-600 focus:bg-red-600 data-[highlighted]:bg-red-600">
                <span className="text-red-600 italic group-hover:text-white group-focus:text-white group-data-[highlighted]:text-white">Clear selection</span>
              </SelectItem>
            )}
            {getColumns(row.spreadsheetId, row.sheetName).map((col) => (
              <SelectItem key={col.index} value={String(col.index)}>
                {col.letter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Select
          key={`${row.id}-header-${row.hasHeader}`}
          value={row.hasHeader !== null ? String(row.hasHeader) : undefined}
          onValueChange={(value) => updateFn('hasHeader', value === "__clear__" ? null : (value === "true"))}
          disabled={row.columnIndex === null}
        >
          <SelectTrigger className={cn("h-10 bg-white text-left", row.columnIndex === null && "opacity-50")}>
            <SelectValue placeholder="Header?" />
          </SelectTrigger>
          <SelectContent>
            <div
              className="sticky top-0 z-10 flex items-center gap-2 px-2 py-2 bg-white border-b"
              onClick={(e) => e.stopPropagation()}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Info className="h-4 w-4 shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm text-left">
                      Does your spreadsheet have headers (typically in row 1)?
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xs text-muted-foreground">
                Does your spreadsheet have headers (typically in row 1)?
              </span>
            </div>
            {row.hasHeader !== null && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 -mx-1 w-[calc(100%+0.5rem)] min-w-full bg-white border-b group hover:bg-green-600 focus:bg-green-600 data-[highlighted]:bg-green-600">
                <span className="text-muted-foreground italic group-hover:text-white group-focus:text-white group-data-[highlighted]:text-white">Clear selection</span>
              </SelectItem>
            )}
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Select
          key={`${row.id}-row-${row.rowIndex}`}
          value={row.rowIndex !== null ? String(row.rowIndex) : undefined}
          onValueChange={(value) => updateFn('rowIndex', value === "__clear__" ? null : (value ? parseInt(value) : null))}
          disabled={!row.sheetName || row.columnIndex !== null}
        >
          <SelectTrigger className={cn("h-10 bg-white text-left", row.columnIndex !== null && "opacity-50")}>
            {isRowsLoading(row.spreadsheetId, row.sheetName) ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder="Row" />
            )}
          </SelectTrigger>
          <SelectContent>
            {row.rowIndex !== null && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 -mx-1 w-[calc(100%+0.5rem)] min-w-full bg-white border-b group hover:bg-red-600 focus:bg-red-600 data-[highlighted]:bg-red-600">
                <span className="text-red-600 italic group-hover:text-white group-focus:text-white group-data-[highlighted]:text-white">Clear selection</span>
              </SelectItem>
            )}
            {getRows(row.spreadsheetId, row.sheetName).map((r) => (
              <SelectItem key={r.index} value={String(r.index)}>
                Row {r.index + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-8 py-8">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center gap-3 mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger 
                value="single"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Single
              </TabsTrigger>
              <TabsTrigger 
                value="multi"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Multi
              </TabsTrigger>
            </TabsList>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm text-left">
                    There is no requirement to include all uploaded files in the comparison. For instance, you may upload five files while selecting only two for comparison.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TabsContent value="single" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Here you can compare single columns and rows across spreadsheets{' '}
              <span className="text-muted-foreground/60">
                (If you are uploading a large spreadsheet it might take some time to load columns and rows)
              </span>
            </p>

            {/* Source Row */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {renderComparisonRow(sourceRow, "1", (field, value) =>
                  updateSourceRow(field, value)
                )}
              </div>
              {/* Invisible spacer to maintain alignment */}
              <div className="flex-shrink-0 w-9 h-9" />
            </div>

            {/* Separator */}
            <div className="flex items-center">
              <span className="text-sm font-medium text-foreground">With</span>
            </div>

            {/* Target Rows */}
            {targetRows.map((target, index) => (
              <>
                {index > 0 && (
                  <div key={`sep-${target.id}`} className="flex items-center">
                    <span className="text-sm font-medium text-foreground">With</span>
                  </div>
                )}
                <div key={target.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    {renderComparisonRow(target, String(index + 2), (field, value) =>
                      updateTargetRow(index, field, value)
                    )}
                  </div>
                  {index > 0 ? (
                    <button
                      onClick={() => removeTargetRow(index)}
                      className="flex-shrink-0 p-2 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove comparison row"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  ) : (
                    /* Invisible spacer to maintain alignment */
                    <div className="flex-shrink-0 w-9 h-9" />
                  )}
                </div>
              </>
            ))}

            {/* Separator and Add Button - only show if there are unused spreadsheets */}
            {spreadsheets.length > targetRows.length + 1 && (
              <>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-foreground">With</span>
                </div>

                <Button
                  onClick={addTargetRow}
                  variant="outline"
                  className="h-10 px-4 bg-muted hover:bg-black hover:text-white border-border font-normal"
                >
                  Add+
                </Button>
              </>
            )}

            {/* Run Comparison Button */}
            <div className="pt-6">
              <Button
                onClick={() => {
                  // TODO: Implement comparison logic
                  console.log('Run comparison clicked');
                }}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:scale-[1.01] shadow-sm font-semibold transition-all duration-200"
              >
                Run Comparison
              </Button>
            </div>
            
            {/* Scroll target for auto-scroll on add */}
            <div ref={bottomRef} />
          </TabsContent>

          <TabsContent value="multi" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Multi comparison feature coming soon...
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ComparisonBuilder;
