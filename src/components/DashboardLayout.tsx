import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, FileText, Settings, Menu, X, Package, ChevronDown, ChevronRight, Plus, HelpCircle, BarChart3, CreditCard } from "lucide-react";
import { useCustomDocumentTypes } from "@/hooks/useCustomDocumentTypes";
import { DulyLogo } from "@/components/ui/DulyLogo";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SubmenuItem {
  name: string;
  href: string;
  isCustom?: boolean;
  isManagement?: boolean;
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
  const [billingExpanded, setBillingExpanded] = React.useState(false);
  const {
    customDocumentTypes
  } = useCustomDocumentTypes();

  const navigation = [{
    name: "Dashboard",
    href: "/dashboard",
    icon: Home
  }, {
    name: "Billing",
    href: "/billing",
    icon: FileText,
    submenu: [{
      name: "Invoices",
      href: "/billing?tab=invoices"
    }, {
      name: "Pro Formas",
      href: "/billing?tab=proformas"
    }, {
      name: "Quotations",
      href: "/quotations"
    },
    // Add custom document types
    ...(customDocumentTypes || []).map(docType => ({
      name: docType.name,
      href: `/custom/${docType.id}`,
      isCustom: true
    }) as SubmenuItem), {
      name: "Custom Document",
      href: "/settings/document-types",
      isManagement: true
    } as SubmenuItem] as SubmenuItem[]
  }, {
    name: "Payments",
    href: "/payments",
    icon: CreditCard
  }, {
    name: "Clients",
    href: "/clients",
    icon: Users
  }, {
    name: "Items",
    href: "/items",
    icon: Package
  }, {
    name: "Settings",
    href: "/settings",
    icon: Settings
  }, {
    name: "Support",
    href: "/support",
    icon: HelpCircle
  }];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const toggleBillingMenu = () => {
    setBillingExpanded(!billingExpanded);
  };
  const isBillingActive = location.pathname.startsWith('/billing') || location.pathname.startsWith('/invoices')|| location.pathname.startsWith('/proforma') || location.pathname.startsWith('/quotations') || location.pathname.startsWith('/custom/');
  React.useEffect(() => {
    if (isBillingActive) {
      setBillingExpanded(true);
    }
  }, [isBillingActive]);

  return <div className="safe-h-screen flex flex-col md:flex-row bg-gray-100 mobile-safe">
      {/* Mobile menu toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <DulyLogo size={24} variant="default" />
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center flex-shrink-0 px-4">
              <DulyLogo size={32} variant="wordmark" />
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map(item => {
              if (item.submenu) {
                return <div key={item.name}>
                      <button onClick={toggleBillingMenu} className={`group flex items-center w-full px-4 py-2 text-sm font-medium rounded-md ${isBillingActive ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
                        <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isBillingActive ? "text-primary" : "text-gray-500"}`} aria-hidden="true" />
                        {item.name}
                        {billingExpanded ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
                      </button>
                      {billingExpanded && <div className="ml-6 mt-1 space-y-1">
                          {item.submenu.map(subItem => {
                      const isSubActive = location.pathname === subItem.href || location.pathname.startsWith(subItem.href + '/') || (subItem.href.includes('?') && location.pathname + location.search === subItem.href);
                      if (subItem.isManagement) {
                        return <Link key={subItem.name} to={subItem.href} className="group flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-500 hover:bg-gray-50">
                                  <Plus className="h-4 w-4 mr-2" />
                                  {subItem.name}
                                </Link>;
                      }
                      return <Link key={subItem.name} to={subItem.href} className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${isSubActive ? "bg-blue-50 text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
                                {subItem.name}
                              </Link>;
                    })}
                        </div>}
                    </div>;
              }
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
            if (item.submenu) {
              return <div key={item.name}>
                      <button onClick={toggleBillingMenu} className={`group flex items-center w-full px-4 py-3 text-base font-medium rounded-md ${isBillingActive ? "bg-gray-100 text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
                        <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isBillingActive ? "text-primary" : "text-gray-500"}`} aria-hidden="true" />
                        {item.name}
                        {billingExpanded ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
                      </button>
                      {billingExpanded && <div className="ml-6 mt-1 space-y-1">
                          {item.submenu.map(subItem => {
                    const isSubActive = location.pathname === subItem.href || location.pathname.startsWith(subItem.href + '/') || (subItem.href.includes('?') && location.pathname + location.search === subItem.href);
                    if (subItem.isManagement) {
                      return <Link key={subItem.name} to={subItem.href} className="group flex items-center px-4 py-2 text-base font-medium rounded-md text-gray-500 hover:bg-gray-50" onClick={toggleMobileMenu}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  {subItem.name}
                                </Link>;
                    }
                    return <Link key={subItem.name} to={subItem.href} className={`group flex items-center px-4 py-2 text-base font-medium rounded-md ${isSubActive ? "bg-blue-50 text-primary" : "text-gray-600 hover:bg-gray-50"}`} onClick={toggleMobileMenu}>
                                {subItem.name}
                              </Link>;
                  })}
                        </div>}
                    </div>;
            }
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
        <main className="flex-1 pt-16 md:pt-0 bg-white py-[67px]">
          <div className="sm:px-6 md:px-8 px-0 py-0 bg-white">{children}</div>
        </main>
      </div>
    </div>;
};

export default DashboardLayout;
