
import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Item = {
  id: string;
  name: string;
  code?: string;
  default_price?: number;
  default_cgst?: number;
  default_sgst?: number;
};

export type LineItem = {
  id?: string;
  item_id?: string;
  description: string;
  qty: number;
  unit_price: number;
  cgst?: number;
  sgst?: number;
  amount: number;
};

interface ItemsSectionProps {
  lineItems: LineItem[];
  setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
  items?: Item[];
}

const ItemsSection: React.FC<ItemsSectionProps> = ({
  lineItems,
  setLineItems,
  items = [],
}) => {
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter items by search term
  const filteredItems = items?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Add a new line item from the selected item
  const addLineItem = (item: Item) => {
    const newItem: LineItem = {
      item_id: item.id,
      description: item.name,
      qty: 1,
      unit_price: item.default_price || 0,
      cgst: item.default_cgst,
      sgst: item.default_sgst,
      amount: item.default_price || 0,
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
      item.amount = item.qty * item.unit_price;
    } else if (field === "unit_price") {
      item.unit_price = value;
      item.amount = item.qty * item.unit_price;
    }

    updatedItems[index] = item;
    setLineItems(updatedItems);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    const updatedItems = [...lineItems];
    updatedItems.splice(index, 1);
    setLineItems(updatedItems);
  };

  // Item Picker Modal
  const ItemPickerModal = () => (
    <Dialog open={itemPickerOpen} onOpenChange={setItemPickerOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {filteredItems && filteredItems.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => {
                    addLineItem(item);
                    setSearchTerm("");
                  }}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{item.name}</div>
                    {item.default_price && (
                      <div>₹{item.default_price.toFixed(2)}</div>
                    )}
                  </div>
                  {item.code && (
                    <div className="text-sm text-muted-foreground">
                      Code: {item.code}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No items found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-lg">Items</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setItemPickerOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        {lineItems.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
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
                        className="w-16 text-right"
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
                        className="w-24 text-right"
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
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No items added</p>
            <Button
              variant="outline"
              onClick={() => setItemPickerOpen(true)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
        )}
      </div>
      <ItemPickerModal />
    </div>
  );
};

export default ItemsSection;
