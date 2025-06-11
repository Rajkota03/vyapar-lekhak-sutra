
-- Add quantity_column_label to company_settings table
ALTER TABLE company_settings 
ADD COLUMN quantity_column_label text DEFAULT 'QTY';
