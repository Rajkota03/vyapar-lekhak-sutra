
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const CompanyInfoSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    gstin: "",
    address: "",
  });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!user) return;

      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);

      if (error) {
        console.error('Error fetching company:', error);
        return;
      }

      if (companies && companies.length > 0) {
        const company = companies[0];
        setCompanyData({
          name: company.name || "",
          gstin: company.gstin || "",
          address: company.address || "",
        });
      }
    };

    fetchCompanyInfo();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
      navigate('/settings');
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update company information",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open onOpenChange={() => navigate('/settings')}>
      <SheetContent className="w-full">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/settings')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <SheetTitle>Company Information</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={companyData.gstin}
                  onChange={(e) => setCompanyData({ ...companyData, gstin: e.target.value })}
                  placeholder="Enter GSTIN"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  placeholder="Enter company address"
                  rows={4}
                />
              </div>
            </div>

            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default CompanyInfoSettings;
