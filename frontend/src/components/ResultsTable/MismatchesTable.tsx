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
import type { ComparisonMismatch } from "../../../../shared/types";

const ROWS_PER_PAGE = 200;

interface MismatchesTableProps {
  mismatches: ComparisonMismatch[];
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

export function MismatchesTable({ mismatches }: MismatchesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(mismatches.length / ROWS_PER_PAGE));
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const pageMismatches = mismatches.slice(start, start + ROWS_PER_PAGE);

  if (mismatches.length === 0) {
    return <p className="text-sm text-secondary-text">No mismatches found.</p>;
  }
  
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
          {pageMismatches.map((mismatch, index) => (
            <TableRow key={start + index}>
              <TableCell className="text-secondary-text">{mismatch.sourceSpreadsheet ?? '—'}</TableCell>
              <TableCell className="font-bold">{String(mismatch.sourceValue)}</TableCell>
              <TableCell className="text-secondary-text">{mismatch.targetSpreadsheet ?? '—'}</TableCell>
              <TableCell className="text-destructive text-sm">No match found</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-3 text-sm text-secondary-text text-center border-t">
        Showing {start + 1}–{start + pageMismatches.length} of {mismatches.length} mismatches
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
