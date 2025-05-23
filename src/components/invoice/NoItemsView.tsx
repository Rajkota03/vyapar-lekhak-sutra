
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoItemsViewProps {
  onAddItem: () => void;
}

const NoItemsView: React.FC<NoItemsViewProps> = ({ onAddItem }) => {
  return (
    <div className="text-center py-6">
      <p className="text-muted-foreground text-sm">No items added</p>
      <Button
        variant="outline"
        onClick={onAddItem}
        className="mt-2 h-9 rounded-md text-sm font-medium"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>
    </div>
  );
};

export default NoItemsView;
