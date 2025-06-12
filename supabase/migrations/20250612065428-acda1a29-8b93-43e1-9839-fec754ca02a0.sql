
-- Add HSN code field to company_settings table
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS hsn_code TEXT DEFAULT '998387';

-- Update the next_doc_number function to properly use invoice_prefix for all document types
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

-- Update the next_invoice_number function to use the prefix from company_settings
CREATE OR REPLACE FUNCTION public.next_invoice_number(p_company_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
    next_num integer;
    prefix_val text;
    invoice_code text;
BEGIN
    -- Get the prefix and next sequence number from company_settings
    SELECT invoice_prefix, next_invoice_seq + 1
    INTO prefix_val, next_num
    FROM company_settings
    WHERE company_id = p_company_id;
    
    -- If no settings found, use default values
    IF prefix_val IS NULL THEN
        prefix_val := 'INV-';
    END IF;
    
    IF next_num IS NULL THEN
        next_num := 1;
    END IF;
    
    -- Update the sequence number
    UPDATE company_settings
    SET next_invoice_seq = next_num
    WHERE company_id = p_company_id;
    
    -- Format the invoice number
    invoice_code := prefix_val || LPAD(next_num::text, 3, '0');
    
    RETURN invoice_code;
END;
$function$;
