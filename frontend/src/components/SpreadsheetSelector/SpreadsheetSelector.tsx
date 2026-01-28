import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SpreadsheetSelectorProps {
  elementType: 'column' | 'row';
  value: {
    spreadsheetId: string;
    sheetName: string;
    elementIdentifier: string | number;
  };
  onChange: (value: {
    spreadsheetId: string;
    sheetName: string;
    elementIdentifier: string | number;
  }) => void;
  label?: string;
}

export function SpreadsheetSelector({ elementType, value, onChange, label }: SpreadsheetSelectorProps) {
  const { spreadsheets, selections } = useSpreadsheet();
  
  // Filter to only show selected spreadsheets/sheets/elements
  const availableSpreadsheets = spreadsheets.filter(s => 
    selections.some(sel => sel.spreadsheetId === s.id && sel.selectedSheets.length > 0)
  );
  
  const currentSelection = selections.find(s => s.spreadsheetId === value.spreadsheetId);
  const availableSheets = currentSelection?.selectedSheets || [];
  
  const getAvailableElements = () => {
    if (!value.spreadsheetId || !value.sheetName) return [];
    
    const spreadsheet = spreadsheets.find(s => s.id === value.spreadsheetId);
    const sheet = spreadsheet?.sheets.find(sh => sh.name === value.sheetName);
    const selection = selections.find(s => s.spreadsheetId === value.spreadsheetId);
    
    if (!sheet || !selection) return [];
    
    if (elementType === 'column') {
      // Only show pre-selected columns for this sheet
      return selection.selectedColumns.filter(c => c.sheetName === value.sheetName);
    } else {
      // Only show pre-selected rows
      return selection.selectedRows;
    }
  };
  
  const availableElements = getAvailableElements();
  
  const selectedSpreadsheet = spreadsheets.find(s => s.id === value.spreadsheetId);
  
  return (
    <div className="space-y-4">
      {label && <Label className="text-base font-semibold">{label}</Label>}
      
      <div>
        <Label className="text-sm">Spreadsheet</Label>
        <Select
          value={value.spreadsheetId}
          onValueChange={(id) => onChange({ spreadsheetId: id, sheetName: '', elementIdentifier: '' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select spreadsheet" />
          </SelectTrigger>
          <SelectContent>
            {availableSpreadsheets.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.fileName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label className="text-sm">Sheet</Label>
        <Select
          value={value.sheetName}
          onValueChange={(name) => onChange({ ...value, sheetName: name, elementIdentifier: '' })}
          disabled={!value.spreadsheetId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sheet" />
          </SelectTrigger>
          <SelectContent>
            {availableSheets.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label className="text-sm">{elementType === 'column' ? 'Column' : 'Row'}</Label>
        <Select
          value={String(value.elementIdentifier)}
          onValueChange={(identifier) => onChange({ ...value, elementIdentifier: identifier })}
          disabled={!value.sheetName}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${elementType}`} />
          </SelectTrigger>
          <SelectContent>
            {elementType === 'column' 
              ? availableElements.map((col: any) => (
                  <SelectItem 
                    key={col.columnIndex} 
                    value={String(col.columnIndex)}
                  >
                    {col.columnHeader}
                  </SelectItem>
                ))
              : availableElements.map((rowIndex: number) => (
                  <SelectItem 
                    key={rowIndex} 
                    value={String(rowIndex)}
                  >
                    Row {rowIndex + 1}
                  </SelectItem>
                ))
            }
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
