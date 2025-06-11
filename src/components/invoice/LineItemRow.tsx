
import React from "react";
import { X } from "lucide-react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { TableCell, TableRow } from "@/components/ui/table";
import SwipeableRow from "./SwipeableRow";
import { LineItem } from "./types/InvoiceTypes";
import { formatNumber } from "@/utils/formatNumber";
import { BodyText, CaptionText } from "@/components/ui/primitives/Typography";

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
    <SwipeableRow onDelete={() => removeLineItem(index)}>
      <TableRow 
        className="border-b last:border-none cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => onEditItem(index)}
      >
        <TableCell className="py-3 px-3">
          <BodyText className="font-medium">
            {item.description}
          </BodyText>
        </TableCell>
        <TableCell className="py-3 px-2 text-center">
          <BodyText>{item.qty}</BodyText>
        </TableCell>
        <TableCell className="py-3 px-2 text-right">
          <BodyText>₹{formatNumber(item.unit_price)}</BodyText>
        </TableCell>
        <TableCell className="py-3 px-2 text-right">
          <BodyText className="font-semibold">₹{item.amount.toFixed(2)}</BodyText>
        </TableCell>
        <TableCell className="py-3 px-2">
          <PremiumButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              removeLineItem(index);
            }}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </PremiumButton>
        </TableCell>
      </TableRow>
    </SwipeableRow>
  );
};

export default LineItemRow;
