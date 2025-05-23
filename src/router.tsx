
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import InvoiceList from '@/pages/InvoiceList'; 
import InvoiceEdit from '@/pages/InvoiceEdit';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import CreateCompany from '@/pages/CreateCompany';
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
    element: <AuthProvider><ProtectedRoute><InvoiceList /></ProtectedRoute></AuthProvider>
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
    path: '*', 
    element: <AuthProvider><NotFound /></AuthProvider> 
  },
]);

