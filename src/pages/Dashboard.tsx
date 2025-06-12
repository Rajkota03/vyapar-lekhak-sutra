import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/primitives/Card";
const Dashboard: React.FC = () => {
  const {
    user
  } = useAuth();
  return <DashboardLayout>
      <main className="safe-h-screen bg-gray-50">
        <div className="space-y-3 py-[8px]">
          <div className="flex items-center justify-between py-[12px]">
            <h1 className="text-[1.375rem] font-semibold tracking-tight px-[10px]">Dashboard</h1>
            <Button asChild className="h-8 px-3 rounded text-xs font-medium">
              <Link to="/company/new" className="px-[26px]">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Company
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Card className="mb-0">
              <div className="pb-2">
                <h2 className="text-[1.125rem] font-semibold">Welcome!</h2>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
              <div className="pt-0">
                <p className="text-xs">Get started by creating your first company profile.</p>
              </div>
            </Card>
            
            <Card className="mb-0">
              <div className="pb-2">
                <h2 className="text-[1.125rem] font-semibold">Recent Invoices</h2>
                <p className="text-xs text-gray-500">
                  You haven't created any invoices yet.
                </p>
              </div>
              <div className="pt-0">
                <p className="text-xs">Create a company profile first, then add clients and invoices.</p>
              </div>
            </Card>
            
            <Card className="mb-0">
              <div className="pb-2">
                <h2 className="text-[1.125rem] font-semibold">Quick Actions</h2>
              </div>
              <div className="pt-0 space-y-2">
                <Button variant="outline" className="w-full h-8 px-3 rounded text-xs font-medium" asChild>
                  <Link to="/company/new">Create Company</Link>
                </Button>
                <Button variant="outline" className="w-full h-8 px-3 rounded text-xs font-medium" asChild>
                  <Link to="/clients">Manage Clients</Link>
                </Button>
                <Button variant="outline" className="w-full h-8 px-3 rounded text-xs font-medium" asChild>
                  <Link to="/invoices">Manage Invoices</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </DashboardLayout>;
};
export default Dashboard;