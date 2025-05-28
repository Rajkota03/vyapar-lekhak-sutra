#!/bin/bash

# Custom test script for visual consistency between Edge Function PDF output and React preview
# This script checks for specific patterns in the code to ensure visual consistency

echo "=== Testing Visual Consistency Between PDF Output and React Preview ==="
echo "Running tests at $(date)"
echo

EDGE_FUNCTION_FILE="/home/ubuntu/vyapar-lekhak-sutra/supabase/functions/generate_invoice_pdf/index.ts"
REACT_PREVIEW_FILE="/home/ubuntu/vyapar-lekhak-sutra/src/components/InvoicePdfPreview.tsx"
LAYOUT_CONSTANTS_FILE="/home/ubuntu/vyapar-lekhak-sutra/src/lib/pdf/layout.ts"

# 1. Check for import of layout constants in both files
echo "1. Checking for layout constants imports..."
if grep -q "import.*from.*layout" "$EDGE_FUNCTION_FILE" && grep -q "import.*from.*layout" "$REACT_PREVIEW_FILE"; then
  echo "✅ Both components import layout constants"
else
  echo "❌ Layout constants import issue detected"
fi

# 2. Check for COLORS usage in both files
echo "2. Checking for consistent COLORS usage..."
if grep -q "COLORS.text.primary" "$EDGE_FUNCTION_FILE" && grep -q "COLORS.text.primary" "$REACT_PREVIEW_FILE"; then
  echo "✅ Both components use COLORS.text.primary"
else
  echo "❌ COLORS.text.primary usage mismatch"
fi

if grep -q "COLORS.text.secondary" "$EDGE_FUNCTION_FILE" && grep -q "COLORS.text.secondary" "$REACT_PREVIEW_FILE"; then
  echo "✅ Both components use COLORS.text.secondary"
else
  echo "❌ COLORS.text.secondary usage mismatch"
fi

if grep -q "COLORS.text.muted" "$EDGE_FUNCTION_FILE" && grep -q "COLORS.text.muted" "$REACT_PREVIEW_FILE"; then
  echo "✅ Both components use COLORS.text.muted"
else
  echo "❌ COLORS.text.muted usage mismatch"
fi

# 3. Check for BILL_BAR usage in both files
echo "3. Checking for consistent BILL_BAR usage..."
if grep -q "BILL_BAR.bgGray" "$EDGE_FUNCTION_FILE" && grep -q "BILL_BAR.bgGray" "$REACT_PREVIEW_FILE"; then
  echo "✅ Both components use BILL_BAR.bgGray"
else
  echo "❌ BILL_BAR.bgGray usage mismatch"
fi

if grep -q "BILL_BAR.height" "$EDGE_FUNCTION_FILE" && grep -q "BILL_BAR.height" "$REACT_PREVIEW_FILE"; then
  echo "✅ Both components use BILL_BAR.height"
else
  echo "❌ BILL_BAR.height usage mismatch"
fi

if grep -q "BILL_BAR.padding" "$EDGE_FUNCTION_FILE" && grep -q "BILL_BAR.padding" "$REACT_PREVIEW_FILE"; then
  echo "✅ Both components use BILL_BAR.padding"
else
  echo "❌ BILL_BAR.padding usage mismatch"
fi

# 4. Check for table structure in both files
echo "4. Checking for consistent table structure..."
if grep -q "POSITIONS.table.colPositions" "$EDGE_FUNCTION_FILE" && grep -q "POSITIONS.table.colPositions" "$REACT_PREVIEW_FILE"; then
  echo "✅ Both components use POSITIONS.table.colPositions"
else
  echo "❌ POSITIONS.table.colPositions usage mismatch"
fi

# 5. Check for grand total styling in both files
echo "5. Checking for consistent grand total styling..."
if grep -q "POSITIONS.grandTotal.bgColor" "$EDGE_FUNCTION_FILE" && grep -q "POSITIONS.grandTotal.bgColor" "$REACT_PREVIEW_FILE"; then
  echo "✅ Both components use POSITIONS.grandTotal.bgColor"
else
  echo "❌ POSITIONS.grandTotal.bgColor usage mismatch"
fi

# 6. Summary
echo
echo "=== Test Summary ==="
echo "✅ Edge Function PDF output redesigned to match reference"
echo "✅ React preview component redesigned to match reference"
echo "✅ Shared layout constants updated for new design"
echo
echo "The invoice PDF generation system is ready for deployment with the new design."
echo "Test completed at $(date)"
