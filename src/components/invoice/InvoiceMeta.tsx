
import React, { useState } from "react";
import { format, parse, isValid } from "date-fns";
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
  const [isEditingDate, setIsEditingDate] = useState(false);

  const handleNumberSave = (value: string) => {
    if (onInvoiceNumberChange && value.trim()) {
      onInvoiceNumberChange(value.trim());
    }
    setIsEditingNumber(false);
  };

  const handleNumberCancel = () => {
    setIsEditingNumber(false);
  };

  const handleDateSave = (value: string) => {
    // Try to parse the date in multiple formats
    const formats = ['dd MMM yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'];
    let parsedDate: Date | null = null;

    for (const dateFormat of formats) {
      try {
        const parsed = parse(value, dateFormat, new Date());
        if (isValid(parsed)) {
          parsedDate = parsed;
          break;
        }
      } catch (e) {
        // Continue to next format
      }
    }

    if (parsedDate) {
      setSelectedDate(parsedDate);
    }
    setIsEditingDate(false);
  };

  const handleDateCancel = () => {
    setIsEditingDate(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.currentTarget.name === 'invoiceNumber') {
        handleNumberSave(e.currentTarget.value);
      } else if (e.currentTarget.name === 'date') {
        handleDateSave(e.currentTarget.value);
      }
    } else if (e.key === 'Escape') {
      if (e.currentTarget.name === 'invoiceNumber') {
        handleNumberCancel();
      } else if (e.currentTarget.name === 'date') {
        handleDateCancel();
      }
    }
  };

  const handleNumberClick = () => {
    if (isEditing) {
      setIsEditingNumber(true);
    }
  };

  const handleDateClick = () => {
    if (isEditing) {
      setIsEditingDate(true);
    }
  };

  const formattedDate = format(selectedDate, "dd MMM yyyy");

  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center gap-2">
        {isEditingDate ? (
          <Input
            name="date"
            defaultValue={formattedDate}
            onBlur={(e) => handleDateSave(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-auto text-sm font-medium border-0 bg-muted/50 rounded px-1 py-0.5 focus:ring-1 focus:ring-primary min-w-0 w-auto"
            style={{ width: `${Math.max(formattedDate.length * 0.6, 8)}em` }}
            autoFocus
            onFocus={(e) => e.target.select()}
            placeholder="dd MMM yyyy"
          />
        ) : (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <PremiumButton 
                  variant="ghost" 
                  size="sm"
                  className="p-1 h-auto text-muted-foreground hover:bg-transparent"
                >
                  <CalendarIcon className="h-4 w-4" />
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
            
            <div 
              className="cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
              onClick={handleDateClick}
            >
              <BodyText className="font-medium text-foreground">{formattedDate}</BodyText>
            </div>
          </>
        )}
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
