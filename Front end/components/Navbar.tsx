import React, { useState } from 'react';
import { Home, Menu, X, User as UserIcon, Shield, Users, LogOut } from 'lucide-react';
import { Language, UserRole, User } from '../types';
import Button from './Button';
import { TRANSLATIONS } from '../constants';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentPage: string;
  navigate: (page: string) => void;
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  language, setLanguage, role, setRole, currentPage, navigate, user, onLoginClick, onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const toggleLanguage = () => {
    setLanguage(language === Language.EN ? Language.SW : Language.EN);
  };

  const toggleRole = () => {
    setRole(role === UserRole.TENANT ? UserRole.LANDLORD : UserRole.TENANT);
    navigate(role === UserRole.TENANT ? '/landlord' : '/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-emerald-600 p-1.5 rounded-lg mr-2">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-emerald-900 tracking-tight">NIKONEKTI</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => navigate('/community')}
              className="text-gray-600 hover:text-emerald-600 font-medium text-sm flex items-center px-3"
            >
              <Users className="w-4 h-4 mr-1" />
              {t.community}
            </button>

            <button 
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-full bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              {language === Language.EN ? '🇹🇿 SW' : '🇬🇧 EN'}
            </button>

            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={toggleRole}>
                  {role === UserRole.TENANT ? t.switchRole : 'Switch to Tenant'}
                </Button>
                
                {role === UserRole.LANDLORD && (
                  <span className="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4 mr-1" />
                    Landlord
                  </span>
                )}
                
                <div className="flex items-center space-x-3 ml-2 pl-2 border-l border-gray-200">
                   <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 text-orange-600 font-bold text-xs">
                      {user.name.substring(0,2).toUpperCase()}
                   </div>
                   <button onClick={onLogout} title="Logout" className="text-gray-400 hover:text-red-500">
                      <LogOut className="w-5 h-5" />
                   </button>
                </div>
              </>
            ) : (
              <Button onClick={onLoginClick} size="sm">
                {t.login}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-emerald-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <button 
              onClick={() => { navigate('/community'); setIsMenuOpen(false); }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              {t.community}
            </button>
             <button 
              onClick={() => { toggleLanguage(); setIsMenuOpen(false); }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Change Language ({language})
            </button>
            {user ? (
              <>
                <button 
                  onClick={() => { toggleRole(); setIsMenuOpen(false); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  {role === UserRole.TENANT ? 'Switch to Landlord' : 'Switch to Tenant'}
                </button>
                <button 
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  {t.logout}
                </button>
              </>
            ) : (
               <button 
                  onClick={() => { onLoginClick(); setIsMenuOpen(false); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50"
                >
                  {t.login}
                </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;