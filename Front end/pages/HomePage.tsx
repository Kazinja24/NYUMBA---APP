import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, CheckCircle, Mic, Loader } from 'lucide-react';
import Button from '../components/Button';
import PropertyCard from '../components/PropertyCard';
import { Language, Property } from '../types';
import { TRANSLATIONS } from '../constants';
import { api } from '../services/api';

interface HomePageProps {
  language: Language;
  onSearch: (filters: any) => void;
  onViewProperty: (id: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ language, onSearch, onViewProperty }) => {
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const props = await api.properties.getAll();
        // Just take first 3 for featured
        setFeaturedProperties(props.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ term: searchTerm });
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = language === Language.SW ? 'sw-TZ' : 'en-US';
      recognition.continuous = false;
      
      setIsListening(true);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
        onSearch({ term: transcript });
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert('Voice recognition error. Please try typing.');
      };
      
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      alert("Voice search is not supported in this browser.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Tanzanian Cityscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-emerald-900/80"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white p-2 rounded-xl shadow-xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-lg h-12 md:h-14 relative">
              <MapPin className="text-gray-400 w-5 h-5 mr-3" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="bg-transparent w-full focus:outline-none text-gray-800 placeholder-gray-500 pr-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="button" 
                onClick={startVoiceSearch}
                className={`absolute right-3 p-1 rounded-full ${isListening ? 'text-red-500 bg-red-100 animate-pulse' : 'text-gray-400 hover:text-emerald-600'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            <div className="md:w-48 hidden md:flex items-center px-4 bg-gray-50 rounded-lg h-14 border-l border-white">
              <DollarSign className="text-gray-400 w-5 h-5 mr-3" />
              <select className="bg-transparent w-full focus:outline-none text-gray-800 text-sm cursor-pointer">
                <option value="">{t.priceRange}</option>
                <option value="0-200000">0 - 200k</option>
                <option value="200000-500000">200k - 500k</option>
                <option value="500000+">500k+</option>
              </select>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full md:w-auto md:px-8 h-12 md:h-14 rounded-lg shadow-md"
            >
              {t.search}
            </Button>
          </form>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-white/80 text-sm font-medium">
            <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-emerald-400" /> Verified Landlords</span>
            <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-emerald-400" /> Direct Chat</span>
            <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-emerald-400" /> Secure Payments</span>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.featured}</h2>
            <p className="text-gray-500 mt-1">Curated listings just for you</p>
          </div>
          <button 
            onClick={() => onSearch({})}
            className="text-emerald-600 font-semibold hover:text-emerald-700 hidden sm:block"
          >
            View All &rarr;
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(prop => (
              <PropertyCard 
                key={prop.id} 
                property={prop} 
                language={language} 
                onClick={() => onViewProperty(prop.id)}
              />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" onClick={() => onSearch({})}>View All Properties</Button>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
             <div className="p-6">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-2xl">🇹🇿</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Made for Tanzania</h3>
                <p className="text-gray-600 text-sm">Swahili support and filters for LUKU, reliable water, and location-specific needs.</p>
             </div>
             <div className="p-6">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-2xl">🚫</span>
                </div>
                <h3 className="font-bold text-lg mb-2">No Middlemen</h3>
                <p className="text-gray-600 text-sm">Talk directly to property owners. Save money on broker fees.</p>
             </div>
             <div className="p-6">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Mobile First</h3>
                <p className="text-gray-600 text-sm">Pay securely via M-Pesa, Tigo Pesa, or Airtel Money within the app.</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;