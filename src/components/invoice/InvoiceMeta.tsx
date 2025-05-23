
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface InvoiceMetaProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const InvoiceMeta: React.FC<InvoiceMetaProps> = ({ selectedDate, setSelectedDate }) => {
  return (
    <div className="space-y-3">
      <h2 className="font-medium text-lg">Invoice Details</h2>
      <div className="bg-white rounded-lg border p-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Invoice Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50 pointer-events-auto">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default InvoiceMeta;
