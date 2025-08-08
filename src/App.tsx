import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { AdminLoginPage } from '@/components/AdminLoginPage';
import { AdminDashboard } from '@/components/AdminDashboard';

const queryClient = new QueryClient();

// Auth guard for admin routes
const AdminRoute = ({ element }: { element: React.ReactNode }) => {
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  return isAuthenticated ? <>{element}</> : <Navigate to="/admin" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route 
            path="/admin/dashboard" 
            element={<AdminRoute element={<AdminDashboard />} />} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
