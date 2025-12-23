import React, { useState } from 'react';
import { X, Mail, Phone, Lock, CheckCircle, Smartphone } from 'lucide-react';
import { Language, UserRole, AuthMethod } from '../types';
import { TRANSLATIONS } from '../constants';
import Button from './Button';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLogin: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, language, onLogin }) => {
  const t = TRANSLATIONS[language];
  const [method, setMethod] = useState<AuthMethod>('PHONE');
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: OTP (for phone)
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.TENANT);
  
  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (method === 'PHONE' && step === 1) {
        // Send OTP via API
        await api.auth.sendOtp(phone);
        setStep(2);
        setIsLoading(false);
        return;
      }

      if (method === 'PHONE' && step === 2) {
         // Verify OTP
         const isValid = await api.auth.verifyOtp(phone, otp);
         if (!isValid) {
             alert("Invalid OTP Code. Try 123456 for demo.");
             setIsLoading(false);
             return;
         }
      }

      // Finalize Login/Signup
      let user;
      if (isSignUp) {
        user = await api.auth.signup({
            name: method === 'EMAIL' ? email.split('@')[0] : 'User ' + phone.slice(-4),
            email: method === 'EMAIL' ? email : undefined,
            phone: method === 'PHONE' ? phone : undefined,
            role: selectedRole
        });
      } else {
        user = await api.auth.login(method === 'EMAIL' ? email : phone);
      }
      
      onLogin(user);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Authentication failed. Please check your connection.");
    } finally {
        // Only clear loading if we are NOT moving to step 2
        if (!(method === 'PHONE' && step === 1)) {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{t.auth.title}</h2>
            <p className="text-gray-500 mt-2">
              {isSignUp ? "Create an account to start" : "Welcome back"}
            </p>
          </div>

          {/* Method Toggles */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            <button
              onClick={() => { setMethod('PHONE'); setStep(1); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center ${
                method === 'PHONE' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {t.auth.phone}
            </button>
            <button
              onClick={() => { setMethod('EMAIL'); setStep(1); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center ${
                method === 'EMAIL' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              {t.auth.email}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && step === 1 && (
              <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">{t.auth.role}</label>
                 <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setSelectedRole(UserRole.TENANT)}
                      className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${selectedRole === UserRole.TENANT ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200'}`}
                    >
                      {t.auth.tenant}
                    </div>
                    <div 
                      onClick={() => setSelectedRole(UserRole.LANDLORD)}
                      className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${selectedRole === UserRole.LANDLORD ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200'}`}
                    >
                      {t.auth.landlord}
                    </div>
                 </div>
              </div>
            )}

            {method === 'EMAIL' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.auth.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder={t.auth.enterEmail}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.auth.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      required
                      className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {method === 'PHONE' && step === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.auth.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder={t.auth.enterPhone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {method === 'PHONE' && step === 2 && (
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Enter Verification Code</h3>
                  <p className="text-sm text-gray-500">Sent to {phone}</p>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full text-center text-2xl tracking-widest border border-gray-300 rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {step === 2 ? t.auth.verifyOtp : (isSignUp ? t.auth.signup : t.auth.login)}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>
            <button
              onClick={() => { setIsSignUp(!isSignUp); setStep(1); }}
              className="ml-2 font-semibold text-emerald-600 hover:text-emerald-500"
            >
              {isSignUp ? t.auth.login : t.auth.signup}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;