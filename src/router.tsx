import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Invoices from "./pages/Invoices";
import InvoiceList from "./pages/InvoiceList";
import InvoiceEdit from "./pages/InvoiceEdit";
import Settings from "./pages/Settings";
import CreateCompany from "./pages/CreateCompany";
import NotFound from "./pages/NotFound";
import Support from "./pages/Support";
import ProForma from "./pages/ProForma";
import Quotations from "./pages/Quotations";
import CustomDocumentList from "./pages/CustomDocumentList";
import ItemList from "./pages/ItemList";

// Settings sub-pages
import GeneralSettings from "./pages/settings/GeneralSettings";
import CompanySettings from "./pages/settings/CompanySettings";
import InvoiceSettings from "./pages/settings/InvoiceSettings";
import TaxSettings from "./pages/settings/TaxSettings";
import UserSettings from "./pages/settings/UserSettings";
import DocumentTypesSettings from "./pages/settings/DocumentTypesSettings";
import LogoSettings from "./pages/settings/LogoSettings";
import NumberingSettings from "./pages/settings/NumberingSettings";
import PaymentNoteSettings from "./pages/settings/PaymentNoteSettings";
import SignatureSettings from "./pages/settings/SignatureSettings";
import CustomizationSettings from "./pages/settings/CustomizationSettings";

// Settings sheets
import GeneralSettingsSheet from "./pages/settings/sheets/GeneralSettingsSheet";
import CompanyInfoSheet from "./pages/settings/sheets/CompanyInfoSheet";
import CompanyTaxSheet from "./pages/settings/sheets/CompanyTaxSheet";
import CompanyMenuSheet from "./pages/settings/sheets/CompanyMenuSheet";
import UserAccountSheet from "./pages/settings/sheets/UserAccountSheet";
import LogoSheet from "./pages/settings/sheets/LogoSheet";
import NumberingSheet from "./pages/settings/sheets/NumberingSheet";
import PaymentNoteSheet from "./pages/settings/sheets/PaymentNoteSheet";
import SignatureSheet from "./pages/settings/sheets/SignatureSheet";
import QuantityLabelSheet from "./pages/settings/sheets/QuantityLabelSheet";

import ProtectedRoute from "./components/ProtectedRoute";

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
    path: "/create-company",
    element: <ProtectedRoute><CreateCompany /></ProtectedRoute>,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/analytics",
    element: <ProtectedRoute><Analytics /></ProtectedRoute>,
  },
  {
    path: "/support",
    element: <ProtectedRoute><Support /></ProtectedRoute>,
  },
  {
    path: "/clients",
    element: <ProtectedRoute><div>Clients Page (Coming Soon)</div></ProtectedRoute>,
  },
  {
    path: "/items",
    element: <ProtectedRoute><ItemList /></ProtectedRoute>,
  },
  {
    path: "/invoices",
    element: <ProtectedRoute><Invoices /></ProtectedRoute>,
  },
  {
    path: "/invoices/list",
    element: <ProtectedRoute><InvoiceList /></ProtectedRoute>,
  },
  {
    path: "/invoices/new",
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>,
  },
  {
    path: "/invoices/:id",
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>,
  },
  {
    path: "/proforma",
    element: <ProtectedRoute><ProForma /></ProtectedRoute>,
  },
  {
    path: "/proforma/new",
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>,
  },
  {
    path: "/proforma/:id",
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>,
  },
  {
    path: "/quotations",
    element: <ProtectedRoute><Quotations /></ProtectedRoute>,
  },
  {
    path: "/quotations/new",
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>,
  },
  {
    path: "/quotations/:id",
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>,
  },
  {
    path: "/custom/:documentTypeId",
    element: <ProtectedRoute><CustomDocumentList /></ProtectedRoute>,
  },
  {
    path: "/custom/:documentTypeId/new",
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>,
  },
  {
    path: "/custom/:documentTypeId/:id",
    element: <ProtectedRoute><InvoiceEdit /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
    children: [
      {
        path: "general",
        element: <GeneralSettings />,
        children: [
          {
            path: "sheet",
            element: <GeneralSettingsSheet />,
          },
        ],
      },
      {
        path: "company",
        element: <CompanySettings />,
        children: [
          {
            path: "info",
            element: <CompanyInfoSheet />,
          },
          {
            path: "tax",
            element: <CompanyTaxSheet />,
          },
          {
            path: "menu",
            element: <CompanyMenuSheet />,
          },
        ],
      },
      {
        path: "invoice",
        element: <InvoiceSettings />,
      },
      {
        path: "tax",
        element: <TaxSettings />,
      },
      {
        path: "user",
        element: <UserSettings />,
        children: [
          {
            path: "account",
            element: <UserAccountSheet />,
          },
        ],
      },
      {
        path: "document-types",
        element: <DocumentTypesSettings />,
      },
      {
        path: "logo",
        element: <LogoSettings />,
        children: [
          {
            path: "sheet",
            element: <LogoSheet />,
          },
        ],
      },
      {
        path: "numbering",
        element: <NumberingSettings />,
        children: [
          {
            path: "sheet",
            element: <NumberingSheet />,
          },
        ],
      },
      {
        path: "payment-note",
        element: <PaymentNoteSettings />,
        children: [
          {
            path: "sheet",
            element: <PaymentNoteSheet />,
          },
        ],
      },
      {
        path: "signature",
        element: <SignatureSettings />,
        children: [
          {
            path: "sheet",
            element: <SignatureSheet />,
          },
        ],
      },
      {
        path: "customization",
        element: <CustomizationSettings />,
        children: [
          {
            path: "quantity-label",
            element: <QuantityLabelSheet />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
