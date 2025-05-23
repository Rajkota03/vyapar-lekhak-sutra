
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { LineItem } from "./types/InvoiceTypes";
import { formatNumber } from "@/utils/formatNumber";

interface LineItemRowProps {
  item: LineItem;
  index: number;
  updateLineItem: (index: number, field: string, value: number) => void;
  removeLineItem: (index: number) => void;
  onEditItem: (index: number) => void;
}

const LineItemRow: React.FC<LineItemRowProps> = ({
  item,
  index,
  updateLineItem,
  removeLineItem,
  onEditItem,
}) => {
  return (
    <TableRow 
      className="border-b last:border-none cursor-pointer hover:bg-gray-50"
      onClick={() => onEditItem(index)}
    >
      <TableCell className="py-1 pr-2 font-medium text-xs">
        {item.description}
      </TableCell>
      <TableCell className="py-1 pr-2 w-14 text-center text-xs">
        {item.qty}
      </TableCell>
      <TableCell className="py-1 pr-2 w-24 text-right text-xs">
        ₹{formatNumber(item.unit_price)}
      </TableCell>
      <TableCell className="py-1 text-right">
        ₹{item.amount.toFixed(2)}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            removeLineItem(index);
          }}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default LineItemRow;
