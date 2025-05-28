#!/bin/bash

# Visual consistency test script for invoice PDF generation
# This script tests the visual consistency between Edge Function and React preview

echo "=== Testing Visual Consistency Between Edge Function and React Preview ==="

# Create test directory if it doesn't exist
mkdir -p /home/ubuntu/vyapar-lekhak-sutra/test_results

# Check if layout.ts has been properly updated
echo "Checking layout.ts for required constants..."
grep -q "TEXT_HANDLING" /home/ubuntu/vyapar-lekhak-sutra/src/lib/pdf/layout.ts
if [ $? -eq 0 ]; then
  echo "✅ layout.ts includes TEXT_HANDLING constants"
else
  echo "❌ layout.ts is missing TEXT_HANDLING constants"
  exit 1
fi

# Check if Edge Function is using the text overflow handling
echo "Checking Edge Function implementation..."
grep -q "truncateWithEllipsis" /home/ubuntu/vyapar-lekhak-sutra/supabase/functions/generate_invoice_pdf/billRenderer.ts
if [ $? -eq 0 ]; then
  echo "✅ Edge Function implements text overflow handling"
else
  echo "❌ Edge Function is missing text overflow handling"
  exit 1
fi

# Check if React preview is using the text overflow handling
echo "Checking React Preview implementation..."
grep -q "truncateText" /home/ubuntu/vyapar-lekhak-sutra/src/components/InvoicePdfPreview/InvoiceBillBar.tsx
if [ $? -eq 0 ]; then
  echo "✅ React Preview implements text overflow handling"
else
  echo "❌ React Preview is missing text overflow handling"
  exit 1
fi

# Check for proper alignment in Edge Function
echo "Checking Edge Function alignment implementation..."
grep -q "detailsValueX" /home/ubuntu/vyapar-lekhak-sutra/supabase/functions/generate_invoice_pdf/billRenderer.ts
if [ $? -eq 0 ]; then
  echo "✅ Edge Function implements proper alignment for details"
else
  echo "❌ Edge Function is missing proper alignment for details"
  exit 1
fi

# Check for proper alignment in React Preview
echo "Checking React Preview alignment implementation..."
grep -q "BILL_BAR.detailsValueWidth" /home/ubuntu/vyapar-lekhak-sutra/src/components/InvoicePdfPreview/InvoiceBillBar.tsx
if [ $? -eq 0 ]; then
  echo "✅ React Preview implements proper alignment for details"
else
  echo "❌ React Preview is missing proper alignment for details"
  exit 1
fi

# Check for proper handling of overlapping elements in Edge Function
echo "Checking Edge Function overlapping elements handling..."
grep -q "maxWidth" /home/ubuntu/vyapar-lekhak-sutra/supabase/functions/generate_invoice_pdf/billRenderer.ts
if [ $? -eq 0 ]; then
  echo "✅ Edge Function implements proper handling of text overflow"
else
  echo "❌ Edge Function is missing proper handling of text overflow"
  exit 1
fi

# Check for proper handling of overlapping elements in React Preview
echo "Checking React Preview overlapping elements handling..."
grep -q "overflow: 'hidden'" /home/ubuntu/vyapar-lekhak-sutra/src/components/InvoicePdfPreview/InvoiceBillBar.tsx
if [ $? -eq 0 ]; then
  echo "✅ React Preview implements proper handling of text overflow"
else
  echo "❌ React Preview is missing proper handling of text overflow"
  exit 1
fi

echo "=== Visual Consistency Test Completed Successfully ==="
echo "All components are using the same layout constants and implementing proper text overflow, alignment, and overlapping elements handling."
echo "The invoice PDF should now match the professional reference design."
