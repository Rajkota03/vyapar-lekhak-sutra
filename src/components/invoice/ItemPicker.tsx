
import React, { useState, useEffect } from "react";
import { Search, Plus, Package, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ItemModal from "./ItemModal";
import { Item } from "./types/InvoiceTypes";

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
      <div className="flex flex-col h-full space-y-3">
        {/* Create new item button - Fixed at top */}
        <div className="flex-shrink-0">
          <Button 
            variant="outline" 
            className="w-full justify-start text-blue-500 border-blue-200 hover:bg-blue-50 h-12"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Create new item
          </Button>
        </div>
        
        {/* Search bar - Fixed at top */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-12 text-base"
              autoFocus
            />
          </div>
        </div>

        {/* Items list - Scrollable */}
        <div className="flex-1 overflow-hidden min-h-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <p className="text-sm font-medium mb-3 text-gray-700 flex-shrink-0">Items</p>
              <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors"
                      onClick={() => handleItemSelect(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="font-medium text-gray-900 truncate text-sm">{item.name}</div>
                          {item.code && (
                            <div className="text-xs text-gray-500 mt-1">{item.code}</div>
                          )}
                        </div>
                        {item.default_price !== undefined && (
                          <div className="font-medium text-gray-900 text-sm flex-shrink-0">
                            ₹{parseFloat(item.default_price.toString()).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-base font-medium mb-1">No items found</p>
                    <p className="text-sm">
                      {searchTerm ? "Try a different search term" : "Create your first item to get started"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
