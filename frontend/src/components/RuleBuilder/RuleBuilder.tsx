import { useState } from "react";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { SpreadsheetSelector } from "@/components/SpreadsheetSelector";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { ComparisonElementType, ComparisonMethod, ComparisonRule } from "../../../../shared/types";

export function RuleBuilder() {
  const { addRule, comparisonRules } = useSpreadsheet();
  const { toast } = useToast();
  
  const [elementType, setElementType] = useState<ComparisonElementType>('column');
  const [method, setMethod] = useState<ComparisonMethod>('equals');
  const [source, setSource] = useState({
    spreadsheetId: '',
    sheetName: '',
    elementIdentifier: '' as string | number
  });
  const [target, setTarget] = useState({
    spreadsheetId: '',
    sheetName: '',
    elementIdentifier: '' as string | number
  });
  const [storeResult, setStoreResult] = useState(false);
  
  const handleAddRule = () => {
    // Validation
    if (!source.spreadsheetId || !source.sheetName || !source.elementIdentifier) {
      toast({
        title: 'Incomplete source',
        description: 'Please select a complete source (spreadsheet, sheet, and element).',
        variant: 'destructive'
      });
      return;
    }
    
    if (!target.spreadsheetId || !target.sheetName || !target.elementIdentifier) {
      toast({
        title: 'Incomplete target',
        description: 'Please select a complete target (spreadsheet, sheet, and element).',
        variant: 'destructive'
      });
      return;
    }
    
    const newRule: ComparisonRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stepNumber: comparisonRules.length + 1,
      elementType,
      method,
      source: {
        ...source,
        elementType
      },
      target: {
        ...target,
        elementType
      },
      storeResult
    };
    
    addRule(newRule);
    
    // Reset form
    setSource({ spreadsheetId: '', sheetName: '', elementIdentifier: '' });
    setTarget({ spreadsheetId: '', sheetName: '', elementIdentifier: '' });
    setStoreResult(false);
    
    toast({
      title: 'Rule added',
      description: `Step ${newRule.stepNumber} has been configured.`
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Build New Comparison Rule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Element Type Selection */}
        <div>
          <Label className="text-sm font-semibold">Element Type</Label>
          <Select
            value={elementType}
            onValueChange={(value) => {
              setElementType(value as ComparisonElementType);
              // Reset selections when element type changes
              setSource({ spreadsheetId: '', sheetName: '', elementIdentifier: '' });
              setTarget({ spreadsheetId: '', sheetName: '', elementIdentifier: '' });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="column">Column</SelectItem>
              <SelectItem value="row">Row</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Comparison Method Selection */}
        <div>
          <Label className="text-sm font-semibold">Comparison Method</Label>
          <Select
            value={method}
            onValueChange={(value) => setMethod(value as ComparisonMethod)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="lookup">Lookup</SelectItem>
              <SelectItem value="validate">Validate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        {/* Source Selection */}
        <SpreadsheetSelector
          elementType={elementType}
          value={source}
          onChange={setSource}
          label="Source"
        />
        
        <Separator />
        
        {/* Target Selection */}
        <SpreadsheetSelector
          elementType={elementType}
          value={target}
          onChange={setTarget}
          label="Target"
        />
        
        <Separator />
        
        {/* Store Result Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="store-result"
            checked={storeResult}
            onCheckedChange={(checked) => setStoreResult(checked as boolean)}
          />
          <Label
            htmlFor="store-result"
            className="text-sm font-normal cursor-pointer"
          >
            Store result for use in subsequent steps
          </Label>
        </div>
        
        {/* Add Rule Button */}
        <Button onClick={handleAddRule} className="w-full" size="lg">
          Add Rule
        </Button>
      </CardContent>
    </Card>
  );
}
