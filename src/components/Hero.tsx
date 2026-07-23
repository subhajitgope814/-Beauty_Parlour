import React, { useState } from 'react';
import { Sparkles, MapPin, Star, Phone, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import indianSalonModel from '../assets/images/indian_salon_model_1783588068177.jpg';

interface HeroProps {
  adminMobileNumber: string;
  salonName: string;
  salonAddress: string;
  onBookClick: () => void;
  onExploreClick: () => void;
}

const HERO_LOOKBOOK = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Hair Spa",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Hairstyling",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Facials",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Nails",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Eyelashes",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=300&h=300",
    name: "Massage",
  }
];

export default function Hero({ adminMobileNumber, salonName, salonAddress, onBookClick, onExploreClick }: HeroProps) {
  const [headerView, setHeaderView] = useState<'model' | 'lookbook'>('model');

  return (
    <div id="hero-section" className="relative overflow-hidden bg-rose-50/10">
      
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#fda4af_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      {/* Main Grid Banner split */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)] items-stretch border-b border-rose-100">
        
        {/* Left Column (Brand Description & Copy) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col justify-center px-6 sm:px-12 py-16 lg:py-24 bg-rose-50/5 border-r border-rose-100">
          
          <div className="flex items-center gap-2 mb-6 group/badge cursor-default">
            <span className="p-1 bg-rose-50 rounded-full text-rose-500 transition-transform duration-300 group-hover/badge:rotate-12">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-rose-500 transition-colors duration-300 group-hover/badge:text-rose-700">
              Beauty, Confidence & Care – All in One Place
            </span>
          </div>

          <h1 className="title-font text-4xl sm:text-6xl lg:text-7xl font-light text-charcoal tracking-tight leading-none mb-6 cursor-default transition-all duration-500 hover:translate-x-1">
            Welcome to
            <span className="block italic text-rose-500 font-serif font-normal mt-1 text-5xl sm:text-7xl hover:text-rose-600 transition-colors duration-300">
              {salonName || "Trisha Beauty Parlour"}
            </span>
          </h1>

          <div className="space-y-4 text-sm text-gray-600 font-light leading-relaxed max-w-lg mb-8 cursor-default">
            <p className="transition-all duration-300 hover:text-charcoal hover:translate-x-1">
              Welcome to <strong className="text-charcoal font-semibold hover:text-rose-600 transition-colors duration-300">Trisha Beauty Parlour</strong>, where beauty meets confidence and self-care. We believe that every person is naturally beautiful, and our mission is to enhance that beauty through professional beauty services, premium-quality products, and personalized care.
            </p>
            <p className="hidden md:block transition-all duration-300 hover:text-charcoal hover:translate-x-1">
              Our experienced beauty professionals use the latest beauty trends and modern techniques to provide exceptional services tailored to each client's unique needs. Whether you're looking for bridal makeup, party makeup, hairstyling, facials, skincare treatments, hair spa, eyebrow shaping, waxing, manicure, pedicure, or any other beauty service, <strong className="text-charcoal font-semibold hover:text-rose-600 transition-colors duration-300">Trisha Beauty Parlour</strong> is your trusted destination.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={onBookClick}
              id="hero-book-now-btn"
              className="px-8 py-4 bg-charcoal hover:bg-rose-500 hover:text-white text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 cursor-pointer text-center"
            >
              Book Appointment
            </button>
            <button
              onClick={onExploreClick}
              id="hero-learn-more-btn"
              className="px-8 py-4 border border-rose-200 hover:border-charcoal hover:bg-charcoal hover:text-white text-charcoal text-xs uppercase tracking-widest font-semibold transition-all duration-300 hover:-translate-y-1 active:translate-y-0 cursor-pointer text-center"
            >
              Our Expertise
            </button>
          </div>

          {/* Info blocks matching layout */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-rose-100">
            <div className="group/stat cursor-pointer">
              <span className="block text-2xl font-serif text-charcoal transition-colors duration-300 group-hover/stat:text-rose-500">98%</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block transition-transform duration-300 group-hover/stat:translate-x-1">Guest Trust</span>
            </div>
            <div className="group/stat cursor-pointer">
              <span className="block text-2xl font-serif text-charcoal transition-colors duration-300 group-hover/stat:text-rose-500">12+</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block transition-transform duration-300 group-hover/stat:translate-x-1">Top Stylists</span>
            </div>
            <div className="group/stat cursor-pointer">
              <span className="block text-2xl font-serif text-charcoal transition-colors duration-300 group-hover/stat:text-rose-500">4.9 ★</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block transition-transform duration-300 group-hover/stat:translate-x-1">250+ Reviews</span>
            </div>
          </div>

        </div>

        {/* Right Column (High fashion professional image of the Indian salon model & lookbook grid) */}
        <div className="col-span-1 lg:col-span-6 relative min-h-[550px] lg:min-h-0 flex items-center justify-center bg-rose-50/5 overflow-hidden group/img-container border-l border-rose-100">
          
          {/* View Toggle Controls */}
          <div className="absolute top-6 left-6 z-20 flex bg-white/95 backdrop-blur-xs p-1 border border-rose-100 rounded-full shadow-md">
            <button
              onClick={() => setHeaderView('model')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                headerView === 'model'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-rose-500'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Signature Style
            </button>
            <button
              onClick={() => setHeaderView('lookbook')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                headerView === 'lookbook'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-rose-500'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Treatment Lookbook
            </button>
          </div>

          {headerView === 'model' ? (
            /* Model View */
            <div className="absolute inset-0 z-0 overflow-hidden animate-fade-in">
              <img 
                src={indianSalonModel} 
                alt="Trisha Salon luxury bridal & styling model" 
                className="w-full h-full object-cover group-hover/img-container:scale-105 transition-all duration-1000 ease-out"
                referrerPolicy="no-referrer"
              />
              {/* Elegant warm beige color overlay representing photo filters */}
              <div className="absolute inset-0 bg-rose-500/5 mix-blend-multiply" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-rose-50/60 to-transparent" />
            </div>
          ) : (
            /* Lookbook Grid View */
            <div className="absolute inset-0 z-0 bg-rose-50/20 p-6 pt-20 pb-20 grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto animate-fade-in">
              {HERO_LOOKBOOK.map((item) => (
                <div 
                  key={item.id} 
                  className="relative group/tile aspect-square bg-white border border-rose-100 overflow-hidden shadow-2xs hover:shadow-md transition-shadow rounded-xs"
                >
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/tile:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle label overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2 text-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white">
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floater Badge (hidden on Lookbook view for cleaner grid) */}
          {headerView === 'model' && (
            <div className="absolute top-6 right-6 z-10 bg-white/95 backdrop-blur-xs p-4 border border-rose-100 max-w-[220px] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-md cursor-pointer hidden sm:block animate-fade-in">
              <div className="flex gap-1 text-amber-500 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-[11px] italic text-gray-600 leading-snug">
                "The most exquisite treatment experience!"
              </p>
              <span className="block text-[9px] uppercase tracking-wider text-charcoal font-bold mt-2">— Founder Trisha Roy</span>
            </div>
          )}

          {/* Quick Details Floating Box on Bottom Left */}
          <div className="absolute bottom-6 left-6 right-6 z-10 bg-charcoal text-rose-50 p-4 border border-rose-200/10 transition-all duration-500 hover:shadow-lg cursor-pointer group/location flex items-center justify-between gap-4">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-amber-300 font-bold block mb-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 group-hover/location:animate-bounce" />
                OUR SANCTUARY
              </span>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salonAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-rose-100 hover:text-white hover:underline transition-colors decoration-rose-300/50 block line-clamp-1"
              >
                {salonAddress}
              </a>
            </div>
            
            <a 
              href={`tel:${adminMobileNumber}`}
              className="text-[10px] text-white hover:text-rose-100 transition-colors tracking-widest font-bold flex items-center gap-1 shrink-0 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xs animate-pulse"
            >
              <Phone className="w-3 h-3 text-rose-300" />
              CALL NOW
            </a>
          </div>

        </div>

      </div>

      {/* Editorial Welcome Showcase Block */}
      <section className="py-20 px-6 sm:px-12 max-w-5xl mx-auto border-b border-rose-100">
        <div className="bg-white border border-rose-100/60 p-8 sm:p-16 rounded-xs shadow-3xs relative overflow-hidden text-center">
          
          {/* Subtle gold/rose accent line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-300 via-amber-300 to-rose-300 opacity-60" />

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100/50 rounded-full mb-6 cursor-default transition-all duration-300 hover:bg-rose-100 hover:scale-105">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-rose-500">
              Beauty, Confidence & Care – All in One Place
            </span>
          </div>

          <h2 className="title-font text-3xl sm:text-5xl font-light text-charcoal mb-8 tracking-tight cursor-default transition-colors duration-500 hover:text-rose-600">
            Welcome to <span className="font-serif italic text-rose-500 hover:text-rose-700 transition-colors duration-300">{salonName || "Trisha Beauty Parlour"}</span>
          </h2>

          <div className="max-w-3xl mx-auto space-y-6 text-sm sm:text-base text-gray-500 font-light leading-relaxed text-justify sm:text-center cursor-default">
            <p className="transition-colors duration-300 hover:text-charcoal hover:translate-x-0.5">
              Welcome to <strong className="text-charcoal font-semibold hover:text-rose-600 transition-colors duration-300">Trisha Beauty Parlour</strong>, where beauty meets confidence and self-care. We believe that every person is naturally beautiful, and our mission is to enhance that beauty through professional beauty services, premium-quality products, and personalized care.
            </p>
            
            <p className="transition-colors duration-300 hover:text-charcoal hover:translate-x-0.5">
              Our experienced beauty professionals use the latest beauty trends and modern techniques to provide exceptional services tailored to each client's unique needs. Whether you're looking for bridal makeup, party makeup, hairstyling, facials, skincare treatments, hair spa, eyebrow shaping, waxing, manicure, pedicure, or any other beauty service, <strong className="text-charcoal font-semibold hover:text-rose-600 transition-colors duration-300">Trisha Beauty Parlour</strong> is your trusted destination.
            </p>

            <p className="transition-colors duration-300 hover:text-charcoal hover:translate-x-0.5">
              We are committed to providing high-quality beauty services in a clean, comfortable, and welcoming environment. Your satisfaction, comfort, and confidence are our highest priorities. Every visit is designed to give you a relaxing experience and leave you looking and feeling your absolute best.
            </p>

            <p className="font-serif italic text-lg text-rose-600 pt-2 transition-all duration-300 hover:text-rose-700 hover:scale-[1.02]">
              "At Trisha Beauty Parlour, we don't just create beautiful looks—we help you feel beautiful from the inside out."
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-rose-50 max-w-lg mx-auto cursor-default">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-600 font-bold mb-3 transition-colors duration-300 hover:text-rose-600">
              Your Beauty, Our Passion.
            </p>
            <p className="text-xs text-gray-400 transition-colors duration-300 hover:text-gray-600">
              Book your appointment today and experience professional beauty care that brings out the best version of you.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
