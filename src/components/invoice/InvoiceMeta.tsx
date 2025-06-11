
import React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { BodyText } from "@/components/ui/primitives/Typography";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface InvoiceMetaProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  invoiceNumber?: string;
}

const InvoiceMeta: React.FC<InvoiceMetaProps> = ({
  selectedDate,
  setSelectedDate,
  invoiceNumber = "#25-26/60"
}) => {
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
      
      <BodyText className="font-medium text-foreground">{invoiceNumber}</BodyText>
    </div>
  );
};

export default InvoiceMeta;
