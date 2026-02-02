import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { useComparisonEngine } from "@/hooks/useComparisonEngine";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trash2, Info, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComparisonRule } from "../../../../shared/types";
import arrowImg from "@/assets/Arrow.png";

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
  const multiTabRef = useRef<HTMLDivElement>(null);
  const [loadingColumns, setLoadingColumns] = useState<Record<string, boolean>>({});
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});
  const [columnSearchQuery, setColumnSearchQuery] = useState("");
  const [rowSearchQuery, setRowSearchQuery] = useState("");
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [multiSourceRow2, setMultiSourceRow2] = useState<ComparisonRow>({
    id: "multi-source-2",
    spreadsheetId: "",
    sheetName: "",
    columnIndex: null,
    hasHeader: null,
    rowIndex: null,
  });
  const [multiTargetRow2, setMultiTargetRow2] = useState<ComparisonRow>({
    id: "multi-target-2",
    spreadsheetId: "",
    sheetName: "",
    columnIndex: null,
    hasHeader: null,
    rowIndex: null,
  });
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

    // Clear Multi mode second comparison section if spreadsheet is removed
    setMultiSourceRow2(prev => {
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
    setMultiTargetRow2(prev => {
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
  }, [spreadsheets]);

  // Auto-scroll to Multi tab content when Multi is selected
  useEffect(() => {
    if (activeTab === "multi" && multiTabRef.current) {
      setTimeout(() => {
        multiTabRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [activeTab]);

  // In Multi mode, automatically sync spreadsheet selections from first comparison to second comparison
  useEffect(() => {
    if (activeTab === "multi") {
      // Sync source spreadsheet from first comparison to second comparison
      if (sourceRow.spreadsheetId && sourceRow.sheetName) {
        setMultiSourceRow2(prev => ({
          ...prev,
          spreadsheetId: sourceRow.spreadsheetId,
          sheetName: sourceRow.sheetName,
        }));
      }
      
      // Sync target spreadsheet from first comparison to second comparison
      if (targetRows[0]?.spreadsheetId && targetRows[0]?.sheetName) {
        setMultiTargetRow2(prev => ({
          ...prev,
          spreadsheetId: targetRows[0].spreadsheetId,
          sheetName: targetRows[0].sheetName,
        }));
      }
    }
  }, [activeTab, sourceRow.spreadsheetId, sourceRow.sheetName, targetRows]);

  const { executeComparisonWithRules, isExecuting } = useComparisonEngine();
  const { toast } = useToast();

  /** Build comparison rules from Single mode form (source vs each target). */
  const buildRulesFromSingleMode = useCallback((): ComparisonRule[] | null => {
    const isColumnMode = sourceRow.columnIndex !== null;
    const isRowMode = sourceRow.rowIndex !== null;

    if (!sourceRow.spreadsheetId || !sourceRow.sheetName) {
      toast({
        title: 'Source not configured',
        description: 'Please select a spreadsheet and sheet for the first row.',
        variant: 'destructive'
      });
      return null;
    }
    if (!isColumnMode && !isRowMode) {
      toast({
        title: 'No comparison type',
        description: 'Please select either a column or a row in the source row.',
        variant: 'destructive'
      });
      return null;
    }
    if (isColumnMode && isRowMode) {
      toast({
        title: 'Invalid selection',
        description: 'Please select either a column or a row, not both, in the source row.',
        variant: 'destructive'
      });
      return null;
    }

    // When comparing columns, user must choose Yes or No for the header dropdown (source and each target)
    if (isColumnMode) {
      if (sourceRow.hasHeader === null) {
        toast({
          title: 'Header not selected',
          description: 'Please select Yes or No in the Header? dropdown for the source row.',
          variant: 'destructive'
        });
        return null;
      }
      for (let i = 0; i < targetRows.length; i++) {
        const target = targetRows[i];
        if (target.spreadsheetId && target.sheetName && target.columnIndex !== null && target.hasHeader === null) {
          toast({
            title: 'Header not selected',
            description: `Please select Yes or No in the Header? dropdown for comparison row ${i + 2}.`,
            variant: 'destructive'
          });
          return null;
        }
      }
    }

    const elementType = isColumnMode ? 'column' : 'row';
    const sourceIdentifier = isColumnMode ? sourceRow.columnIndex! : sourceRow.rowIndex!;

    const rules: ComparisonRule[] = [];
    for (let i = 0; i < targetRows.length; i++) {
      const target = targetRows[i];
      if (!target.spreadsheetId || !target.sheetName) {
        toast({
          title: 'Target not configured',
          description: `Please select a spreadsheet and sheet for comparison row ${i + 2}.`,
          variant: 'destructive'
        });
        return null;
      }
      const targetIsColumn = target.columnIndex !== null;
      const targetIsRow = target.rowIndex !== null;
      if (targetIsColumn !== isColumnMode || targetIsRow !== isRowMode) {
        toast({
          title: 'Mismatched comparison type',
          description: `Target row ${i + 2} must select the same type (column or row) as the source.`,
          variant: 'destructive'
        });
        return null;
      }
      const targetIdentifier = isColumnMode ? target.columnIndex! : target.rowIndex!;

      rules.push({
        id: `single-rule-${sourceRow.id}-${target.id}-${i}`,
        stepNumber: i + 1,
        elementType,
        method: 'equals',
        source: {
          spreadsheetId: sourceRow.spreadsheetId,
          sheetName: sourceRow.sheetName,
          elementType,
          elementIdentifier: sourceIdentifier,
          hasHeader: isColumnMode ? sourceRow.hasHeader ?? undefined : undefined
        },
        target: {
          spreadsheetId: target.spreadsheetId,
          sheetName: target.sheetName,
          elementType,
          elementIdentifier: targetIdentifier,
          hasHeader: isColumnMode ? target.hasHeader ?? undefined : undefined
        }
      });
    }

    if (rules.length === 0) {
      toast({
        title: 'No targets',
        description: 'Please configure at least one target row to compare against.',
        variant: 'destructive'
      });
      return null;
    }

    return rules;
  }, [sourceRow, targetRows, toast]);

  const handleRunComparison = useCallback(() => {
    const rules = buildRulesFromSingleMode();
    if (rules) {
      executeComparisonWithRules(rules);
    }
  }, [buildRulesFromSingleMode, executeComparisonWithRules]);

  // When comparing columns, Run is disabled until Header? is set to Yes or No for source and each configured target
  const isColumnMode = sourceRow.columnIndex !== null;
  const headerMissingForColumnMode =
    isColumnMode &&
    (sourceRow.hasHeader === null ||
      targetRows.some(
        (t) =>
          t.spreadsheetId &&
          t.sheetName &&
          t.columnIndex !== null &&
          t.hasHeader === null
      ));

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

  // Get columns for selected sheet (parser already includes only columns with at least one cell with content)
  const getColumns = (spreadsheetId: string, sheetName: string): Array<{ index: number; letter: string }> => {
    const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
    const sheet = spreadsheet?.sheets.find(s => s.name === sheetName);
    
    if (!sheet) return [];
    
    return sheet.columns.map(c => ({
      index: c.index,
      letter: indexToColumnLetter(c.index)
    }));
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

  // Describe a comparison row for the summary (e.g. "Column D in Spreadsheet file.xlsx")
  const describeComparisonRow = useCallback((row: ComparisonRow): string => {
    if (!row.spreadsheetId) return "";
    const fileName = spreadsheets.find(s => s.id === row.spreadsheetId)?.fileName ?? "";
    if (!fileName) return "";
    const spreadsheetLabel = `Spreadsheet ${fileName}`;
    if (row.columnIndex !== null) {
      const colLetter = indexToColumnLetter(row.columnIndex);
      return row.sheetName ? `Column ${colLetter} in ${row.sheetName} in ${spreadsheetLabel}` : `Column ${colLetter} in ${spreadsheetLabel}`;
    }
    if (row.rowIndex !== null) {
      const rowNum = row.rowIndex + 1;
      return row.sheetName ? `Row ${rowNum} in ${row.sheetName} in ${spreadsheetLabel}` : `Row ${rowNum} in ${spreadsheetLabel}`;
    }
    return spreadsheetLabel;
  }, [spreadsheets]);

  // Summary text for Single tab
  const singleSummary = useMemo(() => {
    const sourceDesc = describeComparisonRow(sourceRow);
    if (!sourceDesc) return null;
    const comparisons = targetRows
      .filter(t => t.spreadsheetId)
      .map(t => {
        const targetDesc = describeComparisonRow(t);
        return targetDesc ? `Compare ${sourceDesc} with ${targetDesc}.` : null;
      })
      .filter(Boolean) as string[];
    if (comparisons.length === 0) return null;
    return comparisons.join("\n");
  }, [sourceRow, targetRows, describeComparisonRow]);

  // Summary text for Multi tab
  const multiSummary = useMemo(() => {
    const parts: string[] = [];
    const sourceDesc = describeComparisonRow(sourceRow);
    const target = targetRows[0];
    const targetDesc = target ? describeComparisonRow(target) : "";
    if (sourceDesc && targetDesc) {
      parts.push(`Compare ${sourceDesc} with ${targetDesc}.`);
      const ruleText =
        selectedRule === "no-match-continue"
          ? "If no match is found, continue."
          : selectedRule === "no-match-stop"
            ? "If no match is found, stop."
            : null;
      if (ruleText) parts.push(ruleText);
    }
    const source2Desc = describeComparisonRow(multiSourceRow2);
    const target2Desc = describeComparisonRow(multiTargetRow2);
    if (source2Desc && target2Desc) {
      parts.push(`Then compare ${source2Desc} with ${target2Desc}.`);
    }
    if (parts.length === 0) return null;
    return parts.join("\n");
  }, [sourceRow, targetRows, multiSourceRow2, multiTargetRow2, selectedRule, describeComparisonRow]);

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
    
    // Columns are already filtered by content in the parser; just yield so UI can update
    const computeColumnsAsync = async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
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
      // When spreadsheet changes (to a new file or cleared), reset all dependent dropdowns to default
      if (field === 'spreadsheetId') {
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
      // When spreadsheet changes (to a new file or cleared), reset all dependent dropdowns to default
      if (field === 'spreadsheetId') {
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
    updateFn: (field: keyof ComparisonRow, value: any) => void,
    spreadsheetPlaceholder: string = "Choose spreadsheet",
    disableSpreadsheetSelection: boolean = false
  ) => (
    <div className="flex items-center gap-3">
      <div className="flex-[2]">
        <Select
          key={`${row.id}-spreadsheet-${row.spreadsheetId}`}
          value={row.spreadsheetId || undefined}
          onValueChange={(value) => updateFn('spreadsheetId', value)}
          disabled={disableSpreadsheetSelection}
        >
          <SelectTrigger className={cn("h-10 bg-white text-left", disableSpreadsheetSelection && "opacity-50 cursor-not-allowed")}>
            <SelectValue placeholder={spreadsheetPlaceholder} />
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
          onOpenChange={(open) => !open && setColumnSearchQuery("")}
          disabled={!row.sheetName || row.rowIndex !== null}
        >
          <SelectTrigger className={cn("h-10 bg-white text-left", row.rowIndex !== null && "opacity-50")}>
            {isColumnsLoading(row.spreadsheetId, row.sheetName) ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder="Column" />
            )}
          </SelectTrigger>
          <SelectContent>
            <div className="sticky top-0 z-10 p-2 bg-white border-b" onClick={(e) => e.stopPropagation()}>
              <Input
                placeholder="Search column (e.g. A, M)"
                value={columnSearchQuery}
                onChange={(e) => setColumnSearchQuery(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            {row.columnIndex !== null && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 -mx-1 w-[calc(100%+0.5rem)] min-w-full bg-white border-b group hover:bg-red-600 focus:bg-red-600 data-[highlighted]:bg-red-600">
                <span className="text-red-600 italic group-hover:text-white group-focus:text-white group-data-[highlighted]:text-white">Clear selection</span>
              </SelectItem>
            )}
            {getColumns(row.spreadsheetId, row.sheetName)
              .filter((col) => col.letter.toLowerCase().includes(columnSearchQuery.trim().toLowerCase()))
              .map((col) => (
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
              <SelectItem value="__clear__" className="sticky top-0 z-10 -mx-1 w-[calc(100%+0.5rem)] min-w-full bg-white border-b group hover:bg-black hover:text-white focus:bg-black focus:text-white data-[highlighted]:bg-black data-[highlighted]:text-white">
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
          onOpenChange={(open) => !open && setRowSearchQuery("")}
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
            <div className="sticky top-0 z-10 p-2 bg-white border-b" onClick={(e) => e.stopPropagation()}>
              <Input
                placeholder="Search row (e.g. 10)"
                value={rowSearchQuery}
                onChange={(e) => setRowSearchQuery(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            {row.rowIndex !== null && (
              <SelectItem value="__clear__" className="sticky top-0 z-10 -mx-1 w-[calc(100%+0.5rem)] min-w-full bg-white border-b group hover:bg-red-600 focus:bg-red-600 data-[highlighted]:bg-red-600">
                <span className="text-red-600 italic group-hover:text-white group-focus:text-white group-data-[highlighted]:text-white">Clear selection</span>
              </SelectItem>
            )}
            {getRows(row.spreadsheetId, row.sheetName)
              .filter((r) => String(r.index + 1).includes(rowSearchQuery.trim()))
              .map((r) => (
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
        <div className="flex items-center gap-2 mb-6 pl-0">
          <h2 className="text-lg font-semibold text-foreground m-0">Comparison</h2>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Comparison info"
                >
                  <AlertCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <div className="text-sm text-left space-y-2">
                  <p className="font-semibold">How the comparison works</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>If you select two spreadsheets, the system will simply compare those two files.</li>
                    <li>If you select more than two spreadsheets, the comparison works like this:
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>The first spreadsheet you select is used as the source (reference).</li>
                        <li>All other selected spreadsheets are compared against this first spreadsheet.</li>
                        <li>The spreadsheets are not compared with each other, only with the first one.</li>
                      </ul>
                    </li>
                  </ul>
                  <p className="pt-1 font-bold">
                    If you want a different comparison setup, change the order of the selected spreadsheets so the correct one is first.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-start gap-3 mb-6 pl-0">
            <TabsList className="grid w-full max-w-md grid-cols-2 shrink-0">
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
                <TooltipContent className="max-w-sm">
                  <div className="text-sm text-left space-y-3">
                    <div>
                      <p className="font-semibold">Single mode</p>
                      <p className="text-muted-foreground mt-0.5">
                        Use this mode to compare one column at a time across selected spreadsheets.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Multi mode</p>
                      <p className="text-muted-foreground mt-0.5">
                        Use this mode to create rule-based comparisons, allowing you to compare multiple columns from two spreadsheets, in a custom order.
                      </p>
                    </div>
                  </div>
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
                  updateSourceRow(field, value), "Choose source spreadsheet"
                )}
              </div>
              {/* Invisible spacer to maintain alignment */}
              <div className="flex-shrink-0 w-9 h-9" />
            </div>

            {/* Separator */}
            <div className="flex items-center">
              <span className="text-sm font-medium text-foreground">Compare with</span>
            </div>

            {/* Target Rows */}
            {targetRows.map((target, index) => (
              <div key={`target-section-${target.id}`} className="space-y-4">
                {index > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-foreground">And</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    {renderComparisonRow(target, String(index + 2), (field, value) =>
                      updateTargetRow(index, field, value), "Choose spreadsheet"
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
              </div>
            ))}

            {/* Separator and Add Button - only show if there are unused spreadsheets */}
            {spreadsheets.length > targetRows.length + 1 && (
              <>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-foreground">And</span>
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

            {/* Summary and Run Comparison Button */}
            {singleSummary && (
              <div className="pt-4 pb-2 rounded-md border border-border bg-muted/30 px-4 py-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">{singleSummary}</p>
              </div>
            )}
            <div className="pt-6">
              <Button
                onClick={handleRunComparison}
                disabled={isExecuting || headerMissingForColumnMode}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:scale-[1.01] shadow-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? 'Running...' : 'Run Comparison'}
              </Button>
            </div>
            
            {/* Scroll target for auto-scroll on add */}
            <div ref={bottomRef} />
          </TabsContent>

          <TabsContent value="multi" className="space-y-4" ref={multiTabRef}>
            <p className="text-sm text-muted-foreground">
              Here you can compare multiple columns in two spreadsheets{' '}
              <span className="text-muted-foreground/60">
                (If you are uploading a large spreadsheet it might take some time to load columns and rows)
              </span>
            </p>

            {/* Source Row */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {renderComparisonRow(sourceRow, "1", (field, value) =>
                  updateSourceRow(field, value), "Choose source spreadsheet"
                )}
              </div>
              <div className="flex-shrink-0 w-9 h-9" />
            </div>

            {/* Separator */}
            <div className="flex items-center">
              <span className="text-sm font-medium text-foreground">Compare with</span>
            </div>

            {/* Target Rows - Multi mode: only one target (two spreadsheets total), no Add+ */}
            {targetRows.slice(0, 1).map((target, index) => (
              <div key={target.id} className="flex items-center gap-3">
                <div className="flex-1">
                  {renderComparisonRow(target, "2", (field, value) =>
                    updateTargetRow(0, field, value), "Choose spreadsheet"
                  )}
                </div>
                <div className="flex-shrink-0 w-9 h-9" />
              </div>
            ))}

            {/* Arrow between first and second comparison */}
            <div className="flex justify-center my-12" aria-hidden>
              <img
                src={arrowImg}
                alt=""
                className="h-5 w-auto rotate-90 object-contain opacity-30"
              />
            </div>

            {/* Second Comparison Section - Multi mode */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Second comparison step
              </p>

              {/* Source Row 2 */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  {renderComparisonRow(multiSourceRow2, "1", (field, value) =>
                    setMultiSourceRow2(prev => ({ ...prev, [field]: value })), "Choose source spreadsheet", true
                  )}
                </div>
                <div className="flex-shrink-0 w-9 h-9" />
              </div>

              {/* Separator */}
              <div className="flex items-center">
                <span className="text-sm font-medium text-foreground">Compare with</span>
              </div>

              {/* Target Row 2 */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  {renderComparisonRow(multiTargetRow2, "2", (field, value) =>
                    setMultiTargetRow2(prev => ({ ...prev, [field]: value })), "Choose spreadsheet", true
                  )}
                </div>
                <div className="flex-shrink-0 w-9 h-9" />
              </div>
            </div>

            {/* Summary and Run Comparison Button */}
            {multiSummary && (
              <div className="pt-4 pb-2 rounded-md border border-border bg-muted/30 px-4 py-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">{multiSummary}</p>
              </div>
            )}
            <div className="pt-6">
              <Button
                onClick={handleRunComparison}
                disabled={isExecuting || headerMissingForColumnMode}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:scale-[1.01] shadow-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? 'Running...' : 'Run Comparison'}
              </Button>
            </div>
            <div ref={bottomRef} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ComparisonBuilder;
