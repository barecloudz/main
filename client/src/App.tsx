import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "./hooks/useAnalytics";
import { initGA } from "./lib/analytics";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/home";
import Login from "@/pages/login";
import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ClientSidebar } from "@/components/layout/ClientSidebar";

// Public pages
import Blog from "@/pages/blog";
import BlogPostDetail from "@/pages/blog/[id]";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminClients from "@/pages/admin/clients";
import AdminForms from "@/pages/admin/forms";
import AdminInvoices from "@/pages/admin/invoices";
import AdminSettings from "@/pages/admin/settings";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminMarketingPlans from "@/pages/admin/marketing-plans";
import AdminBlog from "@/pages/admin/blog";
import AdminDocuments from "@/pages/admin/documents";

// Client pages
import ClientDashboard from "@/pages/client/dashboard";
import ClientMarketingPlan from "@/pages/client/marketing-plan";
import ClientInvoices from "@/pages/client/invoices";
import ClientDocuments from "@/pages/client/documents";
import ClientReports from "@/pages/client/reports";

// Protected route component for admin and client access
function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  
  // Check if admin role is required
  if (adminOnly && user?.role !== "admin") {
    return <NotFound />;
  }
  
  return <Component {...rest} />;
}

// Admin layout with sidebar
function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Mobile menu button - visible on small screens only */}
      <div className="md:hidden flex items-center p-4 bg-[#191919] text-white">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-white focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        <span className="ml-2 font-semibold">BareCloudz Admin</span>
      </div>
      
      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
        <AdminSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

// Client layout with sidebar
function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Mobile menu button - visible on small screens only */}
      <div className="md:hidden flex items-center p-4 bg-[#191919] text-white">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-white focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        <span className="ml-2 font-semibold">Client Portal</span>
      </div>
      
      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}>
        <ClientSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

function Router() {
  const { user, isAuthenticated } = useAuth();
  // Track page views
  useAnalytics();
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogPostDetail} />
      
      {/* Password management routes */}
      <Route path="/forgot-password" component={React.lazy(() => import("./pages/auth/forgot-password"))} />
      <Route path="/set-password" component={React.lazy(() => import("./pages/auth/set-password"))} />
      <Route path="/reset-password" component={React.lazy(() => import("./pages/auth/reset-password"))} />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute 
          component={() => (
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          )} 
          adminOnly={true} 
        />
      </Route>
      
      <Route path="/admin/clients">
        <ProtectedRoute 
          component={() => (
            <AdminLayout>
              <AdminClients />
            </AdminLayout>
          )} 
          adminOnly={true} 
        />
      </Route>
      
      <Route path="/admin/forms">
        <ProtectedRoute 
          component={() => (
            <AdminLayout>
              <AdminForms />
            </AdminLayout>
          )} 
          adminOnly={true} 
        />
      </Route>
      
      <Route path="/admin/invoices">
        <ProtectedRoute 
          component={() => (
            <AdminLayout>
              <AdminInvoices />
            </AdminLayout>
          )} 
          adminOnly={true} 
        />
      </Route>
      
      <Route path="/admin/settings">
        <ProtectedRoute 
          component={() => (
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          )} 
          adminOnly={true} 
        />
      </Route>
      
      <Route path="/admin/documents">
        <ProtectedRoute 
          component={() => (
            <AdminLayout>
              <AdminDocuments />
            </AdminLayout>
          )} 
          adminOnly={true} 
        />
      </Route>

      <Route path="/admin/analytics">
        <ProtectedRoute 
          component={() => (
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          )} 
          adminOnly={true} 
        />
      </Route>

      <Route path="/admin/marketing-plans">
        <ProtectedRoute 
          component={() => (
            <AdminLayout>
              <AdminMarketingPlans />
            </AdminLayout>
          )} 
          adminOnly={true} 
        />
      </Route>
      
      <Route path="/admin/blog">
        <ProtectedRoute 
          component={() => (
            <AdminLayout>
              <AdminBlog />
            </AdminLayout>
          )} 
          adminOnly={true} 
        />
      </Route>
      
      {/* Client routes */}
      <Route path="/client/dashboard">
        <ProtectedRoute 
          component={() => (
            <ClientLayout>
              <ClientDashboard />
            </ClientLayout>
          )}
        />
      </Route>
      
      <Route path="/client/marketing-plan">
        <ProtectedRoute 
          component={() => (
            <ClientLayout>
              <ClientMarketingPlan />
            </ClientLayout>
          )}
        />
      </Route>
      
      <Route path="/client/invoices">
        <ProtectedRoute 
          component={() => (
            <ClientLayout>
              <ClientInvoices />
            </ClientLayout>
          )}
        />
      </Route>
      
      <Route path="/client/documents">
        <ProtectedRoute 
          component={() => (
            <ClientLayout>
              <ClientDocuments />
            </ClientLayout>
          )}
        />
      </Route>
      
      <Route path="/client/reports">
        <ProtectedRoute 
          component={() => (
            <ClientLayout>
              <ClientReports />
            </ClientLayout>
          )}
        />
      </Route>
      
      {/* Client Portal - redirects to login or dashboard based on auth status */}
      <Route path="/client-portal">
        {() => {
          if (isAuthenticated) {
            const redirectPath = user?.role === "admin" 
              ? "/admin/dashboard" 
              : "/client/dashboard";
            
            window.location.href = redirectPath;
            return null;
          } else {
            window.location.href = "/login";
            return null;
          }
        }}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
