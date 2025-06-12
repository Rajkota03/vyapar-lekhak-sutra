
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import MainLayout from './components/layout/MainLayout'
import { AuthProvider } from './context/AuthContext'

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <MainLayout>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MainLayout>
  </QueryClientProvider>
);
