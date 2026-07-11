import React, { useState, useEffect, useMemo } from 'react';
import { Service, Booking, User } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShoppingBag, 
  Search,
  Check
} from 'lucide-react';

interface BookingFormProps {
  services: Service[];
  currentUser: User | null;
  onBookingSubmit: (bookingData: {
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes: string;
    price: number;
  }) => void;
  existingBookings: Booking[];
  selectedServices: Service[];
  onToggleService: (service: Service) => void;
  onClearServices: () => void;
}

const getTodayString = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

export default function BookingForm({
  services,
  currentUser,
  onBookingSubmit,
  existingBookings,
  selectedServices,
  onToggleService,
  onClearServices
}: BookingFormProps) {
  // Booking Form State
  const [bookingDate, setBookingDate] = useState(getTodayString());
  const [bookingTime, setBookingTime] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedBooking, setSubmittedBooking] = useState<{
    serviceNames: string;
    date: string;
    time: string;
    price: number;
  } | null>(null);

  // Dropdown search for quick adding more services directly inside the form
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update when user changes
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerEmail(currentUser.email);
      if (currentUser.phone) {
        setCustomerPhone(currentUser.phone);
      }
    }
  }, [currentUser]);

  // Available Time Slots list
  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:30 AM',
    '01:00 PM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM'
  ];

  // Check if a time slot is already booked on the selected date
  const isSlotBooked = (time: string) => {
    if (!bookingDate) return false;
    return existingBookings.some(
      b => b.date === bookingDate && b.time === time && b.status !== 'cancelled'
    );
  };

  // Instant calculated total sum
  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  // Combined services information for database persistence
  const combinedServiceIds = useMemo(() => {
    return selectedServices.map(s => s.id).join(',');
  }, [selectedServices]);

  const combinedServiceNames = useMemo(() => {
    return selectedServices.map(s => s.name).join(' + ');
  }, [selectedServices]);

  // Filtering services for the quick-add dropdown
  const unselectedServicesFiltered = useMemo(() => {
    const unselected = services.filter(s => !selectedServices.some(sel => sel.id === s.id));
    if (!searchQuery.trim()) return unselected.slice(0, 8); // Top default options
    return unselected.filter(
      s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, selectedServices, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedServices.length === 0) {
      setErrorMsg('Please select at least one beauty service to reserve.');
      return;
    }
    if (!bookingDate) {
      setErrorMsg('Please select a date for your session.');
      return;
    }
    if (!bookingTime) {
      setErrorMsg('Please pick a convenient time slot.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Please provide your name.');
      return;
    }
    if (!customerEmail.trim()) {
      setErrorMsg('Please provide your email address.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('A contact phone number is required.');
      return;
    }

    // Check conflict one last time
    if (isSlotBooked(bookingTime)) {
      setErrorMsg('This slot was just booked by another guest. Please select another slot.');
      return;
    }

    setSubmittedBooking({
      serviceNames: combinedServiceNames,
      date: bookingDate,
      time: bookingTime,
      price: totalPrice
    });

    onBookingSubmit({
      serviceId: combinedServiceIds,
      serviceName: combinedServiceNames,
      date: bookingDate,
      time: bookingTime,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      price: totalPrice
    });

    setSuccess(true);
    // Reset transient fields but keep user details. Keep date default as today.
    setBookingDate(getTodayString());
    setBookingTime('');
    setNotes('');
    onClearServices();

    // Clear success screen after 8 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 8000);
  };

  return (
    <div className="bg-white border border-rose-100 p-6 sm:p-10 rounded-sm shadow-sm max-w-4xl mx-auto relative" id="booking-form-container">
      
      {/* Decorative top pink-gold border line */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400" />

      {success ? (
        <div className="text-center py-12 animate-fade-in" id="booking-success-view">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="title-font text-3xl font-light text-charcoal mb-2">
            Appointment Requested!
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8 font-light">
            Thank you, <strong className="text-charcoal font-medium">{customerName}</strong>! Your multi-treatment reservation has been submitted. We will review your request and call to confirm shortly.
          </p>

          <div className="bg-rose-50/50 p-6 border border-rose-100 text-left space-y-3 rounded-xs max-w-lg mx-auto mb-8">
            <div className="flex justify-between items-start text-xs text-gray-600 gap-4">
              <span>Selected treatments:</span>
              <span className="font-semibold text-charcoal text-right">{submittedBooking?.serviceNames || 'Bespoke Package'}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Date & Time slot:</span>
              <span className="font-semibold text-charcoal">{submittedBooking?.date} at {submittedBooking?.time}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 border-t border-rose-100/50 pt-2">
              <span>Total Price:</span>
              <span className="font-serif font-bold text-rose-600 text-sm">₹{submittedBooking?.price}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Status:</span>
              <span className="px-2 py-0.5 text-[9px] bg-amber-100 text-amber-800 font-bold uppercase rounded-xs">Pending Review</span>
            </div>
          </div>

          <button
            onClick={() => setSuccess(false)}
            className="text-xs uppercase tracking-widest font-bold text-rose-500 hover:text-charcoal transition-colors underline cursor-pointer"
          >
            Schedule Another Appointment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8" id="booking-input-form">
          
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold block mb-1">
              RESERVE YOUR EXPERIENCE
            </span>
            <h3 className="title-font text-2xl sm:text-4xl font-light text-charcoal">
              Book An Appointment
            </h3>
            <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto font-light leading-relaxed">
              Verify your selected treatments, choose your convenient date and slot, and complete your reservation below.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-4 text-xs font-medium border border-red-100 rounded-xs" id="booking-error-alert">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 1. Services Selector & Live Calculations */}
          <div className="space-y-4 bg-rose-50/20 p-5 rounded-xs border border-rose-100/40">
            <div className="flex justify-between items-center">
              <label className="block text-xs uppercase tracking-widest font-bold text-charcoal flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-rose-500" />
                1. Selected Services & Total (₹)
              </label>
              {selectedServices.length > 0 && (
                <button
                  type="button"
                  onClick={onClearServices}
                  className="text-[10px] uppercase font-bold text-gray-400 hover:text-rose-500 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* List of currently selected services */}
            {selectedServices.length === 0 ? (
              <div className="border border-dashed border-rose-100 rounded-xs p-6 text-center bg-white">
                <Sparkles className="w-8 h-8 text-rose-300 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-gray-500 font-light">No treatments selected yet.</p>
                <p className="text-[10px] text-rose-400 mt-1 font-light">
                  Select services from the specialties menu above or search and add below!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedServices.map((service) => (
                  <div 
                    key={service.id}
                    className="flex justify-between items-center bg-white p-3 border border-rose-100/50 rounded-xs text-xs shadow-3xs"
                  >
                    <div>
                      <div className="font-semibold text-charcoal">{service.name}</div>
                      <div className="text-[10px] text-gray-400 font-light mt-0.5">
                        {service.category} • {service.duration}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-serif font-medium text-rose-600">
                        ₹{service.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleService(service)}
                        className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                        title="Remove service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Live Search and Add Extra services inline */}
            <div className="relative mt-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Search className="w-3.5 h-3.5 text-rose-300" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search & add more services directly..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-rose-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-rose-300 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {isDropdownOpen && (
                  <button
                    type="button"
                    onClick={() => { setIsDropdownOpen(false); setSearchQuery(''); }}
                    className="px-3 py-2 border border-rose-100 text-gray-400 hover:text-rose-500 rounded-xs text-xs"
                  >
                    Done
                  </button>
                )}
              </div>

              {/* Quick Add Dropdown */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-rose-100 rounded-xs shadow-lg max-h-52 overflow-y-auto z-40 divide-y divide-rose-50">
                  {unselectedServicesFiltered.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400 font-light text-center">
                      No matching unselected treatments found.
                    </div>
                  ) : (
                    unselectedServicesFiltered.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          onToggleService(service);
                          setSearchQuery('');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-rose-50/50 flex justify-between items-center text-xs transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-charcoal">{service.name}</span>
                          <span className="text-[9px] bg-rose-50 text-rose-500 uppercase px-1.5 py-0.5 rounded-full ml-2 font-bold">
                            {service.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-[10px]">{service.duration}</span>
                          <span className="font-serif font-bold text-rose-600">₹{service.price}</span>
                          <span className="p-1 bg-rose-100 text-rose-600 rounded-full">
                            <Plus className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Total price section */}
            {selectedServices.length > 0 && (
              <div className="border-t border-rose-100/50 pt-3 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-charcoal">
                  Bespoke Pack Total:
                </span>
                <span className="font-serif text-2xl font-bold text-rose-600 animate-fade-in">
                  ₹{totalPrice}
                </span>
              </div>
            )}
          </div>

          {/* 2. Date and Time Slot Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-rose-50">
            
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-bold text-charcoal flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-rose-500" />
                2. Select Appointment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={getTodayString()}
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setBookingTime(''); // Reset selected slot when date shifts
                  }}
                  id="booking-date-input"
                  className="w-full px-4 py-3 bg-rose-50/20 border border-rose-100 rounded-xs text-sm text-charcoal focus:outline-none focus:border-rose-300 focus:bg-white hover:border-rose-200 transition-all duration-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-bold text-charcoal flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                3. Choose Time Slot
              </label>
              {!bookingDate ? (
                <div className="h-12 border border-dashed border-rose-100 rounded-xs flex items-center justify-center text-xs text-gray-400 bg-rose-50/10">
                  Please select a date first
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2" id="time-slots-grid">
                  {timeSlots.map((time) => {
                    const booked = isSlotBooked(time);
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={booked}
                        onClick={() => setBookingTime(time)}
                        id={`slot-btn-${time.replace(/[: ]/g, '')}`}
                        className={`py-2 px-1 text-center text-[11px] border rounded-xs transition-all duration-300 cursor-pointer font-medium ${
                          booked 
                            ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through' 
                            : bookingTime === time
                              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white border-transparent hover:scale-105 shadow-3xs'
                              : 'bg-rose-50/20 text-charcoal border-rose-100 hover:border-rose-300 hover:scale-105 hover:bg-white hover:text-rose-500'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* 3. Customer Contact Details */}
          <div className="space-y-4 pt-6 border-t border-rose-50">
            <label className="block text-xs uppercase tracking-widest font-bold text-charcoal">
              4. Guest Contact Details
            </label>

            {!currentUser && (
              <div className="bg-rose-50/40 p-4 border border-rose-100/50 rounded-xs flex items-center justify-between gap-4">
                <span className="text-[11px] text-gray-500 font-light">
                  Have an account? Sign in to track reservation approvals.
                </span>
                <span className="text-xs font-bold text-rose-500 uppercase cursor-pointer hover:underline">
                  Sign In
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <UserIcon className="w-4 h-4 text-rose-300" />
                </span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  id="booking-name-input"
                  className="w-full pl-10 pr-4 py-3 bg-rose-50/20 border border-rose-100 rounded-xs text-sm text-charcoal focus:outline-none focus:border-rose-300 focus:bg-white hover:border-rose-200 transition-all duration-300"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail className="w-4 h-4 text-rose-300" />
                </span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  id="booking-email-input"
                  className="w-full pl-10 pr-4 py-3 bg-rose-50/20 border border-rose-100 rounded-xs text-sm text-charcoal focus:outline-none focus:border-rose-300 focus:bg-white hover:border-rose-200 transition-all duration-300"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Phone className="w-4 h-4 text-rose-300" />
                </span>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  id="booking-phone-input"
                  className="w-full pl-10 pr-4 py-3 bg-rose-50/20 border border-rose-100 rounded-xs text-sm text-charcoal focus:outline-none focus:border-rose-300 focus:bg-white hover:border-rose-200 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* 4. Notes */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest font-bold text-charcoal">
              Stylist Notes / Special Requests
            </label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-gray-400">
                <FileText className="w-4 h-4 text-rose-300" />
              </span>
              <textarea
                placeholder="Let us know about preferences, allergies, custom Mehendi designs or specific team member requests..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                id="booking-notes-input"
                className="w-full pl-10 pr-4 py-3 bg-rose-50/20 border border-rose-100 rounded-xs text-sm text-charcoal focus:outline-none focus:border-rose-300 focus:bg-white hover:border-rose-200 transition-all duration-300 resize-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              id="booking-submit-btn"
              className="w-full py-4 bg-charcoal hover:bg-gradient-to-r hover:from-rose-500 hover:to-amber-500 hover:border-transparent text-white text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md rounded-xs cursor-pointer shadow-3xs"
            >
              Request Booking Session
            </button>
            <span className="block text-[10px] text-center text-gray-400 mt-2 font-light">
              By submitting, you agree to our 24-hour rescheduling and appointment policies.
            </span>
          </div>

        </form>
      )}

    </div>
  );
}

// Simple internal helper to close inline search dropdown
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
