import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { MatchesTable } from "@/components/ResultsTable/MatchesTable";
import { MismatchesTable } from "@/components/ResultsTable/MismatchesTable";
import type { ComparisonResults, ComparisonRule } from "../../../../shared/types";

export interface ComparisonResultsViewProps {
  results: ComparisonResults;
  comparisonRules?: ComparisonRule[];
}

/**
 * Displays comparison results: accordion of rule details (matches/mismatches) and optional action buttons.
 */
export function ComparisonResultsView({
  results,
  comparisonRules = [],
}: ComparisonResultsViewProps) {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <Accordion type="multiple" className="w-full">
          {results.details.map((detail) => (
            <AccordionItem key={detail.ruleId} value={detail.ruleId} className="border-none">
              <CardHeader className="px-6 py-0">
                <AccordionTrigger className="py-5 hover:no-underline [&[data-state=open]]:border-b">
                  <CardTitle className="text-2xl font-semibold leading-none tracking-tight">
                    Comparison Results
                  </CardTitle>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="pt-4">
                  <div className="space-y-4">
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

                      {detail.errorMessage && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                          <p className="font-semibold">Error:</p>
                          <p className="text-sm">{detail.errorMessage}</p>
                        </div>
                      )}

                      {detail.matches.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Matches</h4>
                          <MatchesTable matches={detail.matches} />
                        </div>
                      )}

                      {detail.mismatches.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Mismatches</h4>
                          <MismatchesTable mismatches={detail.mismatches} />
                        </div>
                      )}
                  </div>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
