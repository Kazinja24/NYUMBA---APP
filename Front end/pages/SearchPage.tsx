import React, { useState, useEffect } from 'react';
import { Filter, X, Map as MapIcon, List, Loader } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';
import { Language, Property } from '../types';
import { TRANSLATIONS, AMENITIES } from '../constants';
import Button from '../components/Button';
import { api } from '../services/api';

interface SearchPageProps {
  language: Language;
  onViewProperty: (id: string) => void;
  initialFilters?: any;
}

const SearchPage: React.FC<SearchPageProps> = ({ language, onViewProperty, initialFilters }) => {
  const t = TRANSLATIONS[language];
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [selectedCity, setSelectedCity] = useState('');
  const [priceMax, setPriceMax] = useState<number>(2000000);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const filters = {
          term: initialFilters?.term,
          city: selectedCity,
          maxPrice: priceMax
        };
        const results = await api.properties.getAll(filters);
        setProperties(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [initialFilters, selectedCity, priceMax]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden bg-white p-4 border-b border-gray-200 sticky top-16 z-30 flex justify-between items-center">
        <span className="font-semibold text-gray-700">{properties.length} Results</span>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}>
                {viewMode === 'list' ? <MapIcon className="w-4 h-4 mr-2" /> : <List className="w-4 h-4 mr-2" />}
                {viewMode === 'list' ? 'Map' : 'List'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                {t.filters}
            </Button>
        </div>
      </div>

      {/* Filters Sidebar */}
      <aside className={`
        fixed inset-0 z-40 bg-white md:static md:w-80 md:block border-r border-gray-200 overflow-y-auto transition-transform duration-300
        ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="text-xl font-bold">{t.filters}</h2>
                <button onClick={() => setShowFilters(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <select 
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2 border"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                    >
                        <option value="">All Cities</option>
                        <option value="Dar es Salaam">Dar es Salaam</option>
                        <option value="Dodoma">Dodoma</option>
                        <option value="Arusha">Arusha</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Price: {(priceMax).toLocaleString()} TZS
                    </label>
                    <input 
                        type="range" 
                        min="50000" 
                        max="3000000" 
                        step="50000" 
                        value={priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">{t.amenities}</label>
                    <div className="space-y-2">
                        {AMENITIES.map(amenity => (
                            <label key={amenity.id} className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                <span className="ml-2 text-sm text-gray-600">
                                    {language === Language.SW ? amenity.name_sw : amenity.name_en}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <Button className="w-full" onClick={() => setShowFilters(false)}>Apply Filters</Button>
                </div>
            </div>
        </div>
      </aside>

      {/* Results Grid */}
      <main className="flex-1 p-4 md:p-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
            <div className="hidden md:flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900">Properties For Rent</h1>
                    <span className="text-gray-500">{properties.length} results found</span>
                 </div>
                 <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${viewMode === 'list' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}
                    >
                        <List className="w-4 h-4 mr-2" /> {t.listView}
                    </button>
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${viewMode === 'map' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}
                    >
                        <MapIcon className="w-4 h-4 mr-2" /> {t.mapView}
                    </button>
                 </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
                  </div>
                ) : viewMode === 'map' ? (
                     <MapView properties={properties} />
                ) : (
                    <>
                        {properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map(prop => (
                                    <PropertyCard 
                                        key={prop.id} 
                                        property={prop} 
                                        language={language}
                                        onClick={() => onViewProperty(prop.id)} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="text-gray-400 text-6xl mb-4">🏠</div>
                                <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
                                <p className="text-gray-500">Try adjusting your price range or location.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;