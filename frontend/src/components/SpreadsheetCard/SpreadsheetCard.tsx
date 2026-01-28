import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { ParsedSpreadsheet } from "../../../../shared/types";

interface SpreadsheetCardProps {
  spreadsheet: ParsedSpreadsheet;
}

export function SpreadsheetCard({ spreadsheet }: SpreadsheetCardProps) {
  const { selections, updateSelection } = useSpreadsheet();
  const currentSelection = selections.find(s => s.spreadsheetId === spreadsheet.id);
  
  const toggleSheet = (sheetName: string) => {
    const newSheets = currentSelection?.selectedSheets.includes(sheetName)
      ? currentSelection.selectedSheets.filter(s => s !== sheetName)
      : [...(currentSelection?.selectedSheets || []), sheetName];
    
    updateSelection(spreadsheet.id, { selectedSheets: newSheets });
  };
  
  const toggleColumn = (sheetName: string, columnIndex: number, columnHeader: string) => {
    const columns = currentSelection?.selectedColumns || [];
    const exists = columns.some(c => 
      c.sheetName === sheetName && c.columnIndex === columnIndex
    );
    
    const newColumns = exists
      ? columns.filter(c => !(c.sheetName === sheetName && c.columnIndex === columnIndex))
      : [...columns, { sheetName, columnIndex, columnHeader }];
    
    updateSelection(spreadsheet.id, { selectedColumns: newColumns });
  };
  
  const toggleRow = (rowIndex: number) => {
    const rows = currentSelection?.selectedRows || [];
    const newRows = rows.includes(rowIndex)
      ? rows.filter(r => r !== rowIndex)
      : [...rows, rowIndex];
    
    updateSelection(spreadsheet.id, { selectedRows: newRows });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{spreadsheet.fileName}</CardTitle>
          <Badge>{spreadsheet.sheets.length} sheet(s)</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {spreadsheet.sheets.map(sheet => (
            <AccordionItem key={sheet.name} value={sheet.name}>
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={currentSelection?.selectedSheets.includes(sheet.name)}
                    onCheckedChange={() => toggleSheet(sheet.name)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{sheet.name}</span>
                  <Badge variant="secondary">
                    {sheet.metadata.rowCount} rows × {sheet.metadata.columnCount} cols
                  </Badge>
                </div>
              </AccordionTrigger>
              
              <AccordionContent>
                <div className="pl-8 space-y-4">
                  {/* Column Selection */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Select Columns
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {sheet.columns.map(column => (
                        <div key={column.index} className="flex items-center gap-2">
                          <Checkbox
                            id={`col-${spreadsheet.id}-${sheet.name}-${column.index}`}
                            checked={currentSelection?.selectedColumns.some(c => 
                              c.sheetName === sheet.name && c.columnIndex === column.index
                            )}
                            onCheckedChange={() => toggleColumn(sheet.name, column.index, column.header)}
                          />
                          <Label
                            htmlFor={`col-${spreadsheet.id}-${sheet.name}-${column.index}`}
                            className="text-sm cursor-pointer"
                          >
                            {column.header}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Row Selection */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Select Rows (by index)
                    </Label>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {Array.from({ length: Math.min(20, sheet.metadata.rowCount) }, (_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Checkbox
                            id={`row-${spreadsheet.id}-${sheet.name}-${i}`}
                            checked={currentSelection?.selectedRows.includes(i)}
                            onCheckedChange={() => toggleRow(i)}
                          />
                          <Label
                            htmlFor={`row-${spreadsheet.id}-${sheet.name}-${i}`}
                            className="text-sm cursor-pointer"
                          >
                            {i + 1}
                          </Label>
                        </div>
                      ))}
                      {sheet.metadata.rowCount > 20 && (
                        <span className="text-sm text-muted-foreground col-span-full">
                          ... and {sheet.metadata.rowCount - 20} more rows
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
