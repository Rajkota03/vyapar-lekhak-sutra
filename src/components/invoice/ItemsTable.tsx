
import React from "react";
import { Plus } from "lucide-react";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LineItemRow from "./LineItemRow";
import EditableQuantityLabel from "./EditableQuantityLabel";
import { LineItem } from "./types/InvoiceTypes";
import { CaptionText } from "@/components/ui/primitives/Typography";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCompany } from "@/context/CompanyContext";

interface ItemsTableProps {
  lineItems: LineItem[];
  updateLineItem: (index: number, field: string, value: number) => void;
  removeLineItem: (index: number) => void;
  onEditItem: (index: number) => void;
  selectedCompanyId?: string | null;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  lineItems,
  updateLineItem,
  removeLineItem,
  onEditItem,
  selectedCompanyId
}) => {
  const isMobile = useIsMobile();
  const { currentCompany } = useCompany();
  const effectiveCompanyId = selectedCompanyId || currentCompany?.id;

  return (
    <div className="w-full overflow-hidden">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="border-none">
            <TableHead className={`${isMobile ? 'w-full' : 'w-[45%]'} py-3 px-3 text-left`}>
              <CaptionText className="font-medium uppercase tracking-wide">Description</CaptionText>
            </TableHead>
            {!isMobile && (
              <>
                <TableHead className="w-[12%] py-3 px-2 text-center">
                  <EditableQuantityLabel companyId={effectiveCompanyId} />
                </TableHead>
                <TableHead className="w-[18%] py-3 px-2 text-right">
                  <CaptionText className="font-medium uppercase tracking-wide">Price</CaptionText>
                </TableHead>
                <TableHead className="w-[18%] py-3 text-right px-[3px] mx-0">
                  <CaptionText className="font-medium uppercase tracking-wide">Amount</CaptionText>
                </TableHead>
                <TableHead className="w-[7%] py-3 px-2">
                  {/* Actions column */}
                </TableHead>
              </>
            )}
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
              isMobile={isMobile}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsTable;
