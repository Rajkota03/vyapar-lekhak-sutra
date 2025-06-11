
import React from "react";
import { X } from "lucide-react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { TableCell, TableRow } from "@/components/ui/table";
import { LineItem } from "./types/InvoiceTypes";
import { formatNumber } from "@/utils/formatNumber";
import { BodyText } from "@/components/ui/primitives/Typography";

interface LineItemRowProps {
  item: LineItem;
  index: number;
  updateLineItem: (index: number, field: string, value: number) => void;
  removeLineItem: (index: number) => void;
  onEditItem: (index: number) => void;
  isMobile?: boolean;
}

const LineItemRow: React.FC<LineItemRowProps> = ({
  item,
  index,
  updateLineItem,
  removeLineItem,
  onEditItem,
  isMobile = false
}) => {
  if (isMobile) {
    return (
      <TableRow className="border-b last:border-none cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onEditItem(index)}>
        <TableCell className="w-full py-4 px-3" colSpan={1}>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <BodyText className="font-medium text-base">
                {item.description}
              </BodyText>
              <div className="flex items-center gap-4 mt-1">
                <BodyText className="text-muted-foreground text-sm">
                  {item.qty} × ₹{formatNumber(item.unit_price)}
                </BodyText>
              </div>
            </div>
            <div className="text-right">
              <BodyText className="font-semibold text-base">
                ₹{formatNumber(item.amount)}
              </BodyText>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="border-b last:border-none cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onEditItem(index)}>
      <TableCell className="w-[45%] py-3 px-3 text-left">
        <BodyText className="font-medium truncate">
          {item.description}
        </BodyText>
      </TableCell>
      <TableCell className="w-[12%] py-3 px-2 text-center">
        <BodyText>{item.qty}</BodyText>
      </TableCell>
      <TableCell className="w-[18%] py-3 px-2 text-right">
        <BodyText>₹{formatNumber(item.unit_price)}</BodyText>
      </TableCell>
      <TableCell className="w-[18%] py-3 px-2 text-right">
        <BodyText className="font-semibold">₹{formatNumber(item.amount)}</BodyText>
      </TableCell>
      <TableCell className="w-[7%] py-3 px-2">
        {/* Actions column - kept empty for now */}
      </TableCell>
    </TableRow>
  );
};

export default LineItemRow;
