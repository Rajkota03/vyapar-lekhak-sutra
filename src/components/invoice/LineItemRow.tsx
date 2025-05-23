
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives/Input";
import { TableCell, TableRow } from "@/components/ui/table";
import { LineItem } from "./types/InvoiceTypes";

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
      <TableCell className="py-1 pr-2">
        <Input
          type="number"
          value={item.qty}
          min={1}
          onChange={(e) => {
            e.stopPropagation();
            updateLineItem(index, "qty", Number(e.target.value));
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-14 h-8 text-right text-xs"
        />
      </TableCell>
      <TableCell className="py-1 pr-2">
        <Input
          type="number"
          value={item.unit_price}
          min={0}
          onChange={(e) => {
            e.stopPropagation();
            updateLineItem(index, "unit_price", Number(e.target.value));
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-20 h-8 text-right text-xs"
        />
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
