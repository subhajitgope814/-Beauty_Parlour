import React, { useState, useEffect } from 'react';
import { User, Booking, Review, Service, AdminSettings } from './types';
import { storage } from './lib/storage';
import { supabase, saveBookingToSupabase, fetchBookingsFromSupabase, updateBookingStatusInSupabase, updateBookingInSupabase, deleteBookingFromSupabase, subscribeToSupabaseErrors, saveReviewToSupabase, fetchReviewsFromSupabase, updateReviewApprovalInSupabase, deleteReviewFromSupabase, fetchServicesFromSupabase, saveServiceToSupabase, updateServiceInSupabase, deleteServiceFromSupabase, lastSupabaseError } from './lib/supabase';

// Import our modular components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesList from './components/ServicesList';
import AboutSection from './components/AboutSection';
import BookingForm from './components/BookingForm';
import ReviewSection from './components/ReviewSection';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import InstagramSection from './components/InstagramSection';

import { Calendar, Clock, Star, Scissors, Phone, MapPin, Sparkles, MessageSquare, Heart, Lock, Database, AlertTriangle, X, Copy, Check } from 'lucide-react';

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
  const [isServicesLoading, setIsServicesLoading] = useState(true);

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

  // Supabase Database Connection & Schema Error states
  const [supabaseError, setSupabaseError] = useState<any>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);

  // Initialize real Supabase Auth session on mount & register listeners
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

    // 1. Check current Supabase Auth session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const email = session.user.email || '';
          const role = email === 'trisha123@gmail.com' ? 'admin' : 'customer';
          const userObj: User = {
            id: session.user.id,
            email: email,
            passwordHash: '',
            name: session.user.user_metadata?.name || email.split('@')[0] || 'Customer',
            role: role,
            phone: session.user.user_metadata?.phone || undefined
          };
          setCurrentUser(userObj);
          localStorage.setItem('meraki_session_user', JSON.stringify(userObj));
        } else {
          // Check local storage if auth session doesn't exist yet (for transition ease)
          const savedSession = localStorage.getItem('meraki_session_user');
          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession);
              setCurrentUser(parsed);
            } catch (e) {}
          }
        }
      } catch (e) {
        console.warn('Session retrieval failed:', e);
      }
    };
    checkSession();

    // 2. Listen to real Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const role = email === 'trisha123@gmail.com' ? 'admin' : 'customer';
        const userObj: User = {
          id: session.user.id,
          email: email,
          passwordHash: '',
          name: session.user.user_metadata?.name || email.split('@')[0] || 'Customer',
          role: role,
          phone: session.user.user_metadata?.phone || undefined
        };
        setCurrentUser(userObj);
        localStorage.setItem('meraki_session_user', JSON.stringify(userObj));
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('meraki_session_user');
      }
    });

    // 3. Load reviews and services from Supabase (shared public data)
    const syncReviews = async () => {
      const dbReviews = await fetchReviewsFromSupabase();
      if (dbReviews && dbReviews.length > 0) {
        setReviews(dbReviews);
        storage.saveReviews(dbReviews);
      }
    };
    syncReviews();

    const syncServices = async () => {
      setIsServicesLoading(true);
      const dbServices = await fetchServicesFromSupabase();
      if (dbServices && dbServices.length > 0) {
        setServices(dbServices);
        storage.saveServices(dbServices);
      } else {
        const localServices = storage.getServices();
        if (localServices && localServices.length > 0) {
          setServices(localServices);
          if (dbServices && dbServices.length === 0 && !lastSupabaseError) {
            console.log('Seeding initial default services to Supabase...');
            for (const s of localServices) {
              await saveServiceToSupabase(s);
            }
            const refreshed = await fetchServicesFromSupabase();
            if (refreshed && refreshed.length > 0) {
              setServices(refreshed);
              storage.saveServices(refreshed);
            }
          }
        }
      }
      setIsServicesLoading(false);
    };
    syncServices();

    // Subscribe to Supabase connection and query errors
    const unsubscribeErrors = subscribeToSupabaseErrors((err) => {
      setSupabaseError(err);
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeErrors();
    };
  }, []);

  // Synchronize browser routing with state
  useEffect(() => {
    // Initial route mapping on mount & route parser
    const handleInitialPath = () => {
      const path = window.location.pathname;
      if (path === '/services') {
        setActiveSection('services');
        setIsAuthOpen(false);
      } else if (path === '/reviews') {
        setActiveSection('reviews');
        setIsAuthOpen(false);
      } else if (path === '/my-bookings') {
        setActiveSection('my-bookings');
        setIsAuthOpen(false);
      } else if (path === '/admin') {
        setActiveSection('admin');
        setIsAuthOpen(false);
      } else if (path === '/login') {
        setActiveSection('home');
        setAuthInitialMode('login');
        setIsAuthOpen(true);
      } else if (path === '/register') {
        setActiveSection('home');
        setAuthInitialMode('register');
        setIsAuthOpen(true);
      } else if (path === '/booking') {
        setActiveSection('home');
        setIsAuthOpen(false);
        // Scroll to booking form
        setTimeout(() => {
          const element = document.getElementById('booking-form-wrapper');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      } else {
        setActiveSection('home');
        setIsAuthOpen(false);
      }
    };

    handleInitialPath();

    // Listen to popstate (back/forward buttons)
    const handlePopState = () => {
      handleInitialPath();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update path in browser address bar and SEO tags when state changes
  useEffect(() => {
    let targetPath = '/';
    if (activeSection === 'services') {
      targetPath = '/services';
    } else if (activeSection === 'reviews') {
      targetPath = '/reviews';
    } else if (activeSection === 'my-bookings') {
      targetPath = '/my-bookings';
    } else if (activeSection === 'admin') {
      targetPath = '/admin';
    } else if (isAuthOpen) {
      if (authInitialMode === 'login') {
        targetPath = '/login';
      } else if (authInitialMode === 'register') {
        targetPath = '/register';
      }
    }

    // Only push if the actual path in browser differs from targetPath
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    // Dynamic SEO Metadata updates
    const title = activeSection === 'services' ? "Our Expertise & Services | Trisha Beauty Parlour"
      : activeSection === 'reviews' ? "Guest Testimonials & Reviews | Trisha Beauty Parlour"
      : activeSection === 'my-bookings' ? "My Appointments | Trisha Beauty Parlour"
      : activeSection === 'admin' ? "Staff Dashboard | Trisha Beauty Parlour Portal"
      : targetPath === '/booking' ? "Book an Appointment | Trisha Beauty Parlour"
      : targetPath === '/login' ? "Login | Trisha Beauty Parlour Profile Portal"
      : targetPath === '/register' ? "Create an Account | Trisha Beauty Parlour"
      : "Trisha Beauty Parlour | Luxury Hair, Skin & Nails Salon";

    const description = activeSection === 'services' ? "Explore our premium selection of beauty services. Keratin smoothening, customized eyelash mappings, soothing aromatherapy massage, professional manicures and more."
      : activeSection === 'reviews' ? "Read authentic reviews from our lovely guests who experienced pure pampering at our luxury beauty sanctuary."
      : activeSection === 'my-bookings' ? "View, manage, and track your personalized beauty appointments and booking history."
      : activeSection === 'admin' ? "Internal administrator panel and appointment scheduling operations manager for Trisha Beauty Parlour."
      : "Trisha Beauty Parlour is a premium luxury salon offering specialized services including hair spas, facials, bridal makeup, nail art, and body therapies.";

    // Update document title
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update canonical link
    const canonicalUrl = `https://trishabeautyparlour.com${targetPath === '/' ? '' : targetPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Update Open Graph tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:type': 'website',
      'og:image': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200&h=630',
    };
    Object.entries(ogTags).forEach(([property, value]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    });

    // Update Twitter Cards
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200&h=630',
    };
    Object.entries(twitterTags).forEach(([name, value]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    });

  }, [activeSection, isAuthOpen, authInitialMode]);

  // Securely fetch bookings from Supabase whenever active user changes & set up realtime updates
  useEffect(() => {
    let channel: any = null;

    const syncBookings = async () => {
      const userId = currentUser?.id;
      const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'staff';
      
      const dbBookings = await fetchBookingsFromSupabase(userId, isAdmin);
      if (dbBookings) {
        setBookings(dbBookings);
        storage.saveBookings(dbBookings);
      }
    };

    syncBookings();

    // Subscribe to real-time changes on the bookings table
    channel = supabase
      .channel('bookings-realtime-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        async (payload) => {
          console.log('Real-time database payload received:', payload);
          await syncBookings();
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser]);

  // Subscribe to Supabase connection and query errors
  useEffect(() => {
    const unsubscribe = subscribeToSupabaseErrors((err) => {
      setSupabaseError(err);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Update localStorage helper wrappers
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
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

  const handleUpdateBooking = async (bookingId: string, updatedFields: Partial<Booking>) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, ...updatedFields };
      }
      return b;
    });
    setBookings(updated);
    storage.saveBookings(updated);

    // Sync with Supabase
    await updateBookingInSupabase(bookingId, updatedFields);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const updated = bookings.filter(b => b.id !== bookingId);
    setBookings(updated);
    storage.saveBookings(updated);

    // Sync with Supabase
    await deleteBookingFromSupabase(bookingId);
  };

  const handleApproveReview = async (reviewId: string) => {
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, approved: true };
      }
      return r;
    });
    setReviews(updated);
    storage.saveReviews(updated);

    // Sync with Supabase
    await updateReviewApprovalInSupabase(reviewId, true);
  };

  const handleToggleReviewApproval = async (reviewId: string, approved: boolean) => {
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, approved };
      }
      return r;
    });
    setReviews(updated);
    storage.saveReviews(updated);

    // Sync with Supabase
    await updateReviewApprovalInSupabase(reviewId, approved);
  };

  const handleDeleteReview = async (reviewId: string) => {
    const updated = reviews.filter(r => r.id !== reviewId);
    setReviews(updated);
    storage.saveReviews(updated);

    // Sync with Supabase
    await deleteReviewFromSupabase(reviewId);
  };

  const handleUpdateSettings = (newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleCreateService = async (newService: Service) => {
    const updated = [...services, newService];
    setServices(updated);
    storage.saveServices(updated);

    await saveServiceToSupabase(newService);

    const refreshed = await fetchServicesFromSupabase();
    if (refreshed && refreshed.length > 0) {
      setServices(refreshed);
      storage.saveServices(refreshed);
    }
  };

  const handleUpdateService = async (serviceId: string, updatedData: Partial<Service>) => {
    const updated = services.map(s => {
      if (s.id === serviceId) {
        return { ...s, ...updatedData };
      }
      return s;
    });
    setServices(updated);
    storage.saveServices(updated);

    await updateServiceInSupabase(serviceId, updatedData);

    const refreshed = await fetchServicesFromSupabase();
    if (refreshed && refreshed.length > 0) {
      setServices(refreshed);
      storage.saveServices(refreshed);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const updated = services.filter(s => s.id !== serviceId);
    setServices(updated);
    storage.saveServices(updated);

    await deleteServiceFromSupabase(serviceId);

    const refreshed = await fetchServicesFromSupabase();
    setServices(refreshed);
    storage.saveServices(refreshed);
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
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    const newBooking: Booking = {
      id: 'b-' + Date.now(),
      customerId: currentUser.id, // Strictly link booking to auth.uid()
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

    // Only allow seeing all bookings if the current user is an admin or staff
    setShowAllBookings(currentUser.role === 'admin' || currentUser.role === 'staff');
    setActiveSection('my-bookings');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Persist to Supabase backend asynchronously
    const { success, error } = await saveBookingToSupabase(newBooking);
    if (!success) {
      console.warn("Notice: Booking was saved locally, but saving to Supabase 'bookings' table failed.", error);
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
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

  // Filter current customer's bookings securely using logged-in user's user_id
  const myBookings = bookings.filter(b => {
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'staff';
    if (isAdmin && showAllBookings) {
      return true;
    }
    if (currentUser) {
      return b.customerId === currentUser.id;
    }
    return false;
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

      {/* Supabase Error Alert Banner */}
      {supabaseError && activeSection === 'admin' && (
        <div className="bg-amber-50 border-b border-amber-200 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs relative z-30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded-full shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  Supabase Integration Action Needed
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded-xs font-mono text-[9px] lowercase">
                    {supabaseError.code || 'unknown'}
                  </span>
                </h4>
                <p className="text-xs text-gray-600 mt-0.5 font-light">
                  Successfully connected to Supabase project <strong className="font-semibold">jnhcswiajmdoxdhgfjvd</strong>, but a table error was encountered. 
                  ({supabaseError.message || 'Table bookings does not exist or has RLS restrictions'}).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowSqlGuide(true)}
                className="px-4 py-2 bg-charcoal text-white hover:bg-amber-600 hover:text-white text-[10px] uppercase tracking-wider font-bold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Database className="w-3.5 h-3.5" />
                Setup SQL Schema
              </button>
              <button
                onClick={() => setSupabaseError(null)}
                className="p-1 text-gray-400 hover:text-charcoal rounded-full transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Render */}
      <main className="flex-1">

        {activeSection === 'home' && (
          <div className="animate-fade-in">
            
            {/* Elegant Hero Slider Header */}
            <Hero 
              adminMobileNumber={adminSettings.adminMobileNumber}
              salonName={adminSettings.salonName}
              salonAddress={adminSettings.salonAddress}
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
              isLoading={isServicesLoading}
            />

            {/* Certified Beauty Excellence Credentials Section */}
            <AboutSection />

            {/* Review Testimonials public approved section */}
            <ReviewSection 
              reviews={reviews}
              onAddReview={handleAddReview}
              currentUser={currentUser}
            />

            {/* Follow Us on Instagram Showcase Gallery Section */}
            <InstagramSection />

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
                  onOpenAuth={handleOpenAuth}
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
              isLoading={isServicesLoading}
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
                  onOpenAuth={handleOpenAuth}
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
                <span className="text-xs uppercase tracking-widest font-bold text-sand-200">SECURE PORTAL</span>
                <h2 className="title-font text-4xl font-light text-charcoal">My Scheduled Treatments</h2>
                <p className="text-xs text-gray-500 font-light mt-1">
                  View, track, and manage beauty appointments requested at {adminSettings.salonName}.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') && (
                  <button
                    onClick={() => setShowAllBookings(!showAllBookings)}
                    className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold border transition-all duration-300 rounded-xs cursor-pointer flex items-center gap-1.5 ${
                      showAllBookings
                        ? 'bg-rose-500 text-white border-transparent shadow-3xs'
                        : 'bg-white text-gray-600 border-sand-100 hover:border-rose-400 hover:text-rose-500'
                    }`}
                    title="Toggle between seeing only your bookings versus all bookings made on this app"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {showAllBookings ? 'Viewing All Bookings' : 'See All Bookings'}
                  </button>
                )}

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
            </div>

            {!currentUser ? (
              <div className="bg-white border border-rose-100 p-8 sm:p-12 rounded-xs shadow-3xs max-w-2xl mx-auto mb-10 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400" />
                <span className="p-3 bg-rose-50 rounded-full text-rose-500 inline-flex mb-4">
                  <Lock className="w-6 h-6" />
                </span>
                <h3 className="title-font text-2xl font-light text-charcoal mb-3">Authentication Required</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8 font-light leading-relaxed">
                  Access restricted: Please log in using your Supabase account to view your scheduled treatments and booking history.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-6 py-2.5 bg-charcoal text-white hover:bg-rose-500 hover:scale-105 hover:shadow-xs transition-all text-xs font-bold uppercase tracking-widest rounded-xs cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="px-6 py-2.5 border border-sand-100 text-gray-600 hover:border-rose-400 hover:text-rose-500 transition-all text-xs font-bold uppercase tracking-widest rounded-xs cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            ) : (
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
                    <div key={booking.id} className="bg-white border border-sand-100 p-6 shadow-2xs hover:shadow-xs transition-shadow relative rounded-xs flex flex-col justify-between">
                      
                      <div>
                        {/* Upper Section with status badge & price */}
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div>
                            <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-xs inline-block mb-2 ${
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800 animate-pulse'
                            }`}>
                              {booking.status === 'pending' ? 'Awaiting Review' : booking.status}
                            </span>
                            
                            <h4 className="font-serif text-lg text-charcoal font-medium">
                              {booking.serviceName}
                            </h4>
                          </div>
                          
                          <div className="text-right">
                            <span className="font-mono text-sm font-bold text-charcoal block">
                              ₹{(booking.price || 0).toFixed(2)}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono block mt-1">ID: {booking.id}</span>
                          </div>
                        </div>

                        {/* Interactive status progress steps timeline */}
                        <div className="mb-5 py-3 border-t border-b border-sand-50">
                          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                            <span>Workflow Status</span>
                            <span className="font-mono text-[8px] font-normal text-gray-400">Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="relative flex items-center justify-between">
                            {/* Background Line */}
                            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                            {/* Color-coded Active Fill Line */}
                            <div 
                              className={`absolute left-0 top-1/2 h-0.5 -translate-y-1/2 z-0 transition-all duration-500 ${
                                booking.status === 'completed' ? 'w-full bg-green-500' :
                                booking.status === 'confirmed' ? 'w-1/2 bg-blue-500' :
                                booking.status === 'cancelled' ? 'w-full bg-red-400' : 'w-1/6 bg-amber-400'
                              }`} 
                            />

                            {/* Step 1: Requested */}
                            <div className="relative z-10 flex flex-col items-center">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-amber-500 text-white'
                              }`}>
                                1
                              </span>
                              <span className="text-[8px] font-bold uppercase tracking-wide mt-1 text-charcoal">Requested</span>
                            </div>

                            {/* Step 2: Confirmed */}
                            <div className="relative z-10 flex flex-col items-center">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
                                booking.status === 'confirmed' || booking.status === 'completed'
                                  ? 'bg-blue-500 text-white'
                                  : booking.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-400'
                                  : 'bg-white border border-gray-200 text-gray-400'
                              }`}>
                                2
                              </span>
                              <span className={`text-[8px] font-bold uppercase tracking-wide mt-1 ${
                                booking.status === 'confirmed' || booking.status === 'completed' ? 'text-blue-600' : 'text-gray-400'
                              }`}>Confirmed</span>
                            </div>

                            {/* Step 3: Completed / Cancelled */}
                            <div className="relative z-10 flex flex-col items-center">
                              {booking.status === 'cancelled' ? (
                                <>
                                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-red-500 text-white">
                                    ✗
                                  </span>
                                  <span className="text-[8px] font-bold uppercase tracking-wide mt-1 text-red-600">Cancelled</span>
                                </>
                              ) : (
                                <>
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
                                    booking.status === 'completed'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-white border border-gray-200 text-gray-400'
                                  }`}>
                                    3
                                  </span>
                                  <span className={`text-[8px] font-bold uppercase tracking-wide mt-1 ${
                                    booking.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                                  }`}>Completed</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Date and Time slots details */}
                        <div className="space-y-2 text-xs text-gray-600 font-light py-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-rose-300" />
                            <span>Scheduled Date: <strong className="text-charcoal font-medium">{booking.date}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-rose-300" />
                            <span>Reserved Time: <strong className="text-charcoal font-medium">{booking.time}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-dashed border-sand-50 mt-1">
                            <span className="text-[10px] text-gray-400">Guest Name: <strong className="text-charcoal font-normal">{booking.customerName} ({booking.customerPhone})</strong></span>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="text-xs text-gray-400 italic mt-3 p-2 bg-rose-50/10 border border-rose-100/10 rounded-xs">
                            Notes: "{booking.notes}"
                          </div>
                        )}
                      </div>

                      {/* Status specific footer messages & Cancel request button */}
                      <div className="mt-4 pt-3 border-t border-sand-50">
                        {booking.status === 'pending' && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              Awaiting salon administrator approval
                            </span>
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to cancel this appointment request?")) {
                                  handleUpdateBookingStatus(booking.id, 'cancelled');
                                }
                              }}
                              className="text-xs text-red-500 hover:text-red-700 underline font-semibold uppercase tracking-wider cursor-pointer"
                            >
                              Cancel Request
                            </button>
                          </div>
                        )}

                        {booking.status === 'confirmed' && (
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50/50 px-2.5 py-1.5 border border-blue-100 rounded-xs flex items-center gap-1.5 flex-1">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                              Active booking is locked in. See you soon!
                            </div>
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to cancel this confirmed appointment?")) {
                                  handleUpdateBookingStatus(booking.id, 'cancelled');
                                }
                              }}
                              className="text-[10px] text-red-400 hover:text-red-600 font-semibold uppercase tracking-wider cursor-pointer ml-auto"
                            >
                              Cancel Appointment
                            </button>
                          </div>
                        )}

                        {booking.status === 'completed' && (
                          <div className="text-[10px] text-green-700 font-bold uppercase tracking-wider bg-green-50/50 p-2 border border-green-100 rounded-xs flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-green-600" />
                            Completed. Thank you for choosing Trisha Beauty Parlour!
                          </div>
                        )}

                        {booking.status === 'cancelled' && (
                          <div className="text-[10px] text-red-700 font-bold uppercase tracking-wider bg-red-50/50 p-2 border border-red-100 rounded-xs">
                            This appointment has been cancelled. Feel free to schedule a new treatment!
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
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
                services={services}
                adminSettings={adminSettings}
                currentUser={currentUser}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onUpdateBooking={handleUpdateBooking}
                onDeleteBooking={handleDeleteBooking}
                onApproveReview={handleApproveReview}
                onToggleReviewApproval={handleToggleReviewApproval}
                onDeleteReview={handleDeleteReview}
                onUpdateSettings={handleUpdateSettings}
                onCreateService={handleCreateService}
                onUpdateService={handleUpdateService}
                onDeleteService={handleDeleteService}
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
            <div className="text-xs text-gray-400 font-light leading-relaxed mb-4 flex gap-2 items-start group/footer-loc">
              <MapPin className="w-4 h-4 text-sand-200 shrink-0 group-hover/footer-loc:animate-bounce" />
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adminSettings.salonAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors decoration-sand-200/30 hover:underline"
              >
                {adminSettings.salonAddress}
              </a>
            </div>
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

      {/* Supabase SQL Guide Modal */}
      {showSqlGuide && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-sand-100 w-full max-w-3xl rounded-xs shadow-xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-sand-100 flex justify-between items-center bg-sand-50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-charcoal text-white rounded-xs">
                  <Database className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="title-font text-lg font-bold text-charcoal uppercase tracking-wider">
                    Supabase Database Setup
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono tracking-wide mt-0.5">
                    Project: jnhcswiajmdoxdhgfjvd.supabase.co
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlGuide(false)}
                className="p-1.5 text-gray-400 hover:text-charcoal rounded-full hover:bg-sand-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xs text-gray-600 leading-relaxed font-light">
                <span className="font-bold text-amber-800 uppercase block mb-1">Why am I seeing this?</span>
                Your Supabase project is connected successfully, but the required database table <strong className="font-medium text-charcoal">bookings</strong> is either missing or Row Level Security (RLS) is blocking inserts. Running this SQL script in your Supabase SQL Editor will instantly build the table and configure proper access permissions.
              </div>

              {/* Step-by-step instructions */}
              <div>
                <h4 className="font-bold uppercase tracking-wider text-charcoal mb-3">
                  Setup Instructions (3 Simple Steps)
                </h4>
                <ol className="list-decimal pl-4 space-y-2 text-gray-600 font-light font-sans">
                  <li>
                    Open your <a href="https://supabase.com/dashboard/project/jnhcswiajmdoxdhgfjvd/editor" target="_blank" rel="noopener noreferrer" className="text-amber-800 font-bold hover:underline">Supabase SQL Editor Dashboard</a> in a new tab.
                  </li>
                  <li>
                    Click <strong className="text-charcoal font-medium">New query</strong> (or use any blank SQL worksheet).
                  </li>
                  <li>
                    Copy the SQL script below, paste it into the editor, and click the green <strong className="text-charcoal font-medium">Run</strong> button in the top right.
                  </li>
                </ol>
              </div>

              {/* SQL Code Block */}
              <div>
                <div className="flex justify-between items-center bg-charcoal text-gray-300 px-4 py-2 rounded-t-xs text-[10px] font-mono font-medium">
                  <span>POSTGRESQL SCHEMA SETUP</span>
                  <button
                    onClick={() => {
                      const sqlText = `-- 1. Create the bookings table with user_id linked to Supabase Auth
create table if not exists bookings (
  id text primary key,
  user_id uuid references auth.users(id),
  customer_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  service_id text not null,
  service_name text not null,
  booking_date text not null,
  booking_time text not null,
  date text,
  time text,
  status text not null default 'pending',
  notes text,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS) on bookings
alter table bookings enable row level security;

-- 3. Create RLS policies for bookings
create policy "Allow select for owner or admin" on bookings
for select
using (
  auth.uid() = user_id 
  OR (auth.jwt() ->> 'email') = 'trisha123@gmail.com'
);

create policy "Allow insert for owner" on bookings
for insert
with check (
  auth.uid() = user_id
);

create policy "Allow update for owner or admin" on bookings
for update
using (
  auth.uid() = user_id
  OR (auth.jwt() ->> 'email') = 'trisha123@gmail.com'
);

create policy "Allow delete for admin only" on bookings
for delete
using (
  (auth.jwt() ->> 'email') = 'trisha123@gmail.com'
);

-- 4. Create the user_profiles table
create table if not exists user_profiles (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  email text not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security (RLS) on user_profiles
alter table user_profiles enable row level security;

-- 6. Create RLS policies for user_profiles
create policy "Allow public insert for signup" on user_profiles
for insert
with check (true);

create policy "Allow select for owner or admin" on user_profiles
for select
using (
  auth.uid() = id
  OR (auth.jwt() ->> 'email') = 'trisha123@gmail.com'
);

create policy "Allow update for owner" on user_profiles
for update
using (
  auth.uid() = id
);`;

                      navigator.clipboard.writeText(sqlText);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-xs text-white transition-colors cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-charcoal/95 text-sand-200 font-mono text-[11px] overflow-x-auto rounded-b-xs max-h-60 leading-relaxed scrollbar-thin">
{`-- 1. Create the bookings table with user_id linked to Supabase Auth
create table if not exists bookings (
  id text primary key,
  user_id uuid references auth.users(id),
  customer_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  service_id text not null,
  service_name text not null,
  booking_date text not null,
  booking_time text not null,
  date text,
  time text,
  status text not null default 'pending',
  notes text,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS) on bookings
alter table bookings enable row level security;

-- 3. Create RLS policies for bookings
create policy "Allow select for owner or admin" on bookings
for select
using (
  auth.uid() = user_id 
  OR (auth.jwt() ->> 'email') = 'trisha123@gmail.com'
);

create policy "Allow insert for owner" on bookings
for insert
with check (
  auth.uid() = user_id
);

create policy "Allow update for owner or admin" on bookings
for update
using (
  auth.uid() = user_id
  OR (auth.jwt() ->> 'email') = 'trisha123@gmail.com'
);

create policy "Allow delete for admin only" on bookings
for delete
using (
  (auth.jwt() ->> 'email') = 'trisha123@gmail.com'
);

-- 4. Create the user_profiles table
create table if not exists user_profiles (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  email text not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security (RLS) on user_profiles
alter table user_profiles enable row level security;

-- 6. Create RLS policies for user_profiles
create policy "Allow public insert for signup" on user_profiles
for insert
with check (true);

create policy "Allow select for owner or admin" on user_profiles
for select
using (
  auth.uid() = id
  OR (auth.jwt() ->> 'email') = 'trisha123@gmail.com'
);

create policy "Allow update for owner" on user_profiles
for update
using (
  auth.uid() = id
);`}
                </pre>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-sand-100 bg-sand-50 flex justify-end gap-3">
              <button
                onClick={() => setShowSqlGuide(false)}
                className="px-5 py-2.5 bg-charcoal text-white hover:bg-sand-200 hover:text-charcoal text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
