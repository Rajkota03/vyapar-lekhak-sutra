
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import MainLayout from './components/layout/MainLayout'

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <MainLayout>
      <App />
    </MainLayout>
  </QueryClientProvider>
);
