
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

  const handleDateClick = () => {
    setIsCalendarOpen(true);
  };

  const formattedDate = format(selectedDate, "dd MMM yyyy");

  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center gap-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <PremiumButton 
              variant="ghost" 
              size="sm"
              className="p-1 h-auto text-muted-foreground hover:bg-transparent"
              onClick={() => setIsCalendarOpen(true)}
            >
              <CalendarIcon className="h-4 w-4" />
            </PremiumButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent 
              mode="single" 
              selected={selectedDate} 
              onSelect={handleDateSelect}
              initialFocus
              className="p-3"
            />
          </PopoverContent>
        </Popover>
        
        <div 
          className="cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
          onClick={handleDateClick}
        >
          <BodyText className="font-medium text-foreground">{formattedDate}</BodyText>
        </div>
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
