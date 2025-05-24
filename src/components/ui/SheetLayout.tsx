
import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogPortal } from "@/components/ui/dialog";
import { SheetBody } from "@/components/ui/SheetBody";

interface SheetLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const SheetLayout: React.FC<SheetLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <Dialog open onOpenChange={() => navigate(-1)}>
      <DialogPortal>
        <DialogContent className="fixed inset-x-0 bottom-0 bg-white rounded-t-lg shadow-lg max-h-[80dvh] w-full max-w-none translate-x-0 translate-y-0 sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:top-[50%] sm:left-[50%] sm:inset-x-auto sm:bottom-auto sm:rounded-lg">
          <div className="flex justify-between items-center p-3 border-b">
            <h2 className="text-sm font-medium">{title}</h2>
            <button onClick={() => navigate(-1)} className="p-1">
              <X size={18} />
            </button>
          </div>
          <SheetBody>{children}</SheetBody>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
