
import React, { useState } from "react";
import { Plus, X, UserPlus, Edit } from "lucide-react";
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
    <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => {
                setClientModalOpen(false);
                setNewClientModalOpen(true);
              }}
              size="icon"
              title="Add New Client"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          
          {filteredClients.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-3 border rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => handleSelectClient(client)}
                >
                  <div className="font-medium">{client.name}</div>
                  {client.email && (
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {searchTerm ? "No clients found" : "Start typing to search clients"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-3">
      <h2 className="font-medium text-lg">Client</h2>
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setClientModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Select Existing Customer
            </Button>
            <Button
              variant="outline"
              onClick={() => setNewClientModalOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" /> New
            </Button>
          </div>
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
