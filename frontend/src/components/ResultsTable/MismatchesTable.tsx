import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComparisonMismatch } from "../../../../shared/types";

interface MismatchesTableProps {
  mismatches: ComparisonMismatch[];
}

export function MismatchesTable({ mismatches }: MismatchesTableProps) {
  if (mismatches.length === 0) {
    return <p className="text-sm text-secondary-text">No mismatches found.</p>;
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source Value</TableHead>
            <TableHead>Source Location</TableHead>
            <TableHead>Target Value</TableHead>
            <TableHead>Target Location</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mismatches.slice(0, 100).map((mismatch, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{String(mismatch.sourceValue)}</TableCell>
              <TableCell className="text-secondary-text">{mismatch.sourceLocation}</TableCell>
              <TableCell className="font-medium">{String(mismatch.targetValue)}</TableCell>
              <TableCell className="text-secondary-text">{mismatch.targetLocation}</TableCell>
              <TableCell className="text-destructive text-sm">{mismatch.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {mismatches.length > 100 && (
        <div className="p-3 text-sm text-secondary-text text-center border-t">
          Showing first 100 of {mismatches.length} mismatches
        </div>
      )}
    </div>
  );
}
