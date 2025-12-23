import React, { useState } from 'react';
import { X, FileText, Download, Send, MapPin, Check, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Language, Tenant } from '../types';
import { TRANSLATIONS, MOCK_PROPERTIES } from '../constants';
import Button from './Button';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  tenant: Tenant | null;
}

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, language, tenant }) => {
  const t = TRANSLATIONS[language];
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !tenant) return null;

  // Fetch full property details using the propertyId
  const property = MOCK_PROPERTIES.find(p => p.id === tenant.propertyId);
  
  // Construct a more complete address/title
  const propertyDisplay = property 
    ? `${property.title}, ${property.location}, ${property.city}`
    : tenant.propertyTitle;

  const currentDate = new Date().toLocaleDateString();

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Formatting
    doc.setFont("helvetica");
    
    // Header
    doc.setFontSize(18);
    doc.text("RESIDENTIAL TENANCY AGREEMENT", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("THE UNITED REPUBLIC OF TANZANIA", 105, 28, { align: "center" });
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // Body
    doc.setFontSize(11);
    let y = 45;
    const leftMargin = 20;
    const maxLineWidth = 170;

    const content = [
        `THIS AGREEMENT is made this ${currentDate} between:`,
        `\n`,
        `LANDLORD: NIKONEKTI Landlord`,
        `TENANT: ${tenant.name}`,
        `\n`,
        `1. THE PROPERTY`,
        `The Landlord agrees to let and the Tenant agrees to take the property situated at:`,
        `${propertyDisplay}`,
        `\n`,
        `2. TERM`,
        `The tenancy shall be for a fixed period commencing on ${tenant.leaseStart} and expiring on ${tenant.leaseEnd}.`,
        `\n`,
        `3. RENT`,
        `The Tenant agrees to pay the sum of ${(tenant.rentAmount).toLocaleString()} TZS per month, payable in advance.`,
        `\n`,
        `4. OBLIGATIONS`,
        `- The Tenant agrees to keep the interior of the premises in good and clean condition.`,
        `- The Tenant is responsible for paying utility bills (LUKU, Water) unless otherwise agreed.`,
        `- The Tenant shall not sublet the premises without written consent from the Landlord.`,
        `- The Tenant shall use the premises for residential purposes only.`
    ];

    content.forEach(line => {
        const splitText = doc.splitTextToSize(line, maxLineWidth);
        doc.text(splitText, leftMargin, y);
        y += splitText.length * 5 + 2;
    });

    // Signatures
    y += 30;
    
    // Check if y is near bottom of page, add page if needed (simple check)
    if (y > 250) {
        doc.addPage();
        y = 40;
    }

    doc.line(leftMargin, y, leftMargin + 70, y); // Landlord line
    doc.text("Landlord Signature", leftMargin, y + 10);
    doc.text("Date: " + currentDate, leftMargin, y + 18);

    doc.line(leftMargin + 90, y, leftMargin + 160, y); // Tenant line
    doc.text("Tenant Signature", leftMargin + 90, y + 10);
    doc.text("Date: _____________", leftMargin + 90, y + 18);

    doc.save(`Tenancy_Agreement_${tenant.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSend = () => {
    setIsSending(true);
    // Simulate API delay
    setTimeout(() => {
        setIsSending(false);
        setIsSent(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
           <h2 className="text-xl font-bold text-gray-900 flex items-center">
             <FileText className="w-5 h-5 mr-2 text-emerald-600" />
             {t.contract.title}
           </h2>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 font-serif text-sm leading-relaxed text-gray-800">
            <div className="bg-white p-8 shadow-sm border border-gray-200" id="contract-content">
                <div className="text-center mb-8">
                   <h3 className="font-bold text-lg underline mb-2">RESIDENTIAL TENANCY AGREEMENT</h3>
                   <p className="text-xs text-gray-500">THE UNITED REPUBLIC OF TANZANIA</p>
                </div>
                
                <p className="mb-4 text-justify">
                    This Tenancy Agreement is made this <strong>{currentDate}</strong> day of <strong>{new Date().getFullYear()}</strong> between 
                    <strong> NIKONEKTI Landlord</strong> (hereinafter referred to as "The Landlord") 
                    and <strong>{tenant.name}</strong> (hereinafter referred to as "The Tenant").
                </p>

                <div className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded">
                    <p className="mb-2"><strong>1. The Property:</strong></p>
                    <p className="flex items-start text-gray-700">
                       <MapPin className="w-4 h-4 mr-1 mt-0.5 text-gray-400" />
                       {propertyDisplay}
                    </p>
                </div>

                <p className="mb-4">
                    <strong>2. Term:</strong> The tenancy shall be for a fixed period commencing on <strong>{tenant.leaseStart}</strong> and expiring on <strong>{tenant.leaseEnd}</strong>.
                </p>

                <p className="mb-4">
                    <strong>3. Rent:</strong> The Tenant agrees to pay the sum of <strong>{(tenant.rentAmount).toLocaleString()} TZS</strong> per month, payable in advance.
                </p>

                <p className="mb-4">
                    <strong>4. Obligations:</strong> 
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>The Tenant agrees to keep the interior of the premises in good and clean condition.</li>
                      <li>The Tenant is responsible for paying utility bills (LUKU, Water) unless otherwise agreed.</li>
                      <li>The Tenant shall not sublet the premises without written consent from the Landlord.</li>
                    </ul>
                </p>

                <div className="mt-12 flex justify-between gap-8">
                    <div className="w-1/2">
                       <div className="h-12 border-b border-black mb-2"></div>
                       <div className="text-center text-xs uppercase tracking-wider">Landlord Signature</div>
                    </div>
                    <div className="w-1/2">
                       <div className="h-12 border-b border-black mb-2"></div>
                       <div className="text-center text-xs uppercase tracking-wider">Tenant Signature</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
             {isSent ? (
                 <div className="flex items-center text-green-600 font-medium px-4 animate-fadeIn">
                     <Check className="w-5 h-5" />
                     <span className="ml-2">{t.contract.generatedSuccess}</span>
                 </div>
             ) : (
                <>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        {t.contract.download}
                    </Button>
                    <Button size="sm" onClick={handleSend} disabled={isSending}>
                        {isSending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        {isSending ? 'Sending...' : t.contract.send}
                    </Button>
                </>
             )}
        </div>
      </div>
    </div>
  );
};

export default ContractModal;