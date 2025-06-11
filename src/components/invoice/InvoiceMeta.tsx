
import React from "react";
import { format } from "date-fns";
import { Calendar, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { BodyText, CaptionText } from "@/components/ui/primitives/Typography";
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
    <ModernCard variant="outlined" padding="md" className="flex justify-between items-center">
      <Popover>
        <PopoverTrigger asChild>
          <PremiumButton 
            variant="ghost" 
            size="md"
            className="p-0 h-auto font-semibold text-lg hover:bg-transparent"
          >
            <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
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
      
      <div className="text-right">
        <BodyText className="font-semibold text-lg">{invoiceNumber}</BodyText>
      </div>
    </ModernCard>
  );
};

export default InvoiceMeta;
