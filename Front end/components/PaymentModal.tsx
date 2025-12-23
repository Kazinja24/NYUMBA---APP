import React, { useState } from 'react';
import { X, Smartphone, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import Button from './Button';
import { api } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  propertyTitle: string;
}

const PROVIDERS = [
  { id: 'M-PESA', name: 'Vodacom M-Pesa', color: 'bg-red-600' },
  { id: 'TIGO', name: 'Tigo Pesa', color: 'bg-blue-500' },
  { id: 'AIRTEL', name: 'Airtel Money', color: 'bg-red-500' },
  { id: 'HALOPESA', name: 'HaloPesa', color: 'bg-orange-500' }
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, propertyTitle }) => {
  const [step, setStep] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStep('PROCESSING');

    try {
      // Simulate API call to trigger USSD
      await api.payment.initiate(amount, phone, provider);
      setStep('SUCCESS');
    } catch (error) {
      console.error(error);
      alert("Payment failed to initiate. Please try again.");
      setStep('SELECT');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Secure Rent Payment</h2>
            <p className="text-sm text-gray-500 mt-1">{propertyTitle}</p>
            <div className="mt-2 text-2xl font-bold text-emerald-600">
              {amount.toLocaleString()} TZS
            </div>
          </div>

          {step === 'SELECT' && (
            <form onSubmit={handlePayment}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Provider</label>
                <div className="grid grid-cols-2 gap-3">
                  {PROVIDERS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      className={`cursor-pointer border rounded-lg p-3 flex items-center transition-all ${
                        provider === p.id 
                          ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full mr-2 ${p.color}`}></div>
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input 
                    type="tel" 
                    required
                    placeholder="07XX XXX XXX"
                    className="pl-10 w-full border border-gray-300 rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  You will receive a USSD popup on this phone.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Pay Securely
              </Button>
            </form>
          )}

          {step === 'PROCESSING' && (
            <div className="text-center py-8">
              <div className="mb-4 relative">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                <Smartphone className="w-6 h-6 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Check your phone...</h3>
              <p className="text-gray-600 text-sm max-w-xs mx-auto">
                We've sent a payment request to <strong>{phone}</strong>. Please enter your PIN to complete the transaction.
              </p>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">
                Your rent payment has been processed. The landlord has been notified.
              </p>
              <Button onClick={onClose} className="w-full">
                Download Receipt
              </Button>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-center items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
           <span className="text-xs font-semibold text-gray-500">Secured by</span>
           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Vodacom_Logo_2016.svg/1200px-Vodacom_Logo_2016.svg.png" className="h-4" alt="Vodacom" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Airtel_logo.svg/2560px-Airtel_logo.svg.png" className="h-4" alt="Airtel" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Tigo_Tanzania_logo.png" className="h-4" alt="Tigo" />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;