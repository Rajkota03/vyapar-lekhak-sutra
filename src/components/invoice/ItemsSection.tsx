
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import NoItemsView from "./NoItemsView";
import ItemsTable from "./ItemsTable";
import ItemPickerDialog from "./ItemPickerDialog";
import ItemEditSheet from "./ItemEditSheet";
import { Item, LineItem } from "./types/InvoiceTypes";

interface ItemsSectionProps {
  lineItems: LineItem[];
  setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
  items?: Item[];
  selectedCompanyId: string | null;
}

const ItemsSection: React.FC<ItemsSectionProps> = ({
  lineItems,
  setLineItems,
  items = [],
  selectedCompanyId,
}) => {
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

  // Add a new line item from the selected item
  const addLineItem = (item: Item) => {
    const newItem: LineItem = {
      item_id: item.id,
      description: item.name,
      qty: 1,
      unit_price: item.default_price || 0,
      cgst: item.default_cgst ?? 9,
      sgst: item.default_sgst ?? 9,
      amount: item.default_price || 0,
      discount_amount: 0,
      note: '',
    };

    setLineItems([...lineItems, newItem]);
    setItemPickerOpen(false);
  };

  // Update line item quantity or price
  const updateLineItem = (index: number, field: string, value: number) => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[index] };

    if (field === "qty") {
      item.qty = value;
      item.amount = item.qty * item.unit_price - (item.discount_amount || 0);
    } else if (field === "unit_price") {
      item.unit_price = value;
      item.amount = item.qty * item.unit_price - (item.discount_amount || 0);
    }

    updatedItems[index] = item;
    setLineItems(updatedItems);
  };

  // Update entire line item (from edit sheet)
  const updateEntireLineItem = (index: number, updatedLine: LineItem) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = updatedLine;
    setLineItems(updatedItems);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    const updatedItems = [...lineItems];
    updatedItems.splice(index, 1);
    setLineItems(updatedItems);
    setEditingLineIndex(null);
  };

  const handleEditItem = (index: number) => {
    setEditingLineIndex(index);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold">Items</h2>
        {lineItems.length > 0 && (
          <span className="text-[10px] text-gray-400 sm:hidden">
            Tap & hold to re-sort items
          </span>
        )}
      </div>

      <div className="rounded-md bg-white shadow-sm border">
        {lineItems.length > 0 ? (
          <ItemsTable 
            lineItems={lineItems}
            updateLineItem={updateLineItem}
            removeLineItem={removeLineItem}
            onEditItem={handleEditItem}
          />
        ) : (
          <NoItemsView onAddItem={() => setItemPickerOpen(true)} />
        )}
      </div>

      {lineItems.length > 0 && (
        <Button
          variant="outline"
          className="w-full flex items-center justify-center border-dashed border-blue-500 text-blue-500 h-8 rounded text-xs font-medium"
          onClick={() => setItemPickerOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      )}
      
      <ItemPickerDialog 
        isOpen={itemPickerOpen}
        onOpenChange={setItemPickerOpen}
        onItemSelect={addLineItem}
        selectedCompanyId={selectedCompanyId}
      />

      <ItemEditSheet
        isOpen={editingLineIndex !== null}
        onOpenChange={(open) => !open && setEditingLineIndex(null)}
        line={editingLineIndex !== null ? lineItems[editingLineIndex] : null}
        onSave={(updatedLine) => {
          if (editingLineIndex !== null) {
            updateEntireLineItem(editingLineIndex, updatedLine);
            setEditingLineIndex(null);
          }
        }}
        onDelete={() => {
          if (editingLineIndex !== null) {
            removeLineItem(editingLineIndex);
          }
        }}
      />
    </div>
  );
};

export default ItemsSection;
