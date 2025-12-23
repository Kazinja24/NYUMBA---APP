import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Shield, Wifi, Droplet, Zap, Phone, Car, Wind, ArrowLeft, Star, CreditCard, PenTool, Loader } from 'lucide-react';
import { Property, Language, Review } from '../types';
import { TRANSLATIONS, AMENITIES } from '../constants';
import Button from '../components/Button';
import ReviewModal from '../components/ReviewModal';
import PaymentModal from '../components/PaymentModal';
import MapView from '../components/MapView';
import { api } from '../services/api';

interface PropertyDetailsPageProps {
  propertyId: string;
  language: Language;
  onBack: () => void;
  onPaymentStart: () => void; // Used to trigger auth modal from parent if not logged in
}

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ propertyId, language, onBack, onPaymentStart }) => {
  const t = TRANSLATIONS[language];
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const data = await api.properties.getById(propertyId);
        if (data) {
          setProperty(data);
          setReviews(data.reviews || []);
        }
      } catch (e) {
        console.error("Failed to load property");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Property not found</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat(language === Language.SW ? 'sw-TZ' : 'en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0
  }).format(property.price);

  const getAmenityIcon = (id: string) => {
    switch (id) {
      case 'water': return <Droplet className="w-5 h-5" />;
      case 'power': return <Zap className="w-5 h-5" />;
      case 'wifi': return <Wifi className="w-5 h-5" />;
      case 'parking': return <Car className="w-5 h-5" />;
      case 'ac': return <Wind className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    const newReview: Review = {
        id: 'r_' + Date.now(),
        userId: 'current_user',
        userName: 'You', // In real app, get from user context
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const handlePaymentClick = () => {
    const user = api.auth.getCurrentUser();
    if (!user) {
      onPaymentStart(); // Triggers Auth Modal in App.tsx
    } else {
      setShowPaymentModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header for Mobile */}
      <div className="sticky top-16 z-20 bg-white/90 backdrop-blur border-b border-gray-200 p-4 md:hidden flex justify-between items-center">
         <button onClick={onBack} className="text-gray-600"><ArrowLeft /></button>
         <span className="font-bold text-emerald-700">{formattedPrice}</span>
      </div>

      <div className="max-w-5xl mx-auto md:py-8">
        <button onClick={onBack} className="hidden md:flex items-center text-gray-500 hover:text-emerald-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Images & Info */}
            <div className="lg:col-span-2 space-y-6">
                {/* Image Gallery */}
                <div className="aspect-video w-full bg-gray-200 rounded-none md:rounded-2xl overflow-hidden relative group">
                    <img 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4">
                         <Button size="sm" variant="secondary" className="shadow-lg">
                            {t.virtualTour}
                         </Button>
                    </div>
                </div>

                <div className="px-4 md:px-0">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                             <div className="flex items-center text-gray-600">
                                <MapPin className="w-5 h-5 mr-1 text-emerald-600" />
                                {property.location}, {property.city}
                             </div>
                        </div>
                    </div>

                    <div className="border-t border-b border-gray-100 py-6 my-6">
                        <h3 className="font-semibold text-lg mb-4">{t.description}</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {language === Language.SW ? property.description_sw : property.description_en}
                        </p>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-semibold text-lg mb-4">{t.amenities}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {property.amenities.map(amenityId => {
                                const amenity = AMENITIES.find(a => a.id === amenityId);
                                if (!amenity) return null;
                                return (
                                    <div key={amenityId} className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        <span className="text-emerald-600 mr-2">
                                            {getAmenityIcon(amenityId)}
                                        </span>
                                        <span className="text-sm">
                                            {language === Language.SW ? amenity.name_sw : amenity.name_en}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Location Map Section */}
                    {property.coordinates && (
                      <div className="mb-8">
                        <h3 className="font-semibold text-lg mb-4">Location</h3>
                        <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200">
                             <MapView properties={[property]} className="h-full w-full" />
                        </div>
                      </div>
                    )}

                    {/* Reviews Section */}
                    <div className="border-t border-gray-100 pt-6">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg">{t.reviews} ({reviews.length})</h3>
                          <Button size="sm" variant="outline" onClick={() => setShowReviewModal(true)}>
                              <PenTool className="w-4 h-4 mr-2" />
                              {t.writeReview}
                          </Button>
                      </div>
                      
                      {reviews.length > 0 ? (
                        <div className="space-y-4">
                          {reviews.map(review => (
                            <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800 mr-2">
                                  {review.userName.charAt(0)}
                                </div>
                                <span className="font-medium mr-2">{review.userName}</span>
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <span className="ml-auto text-xs text-gray-400">{review.date}</span>
                              </div>
                              <p className="text-gray-600 text-sm">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                      )}
                    </div>
                </div>
            </div>

            {/* Right Column: Action Card */}
            <div className="lg:col-span-1 px-4 md:px-0">
                <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                    <div className="mb-6">
                        <span className="text-sm text-gray-500">Rent per month</span>
                        <div className="text-3xl font-bold text-emerald-600">{formattedPrice}</div>
                    </div>

                    <div className="space-y-4">
                        <Button className="w-full justify-center" size="lg" onClick={handlePaymentClick}>
                            <CreditCard className="w-5 h-5 mr-2" />
                            {t.paymentSecure}
                        </Button>
                        <Button variant="outline" className="w-full justify-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {t.contactLandlord}
                        </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="font-medium text-gray-900 mb-2">Safety Tips</h4>
                         <ul className="text-sm text-gray-500 space-y-2">
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                                Never pay without seeing the house.
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                                Use NIKONEKTI Secure Payment.
                            </li>
                         </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        language={language}
        onSubmit={handleReviewSubmit}
      />
      
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={property.price}
        propertyTitle={property.title}
      />
    </div>
  );
};

export default PropertyDetailsPage;