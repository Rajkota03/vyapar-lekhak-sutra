
-- Add notes column to the invoices table
ALTER TABLE public.invoices 
ADD COLUMN notes TEXT NULL;
