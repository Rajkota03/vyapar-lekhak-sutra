import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
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

// New sheet components
import UserAccountSheet from '@/pages/settings/sheets/UserAccountSheet';
import CompanyMenuSheet from '@/pages/settings/sheets/CompanyMenuSheet';
import LogoSheet from '@/pages/settings/sheets/LogoSheet';
import CompanyInfoSheet from '@/pages/settings/sheets/CompanyInfoSheet';
import SignatureSheet from '@/pages/settings/sheets/SignatureSheet';
import PaymentNoteSheet from '@/pages/settings/sheets/PaymentNoteSheet';
import CompanyTaxSheet from '@/pages/settings/sheets/CompanyTaxSheet';
import NumberingSheet from '@/pages/settings/sheets/NumberingSheet';
import InvoiceDefaultsSheet from '@/pages/settings/sheets/InvoiceDefaultsSheet';
import GeneralSettingsSheet from '@/pages/settings/sheets/GeneralSettingsSheet';

import ProtectedRoute from "@/components/ProtectedRoute";

export const router = createBrowserRouter([
  { 
    path: '/', 
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  { 
    path: '/auth', 
    element: <Auth />
  },
  { 
    path: '/dashboard', 
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  { 
    path: '/company/new', 
    element: <ProtectedRoute><CreateCompany /></ProtectedRoute>
  },
  { 
    path: '/invoices', 
    element: <ProtectedRoute><Invoices /></ProtectedRoute>
  },
  { 
    path: '/invoice-list', 
    element: <ProtectedRoute><Invoices /></ProtectedRoute>
  },
  { 
    path: '/invoices/new', 
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>
  },
  { 
    path: '/invoices/:id', 
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>
  },
  { 
    path: '/items', 
    element: <ProtectedRoute><ItemList /></ProtectedRoute>
  },
  { 
    path: '/settings', 
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
    children: [
      {
        path: 'user',
        element: <ProtectedRoute><UserAccountSheet /></ProtectedRoute>
      },
      {
        path: 'company',
        element: <ProtectedRoute><CompanyMenuSheet /></ProtectedRoute>
      },
      {
        path: 'logo',
        element: <ProtectedRoute><LogoSheet /></ProtectedRoute>
      },
      {
        path: 'company-info',
        element: <ProtectedRoute><CompanyInfoSheet /></ProtectedRoute>
      },
      {
        path: 'signature',
        element: <ProtectedRoute><SignatureSheet /></ProtectedRoute>
      },
      {
        path: 'payment-note',
        element: <ProtectedRoute><PaymentNoteSheet /></ProtectedRoute>
      },
      {
        path: 'tax',
        element: <ProtectedRoute><CompanyTaxSheet /></ProtectedRoute>
      },
      {
        path: 'numbering',
        element: <ProtectedRoute><NumberingSheet /></ProtectedRoute>
      },
      {
        path: 'invoice-defaults',
        element: <ProtectedRoute><InvoiceDefaultsSheet /></ProtectedRoute>
      },
      {
        path: 'general',
        element: <ProtectedRoute><GeneralSettingsSheet /></ProtectedRoute>
      },
      {
        path: '*',
        element: <Navigate to="/settings" replace />
      }
    ]
  },
  // Keep legacy routes for compatibility
  { 
    path: '/settings/user', 
    element: <ProtectedRoute><UserSettings /></ProtectedRoute>
  },
  { 
    path: '/settings/company', 
    element: <ProtectedRoute><CompanySettings /></ProtectedRoute>
  },
  { 
    path: '/settings/invoice', 
    element: <ProtectedRoute><InvoiceSettings /></ProtectedRoute>
  },
  { 
    path: '/settings/general', 
    element: <ProtectedRoute><GeneralSettings /></ProtectedRoute>
  },
  { 
    path: '/settings/customization', 
    element: <ProtectedRoute><CustomizationSettings /></ProtectedRoute>
  },
  { 
    path: '*', 
    element: <NotFound />
  },
]);
