import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MatchesTable } from "@/components/ResultsTable/MatchesTable";
import { MismatchesTable } from "@/components/ResultsTable/MismatchesTable";
import { cn } from "@/lib/utils";
import type { ComparisonResults, ComparisonRule } from "../../../../shared/types";

export interface ComparisonResultsViewProps {
  results: ComparisonResults;
  comparisonRules?: ComparisonRule[];
}

/**
 * Displays comparison results: single accordion with all rule details (matches/mismatches) inside.
 */
export function ComparisonResultsView({
  results,
  comparisonRules = [],
}: ComparisonResultsViewProps) {
  const [selectedComparisonIndex, setSelectedComparisonIndex] = useState<number>(0);
  const [resultsView, setResultsView] = useState<'matches' | 'mismatches'>('matches');

  // Get spreadsheet names for each comparison from matches/mismatches
  const comparisonLabels = useMemo(() => {
    return results.details.map((detail) => {
      // Try to get names from first match or mismatch
      const firstMatch = detail.matches[0];
      const firstMismatch = detail.mismatches[0];
      
      const sourceName = firstMatch?.sourceSpreadsheet || 
                        firstMismatch?.sourceSpreadsheet || 
                        'Source';
      const targetName = firstMatch?.targetSpreadsheet || 
                        firstMismatch?.targetSpreadsheet || 
                        'Target';
      
      return {
        source: sourceName,
        target: targetName,
        label: `${sourceName} | ${targetName}`
      };
    });
  }, [results.details]);

  // Filter details based on selected comparison (only show one at a time if multiple exist)
  const displayedDetails = results.details.length > 1 
    ? [results.details[selectedComparisonIndex]]
    : results.details;

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <Card className="bg-card rounded-2xl shadow-sm border border-border">
        <Accordion type="single" collapsible className="w-full" defaultValue="comparison-results">
          <AccordionItem value="comparison-results" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b">
              <h2 className="text-lg font-semibold text-foreground">Comparison Results</h2>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {/* Comparison selector buttons - only show when there are 2+ comparisons */}
              {results.details.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6 pt-5 pb-4 border-b">
                  {comparisonLabels.map((label, index) => (
                    <Button
                      key={index}
                      variant={selectedComparisonIndex === index ? "default" : "outline"}
                      onClick={() => setSelectedComparisonIndex(index)}
                      className={cn(
                        "text-sm shrink-0",
                        selectedComparisonIndex === index && "bg-black text-white hover:bg-black/90 border border-transparent"
                      )}
                    >
                      {label.label}
                    </Button>
                  ))}
                </div>
              )}

              <div className="space-y-6 pt-2">
                {displayedDetails.map((detail, index) => {
                  const actualIndex = results.details.length > 1 
                    ? selectedComparisonIndex 
                    : index;
                  
                  return (
                    <div key={detail.ruleId} className="space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex gap-6">
                          <div>
                            <p className="text-sm font-semibold">Matches:</p>
                            <p className="text-2xl font-bold text-green-600">{detail.matchCount}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Mismatches:</p>
                            <p className="text-2xl font-bold text-red-600">{detail.mismatchCount}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-auto">
                          <Button
                            variant={resultsView === 'matches' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setResultsView('matches')}
                            className={cn(
                              resultsView === 'matches' && "bg-green-600 text-white hover:bg-green-700 border border-transparent",
                              resultsView !== 'matches' && "border-green-600 text-green-600 hover:bg-green-50"
                            )}
                          >
                            Matches
                          </Button>
                          <Button
                            variant={resultsView === 'mismatches' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setResultsView('mismatches')}
                            className={cn(
                              resultsView === 'mismatches' && "bg-red-600 text-white hover:bg-red-700 border border-transparent",
                              resultsView !== 'mismatches' && "border-red-600 text-red-600 hover:bg-red-50"
                            )}
                          >
                            Mismatches
                          </Button>
                        </div>
                      </div>

                      {detail.errorMessage && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                          <p className="font-semibold">Error:</p>
                          <p className="text-sm">{detail.errorMessage}</p>
                        </div>
                      )}

                      {resultsView === 'matches' && detail.matches.length > 0 && (
                        <MatchesTable matches={detail.matches} />
                      )}

                      {resultsView === 'mismatches' && detail.mismatches.length > 0 && (
                        <MismatchesTable mismatches={detail.mismatches} />
                      )}

                      {resultsView === 'matches' && detail.matches.length === 0 && (
                        <p className="text-sm text-secondary-text py-4">No matches found.</p>
                      )}

                      {resultsView === 'mismatches' && detail.mismatches.length === 0 && (
                        <p className="text-sm text-secondary-text py-4">No mismatches found.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}
