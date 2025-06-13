
-- Add document_type column to invoices table
ALTER TABLE invoices ADD COLUMN document_type text;

-- Set document_type based on existing number/invoice_code patterns
UPDATE invoices 
SET document_type = CASE 
  WHEN number LIKE 'QUO-%' OR invoice_code LIKE 'QUO-%' OR number LIKE 'QUOT-%' OR invoice_code LIKE 'QUOT-%' THEN 'quote'
  WHEN number LIKE 'PF-%' OR invoice_code LIKE 'PF-%' THEN 'proforma'
  WHEN number LIKE 'CR-%' OR invoice_code LIKE 'CR-%' THEN 'credit'
  WHEN document_type_id IS NOT NULL THEN 'custom'
  ELSE 'invoice'
END;

-- Set default value for future records
ALTER TABLE invoices ALTER COLUMN document_type SET DEFAULT 'invoice';

-- Make the column NOT NULL after setting values
ALTER TABLE invoices ALTER COLUMN document_type SET NOT NULL;

-- Add check constraint to ensure valid document types
ALTER TABLE invoices ADD CONSTRAINT check_document_type 
CHECK (document_type IN ('invoice', 'quote', 'proforma', 'credit', 'custom'));
