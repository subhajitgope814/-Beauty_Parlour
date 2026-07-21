import React, { useState } from 'react';
import { Booking, Review, AdminSettings, User } from '../types';
import { Calendar, Clock, DollarSign, Users, Check, X, ShieldAlert, Phone, Trash2, CheckCircle, FileText, Star, Settings, MessageSquare } from 'lucide-react';

interface AdminPanelProps {
  bookings: Booking[];
  reviews: Review[];
  adminSettings: AdminSettings;
  currentUser: User | null;
  onUpdateBookingStatus: (bookingId: string, newStatus: 'confirmed' | 'cancelled') => void;
  onApproveReview: (reviewId: string) => void;
  onToggleReviewApproval: (reviewId: string, approved: boolean) => void;
  onDeleteReview: (reviewId: string) => void;
  onUpdateSettings: (newSettings: AdminSettings) => void;
}

export default function AdminPanel({
  bookings,
  reviews,
  adminSettings,
  currentUser,
  onUpdateBookingStatus,
  onApproveReview,
  onToggleReviewApproval,
  onDeleteReview,
  onUpdateSettings
}: AdminPanelProps) {
  // Local state for settings editing
  const [mobileNumber, setMobileNumber] = useState(adminSettings.adminMobileNumber);
  const [salonName, setSalonName] = useState(adminSettings.salonName);
  const [salonAddress, setSalonAddress] = useState(adminSettings.salonAddress);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Filter state for Bookings
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  // Filter state for Reviews
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Stats calculation
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const projectedRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price, 0);

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  // Filtered reviews
  const filteredReviews = reviews.filter(r => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === 'pending') return !r.approved;
    return r.approved;
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim()) return;

    onUpdateSettings({
      adminMobileNumber: mobileNumber.trim(),
      salonName: salonName.trim(),
      salonAddress: salonAddress.trim()
    });

    setSettingsSuccess(true);
    setTimeout(() => {
      setSettingsSuccess(false);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="admin-dashboard-view">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-sand-100 pb-8 mb-12 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-sand-200 block mb-1">
            CONTROL CENTER
          </span>
          <h2 className="title-font text-4xl font-light text-charcoal">
            Staff & Admin Dashboard
          </h2>
          <p className="text-xs text-gray-500 font-light mt-1">
            Logged in as <strong className="text-charcoal font-semibold">{currentUser?.name}</strong> ({currentUser?.role})
          </p>
        </div>

        {/* Rapid Overview Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 border border-sand-100 text-center rounded-xs min-w-[120px] transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer group">
            <span className="block text-2xl font-serif text-charcoal transition-colors duration-300 group-hover:text-sand-200">{totalBookings}</span>
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Total Requests</span>
          </div>
          <div className="bg-amber-50 p-4 border border-amber-100 text-center rounded-xs min-w-[120px] transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer group">
            <span className="block text-2xl font-serif text-amber-800 font-semibold transition-colors duration-300 group-hover:text-amber-600">{pendingBookings}</span>
            <span className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">Pending Review</span>
          </div>
          <div className="bg-green-50 p-4 border border-green-100 text-center rounded-xs min-w-[120px] transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer group">
            <span className="block text-2xl font-serif text-green-800 font-semibold transition-colors duration-300 group-hover:text-green-600">{confirmedBookings}</span>
            <span className="text-[9px] text-green-500 uppercase tracking-widest font-bold">Confirmed</span>
          </div>
          <div className="bg-charcoal text-sand-50 p-4 border border-charcoal text-center rounded-xs min-w-[120px] transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer group">
            <span className="block text-xl font-mono text-sand-200 font-semibold transition-colors duration-300 group-hover:text-white">₹{projectedRevenue}</span>
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Est. Revenue</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        
        {/* Left Side: BOOKING MANAGEMENT (Full Width) */}
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sand-100 pb-3 gap-3">
            <h3 className="title-font text-2xl font-light text-charcoal">
              Bookings & Appointment Approvals
            </h3>
            
            {/* Filter Toggle Pill tabs */}
            <div className="flex bg-sand-100 p-1 gap-1 rounded-xs" id="admin-booking-filters">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  id={`filter-btn-${filter}`}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-xs transition-all duration-300 cursor-pointer ${
                    statusFilter === filter 
                      ? 'bg-white text-charcoal shadow-2xs hover:scale-105' 
                      : 'text-gray-500 hover:text-charcoal hover:bg-white/40'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Queue */}
          <div className="space-y-4" id="admin-bookings-queue">
            {filteredBookings.length === 0 ? (
              <div className="bg-white border border-dashed border-sand-100 rounded-xs py-16 text-center">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 italic">No bookings match the selection criteria.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  id={`admin-booking-card-${booking.id}`}
                  className={`bg-white border p-6 shadow-2xs hover:shadow-xs hover:border-sand-200 transition-all duration-300 relative rounded-xs group ${
                    booking.status === 'confirmed' ? 'border-l-4 border-l-green-500 border-sand-100' :
                    booking.status === 'cancelled' ? 'border-l-4 border-l-red-400 border-sand-100' :
                    'border-l-4 border-l-amber-400 border-sand-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-charcoal font-medium text-lg">
                          {booking.customerName}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-xs tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-light mt-1">
                        <span className="flex items-center gap-1 font-semibold text-charcoal">
                          💅 {booking.serviceName}
                        </span>
                        <span>•</span>
                        <span>✉️ {booking.customerEmail}</span>
                        <span>•</span>
                        <span>📞 {booking.customerPhone}</span>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="font-mono text-charcoal font-bold text-base block">
                        ₹{booking.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Requested: {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Slot Detail */}
                  <div className="bg-sand-50 p-3 border border-sand-100 flex flex-wrap justify-between items-center text-xs text-gray-600 gap-2 mb-4 rounded-xs">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sand-200" />
                        Date: <strong className="text-charcoal">{booking.date}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sand-200" />
                        Time Slot: <strong className="text-charcoal">{booking.time}</strong>
                      </span>
                    </div>
                    {booking.notes && (
                      <span className="italic text-gray-400 font-light text-[11px] line-clamp-1 max-w-xs" title={booking.notes}>
                        Notes: "{booking.notes}"
                      </span>
                    )}
                  </div>

                  {/* Booking Confirmation / Cancel control actions */}
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 justify-end pt-2 border-t border-sand-100/50">
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                        id={`cancel-btn-${booking.id}`}
                        className="px-4 py-2 border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-400 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-all duration-300 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
                      >
                        <X className="w-3 h-3" />
                        Reject Request
                      </button>
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'confirmed')}
                        id={`confirm-btn-${booking.id}`}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase tracking-wider font-bold rounded-xs transition-all duration-300 cursor-pointer flex items-center gap-1 shadow-xs hover:scale-105 hover:shadow-md active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm Booking
                      </button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-green-800 bg-green-50 px-3 py-1.5 border border-green-100 rounded-xs">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" /> Appointment Confirmed and Calendar Slot Secured
                      </span>
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                        className="text-red-500 hover:text-red-700 underline text-[9px] cursor-pointer"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}

                  {booking.status === 'cancelled' && (
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-50 px-3 py-1.5 border border-red-100 rounded-xs">
                      <span>❌ Appointment Cancelled</span>
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'confirmed')}
                        className="text-green-600 hover:text-green-800 underline text-[9px] cursor-pointer"
                      >
                        Re-confirm Appointment
                      </button>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

        {/* Guest Reviews Moderation Section */}
        <div className="space-y-8 border-t border-sand-100 pt-12" id="admin-reviews-management">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sand-100 pb-3 gap-3">
            <div>
              <h3 className="title-font text-2xl font-light text-charcoal flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-sand-200" />
                Guest Reviews Moderation
              </h3>
              <p className="text-xs text-gray-500 font-light mt-1">
                Approve, hide, or delete reviews from the public homepage.
              </p>
            </div>
            
            {/* Filter Toggle Pill tabs */}
            <div className="flex bg-sand-100 p-1 gap-1 rounded-xs" id="admin-review-filters">
              {(['all', 'pending', 'approved'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReviewFilter(filter)}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-xs transition-all duration-300 cursor-pointer ${
                    reviewFilter === filter 
                      ? 'bg-white text-charcoal shadow-2xs hover:scale-105' 
                      : 'text-gray-500 hover:text-charcoal hover:bg-white/40'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="admin-reviews-list">
            {filteredReviews.length === 0 ? (
              <div className="md:col-span-2 bg-white border border-dashed border-sand-100 rounded-xs py-16 text-center">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-gray-500 italic">No reviews match the selected filter.</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div 
                  key={review.id} 
                  className={`bg-white border p-6 shadow-2xs hover:shadow-xs transition-all duration-300 relative rounded-xs flex flex-col justify-between ${
                    review.approved 
                      ? 'border-l-4 border-l-green-500 border-sand-100' 
                      : 'border-l-4 border-l-amber-500 border-sand-100'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <span className="font-serif text-charcoal font-medium text-base block">
                          {review.customerName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {review.date}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-xs tracking-wider ${
                          review.approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {review.approved ? 'Approved' : 'Pending Moderation'}
                        </span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-3 h-3 ${idx < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 font-light italic bg-sand-50/50 p-3 border border-sand-50/60 rounded-xs mb-4 leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end pt-3 border-t border-sand-100/50 mt-2">
                    <button
                      onClick={() => onDeleteReview(review.id)}
                      className="px-3 py-1.5 border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-400 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-all duration-300 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 mr-auto"
                      title="Permanently delete this review"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>

                    {review.approved ? (
                      <button
                        onClick={() => onToggleReviewApproval(review.id, false)}
                        className="px-3 py-1.5 border border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 text-[10px] uppercase tracking-wider font-bold rounded-xs transition-all duration-300 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
                        title="Hide this review from the homepage"
                      >
                        <X className="w-3 h-3" />
                        Hide Review
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleReviewApproval(review.id, true)}
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase tracking-wider font-bold rounded-xs transition-all duration-300 cursor-pointer flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95"
                        title="Approve and publish this review on the homepage"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Review
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
