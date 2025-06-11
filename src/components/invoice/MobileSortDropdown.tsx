
import React from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortField = 'number' | 'client' | 'date' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc' | null;

interface MobileSortDropdownProps {
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort: (field: SortField) => void;
}

const MobileSortDropdown: React.FC<MobileSortDropdownProps> = ({
  sortField,
  sortDirection,
  onSort
}) => {
  const getSortLabel = () => {
    if (!sortField) return "Sort by";
    
    const fieldLabels = {
      number: "Invoice #",
      client: "Client",
      date: "Date",
      amount: "Amount",
      status: "Status"
    };
    
    const directionLabel = sortDirection === 'asc' ? '↑' : '↓';
    return `${fieldLabels[sortField]} ${directionLabel}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {getSortLabel()}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onSort('number')}>
          Invoice #
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('client')}>
          Client
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('date')}>
          Date
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('amount')}>
          Amount
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('status')}>
          Status
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileSortDropdown;
