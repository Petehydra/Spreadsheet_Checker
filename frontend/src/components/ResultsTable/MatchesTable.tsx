import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComparisonMatch } from "../../../../shared/types";

interface MatchesTableProps {
  matches: ComparisonMatch[];
}

export function MatchesTable({ matches }: MatchesTableProps) {
  if (matches.length === 0) {
    return <p className="text-sm text-secondary-text">No matches found.</p>;
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.slice(0, 100).map((match, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{String(match.sourceValue)}</TableCell>
              <TableCell className="text-secondary-text">{match.sourceLocation}</TableCell>
              <TableCell className="font-medium">{String(match.targetValue)}</TableCell>
              <TableCell className="text-secondary-text">{match.targetLocation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {matches.length > 100 && (
        <div className="p-3 text-sm text-secondary-text text-center border-t">
          Showing first 100 of {matches.length} matches
        </div>
      )}
    </div>
  );
}
