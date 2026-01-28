import { useState, useMemo } from "react";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComparisonSelector() {
  const { spreadsheets, selections, updateSelection } = useSpreadsheet();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get selected spreadsheet IDs
  const selectedSpreadsheetIds = useMemo(() => {
    return selections
      .filter(s => s.selectedSheets.length > 0)
      .map(s => s.spreadsheetId);
  }, [selections]);

  // Get sheets from selected spreadsheets
  const availableSheets = useMemo(() => {
    const sheets: Array<{ spreadsheetId: string; spreadsheetName: string; sheetName: string }> = [];
    
    spreadsheets
      .filter(s => selectedSpreadsheetIds.includes(s.id))
      .forEach(spreadsheet => {
        spreadsheet.sheets.forEach(sheet => {
          sheets.push({
            spreadsheetId: spreadsheet.id,
            spreadsheetName: spreadsheet.fileName,
            sheetName: sheet.name
          });
        });
      });
    
    return sheets;
  }, [spreadsheets, selectedSpreadsheetIds]);

  // Toggle spreadsheet selection
  const toggleSpreadsheet = (spreadsheetId: string) => {
    const selection = selections.find(s => s.spreadsheetId === spreadsheetId);
    
    if (selection && selection.selectedSheets.length > 0) {
      // Deselect all sheets for this spreadsheet
      updateSelection(spreadsheetId, { selectedSheets: [] });
    } else {
      // Select all sheets for this spreadsheet
      const spreadsheet = spreadsheets.find(s => s.id === spreadsheetId);
      if (spreadsheet) {
        const allSheetNames = spreadsheet.sheets.map(s => s.name);
        updateSelection(spreadsheetId, { selectedSheets: allSheetNames });
      }
    }
  };

  // Toggle sheet selection
  const toggleSheet = (spreadsheetId: string, sheetName: string) => {
    const selection = selections.find(s => s.spreadsheetId === spreadsheetId);
    const currentSheets = selection?.selectedSheets || [];
    
    const newSheets = currentSheets.includes(sheetName)
      ? currentSheets.filter(s => s !== sheetName)
      : [...currentSheets, sheetName];
    
    updateSelection(spreadsheetId, { selectedSheets: newSheets });
  };

  const isSpreadsheetSelected = (spreadsheetId: string) => {
    const selection = selections.find(s => s.spreadsheetId === spreadsheetId);
    return selection && selection.selectedSheets.length > 0;
  };

  const isSheetSelected = (spreadsheetId: string, sheetName: string) => {
    const selection = selections.find(s => s.spreadsheetId === spreadsheetId);
    return selection?.selectedSheets.includes(sheetName) || false;
  };

  const getSpreadsheetDisplayText = () => {
    const count = selectedSpreadsheetIds.length;
    if (count === 0) return "Select Spreadsheets";
    if (count === 1) {
      const selected = spreadsheets.find(s => selectedSpreadsheetIds.includes(s.id));
      return selected?.fileName || "1 selected";
    }
    return `${count} spreadsheets selected`;
  };

  const getSheetsDisplayText = () => {
    const count = availableSheets.filter(sheet => 
      isSheetSelected(sheet.spreadsheetId, sheet.sheetName)
    ).length;
    if (count === 0) return "Select Sheets";
    return `${count} sheet(s) selected`;
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-6">
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Comparison Selection
        </h2>
        
        <div className="flex flex-wrap gap-4">
          {/* Dropdown 1: Spreadsheets */}
          <Popover open={openDropdown === 'spreadsheets'} onOpenChange={(open) => setOpenDropdown(open ? 'spreadsheets' : null)}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "min-w-[200px] justify-between bg-primary hover:bg-primary/90 text-primary-foreground border-primary font-medium",
                  selectedSpreadsheetIds.length > 0 && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <span className="truncate">{getSpreadsheetDisplayText()}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start" side="bottom" sideOffset={8}>
              <div className="p-2">
                <Label className="text-sm font-semibold px-2 py-1.5 block">Select Spreadsheets</Label>
                <div className="space-y-1 mt-2 max-h-[300px] overflow-y-auto">
                  {spreadsheets.map((spreadsheet) => {
                    const isSelected = isSpreadsheetSelected(spreadsheet.id);
                    return (
                      <div
                        key={spreadsheet.id}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/25 cursor-pointer transition-all"
                        onClick={() => toggleSpreadsheet(spreadsheet.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSpreadsheet(spreadsheet.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Label className="text-sm font-normal cursor-pointer flex-1">
                          {spreadsheet.fileName}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          ({spreadsheet.sheets.length} sheet{spreadsheet.sheets.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Dropdown 2: Sheets (updates based on selected spreadsheets) */}
          <Popover 
            open={openDropdown === 'sheets'} 
            onOpenChange={(open) => setOpenDropdown(open ? 'sheets' : null)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={selectedSpreadsheetIds.length === 0}
                className={cn(
                  "min-w-[200px] justify-between bg-primary hover:bg-primary/90 text-primary-foreground border-primary font-medium",
                  availableSheets.filter(s => isSheetSelected(s.spreadsheetId, s.sheetName)).length > 0 && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <span className="truncate">{getSheetsDisplayText()}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start" side="bottom" sideOffset={8}>
              <div className="p-2">
                <Label className="text-sm font-semibold px-2 py-1.5 block">Select Sheets</Label>
                {selectedSpreadsheetIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                    Please select spreadsheets first
                  </p>
                ) : (
                  <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
                    {spreadsheets
                      .filter(s => selectedSpreadsheetIds.includes(s.id))
                      .map((spreadsheet) => (
                        <div key={spreadsheet.id} className="space-y-1">
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                            {spreadsheet.fileName}
                          </div>
                          {spreadsheet.sheets.map((sheet) => {
                            const isSelected = isSheetSelected(spreadsheet.id, sheet.name);
                            return (
                              <div
                                key={`${spreadsheet.id}-${sheet.name}`}
                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/25 cursor-pointer ml-2 transition-all"
                                onClick={() => toggleSheet(spreadsheet.id, sheet.name)}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSheet(spreadsheet.id, sheet.name)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Label className="text-sm font-normal cursor-pointer flex-1">
                                  {sheet.name}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                  ({sheet.metadata.rowCount} rows × {sheet.metadata.columnCount} cols)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Placeholder Dropdown 3 */}
          <Popover open={openDropdown === 'dropdown3'} onOpenChange={(open) => setOpenDropdown(open ? 'dropdown3' : null)}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled
                className="min-w-[200px] justify-between bg-primary hover:bg-primary/90 text-primary-foreground border-primary font-medium opacity-50"
              >
                <span className="truncate">Coming Soon</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            </PopoverTrigger>
          </Popover>

          {/* Placeholder Dropdown 4 */}
          <Popover open={openDropdown === 'dropdown4'} onOpenChange={(open) => setOpenDropdown(open ? 'dropdown4' : null)}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled
                className="min-w-[200px] justify-between bg-primary hover:bg-primary/90 text-primary-foreground border-primary font-medium opacity-50"
              >
                <span className="truncate">Coming Soon</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            </PopoverTrigger>
          </Popover>
        </div>
      </div>
    </div>
  );
}
