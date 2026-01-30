import { useState } from "react";
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
import { Trash2, Info } from "lucide-react";
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
  const getColumns = (spreadsheetId: string, sheetName: string) => {
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
    const sheet = spreadsheet?.sheets.find(s => s.name === sheetName);
    
    if (!sheet) return [];
    
    // Get all columns with data
    const columns: Array<{ index: number; letter: string }> = [];
    for (let i = 0; i < sheet.metadata.columnCount; i++) {
      const columnDef = sheet.columns.find(c => c.index === i);
      const headerKey = columnDef?.header || `Column ${i + 1}`;
      
      // Check if column has data
      let hasData = false;
      for (const row of sheet.rows) {
        const value = row.data[headerKey];
        if (value !== null && value !== undefined && value !== '' && String(value).trim() !== '') {
          hasData = true;
          break;
        }
      }
      
      if (hasData) {
        columns.push({ index: i, letter: indexToColumnLetter(i) });
      }
    }
    
    return columns;
  };

  // Get rows for selected sheet
  const getRows = (spreadsheetId: string, sheetName: string) => {
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
          onValueChange={(value) => updateFn('spreadsheetId', value === "__clear__" ? "" : value)}
        >
          <SelectTrigger className="h-10 bg-white text-left">
            <SelectValue placeholder={`Spreadsheet ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {row.spreadsheetId && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 bg-white border-b">
                <span className="text-muted-foreground italic">Clear selection</span>
              </SelectItem>
            )}
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
          onValueChange={(value) => updateFn('sheetName', value === "__clear__" ? "" : value)}
          disabled={!row.spreadsheetId}
        >
          <SelectTrigger className="h-10 bg-white text-left">
            <SelectValue placeholder="Sheet" />
          </SelectTrigger>
          <SelectContent>
            {row.sheetName && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 bg-white border-b">
                <span className="text-muted-foreground italic">Clear selection</span>
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
            <SelectValue placeholder="Columns" />
          </SelectTrigger>
          <SelectContent>
            {row.columnIndex !== null && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 bg-white border-b">
                <span className="text-muted-foreground italic">Clear selection</span>
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
            {row.hasHeader !== null && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 bg-white border-b">
                <span className="text-muted-foreground italic">Clear selection</span>
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
            <SelectValue placeholder="Row" />
          </SelectTrigger>
          <SelectContent>
            {row.rowIndex !== null && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 bg-white border-b">
                <span className="text-muted-foreground italic">Clear selection</span>
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
              Here you can compare single columns and rows across spreadsheets
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
