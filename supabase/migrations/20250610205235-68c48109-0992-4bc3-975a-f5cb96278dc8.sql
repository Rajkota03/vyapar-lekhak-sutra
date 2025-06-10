
-- Add signature_scale column to company_settings table
ALTER TABLE company_settings 
ADD COLUMN signature_scale numeric DEFAULT 1.0;
