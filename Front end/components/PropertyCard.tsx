import React from 'react';
import { MapPin, Bed, Bath, ShieldCheck } from 'lucide-react';
import { Property, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface PropertyCardProps {
  property: Property;
  language: Language;
  onClick: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, language, onClick }) => {
  const t = TRANSLATIONS[language];
  const formattedPrice = new Intl.NumberFormat(language === Language.SW ? 'sw-TZ' : 'en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0
  }).format(property.price);

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="relative h-48 w-full">
        <img 
          src={property.images[0]} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-emerald-700 uppercase tracking-wide">
          {property.type}
        </div>
        {property.verified && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs flex items-center shadow-sm">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {t.verified}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
        </div>
        
        <p className="text-emerald-600 font-bold text-lg mb-3">
          {formattedPrice} <span className="text-gray-500 text-xs font-normal">{t.perMonth}</span>
        </p>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            <span>{property.bathrooms} Baths</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;