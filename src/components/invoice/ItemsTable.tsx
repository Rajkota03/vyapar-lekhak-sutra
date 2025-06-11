
import React from "react";
import { Plus } from "lucide-react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LineItemRow from "./LineItemRow";
import { LineItem } from "./types/InvoiceTypes";
import { CaptionText } from "@/components/ui/primitives/Typography";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCompanySettings } from "@/hooks/useCompanySettings";

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
  onEditItem
}) => {
  const isMobile = useIsMobile();
  const { quantityLabel } = useCompanySettings();

  return (
    <div className="w-full overflow-hidden">
      <Table className="w-full table-fixed">
        {!isMobile && (
          <TableHeader>
            <TableRow className="border-none">
              <TableHead className="w-[45%] py-3 px-3 text-left">
                <CaptionText className="font-medium uppercase tracking-wide">Description</CaptionText>
              </TableHead>
              <TableHead className="w-[12%] py-3 px-2 text-center">
                <CaptionText className="font-medium uppercase tracking-wide">{quantityLabel}</CaptionText>
              </TableHead>
              <TableHead className="w-[18%] py-3 px-2 text-right">
                <CaptionText className="font-medium uppercase tracking-wide">Price</CaptionText>
              </TableHead>
              <TableHead className="w-[18%] py-3 text-right px-[3px] mx-0">
                <CaptionText className="font-medium uppercase tracking-wide">Amount</CaptionText>
              </TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {lineItems.map((item, index) => (
            <LineItemRow 
              key={index} 
              item={item} 
              index={index} 
              updateLineItem={updateLineItem} 
              removeLineItem={removeLineItem} 
              onEditItem={onEditItem}
              isMobile={isMobile}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsTable;
