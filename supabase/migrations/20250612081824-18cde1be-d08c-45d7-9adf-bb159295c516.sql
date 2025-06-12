
-- Create table for custom document types
CREATE TABLE public.custom_document_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  name text NOT NULL,
  code_prefix text NOT NULL,
  next_sequence integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(company_id, name),
  UNIQUE(company_id, code_prefix)
);

-- Enable RLS
ALTER TABLE public.custom_document_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom document types
CREATE POLICY "Users can view custom document types for their companies" 
  ON public.custom_document_types 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create custom document types for their companies" 
  ON public.custom_document_types 
  FOR INSERT 
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update custom document types for their companies" 
  ON public.custom_document_types 
  FOR UPDATE 
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete custom document types for their companies" 
  ON public.custom_document_types 
  FOR DELETE 
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Add document_type_id column to invoices table to link to custom document types
ALTER TABLE public.invoices 
ADD COLUMN document_type_id uuid REFERENCES public.custom_document_types(id);

-- Update the next_doc_number function to handle custom document types
CREATE OR REPLACE FUNCTION public.next_doc_number(p_company_id uuid, p_doc_type text, p_custom_type_id uuid DEFAULT NULL)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    next_seq integer;
    prefix_val text;
    result_number text;
BEGIN
    -- Handle custom document types
    IF p_custom_type_id IS NOT NULL THEN
        UPDATE custom_document_types
        SET next_sequence = next_sequence + 1
        WHERE id = p_custom_type_id AND company_id = p_company_id
        RETURNING next_sequence, code_prefix INTO next_seq, prefix_val;
        
        result_number := prefix_val || '-' || next_seq::text;
        
    -- Handle built-in document types
    ELSIF p_doc_type = 'invoice' THEN
        UPDATE company_settings
        SET next_invoice_seq = next_invoice_seq + 1
        WHERE company_id = p_company_id
        RETURNING next_invoice_seq, invoice_prefix INTO next_seq, prefix_val;
        
        result_number := COALESCE(prefix_val, 'INV-') || next_seq::text;
        
    ELSIF p_doc_type = 'quote' THEN
        UPDATE company_settings
        SET next_quote_seq = next_quote_seq + 1
        WHERE company_id = p_company_id
        RETURNING next_quote_seq INTO next_seq;
        
        result_number := 'QUO-' || next_seq::text;
        
    ELSIF p_doc_type = 'proforma' THEN
        UPDATE company_settings
        SET next_proforma_seq = next_proforma_seq + 1
        WHERE company_id = p_company_id
        RETURNING next_proforma_seq INTO next_seq;
        
        result_number := 'PF-' || next_seq::text;
        
    ELSIF p_doc_type = 'credit' THEN
        UPDATE company_settings
        SET next_credit_seq = next_credit_seq + 1
        WHERE company_id = p_company_id
        RETURNING next_credit_seq INTO next_seq;
        
        result_number := 'CR-' || next_seq::text;
    ELSE
        RAISE EXCEPTION 'Invalid document type: %', p_doc_type;
    END IF;
    
    RETURN result_number;
END;
$function$
