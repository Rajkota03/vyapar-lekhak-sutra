
import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import InvoiceEdit from "./pages/InvoiceEdit";
import InvoiceList from "./pages/InvoiceList";
import ItemList from "./pages/ItemList";
import CreateCompany from "./pages/CreateCompany";
import Settings from "./pages/Settings";
import GeneralSettings from "./pages/settings/GeneralSettings";
import CompanySettings from "./pages/settings/CompanySettings";
import InvoiceSettings from "./pages/settings/InvoiceSettings";
import CustomizationSettings from "./pages/settings/CustomizationSettings";
import UserSettings from "./pages/settings/UserSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Import settings components
import LogoSettings from "./pages/settings/LogoSettings";
import CompanyInfoSheet from "./pages/settings/sheets/CompanyInfoSheet";
import SignatureSettings from "./pages/settings/SignatureSettings";
import PaymentNoteSettings from "./pages/settings/PaymentNoteSettings";
import TaxSettings from "./pages/settings/TaxSettings";
import NumberingSettings from "./pages/settings/NumberingSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoices",
    element: (
      <ProtectedRoute>
        <Invoices />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoices/new",
    element: (
      <ProtectedRoute>
        <InvoiceEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoices/:id",
    element: (
      <ProtectedRoute>
        <InvoiceEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/invoice-list",
    element: (
      <ProtectedRoute>
        <InvoiceList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/items",
    element: (
      <ProtectedRoute>
        <ItemList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/company/new",
    element: (
      <ProtectedRoute>
        <CreateCompany />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/general",
    element: (
      <ProtectedRoute>
        <GeneralSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/company",
    element: (
      <ProtectedRoute>
        <CompanySettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/invoices",
    element: (
      <ProtectedRoute>
        <InvoiceSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/customization",
    element: (
      <ProtectedRoute>
        <CustomizationSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/user",
    element: (
      <ProtectedRoute>
        <UserSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/logo",
    element: (
      <ProtectedRoute>
        <LogoSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/company-info",
    element: (
      <ProtectedRoute>
        <CompanyInfoSheet />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/signature",
    element: (
      <ProtectedRoute>
        <SignatureSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/payment-note",
    element: (
      <ProtectedRoute>
        <PaymentNoteSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/tax",
    element: (
      <ProtectedRoute>
        <TaxSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings/numbering",
    element: (
      <ProtectedRoute>
        <NumberingSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
