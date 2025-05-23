
import React from "react";
import { useNavigate } from "react-router-dom";

// UI Components
import DashboardLayout from "@/components/DashboardLayout";

// Custom Components
import InvoiceHeader from "@/components/invoice/InvoiceHeader";
import InvoiceMeta from "@/components/invoice/InvoiceMeta";
import ClientSection from "@/components/invoice/ClientSection";
import ItemsSection from "@/components/invoice/ItemsSection";
import TotalsSection from "@/components/invoice/TotalsSection";

// Custom Hook
import { useInvoiceData } from "@/hooks/useInvoiceData";
import { calcTotals } from "@/utils/invoiceMath";

const InvoiceEdit = () => {
  const navigate = useNavigate();
  
  const {
    isEditing,
    isLoading,
    selectedDate,
    setSelectedDate,
    selectedClient,
    setSelectedClient,
    lineItems,
    setLineItems,
    clients,
    items,
    saveInvoiceMutation,
    isSubmitting,
    selectedCompanyId,
  } = useInvoiceData();

  // Calculate totals using the utility function
  const { subtotal, cgst: cgstAmount, sgst: sgstAmount, total: grandTotal } = calcTotals(lineItems);

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen pb-20 bg-gray-50">
        <InvoiceHeader
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          canSave={!!selectedClient && lineItems.length > 0}
          onSave={() => saveInvoiceMutation.mutate(navigate)}
        />

        <div className="p-4 space-y-6">
          <InvoiceMeta 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          <ClientSection 
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            clients={clients}
            companyId={selectedCompanyId || ""}
          />

          <ItemsSection 
            lineItems={lineItems}
            setLineItems={setLineItems}
            items={items}
            selectedCompanyId={selectedCompanyId}
          />

          {lineItems.length > 0 && (
            <TotalsSection
              subtotal={subtotal}
              cgstAmount={cgstAmount}
              sgstAmount={sgstAmount}
              grandTotal={grandTotal}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceEdit;
