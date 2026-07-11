import React from 'react';
import { User, AdminSettings } from '../types';
import { Phone, User as UserIcon, LogOut, Lock, Scissors, MessageSquare } from 'lucide-react';
import trishaLogo from '../assets/images/trisha_logo_1783583450032.jpg';

interface NavbarProps {
  currentUser: User | null;
  adminSettings: AdminSettings;
  onOpenAuth: (initialMode?: 'login' | 'forgot' | 'register') => void;
  onLogout: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Navbar({
  currentUser,
  adminSettings,
  onOpenAuth,
  onLogout,
  activeSection,
  setActiveSection
}: NavbarProps) {
  // Gracefully handle displaying salon name
  const firstWord = adminSettings.salonName ? adminSettings.salonName.split(' ')[0] : 'TRISHA';
  const remainingWords = adminSettings.salonName ? adminSettings.salonName.split(' ').slice(1).join(' ') : 'Beauty Parlour';

  return (
    <nav className="sticky top-0 z-40 bg-sand-50/95 backdrop-blur-md border-b border-sand-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setActiveSection('home')}
            id="nav-logo-btn"
          >
            <div className="w-11 h-11 rounded-full border border-sand-100 bg-white overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:shadow-md">
              <img 
                src={trishaLogo} 
                alt="Trisha Beauty Parlour Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="block text-xl tracking-widest uppercase font-serif font-medium text-charcoal transition-colors duration-300 group-hover:text-sand-200">
                {firstWord}
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-sand-200 -mt-1 font-sans font-bold transition-colors duration-300 group-hover:text-charcoal">
                {remainingWords}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {[
              { id: 'home', label: 'Home' },
              { id: 'services', label: 'Our Expertise' },
              { id: 'reviews', label: 'Guest Reviews' },
              ...(currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') 
                ? [{ id: 'admin', label: 'Staff Dashboard' }] 
                : [{ id: 'my-bookings', label: 'My Appointments' }])
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveSection(link.id)}
                id={`nav-${link.id}-btn`}
                className={`text-sm tracking-wider uppercase font-medium transition-all duration-300 hover:text-sand-200 hover:-translate-y-0.5 cursor-pointer relative py-1 group/link ${
                  activeSection === link.id ? 'text-sand-200' : 'text-charcoal'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 h-[2px] bg-sand-200 transition-all duration-300 ${
                  activeSection === link.id ? 'w-full' : 'w-0 group-hover/link:w-full'
                }`} />
              </button>
            ))}
          </div>

          {/* Right Area: Contact Admin Phone, User Session Controls */}
          <div className="flex items-center gap-4">
            
            {/* Prominent Admin Mobile Contact */}
            <a 
              href={`tel:${adminSettings.adminMobileNumber}`}
              id="nav-phone-call"
              className="hidden lg:flex items-center gap-2 bg-sand-100 hover:bg-charcoal hover:text-sand-50 hover:scale-105 text-charcoal px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 border border-sand-100 hover:border-charcoal hover:shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-sand-800 animate-pulse group-hover:text-sand-50" />
              <span>BOOK / CALL: {adminSettings.adminMobileNumber}</span>
            </a>

            {/* Session Actions */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-charcoal line-clamp-1">{currentUser.name}</span>
                  <span className="text-[10px] text-sand-200 uppercase font-bold tracking-wider">{currentUser.role}</span>
                </div>
                
                {currentUser.role === 'customer' ? (
                  <button
                    onClick={() => setActiveSection('my-bookings')}
                    id="nav-avatar-btn"
                    className="w-9 h-9 rounded-full bg-sand-200 hover:bg-charcoal hover:text-sand-50 flex items-center justify-center text-charcoal cursor-pointer border border-sand-100 transition-all duration-300 hover:scale-110 hover:shadow-xs"
                    title="My Appointments"
                  >
                    <UserIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveSection('admin')}
                    id="nav-staff-dashboard-btn"
                    className="w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-600 hover:text-white flex items-center justify-center text-amber-800 cursor-pointer border border-amber-200 transition-all duration-300 hover:scale-110 hover:shadow-xs"
                    title="Admin Dashboard"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onLogout}
                  id="nav-logout-btn"
                  className="p-2 text-charcoal hover:text-red-600 rounded-full hover:bg-red-50 hover:scale-110 transition-all duration-300 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  id="nav-login-modal-btn"
                  className="px-4 py-2 text-xs uppercase tracking-widest font-semibold border border-charcoal text-charcoal hover:bg-charcoal hover:text-sand-50 hover:scale-105 transition-all duration-300 rounded-xs cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  id="nav-register-modal-btn"
                  className="hidden sm:inline-block px-4 py-2 text-xs uppercase tracking-widest font-semibold bg-charcoal text-sand-50 hover:bg-sand-200 hover:text-charcoal hover:scale-105 transition-all duration-300 rounded-xs cursor-pointer"
                >
                  Join Us
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Mobile Prominent Quick Bar */}
      <div className="flex md:hidden justify-around items-center py-2 px-4 bg-sand-100/50 border-t border-sand-100">
        <button
          onClick={() => setActiveSection('home')}
          className={`text-xs uppercase font-medium tracking-wider ${activeSection === 'home' ? 'text-sand-200' : 'text-charcoal'}`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveSection('services')}
          className={`text-xs uppercase font-medium tracking-wider ${activeSection === 'services' ? 'text-sand-200' : 'text-charcoal'}`}
        >
          Expertise
        </button>
        <button
          onClick={() => setActiveSection('my-bookings')}
          className={`text-xs uppercase font-medium tracking-wider ${activeSection === 'my-bookings' ? 'text-sand-200' : 'text-charcoal'}`}
        >
          Bookings
        </button>
        {currentUser ? (
          currentUser.role === 'admin' || currentUser.role === 'staff' ? (
            <button
              onClick={() => setActiveSection('admin')}
              className={`text-xs uppercase font-medium tracking-wider text-amber-800 font-semibold ${activeSection === 'admin' ? 'text-amber-600' : ''}`}
            >
              Admin
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="text-xs uppercase font-medium tracking-wider text-red-600 font-semibold"
            >
              Logout
            </button>
          )
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="text-xs uppercase font-bold tracking-wider text-sand-200"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
