
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] py-1 text-[10px] uppercase tracking-wider text-gray-500">Description</TableHead>
            <TableHead className="text-right py-1 text-[10px] uppercase tracking-wider text-gray-500">Qty</TableHead>
            <TableHead className="text-right py-1 text-[10px] uppercase tracking-wider text-gray-500">Price</TableHead>
            <TableHead className="text-right py-1 text-[10px] uppercase tracking-wider text-gray-500">Amount</TableHead>
            <TableHead className="w-[50px] py-1 text-[10px] uppercase tracking-wider text-gray-500"></TableHead>
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
    </div>
  );
};

export default ItemsTable;
