
import React from "react";
import { Plus } from "lucide-react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LineItemRow from "./LineItemRow";
import { LineItem } from "./types/InvoiceTypes";
import { CaptionText } from "@/components/ui/primitives/Typography";

interface ItemsTableProps {
  lineItems: LineItem[];
  updateLineItem: (index: number, field: string, value: number) => void;
  removeLineItem: (index: number) => void;
  onEditItem: (index: number) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  lineItems,
  updateLineItem,
  removeLineItem,
  onEditItem,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-none">
          <TableHead className="w-[40%] py-3 px-3">
            <CaptionText className="font-medium uppercase tracking-wide">Description</CaptionText>
          </TableHead>
          <TableHead className="text-center py-3 px-2">
            <CaptionText className="font-medium uppercase tracking-wide">Qty</CaptionText>
          </TableHead>
          <TableHead className="text-right py-3 px-2">
            <CaptionText className="font-medium uppercase tracking-wide">Price</CaptionText>
          </TableHead>
          <TableHead className="text-right py-3 px-2">
            <CaptionText className="font-medium uppercase tracking-wide">Amount</CaptionText>
          </TableHead>
          <TableHead className="w-[50px] py-3 px-2"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lineItems.map((item, index) => (
          <LineItemRow
            key={index}
            item={item}
            index={index}
            updateLineItem={updateLineItem}
            removeLineItem={removeLineItem}
            onEditItem={onEditItem}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default ItemsTable;
