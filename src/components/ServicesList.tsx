import React, { useState, useMemo } from 'react';
import { Service } from '../types';
import { 
  Search, 
  LayoutGrid, 
  Table, 
  Check, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ShoppingBag, 
  SlidersHorizontal,
  X,
  Scissors,
  Heart,
  Flame,
  Smile,
  Palette,
  Hand,
  Sun,
  Paintbrush
} from 'lucide-react';

interface ServicesListProps {
  services: Service[];
  selectedServices: Service[];
  onToggleService: (service: Service) => void;
  onSelectServiceForBooking: (service: Service) => void;
}

// Category lists for display priority
const CATEGORIES = [
  'All',
  'Threading',
  'Waxing',
  'Facial',
  'Hair',
  'Makeup',
  'Nail Care',
  'Skin Care',
  'Mehendi',
  'Massage'
];

export default function ServicesList({ 
  services, 
  selectedServices, 
  onToggleService,
  onSelectServiceForBooking 
}: ServicesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'none' | 'low-high' | 'high-low'>('none');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Helper to get category icons with a gold/rose color palette
  const getCategoryIcon = (cat: string) => {
    const iconClass = "w-4 h-4 shrink-0 transition-colors duration-300";
    switch (cat.toLowerCase()) {
      case 'threading': return <Scissors className={`${iconClass} text-rose-500`} />;
      case 'waxing': return <Flame className={`${iconClass} text-amber-500`} />;
      case 'facial': return <Sparkles className={`${iconClass} text-rose-400`} />;
      case 'hair': return <Scissors className={`${iconClass} text-amber-600`} />;
      case 'makeup': return <Palette className={`${iconClass} text-rose-600`} />;
      case 'nail care': return <Hand className={`${iconClass} text-pink-500`} />;
      case 'skin care': return <Sun className={`${iconClass} text-amber-500`} />;
      case 'mehendi': return <Paintbrush className={`${iconClass} text-amber-700`} />;
      case 'massage': return <Heart className={`${iconClass} text-rose-500`} />;
      default: return <Sparkles className={`${iconClass} text-pink-500`} />;
    }
  };

  // Filter, Search, and Sort services
  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];

    // 1. Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.category.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term)
      );
    }

    // 2. Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (s) => s.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Sorting
    if (sortBy === 'low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-low') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [services, searchTerm, selectedCategory, sortBy]);

  // Group services by category for structured reading
  const groupedServices = useMemo(() => {
    const groups: { [key: string]: Service[] } = {};
    filteredAndSortedServices.forEach((service) => {
      if (!groups[service.category]) {
        groups[service.category] = [];
      }
      groups[service.category].push(service);
    });
    return groups;
  }, [filteredAndSortedServices]);

  // Total selected count & price
  const totalSelectedPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const isSelected = (id: string) => selectedServices.some(s => s.id === id);

  return (
    <section id="services-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      
      {/* Visual Design Accents */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-amber-50/40 rounded-full blur-3xl pointer-events-none" />

      {/* Elegant Header */}
      <div className="text-center mb-12 relative z-10">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-rose-500 block mb-2">
          ✨ Bespoke Beauty Menu ✨
        </span>
        <h2 className="title-font text-3xl sm:text-5xl font-light text-charcoal tracking-tight">
          Our Specialities & <span className="font-serif italic text-rose-500">Pricing</span>
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-rose-300 via-amber-300 to-rose-300 mx-auto mt-4" />
        <p className="text-xs sm:text-sm text-gray-500 font-light mt-3 max-w-2xl mx-auto leading-relaxed">
          Select individual treatments or build a customized beauty day package. Your selected services will compile automatically below.
        </p>
      </div>

      {/* Control panel: Search, Filter, Sort & View Toggle */}
      <div className="bg-white border border-rose-100 rounded-sm shadow-xs p-5 mb-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          
          {/* Search bar */}
          <div className="relative w-full lg:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-4 h-4 text-rose-300" />
            </span>
            <input
              type="text"
              placeholder="Search services (e.g. Eyebrow, Fruit Facial, Smoothening...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-rose-50/30 border border-rose-100 focus:border-amber-400 focus:bg-white rounded-xs text-xs text-charcoal placeholder-gray-400 focus:outline-none transition-all duration-300"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-rose-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & View Mode controls */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-rose-50/30 border border-rose-100 px-3 py-2 rounded-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-charcoal font-medium focus:outline-none cursor-pointer"
              >
                <option value="none">Sort: Recommended</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-rose-50 border border-rose-100 p-0.5 rounded-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xs transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-white text-rose-600 shadow-3xs font-semibold' 
                    : 'text-gray-400 hover:text-rose-500'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xs transition-all duration-300 ${
                  viewMode === 'table' 
                    ? 'bg-white text-rose-600 shadow-3xs font-semibold' 
                    : 'text-gray-400 hover:text-rose-500'
                }`}
                title="Table List View"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Category Pills Slider */}
        <div className="mt-5 pt-4 border-t border-rose-50 overflow-x-auto scrollbar-none flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-[11px] font-semibold tracking-wide uppercase transition-all duration-300 rounded-full cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm scale-105'
                  : 'bg-rose-50/50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-rose-100/50'
              }`}
            >
              {cat !== 'All' && getCategoryIcon(cat)}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Content Presentation */}
      {filteredAndSortedServices.length === 0 ? (
        <div className="text-center py-16 bg-white border border-rose-100 rounded-sm">
          <Sparkles className="w-10 h-10 text-rose-300 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-gray-500 font-light">No treatments matching your filters found.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSortBy('none'); }}
            className="mt-4 text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-amber-600 underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* Card / Grid View */}
          {viewMode === 'grid' && (
            <div className="space-y-12">
              {Object.keys(groupedServices).map((categoryName) => (
                <div key={categoryName} className="space-y-6">
                  {/* Category Section title */}
                  <div className="flex items-center gap-3 border-b border-rose-100/70 pb-3">
                    <span className="p-1.5 bg-rose-50 rounded-full text-rose-500">
                      {getCategoryIcon(categoryName)}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-light text-charcoal tracking-wide flex items-center gap-2">
                      {categoryName}
                      <span className="text-xs font-sans text-gray-400 font-light font-normal">
                        ({groupedServices[categoryName].length} options)
                      </span>
                    </h3>
                  </div>

                  {/* Grid of cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedServices[categoryName].map((service) => {
                      const selected = isSelected(service.id);
                      return (
                        <div 
                          key={service.id}
                          className={`group relative bg-white border rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md p-6 flex flex-col justify-between min-h-[220px] ${
                            selected 
                              ? 'border-rose-400 ring-1 ring-rose-300 bg-rose-50/10' 
                              : 'border-rose-100 hover:border-amber-300'
                          }`}
                        >
                          {/* Top accent gradient line */}
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-300 via-amber-300 to-rose-300 opacity-70" />
                          
                          {/* Selection Check Circle */}
                          {selected && (
                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-3xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          <div className="flex-1">
                            {/* Category & Duration Row */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-rose-50 text-rose-600 rounded-xs border border-rose-100/40">
                                {service.category}
                              </span>
                              <span className="text-[10px] text-gray-400 font-light flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 text-amber-500" /> {service.duration}
                              </span>
                            </div>

                            {/* Service name & price */}
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="font-serif text-lg text-charcoal font-light tracking-wide group-hover:text-rose-600 transition-colors duration-300">
                                {service.name}
                              </h4>
                              <span className="font-serif text-lg font-medium text-rose-600 shrink-0">
                                ₹{service.price}
                              </span>
                            </div>

                            {/* Service Description */}
                            <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                              {service.description}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-auto">
                            <button
                              onClick={() => onToggleService(service)}
                              className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-bold transition-all duration-300 rounded-xs border cursor-pointer ${
                                selected
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-white hover:bg-rose-50 text-gray-700 border-rose-100 hover:border-rose-300'
                              }`}
                            >
                              {selected ? 'Deselect' : 'Select'}
                            </button>
                            <button
                              onClick={() => onSelectServiceForBooking(service)}
                              className="px-4 py-2 text-[10px] uppercase tracking-wider font-bold bg-charcoal text-white hover:bg-rose-500 hover:text-white transition-all duration-300 rounded-xs cursor-pointer shadow-3xs"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table List View */}
          {viewMode === 'table' && (
            <div className="space-y-12">
              {Object.keys(groupedServices).map((categoryName) => (
                <div key={categoryName} className="space-y-4">
                  {/* Category Title */}
                  <div className="flex items-center gap-3 border-b border-rose-100 pb-2">
                    <span className="p-1 bg-rose-50 rounded-full text-rose-500">
                      {getCategoryIcon(categoryName)}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-light text-charcoal tracking-wide">
                      {categoryName}
                    </h3>
                  </div>

                  {/* Sleek Elegant Table */}
                  <div className="overflow-hidden border border-rose-100/50 rounded-sm bg-white shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-rose-50/40 text-[10px] uppercase tracking-wider text-rose-500 font-bold border-b border-rose-100">
                          <th className="py-3 px-4 w-12 text-center">Select</th>
                          <th className="py-3 px-4">Treatment</th>
                          <th className="py-3 px-4 hidden sm:table-cell">Duration</th>
                          <th className="py-3 px-4 text-right">Price (₹)</th>
                          <th className="py-3 px-4 text-center w-28">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100/30">
                        {groupedServices[categoryName].map((service) => {
                          const selected = isSelected(service.id);
                          return (
                            <tr 
                              key={service.id} 
                              className={`text-xs hover:bg-rose-50/20 transition-all duration-200 ${
                                selected ? 'bg-rose-50/10' : ''
                              }`}
                            >
                              {/* Selection checkbox cell */}
                              <td className="py-4 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => onToggleService(service)}
                                  className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                                    selected 
                                      ? 'bg-rose-500 border-rose-500 text-white' 
                                      : 'border-rose-200 hover:border-rose-400 bg-white'
                                  }`}
                                >
                                  {selected && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                              </td>

                              {/* Info cell */}
                              <td className="py-4 px-4">
                                <div className="font-medium text-charcoal text-sm sm:text-base leading-snug">
                                  {service.name}
                                </div>
                                <div className="text-[11px] text-gray-400 font-light mt-0.5 max-w-lg hidden sm:block">
                                  {service.description}
                                </div>
                                <span className="inline-block sm:hidden text-[9px] uppercase tracking-widest font-semibold text-rose-400 mt-1">
                                  ⏳ {service.duration}
                                </span>
                              </td>

                              {/* Duration cell */}
                              <td className="py-4 px-4 hidden sm:table-cell text-gray-500 font-light">
                                {service.duration}
                              </td>

                              {/* Price cell */}
                              <td className="py-4 px-4 text-right font-serif text-sm sm:text-base font-medium text-rose-600">
                                ₹{service.price}
                              </td>

                              {/* Book Button Cell */}
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => onSelectServiceForBooking(service)}
                                  className="w-full py-1.5 px-3 text-[10px] uppercase tracking-wider font-bold bg-charcoal text-white hover:bg-rose-500 transition-all duration-300 rounded-xs cursor-pointer"
                                >
                                  Book
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Sticky Bottom Cart Summary Bar */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-8 max-w-4xl mx-auto bg-charcoal/95 backdrop-blur-md border border-amber-300/30 text-white p-4 sm:p-5 rounded-lg shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-r from-rose-500 to-amber-500 rounded-md text-white shadow-md">
              <ShoppingBag className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h5 className="font-serif text-base sm:text-lg font-light tracking-wide text-amber-200">
                Selected {selectedServices.length} {selectedServices.length === 1 ? 'treatment' : 'treatments'}
              </h5>
              <div className="flex flex-wrap gap-x-2 text-[10px] text-gray-300 font-light mt-0.5">
                {selectedServices.map(s => s.name).join(', ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 block">Total Price</span>
              <span className="font-serif text-xl sm:text-2xl text-amber-300 font-bold">
                ₹{totalSelectedPrice}
              </span>
            </div>

            <button
              onClick={() => onSelectServiceForBooking(selectedServices[0])}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all duration-300 hover:scale-105 active:scale-95 rounded-sm flex items-center gap-1.5 cursor-pointer"
            >
              Book Selected <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
