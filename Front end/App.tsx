import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import LandlordDashboard from './pages/LandlordDashboard';
import CommunityPage from './pages/CommunityPage';
import AIAssistant from './components/AIAssistant';
import AuthModal from './components/AuthModal';
import { UserRole, Language, Property, User } from './types';
import { api } from './services/api';

function App() {
  // State for Global settings
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [role, setRole] = useState<UserRole>(UserRole.TENANT);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Simple Router State
  const [currentPage, setCurrentPage] = useState('/');
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<any>(null);

  // Initialize Auth
  useEffect(() => {
    const currentUser = api.auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setRole(currentUser.role);
    }
  }, []);

  // Hash Navigation Listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/';
      // Basic routing logic
      if (hash.startsWith('/property/')) {
        const id = hash.split('/')[2];
        setCurrentPropertyId(id);
        setCurrentPage('/property');
      } else if (hash === '/landlord') {
        setRole(UserRole.LANDLORD); 
        setCurrentPage('/landlord');
      } else if (hash === '/search') {
        setCurrentPage('/search');
      } else if (hash === '/community') {
        setCurrentPage('/community');
      } else {
        setCurrentPage('/');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const handlePropertyView = (id: string) => {
    navigate(`/property/${id}`);
  };

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
    navigate('/search');
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setRole(loggedInUser.role);
    if (loggedInUser.role === UserRole.LANDLORD) {
      navigate('/landlord');
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    setRole(UserRole.TENANT);
    navigate('/');
  };

  const handlePaymentStart = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    alert("Starting secure mobile money payment integration (Simulation)...");
  };

  // Render Page based on State
  const renderPage = () => {
    if (currentPage === '/community') {
      return <CommunityPage language={language} />;
    }

    if (currentPage === '/landlord') {
      return <LandlordDashboard language={language} />;
    }
    
    if (currentPage === '/property' && currentPropertyId) {
      // Fetch property data logic would ideally be async inside the page, 
      // but for router level we can pass ID and let page fetch.
      return (
        <PropertyDetailsPage 
          propertyId={currentPropertyId}
          language={language} 
          onBack={() => navigate('/search')}
          onPaymentStart={handlePaymentStart}
        />
      );
    }

    if (currentPage === '/search') {
      return (
        <SearchPage 
          language={language} 
          onViewProperty={handlePropertyView}
          initialFilters={searchFilters}
        />
      );
    }

    return (
      <HomePage 
        language={language} 
        onSearch={handleSearch}
        onViewProperty={handlePropertyView}
      />
    );
  };

  return (
    <div className="font-sans text-gray-900 bg-white">
      <Navbar 
        language={language} 
        setLanguage={setLanguage}
        role={role}
        setRole={setRole}
        currentPage={currentPage}
        navigate={navigate}
        user={user}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />
      
      <main>
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-xl font-bold mb-4">NIKONEKTI</h3>
            <p className="text-sm max-w-md">Revolutionizing the rental housing market in Tanzania. Safe, direct, and affordable housing for everyone.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/')} className="hover:text-white">Home</button></li>
              <li><button onClick={() => navigate('/search')} className="hover:text-white">Search Rentals</button></li>
              <li><button onClick={() => navigate('/community')} className="hover:text-white">Community & Tips</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Dar es Salaam, Tanzania</li>
              <li>support@nikonekti.tz</li>
              <li>+255 700 000 000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} NIKONEKTI Tanzania. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        language={language}
        onLogin={handleLogin}
      />

      {/* AI Assistant Chatbot (Always present for Tenants) */}
      {role === UserRole.TENANT && <AIAssistant language={language} />}
    </div>
  );
}

export default App;