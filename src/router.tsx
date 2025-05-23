
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import InvoiceList from '@/pages/InvoiceList';
import InvoiceEdit from '@/pages/InvoiceEdit';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import CreateCompany from '@/pages/CreateCompany';
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company/new" 
            element={
              <ProtectedRoute>
                <CreateCompany />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices" 
            element={
              <ProtectedRoute>
                <InvoiceList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices/new" 
            element={
              <ProtectedRoute>
                <InvoiceEdit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices/:id" 
            element={
              <ProtectedRoute>
                <InvoiceEdit />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
