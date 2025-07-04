
-- Add Pro Forma document numbering fields to company_settings
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS proforma_title TEXT DEFAULT 'Pro Forma Invoice',
ADD COLUMN IF NOT EXISTS next_proforma_seq INTEGER DEFAULT 1;

-- Update the next_doc_number function to handle pro forma documents
CREATE OR REPLACE FUNCTION public.next_doc_number(p_company_id uuid, p_doc_type text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
    next_seq integer;
    prefix_val text;
    result_number text;
BEGIN
    IF p_doc_type = 'invoice' THEN
        UPDATE company_settings
        SET next_invoice_seq = next_invoice_seq + 1
        WHERE company_id = p_company_id
        RETURNING next_invoice_seq, invoice_prefix INTO next_seq, prefix_val;
        
        result_number := COALESCE(prefix_val, 'INV-') || next_seq::text;
        
    ELSIF p_doc_type = 'quote' THEN
        UPDATE company_settings
        SET next_quote_seq = next_quote_seq + 1
        WHERE company_id = p_company_id
        RETURNING next_quote_seq, invoice_prefix INTO next_seq, prefix_val;
        
        result_number := COALESCE(prefix_val, 'QUO-') || next_seq::text;
        
    ELSIF p_doc_type = 'proforma' THEN
        UPDATE company_settings
        SET next_proforma_seq = next_proforma_seq + 1
        WHERE company_id = p_company_id
        RETURNING next_proforma_seq, invoice_prefix INTO next_seq, prefix_val;
        
        result_number := COALESCE(prefix_val, 'PF-') || next_seq::text;
        
    ELSIF p_doc_type = 'credit' THEN
        UPDATE company_settings
        SET next_credit_seq = next_credit_seq + 1
        WHERE company_id = p_company_id
        RETURNING next_credit_seq, invoice_prefix INTO next_seq, prefix_val;
        
        result_number := COALESCE(prefix_val, 'CR-') || next_seq::text;
    ELSE
        RAISE EXCEPTION 'Invalid document type: %', p_doc_type;
    END IF;
    
    RETURN result_number;
END;
$function$;
