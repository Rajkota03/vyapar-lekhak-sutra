
import React, { useState, useEffect } from "react";
import { Search, Plus, Package, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ItemModal from "./ItemModal";
import { Item } from "./ItemsSection";

interface ItemPickerProps {
  companyId: string | null;
  onItemSelect: (item: Item) => void;
  onClose: () => void;
}

const ItemPicker: React.FC<ItemPickerProps> = ({ companyId, onItemSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search items query
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items', companyId, debouncedSearchTerm],
    queryFn: async () => {
      if (!companyId) return [];
      
      const query = supabase
        .from('items')
        .select('*')
        .eq('company_id', companyId);
      
      if (debouncedSearchTerm) {
        query.or(`name.ilike.%${debouncedSearchTerm}%,code.ilike.%${debouncedSearchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching items:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!companyId,
  });

  // Handle item select
  const handleItemSelect = (item: Item) => {
    onItemSelect(item);
    onClose();
  };

  // Handle new item creation
  const handleItemCreated = (newItem: Item) => {
    setIsModalOpen(false);
    onItemSelect(newItem);
    onClose();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-blue-500"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Create new item
          </Button>
        </div>
        
        <div className="bg-gray-50 p-2 rounded-lg mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
              autoFocus
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <p className="text-sm font-medium mb-2">Items</p>
            <div className="space-y-2 max-h-72 overflow-y-auto rounded-lg">
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleItemSelect(item)}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">{item.name}</div>
                      {item.default_price !== undefined && (
                        <div className="font-medium">₹{parseFloat(item.default_price.toString()).toFixed(2)}</div>
                      )}
                    </div>
                    {item.code && (
                      <div className="text-sm text-muted-foreground">
                        {item.code}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground bg-white p-3 rounded-lg border">
                  {searchTerm ? "No items found" : "Start typing to search items"}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onItemCreated={handleItemCreated}
        companyId={companyId || ""}
      />
    </>
  );
};

export default ItemPicker;
