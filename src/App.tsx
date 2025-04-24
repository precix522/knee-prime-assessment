
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import GeneralLogin from "./pages/GeneralLogin";
import Logout from "./pages/Logout";
import PatientID from "./pages/PatientID";
import ReportViewer from "./pages/ReportViewer";
import NotFound from "./pages/NotFound";
import ContactUS from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ManagePatients from "./pages/ManagePatients";
import { AuthInitializer } from "./components/AuthInitializer";
import AllReports from "./pages/AllReports";
import ManageUsers from "./pages/ManageUsers";

// Add global styles to ensure proper spacing
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer />
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/general-login" element={<GeneralLogin />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/patient-id" element={<PatientID />} />
            <Route path="/report-viewer" element={<ReportViewer />} />
            <Route path="/contactus" element={<ContactUS />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/manage-patients" element={<ManagePatients />} />
            <Route path="/all-reports" element={<AllReports />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
