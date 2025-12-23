import React, { useState, useEffect } from 'react';
import { Camera, Check, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { Language, Property } from '../types';
import { TRANSLATIONS, AMENITIES } from '../constants';
import Button from './Button';

interface ListingFormProps {
  language: Language;
  onCancel: () => void;
  onSubmit: (property: Partial<Property>) => void;
  initialData?: Property;
}

const ListingForm: React.FC<ListingFormProps> = ({ language, onCancel, onSubmit, initialData }) => {
  const t = TRANSLATIONS[language];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    price: 0,
    location: '',
    city: 'Dar es Salaam',
    type: 'Apartment',
    period: 'month',
    bedrooms: 1,
    bathrooms: 1,
    description_en: '',
    description_sw: '',
    amenities: [],
    images: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Property, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (id: string) => {
    const current = formData.amenities || [];
    if (current.includes(id)) {
      handleChange('amenities', current.filter(item => item !== id));
    } else {
      handleChange('amenities', [...current, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData ? initialData.id : Date.now().toString(),
      landlordId: initialData ? initialData.landlordId : 'currentUser',
      verified: initialData ? initialData.verified : false,
      reviews: initialData ? initialData.reviews : [],
      // Use mock image if none uploaded and no existing images
      images: formData.images?.length ? formData.images : ['https://picsum.photos/800/600?random=' + Date.now()] 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? t.landlord.editListing : t.landlord.createListing}
        </h2>
        <div className="flex space-x-2">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-semibold text-lg mb-4 text-emerald-700">{t.landlord.step1}</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.landlord.titleLabel}</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Modern Apartment in Sinza"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.landlord.cityLabel}</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                >
                  <option value="Dar es Salaam">Dar es Salaam</option>
                  <option value="Dodoma">Dodoma</option>
                  <option value="Arusha">Arusha</option>
                  <option value="Mwanza">Mwanza</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.landlord.locationLabel}</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Makumbusho, Kijitonyama"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House (Standalone)</option>
                  <option value="Room">Single Room (Chumba)</option>
                  <option value="Hostel">Student Hostel</option>
                  <option value="Frame">Biashara / Frame</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.landlord.priceLabel}</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500"
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-semibold text-lg mb-4 text-emerald-700">{t.landlord.step2}</h3>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    value={formData.bedrooms}
                    onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                  />
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.landlord.descLabel} (English)</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 h-24"
                value={formData.description_en}
                onChange={(e) => handleChange('description_en', e.target.value)}
                placeholder="Describe the property..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.landlord.descLabel} (Swahili)</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 h-24"
                value={formData.description_sw}
                onChange={(e) => handleChange('description_sw', e.target.value)}
                placeholder="Elezea nyumba yako..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="font-semibold text-lg mb-4 text-emerald-700">{t.landlord.step3}</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">{t.amenities}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES.map(amenity => (
                  <div 
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`cursor-pointer p-3 rounded-lg border flex items-center transition-all ${
                      formData.amenities?.includes(amenity.id) 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 mr-2 rounded border flex items-center justify-center ${
                      formData.amenities?.includes(amenity.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                    }`}>
                      {formData.amenities?.includes(amenity.id) && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm">
                        {language === Language.SW ? amenity.name_sw : amenity.name_en}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.landlord.uploadPhotos}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                </div>
                {formData.images && formData.images.length > 0 && (
                   <div className="mt-4 flex gap-2">
                      {formData.images.map((img, idx) => (
                        <img key={idx} src={img} alt="Preview" className="w-16 h-16 object-cover rounded" />
                      ))}
                   </div>
                )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={step === 1 ? onCancel : () => setStep(s => s - 1)}>
                {step === 1 ? t.landlord.cancel : t.landlord.back}
            </Button>
            
            <Button onClick={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1); }}>
                {step === 3 ? (initialData ? t.landlord.update : t.landlord.save) : (
                    <>
                        {t.landlord.next} <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                )}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;