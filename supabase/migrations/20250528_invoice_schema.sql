-- Create the get_invoice_full RPC function for retrieving complete invoice data
CREATE OR REPLACE FUNCTION public.get_invoice_full(_invoice_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id',              i.id,
    'invoice_code',    i.invoice_code,
    'date',            i.issue_date,
    'date_fmt',        to_char(i.issue_date, 'DD Mon YYYY'),
    'subtotal',        i.subtotal,
    'subtotal_fmt',    to_char(i.subtotal, 'FM₹999G99G999D00'),
    'cgst_pct',        i.cgst_pct,
    'cgst_total',      i.cgst_total,
    'cgst_total_fmt',  to_char(i.cgst_total, 'FM₹999G99G999D00'),
    'sgst_pct',        i.sgst_pct,
    'sgst_total',      i.sgst_total,
    'sgst_total_fmt',  to_char(i.sgst_total, 'FM₹999G99G999D00'),
    'igst_pct',        i.igst_pct,
    'igst_total',      i.igst_total,
    'igst_total_fmt',  to_char(i.igst_total, 'FM₹999G99G999D00'),
    'use_igst',        i.use_igst,
    'grand_total',     i.grand_total,
    'grand_total_fmt', to_char(i.grand_total, 'FM₹999G99G999D00'),
    'thank_you',       cs.default_note,
    'show_my_signature', i.show_my_signature,
    'require_client_signature', i.require_client_signature,

    /* ---- company & settings ---- */
    'company', json_build_object(
      'id',           c.id,
      'name',         c.name,
      'address_line', c.address1,
      'city',         c.city,
      'zip',          c.zip,
      'gstin',        c.gstin,
      'email_on_invoice', c.email_on_invoice,
      'logo_url',     cs.logo_url,
      'signature_url',cs.signature_url,
      'sac_hsn',      cs.sac_hsn
    ),
    'company_settings', json_build_object(
      'logo_scale',    cs.logo_scale,
      'payment_note',  cs.payment_note,
      'show_logo',     cs.show_logo,
      'sac_hsn',       cs.sac_hsn
    ),

    /* ---- client ---- */
    'client', json_build_object(
      'name',         cl.name,
      'address_line', cl.address1,
      'gstin',        cl.gstin
    ),

    /* ---- invoice lines ---- */
    'lines', (
      SELECT json_agg(
        json_build_object(
          'description', il.description,
          'qty',         il.qty,
          'unit_price',  il.unit_price,
          'unit_price_fmt', to_char(il.unit_price, 'FM₹999G99G999D00'),
          'amount',      il.amount,
          'amount_fmt',  to_char(il.amount, 'FM₹999G99G999D00')
        )
      )
      FROM invoice_lines il
      WHERE il.invoice_id = i.id
    )
  )
  INTO result
  FROM invoices          i
  JOIN companies         c  ON c.id = i.company_id
  JOIN company_settings  cs ON cs.company_id = c.id
  JOIN clients           cl ON cl.id = i.client_id
  WHERE i.id = _invoice_id;

  RETURN result;
END;
$$;

-- Add permissions for the function
GRANT EXECUTE ON FUNCTION public.get_invoice_full(uuid) TO authenticated, anon;

-- Ensure company_settings table has the required columns
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS logo_scale numeric DEFAULT 0.25,
  ADD COLUMN IF NOT EXISTS sac_hsn text,
  ADD COLUMN IF NOT EXISTS payment_note text,
  ADD COLUMN IF NOT EXISTS show_logo boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_note text DEFAULT 'Thank you for your business!';

-- Ensure invoices table has the required columns
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS show_my_signature boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS require_client_signature boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS use_igst boolean DEFAULT false;

-- Create an index for faster invoice lookups
CREATE INDEX IF NOT EXISTS idx_invoices_id ON invoices(id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
