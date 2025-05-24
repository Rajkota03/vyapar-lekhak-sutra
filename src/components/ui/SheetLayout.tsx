
import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface SheetLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const SheetLayout: React.FC<SheetLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <Sheet open onOpenChange={() => navigate(-1)}>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <SheetHeader className="flex-row justify-between items-center p-3 border-b">
          <SheetTitle className="text-sm font-medium">{title}</SheetTitle>
          <button onClick={() => navigate(-1)} className="p-1">
            <X size={18} />
          </button>
        </SheetHeader>
        <div className="overflow-y-auto h-full p-4 pb-24">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
