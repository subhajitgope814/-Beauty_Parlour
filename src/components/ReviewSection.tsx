import React, { useState } from 'react';
import { Review } from '../types';
import { Star, MessageSquare, ShieldAlert, Sparkles, Send } from 'lucide-react';

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (reviewData: { customerName: string; rating: number; comment: string }) => void;
  currentUser: any;
}

export default function ReviewSection({ reviews, onAddReview, currentUser }: ReviewSectionProps) {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Show only approved reviews on the public view
  const approvedReviews = reviews.filter(r => r.approved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please specify your name.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Please write a brief comment.');
      return;
    }

    onAddReview({
      customerName,
      rating,
      comment
    });

    setSuccess(true);
    setComment('');
    setRating(5);

    setTimeout(() => {
      setSuccess(false);
    }, 5000);
  };

  return (
    <section id="reviews-section" className="py-24 bg-sand-100/20 border-y border-sand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-sand-200 block mb-2">
            GUEST EXPERIENCES & FEEDBACK
          </span>
          <h2 className="title-font text-4xl sm:text-5xl font-light text-charcoal">
            The Guest Reviews
          </h2>
          <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto font-light">
            Read authentic reviews from guests who have experienced the elite artistry and scalp pampering at Trisha Beauty Parlour.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Reviews List (Public/Approved) */}
          <div className="lg:col-span-7 space-y-8" id="reviews-list-container">
            <h3 className="text-lg font-serif tracking-wide text-charcoal border-b border-sand-100 pb-3">
              Stories of Transformation ({approvedReviews.length})
            </h3>

            {approvedReviews.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No approved reviews yet. Be the first to share your experience!</p>
            ) : (
              <div className="space-y-6">
                {approvedReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="bg-white p-6 border border-sand-100 shadow-2xs hover:shadow-[0_8px_24px_-8px_rgba(217,119,6,0.15)] hover:-translate-y-1 transition-all duration-300 relative group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-serif text-charcoal font-medium text-sm sm:text-base block group-hover:text-sand-200 transition-colors duration-300">
                          {review.customerName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {review.date}
                        </span>
                      </div>
                      <div className="flex text-amber-500 transition-transform duration-300 group-hover:scale-105">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`w-3.5 h-3.5 transition-all duration-300 ${idx < review.rating ? 'fill-amber-500 text-amber-500 group-hover:rotate-12' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed italic transition-colors duration-300 group-hover:text-gray-900">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Review Box */}
          <div className="lg:col-span-5 bg-white p-8 border border-sand-100 rounded-xs">
            <h3 className="title-font text-2xl font-light text-charcoal mb-2">
              Share Your Story
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-light mb-6">
              Your feedback fuels our artistry! Submit a review below. Note that all submitted reviews go through our admin review system before publishing.
            </p>

            {success ? (
              <div className="bg-green-50 text-green-800 p-6 border border-green-100 rounded-xs text-center space-y-3" id="review-success-panel">
                <Sparkles className="w-8 h-8 text-green-600 mx-auto animate-bounce" />
                <h4 className="font-serif font-bold text-sm">Review Submitted!</h4>
                <p className="text-xs font-light">
                  Thank you! Your review has been entered into the moderation queue. Switch to the Admin / Staff view to approve it.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" id="review-submission-form">
                {errorMsg && (
                  <div className="bg-red-50 text-red-700 p-3 text-xs font-medium border border-red-100 rounded-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Charlotte Higgins"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    id="review-author-input"
                    className="w-full px-3 py-2 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal">
                    Rating Stars
                  </label>
                  <div className="flex gap-1.5" id="rating-star-selector">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        id={`star-btn-${val}`}
                        className="text-amber-400 hover:scale-125 hover:rotate-12 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
                      >
                        <Star 
                          className={`w-6 h-6 transition-all duration-200 ${val <= rating ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-gray-200'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal">
                    Review Comment
                  </label>
                  <textarea
                    placeholder="Tell us about your haircut, color, experience, or the team's hospitality..."
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    id="review-comment-textarea"
                    className="w-full px-3 py-2 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200 focus:bg-white transition-colors duration-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  id="review-submit-btn"
                  className="w-full py-3 bg-charcoal hover:bg-sand-200 hover:text-charcoal text-white text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 rounded-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Feedback
                </button>
              </form>
            )}

            {/* Simulated Review Policy Footer */}
            <div className="mt-6 pt-6 border-t border-sand-100 flex items-center gap-2 text-gray-400 text-[10px] font-light">
              <ShieldAlert className="w-3.5 h-3.5 text-sand-200 shrink-0" />
              <span>We fight spam. Our automated system flags fraudulent, duplicate, or profane feedback.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
