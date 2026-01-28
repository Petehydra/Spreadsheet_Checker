import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MatchesTable } from "@/components/ResultsTable/MatchesTable";
import { MismatchesTable } from "@/components/ResultsTable/MismatchesTable";
import Header from "@/components/Header";

export default function Results() {
  const { results, comparisonRules } = useSpreadsheet();
  const navigate = useNavigate();
  
  if (!results) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-8">
          <div className="text-center py-12">
            <p className="text-lg text-secondary-text mb-4">
              No results available. Please configure and execute comparisons first.
            </p>
            <Button onClick={() => navigate('/config')}>
              Go to Configuration
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Comparison Results</h1>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{results.totalRules}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">{results.passedRules}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-600">{results.failedRules}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Expandable Rule Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {results.details.map((detail, index) => {
                const rule = comparisonRules.find(r => r.id === detail.ruleId);
                
                return (
                  <AccordionItem key={detail.ruleId} value={detail.ruleId}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">Step {detail.stepNumber}</span>
                          <span className="text-sm text-secondary-text">
                            {rule?.method || 'Unknown method'}
                          </span>
                        </div>
                        <Badge variant={detail.status === 'passed' ? 'default' : 'destructive'}>
                          {detail.status}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
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
                        
                        {/* Matches table */}
                        {detail.matches.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Matches</h4>
                            <MatchesTable matches={detail.matches} />
                          </div>
                        )}
                        
                        {/* Mismatches table */}
                        {detail.mismatches.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Mismatches</h4>
                            <MismatchesTable mismatches={detail.mismatches} />
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex gap-4">
          <Button onClick={() => navigate('/config')}>Configure New Comparison</Button>
          <Button variant="outline" onClick={() => navigate('/')}>Upload More Files</Button>
        </div>
      </div>
    </div>
  );
}
