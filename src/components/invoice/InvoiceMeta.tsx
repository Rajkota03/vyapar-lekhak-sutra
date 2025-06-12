
import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleNumberSave = (value: string) => {
    if (onInvoiceNumberChange && value.trim()) {
      onInvoiceNumberChange(value.trim());
    }
    setIsEditingNumber(false);
  };

  const handleNumberCancel = () => {
    setIsEditingNumber(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.currentTarget.name === 'invoiceNumber') {
        handleNumberSave(e.currentTarget.value);
      }
    } else if (e.key === 'Escape') {
      if (e.currentTarget.name === 'invoiceNumber') {
        handleNumberCancel();
      }
    }
  };

  const handleNumberClick = () => {
    if (isEditing) {
      setIsEditingNumber(true);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const handleCalendarToggle = (open: boolean) => {
    setIsCalendarOpen(open);
  };

  const formattedDate = format(selectedDate, "dd MMM yyyy");

  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center gap-3">
        <Popover open={isCalendarOpen} onOpenChange={handleCalendarToggle}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer group rounded-lg px-3 py-2 hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border/50">
              <CalendarIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <BodyText className="font-medium text-foreground select-none">
                {formattedDate}
              </BodyText>
            </div>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 z-[100] shadow-lg border bg-popover" 
            align="start"
            sideOffset={8}
          >
            <CalendarComponent 
              mode="single" 
              selected={selectedDate} 
              onSelect={handleDateSelect}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex items-center gap-2">
        {isEditingNumber ? (
          <Input
            name="invoiceNumber"
            defaultValue={invoiceNumber}
            onBlur={(e) => handleNumberSave(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-auto text-sm font-medium text-right border-0 bg-muted/50 rounded px-1 py-0.5 focus:ring-1 focus:ring-primary min-w-0 w-auto"
            style={{ width: `${Math.max(invoiceNumber.length * 0.6, 4)}em` }}
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <div 
            className="cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
            onClick={handleNumberClick}
          >
            <BodyText className="font-medium text-foreground">{invoiceNumber}</BodyText>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceMeta;
