
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-screen-sm sm:max-w-screen-md px-3 sm:px-6">
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
            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle>Welcome!</CardTitle>
                <CardDescription>
                  {user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0">
                <p>Get started by creating your first company profile.</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  You haven't created any invoices yet.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0">
                <p>Create a company profile first, then add clients and invoices.</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0 space-y-2">
                <Button variant="outline" className="w-full h-10 px-4 rounded-md text-sm font-medium" asChild>
                  <Link to="/company/new">Create Company</Link>
                </Button>
                <Button variant="outline" className="w-full h-10 px-4 rounded-md text-sm font-medium" asChild>
                  <Link to="/clients">Manage Clients</Link>
                </Button>
                <Button variant="outline" className="w-full h-10 px-4 rounded-md text-sm font-medium" asChild>
                  <Link to="/invoices">Manage Invoices</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
