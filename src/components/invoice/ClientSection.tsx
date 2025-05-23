
import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type Client = {
  id: string;
  name: string;
  email?: string;
  gstin?: string;
};

interface ClientSectionProps {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  clients?: Client[];
}

const ClientSection: React.FC<ClientSectionProps> = ({
  selectedClient,
  setSelectedClient,
  clients = [],
}) => {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter clients by search term
  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const ClientModal = () => (
    <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {filteredClients.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-3 border rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => {
                    setSelectedClient(client);
                    setClientModalOpen(false);
                    setSearchTerm("");
                  }}
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
              No clients found
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
              {selectedClient.gstin && (
                <p className="text-sm text-muted-foreground">
                  GSTIN: {selectedClient.gstin}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setClientModalOpen(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setClientModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        )}
      </div>
      <ClientModal />
    </div>
  );
};

export default ClientSection;
