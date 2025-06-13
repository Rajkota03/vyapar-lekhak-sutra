
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { AnalyticsFilters, FilterPeriod } from "@/hooks/useAnalytics";

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

export const AnalyticsFiltersComponent: React.FC<AnalyticsFiltersProps> = ({ 
  filters, 
  onFiltersChange 
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const quarters = [
    `Q1 ${currentYear}`, `Q2 ${currentYear}`, `Q3 ${currentYear}`, `Q4 ${currentYear}`,
    `Q1 ${currentYear - 1}`, `Q2 ${currentYear - 1}`, `Q3 ${currentYear - 1}`, `Q4 ${currentYear - 1}`
  ];

  const monthsWithYears = years.flatMap(year => 
    months.map(month => `${month} ${year}`)
  );

  const handlePeriodChange = (period: FilterPeriod) => {
    onFiltersChange({ ...filters, period });
  };

  const handleMonthChange = (month: string) => {
    onFiltersChange({ ...filters, selectedMonth: month });
  };

  const handleQuarterChange = (quarter: string) => {
    onFiltersChange({ ...filters, selectedQuarter: quarter });
  };

  const handleYearChange = (year: string) => {
    onFiltersChange({ ...filters, selectedYear: parseInt(year) });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, startDate: date });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, endDate: date });
  };

  return (
    <div className="bg-white p-4 rounded-lg border mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <Button
            variant={filters.period === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePeriodChange('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={filters.period === 'quarterly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePeriodChange('quarterly')}
          >
            Quarterly
          </Button>
          <Button
            variant={filters.period === 'yearly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePeriodChange('yearly')}
          >
            Yearly
          </Button>
          <Button
            variant={filters.period === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePeriodChange('custom')}
          >
            Custom
          </Button>
        </div>

        {filters.period === 'monthly' && (
          <Select value={filters.selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthsWithYears.map(month => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {filters.period === 'quarterly' && (
          <Select value={filters.selectedQuarter} onValueChange={handleQuarterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent>
              {quarters.map(quarter => (
                <SelectItem key={quarter} value={quarter}>
                  {quarter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {filters.period === 'yearly' && (
          <Select value={filters.selectedYear?.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {filters.period === 'custom' && (
          <div className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, "MMM dd, yyyy") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, "MMM dd, yyyy") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
};
