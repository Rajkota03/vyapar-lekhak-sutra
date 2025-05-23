
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
    <div className="bg-white rounded-lg border p-4 flex justify-between items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="text-xl font-bold p-0 h-auto">
            {format(selectedDate, "dd MMM yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="p-3"
          />
        </PopoverContent>
      </Popover>
      
      <div className="text-xl font-bold">{invoiceNumber}</div>
    </div>
  );
};

export default InvoiceMeta;
