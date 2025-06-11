import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateCompany from "./pages/CreateCompany";
import InvoiceList from "./pages/InvoiceList";
import InvoiceEdit from "./pages/InvoiceEdit";
import ItemList from "./pages/ItemList";
import Settings from "./pages/Settings";
import GeneralSettings from "./pages/settings/GeneralSettings";
import CompanySettings from "./pages/settings/CompanySettings";
import InvoiceSettings from "./pages/settings/InvoiceSettings";
import CustomizationSettings from "./pages/settings/CustomizationSettings";
import UserSettings from "./pages/settings/UserSettings";
import NotFound from "./pages/NotFound";
import QuantityLabelSheet from "./pages/settings/sheets/QuantityLabelSheet";

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
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/create-company",
    element: <ProtectedRoute><CreateCompany /></ProtectedRoute>,
  },
  {
    path: "/invoices",
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
    path: "/items",
    element: <ProtectedRoute><ItemList /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
    children: [
      {
        path: "general",
        element: <GeneralSettings />,
      },
      {
        path: "company",
        element: <CompanySettings />,
      },
      {
        path: "invoice",
        element: <InvoiceSettings />,
      },
      {
        path: "customization",
        element: <CustomizationSettings />,
      },
      {
        path: "customization/quantity-label",
        element: <QuantityLabelSheet />,
      },
      {
        path: "user",
        element: <UserSettings />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
