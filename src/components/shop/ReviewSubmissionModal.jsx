import React, { useState } from 'react';
import { X, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function ReviewSubmissionModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await addDoc(collection(db, 'customer_reviews'), {
        userId: currentUser?.uid || 'guest',
        userName: name,
        userEmail: email,
        rating,
        comment,
        status: 'pending',
        location: 'Baharagora, Jharkhand',
        createdAt: serverTimestamp(),
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset form
        setRating(5);
        setComment('');
      }, 3000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-black text-slate-900">Thank You!</h3>
            <p className="text-sm font-bold text-slate-500">
              Your review has been submitted successfully and is pending approval.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Share Your Experience</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">Help others by sharing your feedback about The Grocery Hub.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Rating Stars */}
              <div className="flex flex-col items-center py-2 space-y-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tap to Rate</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Email / Phone (Optional)</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="For verification"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Your Review</label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked (or didn't like) about your order..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all resize-none"
                  />
                </div>
              </div>

              {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-sm font-black rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
