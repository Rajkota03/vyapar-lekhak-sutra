import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, FileText, Settings, Menu, X, Package } from "lucide-react";
interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children
}) => {
  const {
    signOut
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigation = [{
    name: "Dashboard",
    href: "/dashboard",
    icon: Home
  }, {
    name: "Clients",
    href: "/clients",
    icon: Users
  }, {
    name: "Items",
    href: "/items",
    icon: Package
  }, {
    name: "Invoices",
    href: "/invoices",
    icon: FileText
  }, {
    name: "Settings",
    href: "/settings",
    icon: Settings
  }];
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  return <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile menu toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white p-4 shadow-md flex justify-between items-center">
        <h2 className="text-lg font-bold">Vyapar Lekhak</h2>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold">Vyapar Lekhak</h1>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map(item => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return <Link key={item.name} to={item.href} className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? "text-primary" : "text-gray-500"}`} aria-hidden="true" />
                    {item.name}
                  </Link>;
            })}
            </nav>
          </div>
          <div className="border-t border-gray-200 p-4">
            <Button variant="outline" className="w-full" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white pt-16">
            <nav className="mt-4 px-4 space-y-1 flex-1">
              {navigation.map(item => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return <Link key={item.name} to={item.href} className={`group flex items-center px-4 py-3 text-base font-medium rounded-md ${isActive ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50"}`} onClick={toggleMobileMenu}>
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? "text-primary" : "text-gray-500"}`} aria-hidden="true" />
                    {item.name}
                  </Link>;
          })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <Button variant="outline" className="w-full" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>}

      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pt-16 md:pt-0">
          <div className="py-6 px-4 sm:px-6 md:px-8 bg-inherit">{children}</div>
        </main>
      </div>
    </div>;
};
export default DashboardLayout;