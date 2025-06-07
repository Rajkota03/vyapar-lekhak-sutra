
import React from 'react';

interface InvoicePdfPreviewProps {
  invoice?: any;
  company?: any;
  client?: any;
  lines?: any[];
}

export const InvoicePdfPreview: React.FC<InvoicePdfPreviewProps> = ({
  invoice,
  company,
  client,
  lines = []
}) => {
  return (
    <div className="w-full h-full p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Invoice Preview</h1>
          <p className="text-gray-600">Live preview functionality temporarily unavailable</p>
        </div>
        
        {invoice && (
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700">From:</h3>
                <p className="text-gray-600">{company?.name || 'Company Name'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">To:</h3>
                <p className="text-gray-600">{client?.name || 'Client Name'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700">Invoice Number:</h3>
                <p className="text-gray-600">{invoice.number || invoice.invoice_code}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Total:</h3>
                <p className="text-gray-600">₹{invoice.total?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            
            {lines && lines.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Line Items:</h3>
                <div className="space-y-2">
                  {lines.map((line, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{line.description}</span>
                      <span>₹{line.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
