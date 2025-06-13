
-- Add paid_amount column to track partial payments
ALTER TABLE public.invoices 
ADD COLUMN paid_amount numeric DEFAULT 0 NOT NULL;

-- Update existing invoices to set paid_amount based on current status
UPDATE public.invoices 
SET paid_amount = CASE 
  WHEN status = 'paid' THEN total 
  ELSE 0 
END;
