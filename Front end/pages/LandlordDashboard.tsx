import React, { useState, useEffect } from 'react';
import { Plus, Eye, MessageSquare, Home, BarChart, Users, FileText, Settings, Check, X, Menu, Search as SearchIcon, Loader } from 'lucide-react';
import { Language, LandlordStats, Property, Inquiry, Tenant } from '../types';
import { TRANSLATIONS, LANDLORD_STATS } from '../constants';
import Button from '../components/Button';
import ListingForm from '../components/ListingForm';
import ContractModal from '../components/ContractModal';
import { api } from '../services/api';

interface LandlordDashboardProps {
  language: Language;
}

type Tab = 'overview' | 'properties' | 'messages' | 'tenants' | 'settings';

const LandlordDashboard: React.FC<LandlordDashboardProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  
  // Async State
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contractTenant, setContractTenant] = useState<Tenant | null>(null);

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [props, inqs, tnts] = await Promise.all([
          api.properties.getAll(),
          api.inquiries.getByLandlord('currentUser'),
          api.tenants.getByLandlord('currentUser')
        ]);
        setProperties(props);
        setInquiries(inqs);
        setTenants(tnts);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddProperty = async (newProp: Partial<Property>) => {
    setIsLoading(true);
    try {
      const created = await api.properties.create(newProp as Property);
      setProperties(prev => [...prev, created]);
      setIsAddingProperty(false);
      setActiveTab('properties');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProperty = async (updatedProp: Partial<Property>) => {
    setIsLoading(true);
    try {
      const updated = await api.properties.update(updatedProp as Property);
      setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
      setIsAddingProperty(false);
      setEditingProperty(undefined);
      setActiveTab('properties');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (property: Property) => {
    setEditingProperty(property);
    setIsAddingProperty(true);
  };

  const openContractModal = (tenant: Tenant) => {
    setContractTenant(tenant);
  };

  if (isLoading && activeTab === 'overview' && properties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    if (isAddingProperty) {
      return (
        <div className="max-w-2xl mx-auto">
            <ListingForm 
                language={language} 
                onCancel={() => { setIsAddingProperty(false); setEditingProperty(undefined); }} 
                onSubmit={editingProperty ? handleUpdateProperty : handleAddProperty} 
                initialData={editingProperty}
            />
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Eye className="w-6 h-6" /></div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">{t.views}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{LANDLORD_STATS.totalViews}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><MessageSquare className="w-6 h-6" /></div>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+5%</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">{t.inquiries}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{inquiries.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Home className="w-6 h-6" /></div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">{t.landlord.activeListings}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{properties.filter(p => p.status === 'ACTIVE').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><BarChart className="w-6 h-6" /></div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">{t.landlord.revenue}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{(LANDLORD_STATS.revenue).toLocaleString()}</h3>
                </div>
             </div>

             {/* Recent Inquiries Preview */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">Recent Messages</h3>
                    <button onClick={() => setActiveTab('messages')} className="text-sm text-emerald-600 font-medium hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                    {inquiries.slice(0, 2).map(inquiry => (
                        <div key={inquiry.id} className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center font-bold text-emerald-800 mr-3 flex-shrink-0">
                                {inquiry.tenantName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <h4 className="text-sm font-bold text-gray-900">{inquiry.tenantName}</h4>
                                    <span className="text-xs text-gray-500">{inquiry.date}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">{inquiry.propertyTitle}</p>
                                <p className="text-sm text-gray-700 truncate">{inquiry.message}</p>
                            </div>
                        </div>
                    ))}
                    {inquiries.length === 0 && <p className="text-gray-500 text-sm">No messages yet.</p>}
                </div>
             </div>
          </div>
        );

      case 'properties':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-900">{t.landlord.properties}</h2>
                 <Button onClick={() => { setEditingProperty(undefined); setIsAddingProperty(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t.addNew}
                 </Button>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4">{t.landlord.titleLabel}</th>
                                <th className="p-4">{t.landlord.locationLabel}</th>
                                <th className="p-4">{t.landlord.priceLabel}</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {properties.map(prop => (
                                <tr key={prop.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <img src={prop.images[0]} className="w-10 h-10 rounded object-cover mr-3 bg-gray-200" alt="" />
                                            <span className="font-medium text-gray-900 line-clamp-1">{prop.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">{prop.location}</td>
                                    <td className="p-4 font-semibold text-emerald-600">
                                      {(prop.price).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            prop.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                            prop.status === 'RENTED' ? 'bg-gray-100 text-gray-700' : 
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {prop.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button 
                                          onClick={() => handleEditClick(prop)}
                                          className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wide"
                                        >
                                          Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          </div>
        );

      case 'messages':
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex flex-col animate-fadeIn">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{t.landlord.messages}</h2>
                    <div className="relative">
                        <input type="text" placeholder="Search..." className="pl-8 pr-4 py-1 text-sm border border-gray-300 rounded-full" />
                        <SearchIcon className="absolute left-2.5 top-1.5 w-4 h-4 text-gray-400" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                     {inquiries.map(inquiry => (
                        <div key={inquiry.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${inquiry.status === 'PENDING' ? 'bg-blue-50/50' : ''}`}>
                             <div className="flex justify-between mb-1">
                                <h4 className="font-bold text-gray-900">{inquiry.tenantName} <span className="text-gray-400 font-normal text-xs ml-2">{inquiry.tenantPhone}</span></h4>
                                <span className="text-xs text-gray-500">{inquiry.date}</span>
                             </div>
                             <div className="text-xs text-emerald-600 font-medium mb-2">{inquiry.propertyTitle}</div>
                             <p className="text-sm text-gray-700 mb-3">{inquiry.message}</p>
                             <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="h-8 text-xs">{t.landlord.reply}</Button>
                                {inquiry.status === 'PENDING' && (
                                    <Button size="sm" variant="secondary" className="h-8 text-xs bg-white border border-gray-200 text-gray-600 hover:bg-gray-100">{t.landlord.markRead}</Button>
                                )}
                             </div>
                        </div>
                     ))}
                </div>
            </div>
        );

      case 'tenants':
        return (
             <div className="space-y-6 animate-fadeIn">
                 <div className="flex justify-between items-center">
                     <h2 className="text-xl font-bold text-gray-900">{t.landlord.tenants}</h2>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4">Tenant Name</th>
                                <th className="p-4">Property</th>
                                <th className="p-4">Lease Period</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tenants.map(tenant => (
                                <tr key={tenant.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{tenant.name}</td>
                                    <td className="p-4">{tenant.propertyTitle}</td>
                                    <td className="p-4 text-xs">
                                        {tenant.leaseStart} - {tenant.leaseEnd}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button size="sm" variant="outline" onClick={() => openContractModal(tenant)}>
                                            <FileText className="w-3 h-3 mr-1" />
                                            {t.landlord.generateContract}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
        );
        
      default: 
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
       {/* Sidebar Navigation */}
       <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-10 pt-16">
          <div className="flex-1 px-4 py-6 space-y-2">
             <button 
                onClick={() => { setActiveTab('overview'); setIsAddingProperty(false); }}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' && !isAddingProperty ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
             >
                <BarChart className="w-5 h-5 mr-3" />
                {t.landlord.overview}
             </button>
             <button 
                onClick={() => { setActiveTab('properties'); setIsAddingProperty(false); }}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'properties' || isAddingProperty ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
             >
                <Home className="w-5 h-5 mr-3" />
                {t.landlord.properties}
             </button>
             <button 
                onClick={() => { setActiveTab('messages'); setIsAddingProperty(false); }}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
             >
                <MessageSquare className="w-5 h-5 mr-3" />
                {t.landlord.messages}
             </button>
             <button 
                onClick={() => { setActiveTab('tenants'); setIsAddingProperty(false); }}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tenants' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
             >
                <Users className="w-5 h-5 mr-3" />
                {t.landlord.tenants}
             </button>
          </div>
          <div className="p-4 border-t border-gray-200">
              <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
              </button>
          </div>
       </aside>

       {/* Mobile Header Toggle */}
       <div className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-16 z-30 flex justify-between items-center">
            <span className="font-bold text-gray-900 capitalize">{activeTab}</span>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-100 rounded-md">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
       </div>

       {/* Mobile Nav Menu */}
       {mobileMenuOpen && (
           <div className="md:hidden fixed inset-0 z-40 bg-white pt-24 px-4 space-y-4">
               <button onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); setIsAddingProperty(false); }} className="block w-full text-left py-3 border-b text-lg font-medium">{t.landlord.overview}</button>
               <button onClick={() => { setActiveTab('properties'); setMobileMenuOpen(false); setIsAddingProperty(false); }} className="block w-full text-left py-3 border-b text-lg font-medium">{t.landlord.properties}</button>
               <button onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); setIsAddingProperty(false); }} className="block w-full text-left py-3 border-b text-lg font-medium">{t.landlord.messages}</button>
               <button onClick={() => { setActiveTab('tenants'); setMobileMenuOpen(false); setIsAddingProperty(false); }} className="block w-full text-left py-3 border-b text-lg font-medium">{t.landlord.tenants}</button>
           </div>
       )}

       {/* Main Content */}
       <main className="flex-1 md:ml-64 p-4 md:p-8 pt-6">
          {renderContent()}
       </main>

       {/* Contract Modal */}
       <ContractModal 
         isOpen={!!contractTenant} 
         onClose={() => setContractTenant(null)} 
         language={language} 
         tenant={contractTenant} 
       />
    </div>
  );
};

export default LandlordDashboard;