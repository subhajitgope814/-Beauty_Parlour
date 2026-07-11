import React, { useState, useEffect } from 'react';
import { User, Booking, Review, Service, AdminSettings } from './types';
import { storage } from './lib/storage';
import { saveBookingToSupabase, fetchBookingsFromSupabase, updateBookingStatusInSupabase } from './lib/supabase';

// Import our modular components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesList from './components/ServicesList';
import AboutSection from './components/AboutSection';
import BookingForm from './components/BookingForm';
import ReviewSection from './components/ReviewSection';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';

import { Calendar, Clock, Star, Scissors, Phone, MapPin, Sparkles, MessageSquare, Heart, Lock } from 'lucide-react';

export default function App() {
  // Application Data States
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    adminMobileNumber: '',
    salonName: '',
    salonAddress: ''
  });
  const [services, setServices] = useState<Service[]>([]);

  // Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Layout / UI Navigation States
  const [activeSection, setActiveSection] = useState<string>('home'); // 'home' | 'services' | 'reviews' | 'admin' | 'my-bookings'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Guest Lookup Search States
  const [searchEmailOrPhone, setSearchEmailOrPhone] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  
  // Selected service list for multi-select booking
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const loadedUsers = storage.getUsers();
    const loadedBookings = storage.getBookings();
    const loadedReviews = storage.getReviews();
    const loadedSettings = storage.getSettings();
    const loadedServices = storage.getServices();

    setUsers(loadedUsers);
    setBookings(loadedBookings);
    setReviews(loadedReviews);
    setAdminSettings(loadedSettings);
    setServices(loadedServices);

    // Sync with Supabase on load
    const syncBookings = async () => {
      const dbBookings = await fetchBookingsFromSupabase();
      if (dbBookings && dbBookings.length > 0) {
        setBookings(prevBookings => {
          // Combine and deduplicate by id
          const combined = [...dbBookings];
          prevBookings.forEach(pb => {
            if (!combined.some(cb => cb.id === pb.id)) {
              combined.push(pb);
            }
          });
          // Sort by createdAt descending
          combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          storage.saveBookings(combined);
          return combined;
        });
      }
    };
    syncBookings();

    // Auto-login simulated customer on start to make demo easy, or keep clean
    // For testing/evaluation purposes, keeping it clear but can load active session if present
    const savedSession = localStorage.getItem('meraki_session_user');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.role === 'admin') {
          parsed.email = 'trisha123@gmail.com';
          parsed.passwordHash = 'Trisha@123';
          parsed.name = 'Trisha Day';
          parsed.phone = '8132935520';
          localStorage.setItem('meraki_session_user', JSON.stringify(parsed));
        }
        setCurrentUser(parsed);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Update localStorage helper wrappers
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: newStatus };
      }
      return b;
    });
    setBookings(updated);
    storage.saveBookings(updated);

    // Also update on Supabase backend
    await updateBookingStatusInSupabase(bookingId, newStatus);
  };

  const handleApproveReview = (reviewId: string) => {
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, approved: true };
      }
      return r;
    });
    setReviews(updated);
    storage.saveReviews(updated);
  };

  const handleDeleteReview = (reviewId: string) => {
    const updated = reviews.filter(r => r.id !== reviewId);
    setReviews(updated);
    storage.saveReviews(updated);
  };

  const handleUpdateSettings = (newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // Customer Interactions
  const handleBookingSubmit = async (data: {
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes: string;
    price: number;
  }) => {
    const newBooking: Booking = {
      id: 'b-' + Date.now(),
      customerId: currentUser?.id || 'guest-' + Date.now(),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      date: data.date,
      time: data.time,
      status: 'pending',
      notes: data.notes,
      price: data.price,
      createdAt: new Date().toISOString()
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    storage.saveBookings(updated);

    // Persist to Supabase backend asynchronously
    const { success, error } = await saveBookingToSupabase(newBooking);
    if (!success) {
      console.warn("Notice: Booking was saved locally, but saving to Supabase 'bookings' table failed. Make sure you have created the 'bookings' table in your Supabase SQL editor with the correct schema.", error);
    }
  };

  const handleAddReview = (data: { customerName: string; rating: number; comment: string }) => {
    const newReview: Review = {
      id: 'r-' + Date.now(),
      customerName: data.customerName,
      rating: data.rating,
      comment: data.comment,
      date: new Date().toISOString().split('T')[0],
      approved: false // Moderation required
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    storage.saveReviews(updated);
  };

  // Auth Operations
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('meraki_session_user', JSON.stringify(user));
    
    // Redirect appropriately
    if (user.role === 'admin' || user.role === 'staff') {
      setActiveSection('admin');
    } else {
      setActiveSection('my-bookings');
    }
  };

  const handleRegisterSuccess = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers);

    setCurrentUser(newUser);
    localStorage.setItem('meraki_session_user', JSON.stringify(newUser));
    setActiveSection('my-bookings');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('meraki_session_user');
    setActiveSection('home');
  };

  const handleToggleService = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleClearServices = () => {
    setSelectedServices([]);
  };

  const handleSelectServiceForBooking = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev;
      } else {
        return [...prev, service];
      }
    });
    
    // Scroll down to the booking form automatically
    const element = document.getElementById('booking-form-wrapper');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Open auth modal with specific mode
  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  // Filter current customer's bookings or guest-searched bookings
  const myBookings = bookings.filter(b => {
    if (currentUser) {
      return b.customerEmail.toLowerCase() === currentUser.email.toLowerCase() || 
             (currentUser.phone && b.customerPhone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, ''));
    } else {
      if (!searchSubmitted || !searchEmailOrPhone.trim()) return false;
      const term = searchEmailOrPhone.trim().toLowerCase();
      const cleanTerm = term.replace(/[^0-9]/g, '');
      const emailMatch = b.customerEmail.toLowerCase() === term;
      const cleanDbPhone = b.customerPhone.replace(/[^0-9]/g, '');
      const phoneMatch = cleanTerm && (cleanDbPhone === cleanTerm || cleanDbPhone.includes(cleanTerm) || cleanTerm.includes(cleanDbPhone));
      return emailMatch || phoneMatch;
    }
  });

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-sand-200 selection:text-charcoal bg-sand-50">
      
      {/* Navigation bar */}
      <Navbar 
        currentUser={currentUser}
        adminSettings={adminSettings}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Render */}
      <main className="flex-1">

        {activeSection === 'home' && (
          <div className="animate-fade-in">
            
            {/* Elegant Hero Slider Header */}
            <Hero 
              adminMobileNumber={adminSettings.adminMobileNumber}
              salonName={adminSettings.salonName}
              onBookClick={() => {
                const element = document.getElementById('booking-form-wrapper');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreClick={() => {
                const element = document.getElementById('services-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Services Showcase Category Listing */}
            <ServicesList 
              services={services}
              selectedServices={selectedServices}
              onToggleService={handleToggleService}
              onSelectServiceForBooking={handleSelectServiceForBooking}
            />

            {/* Certified Beauty Excellence Credentials Section */}
            <AboutSection />

            {/* Review Testimonials public approved section */}
            <ReviewSection 
              reviews={reviews}
              onAddReview={handleAddReview}
              currentUser={currentUser}
            />

            {/* Seamless Appointment Booking Section wrapper */}
            <div className="py-24 px-4 sm:px-6 lg:px-8 bg-sand-100/10 border-t border-sand-100" id="booking-form-wrapper">
              <div className="max-w-4xl mx-auto">
                <BookingForm 
                  services={services}
                  currentUser={currentUser}
                  onBookingSubmit={handleBookingSubmit}
                  existingBookings={bookings}
                  selectedServices={selectedServices}
                  onToggleService={handleToggleService}
                  onClearServices={handleClearServices}
                />
              </div>
            </div>

          </div>
        )}

        {/* SERVICES SECTION - Independent Tab View */}
        {activeSection === 'services' && (
          <div className="py-12 animate-fade-in">
            <ServicesList 
              services={services}
              selectedServices={selectedServices}
              onToggleService={handleToggleService}
              onSelectServiceForBooking={handleSelectServiceForBooking}
            />
            {/* Booking form following directly */}
            <div className="py-16 bg-sand-100/10 border-t border-sand-100" id="booking-form-wrapper">
              <div className="max-w-4xl mx-auto px-4">
                <BookingForm 
                  services={services}
                  currentUser={currentUser}
                  onBookingSubmit={handleBookingSubmit}
                  existingBookings={bookings}
                  selectedServices={selectedServices}
                  onToggleService={handleToggleService}
                  onClearServices={handleClearServices}
                />
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS SECTION - Independent Tab View */}
        {activeSection === 'reviews' && (
          <div className="py-12 animate-fade-in">
            <ReviewSection 
              reviews={reviews}
              onAddReview={handleAddReview}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* CUSTOMER MY-BOOKINGS HISTORY SECTION */}
        {activeSection === 'my-bookings' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in" id="customer-bookings-view">
            <div className="border-b border-sand-100 pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-sand-200">GUEST PORTAL</span>
                <h2 className="title-font text-4xl font-light text-charcoal">My Scheduled Treatments</h2>
                <p className="text-xs text-gray-500 font-light mt-1">
                  View, track, and manage your beauty appointments requested at {adminSettings.salonName}.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveSection('home');
                  setTimeout(() => {
                    const el = document.getElementById('booking-form-wrapper');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-5 py-2.5 bg-charcoal text-white hover:bg-sand-200 hover:text-charcoal text-xs uppercase tracking-widest font-bold rounded-xs transition-colors cursor-pointer"
              >
                Schedule New Session
              </button>
            </div>

            {!currentUser && (
              <div className="bg-white border border-rose-100 p-6 sm:p-8 rounded-xs shadow-3xs max-w-2xl mx-auto mb-10 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-300 via-amber-300 to-rose-300 opacity-60" />
                <span className="p-2 bg-rose-50 rounded-full text-rose-500 inline-flex mb-4">
                  <Lock className="w-5 h-5" />
                </span>
                <h3 className="title-font text-xl font-medium text-charcoal mb-2">Retrieve Guest Bookings</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-6 font-light leading-relaxed">
                  Did you book as a guest or want to search your existing scheduled treatments? Enter your contact Email address or Phone number below:
                </p>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSearchSubmitted(true);
                  }}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <input
                    type="text"
                    required
                    placeholder="e.g. email@example.com or phone..."
                    value={searchEmailOrPhone}
                    onChange={(e) => {
                      setSearchEmailOrPhone(e.target.value);
                      setSearchSubmitted(false);
                    }}
                    className="flex-1 px-4 py-3 border border-rose-100 focus:outline-none focus:border-rose-400 text-xs tracking-wider uppercase font-medium placeholder:text-gray-300 bg-rose-50/10"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-charcoal hover:bg-rose-500 text-white text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer"
                  >
                    Search Bookings
                  </button>
                </form>
                
                <div className="mt-6 pt-4 border-t border-rose-50/50 flex justify-center gap-2 items-center">
                  <span className="text-[10px] text-gray-400">Have an account?</span>
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-bold uppercase tracking-wider underline cursor-pointer"
                  >
                    Sign In here
                  </button>
                </div>
              </div>
            )}

            {currentUser ? (
              myBookings.length === 0 ? (
                <div className="bg-white border border-dashed border-sand-100 rounded-xs py-20 text-center max-w-2xl mx-auto">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="title-font text-xl font-medium text-charcoal mb-2">No Appointments Yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mb-8 font-light">
                    You haven't scheduled any styling sessions yet. Book a premium treatment with our world-class stylists today!
                  </p>
                  <button
                    onClick={() => setActiveSection('home')}
                    className="px-6 py-3 bg-charcoal text-white hover:bg-sand-200 hover:text-charcoal text-xs uppercase tracking-widest font-bold rounded-xs transition-colors"
                  >
                    Book Treatment Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="customer-bookings-list">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="bg-white border border-sand-100 p-6 shadow-2xs hover:shadow-xs transition-shadow relative rounded-xs">
                      
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-xs inline-block mb-2 ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {booking.status === 'pending' ? 'Awaiting Admin Review' : booking.status}
                          </span>
                          
                          <h4 className="font-serif text-lg text-charcoal font-medium">
                            {booking.serviceName}
                          </h4>
                        </div>
                        
                        <span className="font-mono text-sm font-bold text-charcoal">
                          ₹{booking.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600 font-light border-t border-b border-sand-50 py-3 my-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-sand-200" />
                          <span>Date: <strong className="text-charcoal font-medium">{booking.date}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-sand-200" />
                          <span>Time slot: <strong className="text-charcoal font-medium">{booking.time}</strong></span>
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="text-xs text-gray-400 italic mb-4">
                          Notes: "{booking.notes}"
                        </p>
                      )}

                      {booking.status === 'pending' && (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            Our team will call/confirm shortly
                          </span>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            className="text-xs text-red-500 hover:text-red-700 underline font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}

                      {booking.status === 'confirmed' && (
                        <div className="text-[10px] text-green-700 font-bold uppercase tracking-wider bg-green-50/50 p-2 border border-green-100 rounded-xs flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-green-600 animate-pulse" />
                          Your slot is locked in. We look forward to pampering you!
                        </div>
                      )}

                      {booking.status === 'cancelled' && (
                        <div className="text-[10px] text-red-700 font-bold uppercase tracking-wider bg-red-50/50 p-2 border border-red-100 rounded-xs">
                          This request has been cancelled or rescheduled.
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )
            ) : (
              searchSubmitted && (
                myBookings.length === 0 ? (
                  <div className="bg-white border border-dashed border-sand-100 rounded-xs py-16 text-center max-w-2xl mx-auto">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="title-font text-xl font-medium text-charcoal mb-2">No Appointments Found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4 font-light">
                      We couldn't find any scheduled treatments matching <strong className="text-charcoal font-semibold">"{searchEmailOrPhone}"</strong>.
                    </p>
                    <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
                      Please double-check the email address or phone number you entered during booking, or place a new booking!
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-rose-500 uppercase mb-6 text-center">
                      Found {myBookings.length} Appointment{myBookings.length > 1 ? 's' : ''} for "{searchEmailOrPhone}"
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="customer-bookings-list">
                      {myBookings.map((booking) => (
                        <div key={booking.id} className="bg-white border border-sand-100 p-6 shadow-2xs hover:shadow-xs transition-shadow relative rounded-xs">
                          
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                              <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-xs inline-block mb-2 ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800 animate-pulse'
                              }`}>
                                {booking.status === 'pending' ? 'Awaiting Admin Review' : booking.status}
                              </span>
                              
                              <h4 className="font-serif text-lg text-charcoal font-medium">
                                {booking.serviceName}
                              </h4>
                            </div>
                            
                            <span className="font-mono text-sm font-bold text-charcoal">
                              ₹{booking.price.toFixed(2)}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs text-gray-600 font-light border-t border-b border-sand-50 py-3 my-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-sand-200" />
                              <span>Date: <strong className="text-charcoal font-medium">{booking.date}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-sand-200" />
                              <span>Time slot: <strong className="text-charcoal font-medium">{booking.time}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[10px] text-gray-400">Guest: <strong className="text-charcoal font-normal">{booking.customerName} ({booking.customerPhone})</strong></span>
                            </div>
                          </div>

                          {booking.notes && (
                            <p className="text-xs text-gray-400 italic mb-4">
                              Notes: "{booking.notes}"
                            </p>
                          )}

                          {booking.status === 'pending' && (
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                Our team will call/confirm shortly
                              </span>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                className="text-xs text-red-500 hover:text-red-700 underline font-semibold uppercase tracking-wider cursor-pointer"
                              >
                                Cancel Request
                              </button>
                            </div>
                          )}

                          {booking.status === 'confirmed' && (
                            <div className="text-[10px] text-green-700 font-bold uppercase tracking-wider bg-green-50/50 p-2 border border-green-100 rounded-xs flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-green-600 animate-pulse" />
                              Your slot is locked in. We look forward to pampering you!
                            </div>
                          )}

                          {booking.status === 'cancelled' && (
                            <div className="text-[10px] text-red-700 font-bold uppercase tracking-wider bg-red-50/50 p-2 border border-red-100 rounded-xs">
                              This request has been cancelled or rescheduled.
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        )}

        {/* SECURE ADMIN PANEL VIEW */}
        {activeSection === 'admin' && (
          <div className="animate-fade-in">
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') ? (
              <AdminPanel 
                bookings={bookings}
                reviews={reviews}
                adminSettings={adminSettings}
                currentUser={currentUser}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onApproveReview={handleApproveReview}
                onDeleteReview={handleDeleteReview}
                onUpdateSettings={handleUpdateSettings}
              />
            ) : (
              <div className="max-w-md mx-auto text-center py-24 px-4" id="admin-unauthorized-view">
                <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="title-font text-2xl font-light text-charcoal mb-2">Restricted Access</h3>
                <p className="text-xs text-gray-500 font-light mb-8 max-w-sm mx-auto">
                  Only authorized beauty salon staff or administrators may coordinate bookings and review logs.
                </p>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-6 py-3 bg-charcoal text-white hover:bg-sand-200 hover:text-charcoal text-xs uppercase tracking-widest font-bold transition-all rounded-xs cursor-pointer"
                >
                  Sign In as Staff
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Elegant Editorial Footer */}
      <footer className="bg-charcoal text-sand-50 border-t border-sand-200/10 pt-16 pb-8" id="editorial-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-sand-200/10">
          
          {/* Col 1: Salon Name/Contact */}
          <div className="space-y-4">
            <span className="title-font text-2xl tracking-widest uppercase text-white font-medium block">
              {adminSettings.salonName}
            </span>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Bespoke hair design, luxury balayage coloring, keratin hair treatments, and bridal makeup. Experience real customer-first luxury.
            </p>
            <div className="flex gap-4 pt-2">
              <a href={`tel:${adminSettings.adminMobileNumber}`} className="text-sand-200 hover:text-white transition-colors text-xs flex items-center gap-1.5 font-bold tracking-wider">
                <Phone className="w-4 h-4" />
                {adminSettings.adminMobileNumber}
              </a>
            </div>
          </div>

          {/* Col 2: Services shortcuts */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-sand-200 mb-4">
              Salon Services
            </h4>
            <ul className="space-y-2 text-xs text-gray-400 font-light">
              <li><button onClick={() => { setActiveSection('home'); setTimeout(() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' }), 150); }} className="hover:text-white transition-colors cursor-pointer">Woman's Cut & Style</button></li>
              <li><button onClick={() => { setActiveSection('home'); setTimeout(() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' }), 150); }} className="hover:text-white transition-colors cursor-pointer">Premium Global Balayage</button></li>
              <li><button onClick={() => { setActiveSection('home'); setTimeout(() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' }), 150); }} className="hover:text-white transition-colors cursor-pointer">Scalp Detox & Therapy</button></li>
              <li><button onClick={() => { setActiveSection('home'); setTimeout(() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' }), 150); }} className="hover:text-white transition-colors cursor-pointer">Bridal Luxury HD Makeup</button></li>
            </ul>
          </div>

          {/* Col 3: Hours */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-sand-200 mb-4">
              Opening Hours
            </h4>
            <ul className="space-y-2 text-xs text-gray-400 font-light">
              <li className="flex justify-between"><span>Mon — Fri</span> <span>09:00 AM — 07:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday</span> <span>09:00 AM — 05:00 PM</span></li>
              <li className="flex justify-between text-red-400 font-semibold"><span>Sunday</span> <span>Closed</span></li>
            </ul>
          </div>

          {/* Col 4: Location */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-sand-200 mb-4">
              Salon Sanctuary
            </h4>
            <p className="text-xs text-gray-400 font-light leading-relaxed mb-4 flex gap-2 items-start">
              <MapPin className="w-4 h-4 text-sand-200 shrink-0" />
              <span>{adminSettings.salonAddress}</span>
            </p>
            <button
              onClick={() => {
                setActiveSection('home');
                setTimeout(() => document.getElementById('booking-form-wrapper')?.scrollIntoView({ behavior: 'smooth' }), 150);
              }}
              className="w-full py-2.5 bg-sand-200 text-charcoal text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all cursor-pointer"
            >
              Secure Appointment Slot
            </button>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 font-mono gap-4">
          <p>© 2026 {adminSettings.salonName}. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Designed in beautiful style</span>
            <span>•</span>
            <button 
              onClick={() => handleOpenAuth('login')}
              className="hover:text-white transition-colors cursor-pointer uppercase font-bold text-[9px]"
            >
              🔒 Staff Area
            </button>
          </div>
        </div>
      </footer>

      {/* Shared Auth modal for Login, logout, register, forget password */}
      <AuthModal 
        isOpen={isAuthOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        allUsers={users}
      />

    </div>
  );
}
