import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AppointmentPage from './components/AppointmentPage';
import CustomerPage from './components/CustomerPage';
import ServicesPage from './components/ServicesPage';
import AIConsultant from './components/AIConsultant';
import InventoryPage from './components/InventoryPage';
import POSPage from './components/POSPage';
import LoginPage from './components/LoginPage';
import SetupPage from './components/SetupPage';
import SettingsPage from './components/SettingsPage';
import DatabaseSetupGuide from './components/DatabaseSetupGuide';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isConfigured } from './lib/supabaseClient';
import { Menu, Sparkles, PanelLeftOpen } from 'lucide-react';

// Inner layout to consume ClinicContext
const ClinicLayout: React.FC = () => {
  const { dbConnectionError } = useClinic();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Check for missing tables error
  if (dbConnectionError === 'MISSING_TABLES') {
    return <DatabaseSetupGuide />;
  }

  const handleSidebarClose = () => {
    setIsMobileSidebarOpen(false);
    setIsDesktopSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden transition-opacity" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          md:relative 
          ${isMobileSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'} 
          md:translate-x-0 md:shadow-none
          ${isDesktopSidebarOpen ? 'md:w-64' : 'md:w-0 md:overflow-hidden md:border-none'}
        `}
      >
        <div className="h-full w-64">
            <Sidebar onClose={handleSidebarClose} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Desktop Open Sidebar Button */}
        {!isDesktopSidebarOpen && (
            <button 
              onClick={() => setIsDesktopSidebarOpen(true)}
              className="hidden md:flex absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
              title="Open Sidebar"
            >
              <PanelLeftOpen size={24} />
            </button>
        )}

        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white">
                  <Sparkles size={16} />
              </div>
              <h1 className="font-bold text-gray-800">Patricia Clinic</h1>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<AppointmentPage />} />
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/ai-consultant" element={<AIConsultant />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const ProtectedLayout: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ClinicProvider>
        <ClinicLayout />
    </ClinicProvider>
  );
};

const App: React.FC = () => {
  if (!isConfigured()) {
    return <SetupPage />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;