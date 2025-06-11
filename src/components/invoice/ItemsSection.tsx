
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/context/CompanyContext";
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
  const { currentCompany } = useCompany();
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

  // Use the selectedCompanyId from props, fallback to currentCompany.id
  const effectiveCompanyId = selectedCompanyId || currentCompany?.id || null;

  console.log('=== ITEMS SECTION COMPANY ID ===');
  console.log('Props selectedCompanyId:', selectedCompanyId);
  console.log('Current company ID:', currentCompany?.id);
  console.log('Effective company ID:', effectiveCompanyId);

  // Add a new line item from the selected item
  const addLineItem = (item: Item) => {
    console.log('=== ADDING LINE ITEM ===');
    console.log('Selected item:', item);
    
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

    console.log('New line item:', newItem);
    setLineItems(prevItems => {
      const updatedItems = [...prevItems, newItem];
      console.log('Updated line items:', updatedItems);
      return updatedItems;
    });
    setItemPickerOpen(false);
  };

  // Update line item quantity or price
  const updateLineItem = (index: number, field: string, value: number) => {
    console.log('=== UPDATING LINE ITEM ===');
    console.log('Index:', index, 'Field:', field, 'Value:', value);
    
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
    console.log('Updated line item:', item);
    setLineItems(updatedItems);
  };

  // Update entire line item (from edit sheet)
  const updateEntireLineItem = (index: number, updatedLine: LineItem) => {
    console.log('=== UPDATING ENTIRE LINE ITEM ===');
    console.log('Index:', index, 'Updated line:', updatedLine);
    
    const updatedItems = [...lineItems];
    updatedItems[index] = updatedLine;
    setLineItems(updatedItems);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    console.log('=== REMOVING LINE ITEM ===');
    console.log('Index:', index);
    
    const updatedItems = [...lineItems];
    updatedItems.splice(index, 1);
    setLineItems(updatedItems);
    setEditingLineIndex(null);
  };

  const handleEditItem = (index: number) => {
    console.log('=== EDITING LINE ITEM ===');
    console.log('Index:', index);
    setEditingLineIndex(index);
  };

  const handleOpenItemPicker = () => {
    if (!effectiveCompanyId) {
      console.error('Cannot open item picker: No company ID');
      return;
    }
    console.log('=== OPENING ITEM PICKER ===');
    console.log('Company ID:', effectiveCompanyId);
    setItemPickerOpen(true);
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

      {lineItems.length > 0 ? (
        <ItemsTable 
          lineItems={lineItems}
          updateLineItem={updateLineItem}
          removeLineItem={removeLineItem}
          onEditItem={handleEditItem}
        />
      ) : (
        <div className="rounded-md bg-white shadow-sm border">
          <NoItemsView onAddItem={handleOpenItemPicker} />
        </div>
      )}

      {lineItems.length > 0 && (
        <Button
          variant="outline"
          className="w-full flex items-center justify-center border-dashed border-blue-500 text-blue-500 h-8 rounded text-xs font-medium"
          onClick={handleOpenItemPicker}
          disabled={!effectiveCompanyId}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      )}
      
      <ItemPickerDialog 
        isOpen={itemPickerOpen}
        onOpenChange={setItemPickerOpen}
        onItemSelect={addLineItem}
        selectedCompanyId={effectiveCompanyId}
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
