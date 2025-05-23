import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Package } from "lucide-react";
import { Item } from "./types/InvoiceTypes";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: Item) => void;
  companyId: string;
  item?: Item;
}

const ItemModal: React.FC<ItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onItemCreated,
  companyId,
  item 
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!item;

  // Form state
  const [name, setName] = useState(item?.name || "");
  const [code, setCode] = useState(item?.code || "");
  const [defaultPrice, setDefaultPrice] = useState(
    item?.default_price !== undefined ? String(item.default_price) : ""
  );
  const [useCGST, setUseCGST] = useState(!!item?.default_cgst);
  const [useSGST, setUseSGST] = useState(!!item?.default_sgst);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo upload functionality (basic implementation)
  const [photo, setPhoto] = useState<File | null>(null);

  // Create/Update item mutation
  const itemMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsSubmitting(true);
      try {
        // Prepare the item data with explicit company_id
        const itemData = {
          name,
          code: code || null,
          default_price: defaultPrice ? parseFloat(defaultPrice) : null,
          default_cgst: useCGST ? 9 : null,
          default_sgst: useSGST ? 9 : null,
          company_id: companyId
        };

        let newItem: Item;

        if (isEditing && item) {
          // Update existing item
          const { data, error } = await supabase
            .from('items')
            .update(itemData)
            .eq('id', item.id)
            .select()
            .single();

          if (error) throw error;
          newItem = data;
        } else {
          // Create new item
          const { data, error } = await supabase
            .from('items')
            .insert(itemData)
            .select()
            .single();

          if (error) throw error;
          newItem = data;
        }

        // Handle photo upload if there is a photo
        if (photo) {
          const fileName = `${newItem.id}-${Date.now()}`;
          const { error: uploadError } = await supabase.storage
            .from('items')
            .upload(fileName, photo);

          if (uploadError) {
            console.error("Error uploading photo:", uploadError);
            // Continue with item creation even if photo upload fails
          } else {
            // Update the item with the photo URL
            const photoUrl = `${supabase.storage.from('items').getPublicUrl(fileName).data.publicUrl}`;
            
            const { error: updateError } = await supabase
              .from('items')
              .update({ photo_url: photoUrl })
              .eq('id', newItem.id);

            if (updateError) {
              console.error("Error updating item with photo URL:", updateError);
            } else {
              newItem.photo_url = photoUrl;
            }
          }
        }

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['items'] });
        
        toast({
          title: isEditing ? "Item updated" : "Item created",
          description: `${name} has been ${isEditing ? 'updated' : 'created'} successfully.`
        });

        return newItem;
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        variant: "destructive",
        title: "Name is required",
        description: "Please enter an item name"
      });
      return;
    }

    // Create form data for file upload
    const formData = new FormData();
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const newItem = await itemMutation.mutateAsync(formData);
      onItemCreated(newItem);
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save the item. Please try again."
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-500" /> 
            {isEditing ? "Edit Item" : "Create Item"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Item Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Optional code or SKU"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Default Price (₹)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="cgst">Include CGST (9%)</Label>
            <Switch
              id="cgst"
              checked={useCGST}
              onCheckedChange={setUseCGST}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sgst">Include SGST (9%)</Label>
            <Switch
              id="sgst"
              checked={useSGST}
              onCheckedChange={setUseSGST}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Item Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {photo && (
              <div className="text-sm text-muted-foreground">
                Selected file: {photo.name}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !name}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemModal;
