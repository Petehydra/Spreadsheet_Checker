import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComparisonMatch, ComparisonMismatch, ComparisonRule } from "../../../../shared/types";

const ROWS_PER_PAGE = 200;

interface CombinedResultsTableProps {
  matches: ComparisonMatch[];
  mismatches: ComparisonMismatch[];
  comparisonRules?: ComparisonRule[];
}

type CombinedResult = {
  type: 'match' | 'mismatch';
  data: ComparisonMatch | ComparisonMismatch;
};

function PageSelector({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (currentPage > 3) pages.push("ellipsis");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
      if (!pages.includes(p)) pages.push(p);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 py-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      {getPageNumbers().map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-1 text-secondary-text">…</span>
        ) : (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "outline"}
            size="sm"
            className={cn(currentPage === p && "bg-black hover:bg-black/90")}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}

export function CombinedResultsTable({ matches, mismatches, comparisonRules = [] }: CombinedResultsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Combine matches and mismatches into a single array
  const combinedResults: CombinedResult[] = useMemo(() => {
    const matchResults: CombinedResult[] = matches.map(m => ({ type: 'match' as const, data: m }));
    const mismatchResults: CombinedResult[] = mismatches.map(m => ({ type: 'mismatch' as const, data: m }));
    return [...matchResults, ...mismatchResults];
  }, [matches, mismatches]);

  const totalPages = Math.max(1, Math.ceil(combinedResults.length / ROWS_PER_PAGE));
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const pageResults = combinedResults.slice(start, start + ROWS_PER_PAGE);

  // Detect if this is Multi mode (2 rules with step numbers 1 and 2)
  const isMultiMode = useMemo(() => {
    return comparisonRules.length === 2 && 
           comparisonRules[0]?.stepNumber === 1 && 
           comparisonRules[1]?.stepNumber === 2;
  }, [comparisonRules]);

  // Get column/row labels for Multi mode
  const getElementLabel = (rule: ComparisonRule | undefined) => {
    if (!rule) return '';
    const elementIndex = rule.source.elementIdentifier;
    if (typeof elementIndex === 'number') {
      if (rule.elementType === 'column') {
        // Convert column index to letter (0-based: 0=A, 1=B, etc.)
        let letter = '';
        let n = elementIndex;
        while (n >= 0) {
          letter = String.fromCharCode((n % 26) + 65) + letter;
          n = Math.floor(n / 26) - 1;
        }
        return `Column ${letter}`;
      } else {
        // Row index (1-based display)
        return `Row ${elementIndex + 1}`;
      }
    }
    return String(elementIndex);
  };

  // Generate conclusion text based on result type
  const getConclusion = (result: CombinedResult) => {
    if (result.type === 'match') {
      if (isMultiMode) {
        return 'Comparison 1: Match found\nComparison 2: Match found';
      }
      return 'Match found';
    } else {
      const mismatch = result.data as ComparisonMismatch;
      if (isMultiMode) {
        if (mismatch.reason === 'Found no matching value for comparison 1') {
          return 'Comparison 1: No match found';
        } else if (mismatch.reason === 'Comparison 1 matched, but comparison 2 failed') {
          return `Comparison 1: Match found\nComparison 2: No match found (expected: ${mismatch.step2SourceValue}, found: ${mismatch.step2TargetValue})`;
        }
      }
      return mismatch.reason || 'No match found';
    }
  };

  if (combinedResults.length === 0) {
    return <p className="text-sm text-secondary-text py-4">No results found.</p>;
  }

  if (isMultiMode) {
    // Multi mode table with 4 columns
    return (
      <div className="rounded-md border overflow-hidden">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Source Spreadsheet</TableHead>
              <TableHead className="w-[25%]">Source Value {getElementLabel(comparisonRules[0])}</TableHead>
              <TableHead className="w-[25%]">Source Value {getElementLabel(comparisonRules[1])}</TableHead>
              <TableHead className="w-[25%]">Conclusion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageResults.map((result, index) => {
              const match = result.type === 'match' ? result.data as ComparisonMatch : null;
              const mismatch = result.type === 'mismatch' ? result.data as ComparisonMismatch : null;
              
              return (
                <TableRow key={`${result.type}-${start + index}`}>
                  <TableCell className="text-secondary-text">
                    {(match || mismatch)?.sourceSpreadsheet ?? '—'}
                  </TableCell>
                  <TableCell className="font-bold whitespace-pre-wrap break-words">
                    {match 
                      ? String(match.step1SourceValue ?? match.sourceValue)
                      : mismatch
                      ? String(mismatch.step1SourceValue ?? mismatch.sourceValue)
                      : '—'}
                  </TableCell>
                  <TableCell className="font-bold whitespace-pre-wrap break-words">
                    {match 
                      ? String(match.step2SourceValue ?? '—')
                      : mismatch
                      ? (mismatch.step2SourceValue !== null ? String(mismatch.step2SourceValue) : '—')
                      : '—'}
                  </TableCell>
                  <TableCell className={cn(
                    "text-sm whitespace-pre-wrap break-words",
                    result.type === 'match' ? "text-green-600" : "text-destructive"
                  )}>
                    {getConclusion(result)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="p-3 text-sm text-secondary-text text-center border-t">
          Showing {start + 1}–{start + pageResults.length} of {combinedResults.length} results
        </div>
        {totalPages > 1 && (
          <div className="border-t">
            <PageSelector
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    );
  }

  // Single mode table with 4 columns (including Conclusion)
  return (
    <div className="rounded-md border overflow-hidden">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Source Spreadsheet</TableHead>
            <TableHead className="w-[25%]">Source Value</TableHead>
            <TableHead className="w-[25%]">Target Spreadsheet</TableHead>
            <TableHead className="w-[25%]">Conclusion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageResults.map((result, index) => {
            const match = result.type === 'match' ? result.data as ComparisonMatch : null;
            const mismatch = result.type === 'mismatch' ? result.data as ComparisonMismatch : null;
            
            return (
              <TableRow key={`${result.type}-${start + index}`}>
                <TableCell className="text-secondary-text">
                  {(match || mismatch)?.sourceSpreadsheet ?? '—'}
                </TableCell>
                <TableCell className="font-bold">
                  {match 
                    ? String(match.sourceValue)
                    : mismatch
                    ? String(mismatch.sourceValue)
                    : '—'}
                </TableCell>
                <TableCell className="text-secondary-text">
                  {(match || mismatch)?.targetSpreadsheet ?? '—'}
                </TableCell>
                <TableCell className={cn(
                  "text-sm",
                  result.type === 'match' ? "text-green-600" : "text-destructive"
                )}>
                  {getConclusion(result)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="p-3 text-sm text-secondary-text text-center border-t">
        Showing {start + 1}–{start + pageResults.length} of {combinedResults.length} results
      </div>
      {totalPages > 1 && (
        <div className="border-t">
          <PageSelector
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
