
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
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  lineItems,
  updateLineItem,
  removeLineItem,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] text-xs uppercase text-gray-500 py-2">Description</TableHead>
            <TableHead className="text-right text-xs uppercase text-gray-500 py-2">Qty</TableHead>
            <TableHead className="text-right text-xs uppercase text-gray-500 py-2">Price</TableHead>
            <TableHead className="text-right text-xs uppercase text-gray-500 py-2">Amount</TableHead>
            <TableHead className="w-[50px] text-xs uppercase text-gray-500 py-2"></TableHead>
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
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsTable;
