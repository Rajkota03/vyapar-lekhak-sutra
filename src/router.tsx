
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import InvoiceList from '@/pages/InvoiceList'; 
import InvoiceEdit from '@/pages/InvoiceEdit';
import Invoices from '@/pages/Invoices';
import ItemList from '@/pages/ItemList';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import CreateCompany from '@/pages/CreateCompany';
import Settings from '@/pages/Settings';
import UserSettings from '@/pages/settings/UserSettings';
import CompanySettings from '@/pages/settings/CompanySettings';
import InvoiceSettings from '@/pages/settings/InvoiceSettings';
import GeneralSettings from '@/pages/settings/GeneralSettings';
import CustomizationSettings from '@/pages/settings/CustomizationSettings';
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export const router = createBrowserRouter([
  { 
    path: '/', 
    element: <AuthProvider><ProtectedRoute><Dashboard /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/auth', 
    element: <AuthProvider><Auth /></AuthProvider> 
  },
  { 
    path: '/dashboard', 
    element: <AuthProvider><ProtectedRoute><Dashboard /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/company/new', 
    element: <AuthProvider><ProtectedRoute><CreateCompany /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/invoices', 
    element: <AuthProvider><ProtectedRoute><Invoices /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/invoice-list', 
    element: <AuthProvider><ProtectedRoute><Invoices /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/invoices/new', 
    element: <AuthProvider><ProtectedRoute><InvoiceEdit /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/invoices/:id', 
    element: <AuthProvider><ProtectedRoute><InvoiceEdit /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/items', 
    element: <AuthProvider><ProtectedRoute><ItemList /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/settings', 
    element: <AuthProvider><ProtectedRoute><Settings /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/settings/user', 
    element: <AuthProvider><ProtectedRoute><UserSettings /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/settings/company', 
    element: <AuthProvider><ProtectedRoute><CompanySettings /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/settings/invoice', 
    element: <AuthProvider><ProtectedRoute><InvoiceSettings /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/settings/general', 
    element: <AuthProvider><ProtectedRoute><GeneralSettings /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '/settings/customization', 
    element: <AuthProvider><ProtectedRoute><CustomizationSettings /></ProtectedRoute></AuthProvider>
  },
  { 
    path: '*', 
    element: <AuthProvider><NotFound /></AuthProvider> 
  },
]);
