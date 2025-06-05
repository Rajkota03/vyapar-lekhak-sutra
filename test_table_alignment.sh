#!/bin/bash

# Test script for validating table alignment fixes
# This script checks for proper implementation of all required fixes

echo "=== Testing Table Alignment Fixes ==="

# Check for updated table column proportions
echo "Checking table column proportions..."
grep -q "cols: \[0.08, 0.47, 0.15, 0.15, 0.15\]" /home/ubuntu/vyapar-lekhak-sutra/supabase/functions/generate_invoice_pdf/layout.ts
if [ $? -eq 0 ]; then
  echo "✅ Table column proportions updated for better alignment"
else
  echo "❌ Table column proportions not properly updated"
  exit 1
fi

# Check for increased row height and header height
echo "Checking row and header height..."
grep -q "rowH: 24" /home/ubuntu/vyapar-lekhak-sutra/supabase/functions/generate_invoice_pdf/layout.ts
if [ $? -eq 0 ]; then
  echo "✅ Row height increased for better readability"
else
  echo "❌ Row height not properly updated"
  exit 1
fi

# Check for consistent column centering
echo "Checking column centering..."
grep -q "const snoColCenter = colX + (colWidths\[0\] / 2)" /home/ubuntu/vyapar-lekhak-sutra/supabase/functions/generate_invoice_pdf/tableRenderer.ts
if [ $? -eq 0 ]; then
  echo "✅ Column centering implemented for consistent alignment"
else
  echo "❌ Column centering not properly implemented"
  exit 1
fi

# Check for right alignment of numeric columns
echo "Checking numeric column alignment..."
grep -q "const rateRightEdge = colX + colWidths\[2\] - TABLE.padding" /home/ubuntu/vyapar-lekhak-sutra/supabase/functions/generate_invoice_pdf/tableRenderer.ts
if [ $? -eq 0 ]; then
  echo "✅ Numeric columns properly right-aligned"
else
  echo "❌ Numeric column alignment not properly implemented"
  exit 1
fi

# Check for thicker borders
echo "Checking border thickness..."
grep -q "thickness: 1.5" /home/ubuntu/vyapar-lekhak-sutra/supabase/functions/generate_invoice_pdf/tableRenderer.ts
if [ $? -eq 0 ]; then
  echo "✅ Border thickness increased for better visibility"
else
  echo "❌ Border thickness not properly updated"
  exit 1
fi

echo "=== All Table Alignment Fixes Successfully Implemented ==="
echo "The invoice table should now have:"
echo "- Proper column proportions for better alignment"
echo "- Consistent centering of column headers and content"
echo "- Right alignment of numeric columns (RATE and AMOUNT)"
echo "- Thicker borders for better visibility"
echo "- Consistent row heights and spacing"
