import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Button from './Button';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSubmit: (rating: number, comment: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, language, onSubmit }) => {
  const t = TRANSLATIONS[language];
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
         <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{t.writeReview}</h3>
                <button onClick={onClose}><X className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="flex justify-center mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="p-1"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star 
                                className={`w-8 h-8 ${
                                    star <= (hoverRating || rating) 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                }`} 
                            />
                        </button>
                    ))}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tell us about your stay
                    </label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500 min-h-[100px]"
                        placeholder="Was the water reliable? Is the neighborhood quiet?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" className="w-full" disabled={rating === 0}>
                    {t.submitReview}
                </Button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default ReviewModal;