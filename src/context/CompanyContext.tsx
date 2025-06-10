
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Company {
  id: string;
  name: string;
  gstin?: string;
  address?: string;
  logo_url?: string;
  owner_id: string;
}

interface CompanyContextType {
  currentCompany: Company | null;
  companies: Company[];
  loading: boolean;
  error: string | null;
  refetchCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('=== FETCHING COMPANIES FOR USER ===');
      console.log('User ID:', user.id);
      
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id);

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        throw companiesError;
      }

      console.log('Fetched companies:', companiesData);
      setCompanies(companiesData || []);
      
      // Set the first company as current if available
      if (companiesData && companiesData.length > 0) {
        setCurrentCompany(companiesData[0]);
        console.log('Set current company:', companiesData[0]);
      } else {
        console.log('No companies found for user');
        setCurrentCompany(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error in fetchCompanies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const refetchCompanies = async () => {
    setLoading(true);
    await fetchCompanies();
  };

  useEffect(() => {
    fetchCompanies();
  }, [user?.id]);

  const value: CompanyContextType = {
    currentCompany,
    companies,
    loading,
    error,
    refetchCompanies,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
