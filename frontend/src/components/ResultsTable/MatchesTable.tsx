import { useState } from "react";
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
import type { ComparisonMatch } from "../../../../shared/types";

const ROWS_PER_PAGE = 200;

interface MatchesTableProps {
  matches: ComparisonMatch[];
}

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

export function MatchesTable({ matches }: MatchesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(matches.length / ROWS_PER_PAGE));
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const pageMatches = matches.slice(start, start + ROWS_PER_PAGE);

  if (matches.length === 0) {
    return <p className="text-sm text-secondary-text">No matches found.</p>;
  }
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[33%]">Source Spreadsheet</TableHead>
            <TableHead className="w-[33%]">Source Value</TableHead>
            <TableHead className="w-[34%]">Target Spreadsheet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageMatches.map((match, index) => (
            <TableRow key={start + index}>
              <TableCell className="text-secondary-text">{match.sourceSpreadsheet ?? '—'}</TableCell>
              <TableCell className="font-bold">{String(match.sourceValue)}</TableCell>
              <TableCell className="text-secondary-text">{match.targetSpreadsheet ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-3 text-sm text-secondary-text text-center border-t">
        Showing {start + 1}–{start + pageMatches.length} of {matches.length} matches
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
