
import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { ChevronLeft, User, Building2, FileText, Palette, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives/Card";
import { SettingsRow } from "@/components/ui/SettingsRow";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b p-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* User Account Section */}
          <Card className="p-0">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">John Doe</h3>
                  <p className="text-sm text-gray-500">john@example.com</p>
                </div>
              </div>
            </div>
            <SettingsRow 
              label="User Account" 
              onClick={() => navigate('/settings/user')}
            />
          </Card>

          {/* Company Section */}
          <Card className="p-0">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-medium text-sm text-gray-600">COMPANY</h3>
            </div>
            <SettingsRow 
              label="Logo"
              onClick={() => navigate('/settings/logo')}
            />
            <SettingsRow 
              label="Company Information"
              onClick={() => navigate('/settings/company-info')}
            />
            <SettingsRow 
              label="Signature"
              onClick={() => navigate('/settings/signature')}
            />
            <SettingsRow 
              label="Payment Instructions"
              onClick={() => navigate('/settings/payment-note')}
            />
          </Card>

          {/* Invoice Section */}
          <Card className="p-0">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-medium text-sm text-gray-600">INVOICE</h3>
            </div>
            <SettingsRow 
              label="Invoice Defaults"
              onClick={() => navigate('/settings/invoice-defaults')}
            />
            <SettingsRow 
              label="Tax Settings"
              onClick={() => navigate('/settings/tax')}
            />
            <SettingsRow 
              label="Document Numbering"
              onClick={() => navigate('/settings/numbering')}
            />
          </Card>

          {/* General Section */}
          <Card className="p-0">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-medium text-sm text-gray-600">GENERAL</h3>
            </div>
            <SettingsRow 
              label="General Settings"
              onClick={() => navigate('/settings/general')}
            />
          </Card>
        </div>
      </div>
      
      {/* Render child routes as overlays */}
      <Outlet />
    </>
  );
};

export default Settings;
