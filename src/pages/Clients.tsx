
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { Heading2, BodyText, CaptionText } from "@/components/ui/primitives/Typography";
import { Button } from "@/components/ui/button";
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCompany } from "@/context/CompanyContext";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  billing_address: string | null;
  created_at: string;
};

const Clients = () => {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Fetch user's companies
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Set company from context or first available company
  useEffect(() => {
    if (currentCompany) {
      setSelectedCompanyId(currentCompany.id);
    } else if (companies && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [currentCompany, companies, selectedCompanyId]);

  // Fetch clients for selected company
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Client[] || [];
    },
    enabled: !!selectedCompanyId
  });

  if (isLoadingCompanies) {
    return (
      <DashboardLayout>
        <AppHeader title="Clients" showBack backPath="/dashboard" />
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <DashboardLayout>
        <AppHeader title="Clients" showBack backPath="/dashboard" />
        <div className="p-6">
          <ModernCard className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <Heading2 className="mb-2">No Company Found</Heading2>
            <BodyText>Create a company first to manage clients.</BodyText>
          </ModernCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AppHeader title="Clients" showBack backPath="/dashboard" />
      
      <div className="p-6 space-y-6">
        {/* Company Selector */}
        {companies && companies.length > 1 && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Company:</label>
            <select 
              value={selectedCompanyId || ''} 
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <Heading2>Client Management</Heading2>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        {isLoadingClients ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : clients && clients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <ModernCard key={client.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <BodyText className="font-semibold">{client.name}</BodyText>
                    <CaptionText className="text-muted-foreground">
                      Client since {new Date(client.created_at).toLocaleDateString()}
                    </CaptionText>
                  </div>
                  
                  <div className="space-y-2">
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <CaptionText className="truncate">{client.email}</CaptionText>
                      </div>
                    )}
                    
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <CaptionText>{client.phone}</CaptionText>
                      </div>
                    )}
                    
                    {client.billing_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <CaptionText className="text-xs leading-relaxed">
                          {client.billing_address}
                        </CaptionText>
                      </div>
                    )}
                    
                    {client.gstin && (
                      <div className="pt-1">
                        <CaptionText className="text-xs text-muted-foreground">
                          GSTIN: {client.gstin}
                        </CaptionText>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        ) : (
          <ModernCard className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <Heading2 className="mb-2">No Clients Yet</Heading2>
            <BodyText className="mb-4">Start by adding your first client to manage invoices and payments.</BodyText>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Client
            </Button>
          </ModernCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Clients;
