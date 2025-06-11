
import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Edit3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { BodyText } from "@/components/ui/primitives/Typography";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

interface InvoiceMetaProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  invoiceNumber?: string;
  onInvoiceNumberChange?: (number: string) => void;
  isEditing?: boolean;
}

const InvoiceMeta: React.FC<InvoiceMetaProps> = ({
  selectedDate,
  setSelectedDate,
  invoiceNumber = "#25-26/60",
  onInvoiceNumberChange,
  isEditing = false
}) => {
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [tempNumber, setTempNumber] = useState(invoiceNumber);

  const handleNumberSave = () => {
    if (onInvoiceNumberChange && tempNumber.trim()) {
      onInvoiceNumberChange(tempNumber.trim());
    }
    setIsEditingNumber(false);
  };

  const handleNumberCancel = () => {
    setTempNumber(invoiceNumber);
    setIsEditingNumber(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNumberSave();
    } else if (e.key === 'Escape') {
      handleNumberCancel();
    }
  };

  return (
    <div className="flex justify-between items-center py-2">
      <Popover>
        <PopoverTrigger asChild>
          <PremiumButton 
            variant="ghost" 
            size="md"
            className="p-0 h-auto font-medium text-foreground hover:bg-transparent"
          >
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            {format(selectedDate, "dd MMM yyyy")}
          </PremiumButton>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <CalendarComponent 
            mode="single" 
            selected={selectedDate} 
            onSelect={date => date && setSelectedDate(date)} 
            className="p-3 pointer-events-auto" 
          />
        </PopoverContent>
      </Popover>
      
      <div className="flex items-center gap-2">
        {isEditingNumber ? (
          <Input
            value={tempNumber}
            onChange={(e) => setTempNumber(e.target.value)}
            onBlur={handleNumberSave}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm font-medium text-right border-0 p-1 focus:ring-1 focus:ring-primary w-24"
            autoFocus
          />
        ) : (
          <div 
            className="flex items-center gap-1 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
            onClick={() => isEditing && setIsEditingNumber(true)}
          >
            <BodyText className="font-medium text-foreground">{invoiceNumber}</BodyText>
            {isEditing && <Edit3 className="h-3 w-3 text-muted-foreground" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceMeta;
