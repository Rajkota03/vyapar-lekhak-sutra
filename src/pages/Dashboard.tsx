
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/primitives/Card";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <Button asChild className="h-10 px-4 rounded-md text-sm font-medium">
            <Link to="/company/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Company
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="mb-0">
            <div className="pb-2">
              <h2 className="text-lg font-semibold">Welcome!</h2>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <div className="pt-0">
              <p>Get started by creating your first company profile.</p>
            </div>
          </Card>
          
          <Card className="mb-0">
            <div className="pb-2">
              <h2 className="text-lg font-semibold">Recent Invoices</h2>
              <p className="text-sm text-muted-foreground">
                You haven't created any invoices yet.
              </p>
            </div>
            <div className="pt-0">
              <p>Create a company profile first, then add clients and invoices.</p>
            </div>
          </Card>
          
          <Card className="mb-0">
            <div className="pb-2">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="pt-0 space-y-2">
              <Button variant="outline" className="w-full h-10 px-4 rounded-md text-sm font-medium" asChild>
                <Link to="/company/new">Create Company</Link>
              </Button>
              <Button variant="outline" className="w-full h-10 px-4 rounded-md text-sm font-medium" asChild>
                <Link to="/clients">Manage Clients</Link>
              </Button>
              <Button variant="outline" className="w-full h-10 px-4 rounded-md text-sm font-medium" asChild>
                <Link to="/invoices">Manage Invoices</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
