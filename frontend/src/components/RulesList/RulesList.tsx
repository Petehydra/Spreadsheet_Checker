import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import type { ComparisonRule } from "../../../../shared/types";

export function RulesList() {
  const { comparisonRules, removeRule, reorderRules, spreadsheets } = useSpreadsheet();
  
  const moveRuleUp = (index: number) => {
    if (index === 0) return;
    
    const newRules = [...comparisonRules];
    [newRules[index - 1], newRules[index]] = [newRules[index], newRules[index - 1]];
    
    reorderRules(newRules.map(r => r.id));
  };
  
  const moveRuleDown = (index: number) => {
    if (index === comparisonRules.length - 1) return;
    
    const newRules = [...comparisonRules];
    [newRules[index], newRules[index + 1]] = [newRules[index + 1], newRules[index]];
    
    reorderRules(newRules.map(r => r.id));
  };
  
  const getRuleSummary = (rule: ComparisonRule) => {
    const sourceSpreadsheet = spreadsheets.find(s => s.id === rule.source.spreadsheetId);
    const targetSpreadsheet = spreadsheets.find(s => s.id === rule.target.spreadsheetId);
    
    const sourceText = sourceSpreadsheet 
      ? `${sourceSpreadsheet.fileName} > ${rule.source.sheetName} > ${rule.elementType === 'column' ? rule.source.elementIdentifier : `Row ${Number(rule.source.elementIdentifier) + 1}`}`
      : 'Unknown source';
    
    const targetText = targetSpreadsheet 
      ? `${targetSpreadsheet.fileName} > ${rule.target.sheetName} > ${rule.elementType === 'column' ? rule.target.elementIdentifier : `Row ${Number(rule.target.elementIdentifier) + 1}`}`
      : 'Unknown target';
    
    return `${sourceText} ${rule.method} ${targetText}`;
  };
  
  if (comparisonRules.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-text">
        <p>No rules configured yet.</p>
        <p className="text-sm mt-2">Add a rule using the form on the left.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {comparisonRules.map((rule, index) => (
        <Card key={rule.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {/* Step Number */}
              <Badge className="shrink-0 mt-1" variant="outline">
                Step {rule.stepNumber}
              </Badge>
              
              {/* Rule Summary */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">
                  {rule.elementType.charAt(0).toUpperCase() + rule.elementType.slice(1)} Comparison
                </p>
                <p className="text-sm text-secondary-text break-words">
                  {getRuleSummary(rule)}
                </p>
                {rule.storeResult && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Result stored
                  </Badge>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveRuleUp(index)}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveRuleDown(index)}
                  disabled={index === comparisonRules.length - 1}
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRule(rule.id)}
                  className="text-destructive hover:text-destructive"
                  title="Delete rule"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
