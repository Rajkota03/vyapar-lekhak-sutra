
import React, { useState } from "react";
import { Plus, X, UserPlus, Edit, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientModal from "./ClientModal";

export type Client = {
  id: string;
  name: string;
  email?: string;
  gstin?: string;
  billing_address?: string;
  phone?: string;
};

interface ClientSectionProps {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  clients?: Client[];
  companyId?: string;
}

const ClientSection: React.FC<ClientSectionProps> = ({
  selectedClient,
  setSelectedClient,
  clients = [],
  companyId = "",
}) => {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter clients by search term
  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientModalOpen(false);
    setSearchTerm("");
  };

  const ClientSearchModal = () => (
    <Dialog open={clientModalOpen} onOpenChange={(open) => {
      setClientModalOpen(open);
      if (!open) setSearchTerm("");
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" /> Add Customer
          </DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex flex-col gap-3 mb-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-blue-500"
              onClick={() => {
                setClientModalOpen(false);
                setNewClientModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Create new customer
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-blue-500"
              onClick={() => {
                // This would import from contacts in a real app
                console.log("Import from contacts");
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" /> Import from your contacts
            </Button>
          </div>
          
          <div className="bg-gray-50 p-2 rounded-lg mb-4">
            <Input
              placeholder="Search customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white"
              autoFocus
            />
          </div>
          
          {clients && clients.length > 0 ? (
            <>
              <p className="text-sm font-medium mb-2">Recents</p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-3 bg-white border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleSelectClient(client)}
                    >
                      <div className="font-medium">{client.name}</div>
                      {client.email && (
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground bg-white p-3 rounded-lg border">
                    {searchTerm ? "No customers found" : "Start typing to search customers"}
                  </div>
                )}
              </div>
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="link" 
                  className="text-blue-500"
                  onClick={() => {
                    // In a real app, this would navigate to view all clients
                    console.log("View all clients");
                  }}
                >
                  View all
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No customers found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-3">
      <h2 className="font-medium text-lg">BILL TO</h2>
      <div className="bg-white rounded-lg border p-4">
        {selectedClient ? (
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{selectedClient.name}</h3>
              {selectedClient.email && (
                <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
              )}
              {selectedClient.phone && (
                <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
              )}
              {selectedClient.gstin && (
                <p className="text-sm text-muted-foreground">
                  GSTIN: {selectedClient.gstin}
                </p>
              )}
              {selectedClient.billing_address && (
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                  {selectedClient.billing_address}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNewClientModalOpen(true)}
                title="Edit Client"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedClient(null)}
                title="Remove Client"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-center text-blue-500"
            onClick={() => setClientModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        )}
      </div>
      
      {/* Client search modal */}
      <ClientSearchModal />
      
      {/* Add/Edit client modal */}
      <ClientModal
        open={newClientModalOpen}
        onOpenChange={setNewClientModalOpen}
        companyId={companyId}
        onClientSelected={handleSelectClient}
        existingClient={selectedClient}
      />
    </div>
  );
};

export default ClientSection;
