
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { LineItem } from "./types/InvoiceTypes";

interface LineItemRowProps {
  item: LineItem;
  index: number;
  updateLineItem: (index: number, field: string, value: number) => void;
  removeLineItem: (index: number) => void;
}

const LineItemRow: React.FC<LineItemRowProps> = ({
  item,
  index,
  updateLineItem,
  removeLineItem,
}) => {
  return (
    <TableRow>
      <TableCell className="align-top font-medium">
        {item.description}
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          value={item.qty}
          min={1}
          onChange={(e) =>
            updateLineItem(index, "qty", Number(e.target.value))
          }
          className="w-16 h-9 text-right text-sm"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          value={item.unit_price}
          min={0}
          onChange={(e) =>
            updateLineItem(
              index,
              "unit_price",
              Number(e.target.value)
            )
          }
          className="w-16 h-9 text-right text-sm"
        />
      </TableCell>
      <TableCell className="text-right">
        ₹{item.amount.toFixed(2)}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeLineItem(index)}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default LineItemRow;
