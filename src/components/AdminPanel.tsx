import React, { useState } from 'react';
import { Booking, Review, AdminSettings, User, Service } from '../types';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Check, 
  X, 
  Phone, 
  Trash2, 
  CheckCircle, 
  Star, 
  Settings, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  SlidersHorizontal,
  Sparkles,
  MapPin,
  Save,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail
} from 'lucide-react';

interface AdminPanelProps {
  bookings: Booking[];
  reviews: Review[];
  services: Service[];
  adminSettings: AdminSettings;
  currentUser: User | null;
  onUpdateBookingStatus: (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => void;
  onUpdateBooking: (bookingId: string, updatedFields: Partial<Booking>) => void;
  onDeleteBooking: (bookingId: string) => void;
  onApproveReview: (reviewId: string) => void;
  onToggleReviewApproval: (reviewId: string, approved: boolean) => void;
  onDeleteReview: (reviewId: string) => void;
  onUpdateSettings: (newSettings: AdminSettings) => void;
  onCreateService: (newService: Service) => void;
  onUpdateService: (serviceId: string, updatedData: Partial<Service>) => void;
  onDeleteService: (serviceId: string) => void;
}

const CATEGORIES = [
  'Threading',
  'Waxing',
  'Facial',
  'Hair Cutting',
  'Hair Spa',
  'Makeup',
  'Nail Care',
  'Skin Care',
  'Mehendi',
  'Massage'
];

export default function AdminPanel({
  bookings,
  reviews,
  services = [],
  adminSettings,
  currentUser,
  onUpdateBookingStatus,
  onUpdateBooking,
  onDeleteBooking,
  onApproveReview,
  onToggleReviewApproval,
  onDeleteReview,
  onUpdateSettings,
  onCreateService,
  onUpdateService,
  onDeleteService
}: AdminPanelProps) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'reviews' | 'settings'>('bookings');

  // Local state for settings editing
  const [mobileNumber, setMobileNumber] = useState(adminSettings.adminMobileNumber);
  const [salonName, setSalonName] = useState(adminSettings.salonName);
  const [salonAddress, setSalonAddress] = useState(adminSettings.salonAddress);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Filter & Search states for Bookings
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Edit Booking Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormPhone, setEditFormPhone] = useState('');
  const [editFormEmail, setEditFormEmail] = useState('');
  const [editFormServiceName, setEditFormServiceName] = useState('');
  const [editFormPrice, setEditFormPrice] = useState('');
  const [editFormDate, setEditFormDate] = useState('');
  const [editFormTime, setEditFormTime] = useState('');
  const [editFormNotes, setEditFormNotes] = useState('');
  const [editFormStatus, setEditFormStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');

  // Filter state for Reviews
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Local state for Service Form (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Threading');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [serviceIsActive, setServiceIsActive] = useState(true);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // 1. Math statistics computations
  const todayStr = new Date().toISOString().split('T')[0];
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const todaysBookings = bookings.filter(b => b.date === todayStr).length;
  const upcomingBookings = bookings.filter(b => b.date > todayStr).length;

  const totalRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.price || 0), 0);

  // 2. Filter & Sort bookings
  const filteredAndSortedBookings = bookings
    .filter(b => {
      // Status Filter
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;

      // Search Filter (customer name, phone, booking ID, or service name)
      const term = searchTerm.toLowerCase();
      if (term) {
        return (
          b.customerName?.toLowerCase().includes(term) ||
          b.customerPhone?.toLowerCase().includes(term) ||
          b.id?.toLowerCase().includes(term) ||
          b.serviceName?.toLowerCase().includes(term) ||
          b.customerEmail?.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${convertTo24Hour(a.time)}`).getTime() || 0;
      const dateB = new Date(`${b.date}T${convertTo24Hour(b.time)}`).getTime() || 0;
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Convert time string (e.g. "10:30 AM") to 24hr format for sorting
  function convertTo24Hour(timeStr: string): string {
    if (!timeStr) return '00:00';
    try {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = String(parseInt(hours, 10) + 12);
      }
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch (e) {
      return '00:00';
    }
  }

  // Pagination bounds
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage) || 1;
  const paginatedBookings = filteredAndSortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filtered reviews
  const filteredReviews = reviews.filter(r => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === 'pending') return !r.approved;
    return r.approved;
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleEditServiceClick = (service: Service) => {
    setEditingServiceId(service.id);
    setServiceName(service.name);
    setServiceCategory(service.category);
    setServicePrice(service.price.toString());
    setServiceDuration(service.duration);
    setServiceDescription(service.description);
    setServiceImage(service.image || '');
    setServiceIsActive(service.isActive !== false);
    setFormSuccessMessage('');
    setIsFormOpen(true);
  };

  const handleServiceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice || !serviceDuration.trim()) {
      alert('Please fill out Name, Price, and Duration.');
      return;
    }

    const priceNum = parseFloat(servicePrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Please enter a valid price.');
      return;
    }

    const serviceData: Service = {
      id: editingServiceId || `s-${Date.now()}`,
      name: serviceName.trim(),
      category: serviceCategory,
      price: priceNum,
      duration: serviceDuration.trim(),
      description: serviceDescription.trim(),
      image: serviceImage.trim() || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
      isActive: serviceIsActive
    };

    if (editingServiceId) {
      onUpdateService(editingServiceId, serviceData);
      setFormSuccessMessage('Service updated successfully!');
    } else {
      onCreateService(serviceData);
      setFormSuccessMessage('Service created successfully!');
    }

    setTimeout(() => {
      resetServiceForm();
    }, 1000);
  };

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setServiceName('');
    setServiceCategory('Threading');
    setServicePrice('');
    setServiceDuration('');
    setServiceDescription('');
    setServiceImage('');
    setServiceIsActive(true);
    setFormSuccessMessage('');
    setIsFormOpen(false);
  };

  // 3. Export bookings as CSV
  const handleExportCSV = () => {
    const headers = [
      'Booking ID', 
      'Customer Name', 
      'Phone', 
      'Email', 
      'Service Name', 
      'Price (INR)', 
      'Date', 
      'Time Slot', 
      'Status', 
      'Notes', 
      'Created At'
    ];
    
    const rows = filteredAndSortedBookings.map(b => [
      b.id,
      b.customerName,
      b.customerPhone,
      b.customerEmail || '',
      b.serviceName,
      b.price,
      b.date,
      b.time,
      b.status,
      (b.notes || '').replace(/\n/g, ' '),
      b.createdAt
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trisha_beauty_parlour_bookings_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Edit Booking Modal Helpers
  const handleOpenEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setEditFormName(booking.customerName || '');
    setEditFormPhone(booking.customerPhone || '');
    setEditFormEmail(booking.customerEmail || '');
    setEditFormServiceName(booking.serviceName || '');
    setEditFormPrice((booking.price || 0).toString());
    setEditFormDate(booking.date || '');
    setEditFormTime(booking.time || '');
    setEditFormNotes(booking.notes || '');
    setEditFormStatus(booking.status || 'pending');
    setIsEditModalOpen(true);
  };

  const handleEditModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    const priceNum = parseFloat(editFormPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Please enter a valid price');
      return;
    }

    const updatedFields: Partial<Booking> = {
      customerName: editFormName.trim(),
      customerPhone: editFormPhone.trim(),
      customerEmail: editFormEmail.trim(),
      serviceName: editFormServiceName.trim(),
      price: priceNum,
      date: editFormDate,
      time: editFormTime,
      notes: editFormNotes.trim(),
      status: editFormStatus
    };

    onUpdateBooking(editingBooking.id, updatedFields);
    setIsEditModalOpen(false);
    setEditingBooking(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in" id="admin-dashboard-view">
      
      {/* Title Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-sand-100 pb-8 mb-10 gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-rose-500 block mb-1">
            ✨ SALON CONTROL PORTAL & DASHBOARD ✨
          </span>
          <h2 className="title-font text-3xl sm:text-4xl font-light text-charcoal">
            Trisha Beauty Parlour Admin
          </h2>
          <p className="text-xs text-gray-500 font-light mt-1">
            Authorized Account: <strong className="text-charcoal font-semibold">{currentUser?.name}</strong> ({currentUser?.role})
          </p>
        </div>

        {/* Dynamic Horizontal Overview Stats (7 Cards Bento Grid style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 w-full xl:w-auto">
          <div className="bg-white p-3 border border-rose-100/40 text-center rounded-xs shadow-3xs transition-all duration-300 hover:scale-[1.03]">
            <span className="block text-lg font-serif text-charcoal font-semibold">{totalBookings}</span>
            <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold block mt-0.5">Total Bookings</span>
          </div>
          <div className="bg-amber-50/50 p-3 border border-amber-100 text-center rounded-xs shadow-3xs transition-all duration-300 hover:scale-[1.03]">
            <span className="block text-lg font-serif text-amber-800 font-bold">{pendingBookings}</span>
            <span className="text-[8px] text-amber-500 uppercase tracking-widest font-bold block mt-0.5">Pending</span>
          </div>
          <div className="bg-blue-50/40 p-3 border border-blue-100 text-center rounded-xs shadow-3xs transition-all duration-300 hover:scale-[1.03]">
            <span className="block text-lg font-serif text-blue-800 font-bold">{confirmedBookings}</span>
            <span className="text-[8px] text-blue-500 uppercase tracking-widest font-bold block mt-0.5">Confirmed</span>
          </div>
          <div className="bg-green-50/40 p-3 border border-green-100 text-center rounded-xs shadow-3xs transition-all duration-300 hover:scale-[1.03]">
            <span className="block text-lg font-serif text-green-800 font-bold">{completedBookings}</span>
            <span className="text-[8px] text-green-500 uppercase tracking-widest font-bold block mt-0.5">Completed</span>
          </div>
          <div className="bg-red-50/30 p-3 border border-red-100 text-center rounded-xs shadow-3xs transition-all duration-300 hover:scale-[1.03]">
            <span className="block text-lg font-serif text-red-800 font-bold">{cancelledBookings}</span>
            <span className="text-[8px] text-red-400 uppercase tracking-widest font-bold block mt-0.5">Cancelled</span>
          </div>
          <div className="bg-rose-50 p-3 border border-rose-200/40 text-center rounded-xs shadow-3xs transition-all duration-300 hover:scale-[1.03]">
            <span className="block text-lg font-serif text-rose-800 font-bold">{todaysBookings}</span>
            <span className="text-[8px] text-rose-500 uppercase tracking-widest font-bold block mt-0.5">Today's Slots</span>
          </div>
          <div className="bg-charcoal text-sand-50 p-3 border border-charcoal text-center rounded-xs shadow-3xs transition-all duration-300 hover:scale-[1.03]">
            <span className="block text-base font-mono text-amber-300 font-bold">₹{totalRevenue}</span>
            <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold block mt-1">Confirmed Rev</span>
          </div>
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="flex border-b border-rose-100/50 mb-8 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => { setActiveTab('bookings'); resetServiceForm(); }}
          className={`pb-4 px-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-rose-500 text-rose-600 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-charcoal'
          }`}
        >
          📅 Appointments Queue ({bookings.length})
        </button>
        <button
          onClick={() => { setActiveTab('services'); }}
          className={`pb-4 px-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 cursor-pointer ${
            activeTab === 'services'
              ? 'border-rose-500 text-rose-600 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-charcoal'
          }`}
        >
          💅 Services Menu ({services.length})
        </button>
        <button
          onClick={() => { setActiveTab('reviews'); resetServiceForm(); }}
          className={`pb-4 px-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-rose-500 text-rose-600 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-charcoal'
          }`}
        >
          ⭐ Reviews Moderation ({reviews.length})
        </button>
        <button
          onClick={() => { setActiveTab('settings'); resetServiceForm(); }}
          className={`pb-4 px-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'border-rose-500 text-rose-600 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-charcoal'
          }`}
        >
          ⚙️ Salon Profile
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        
        {/* PANEL 1: APPOINTMENTS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            
            {/* Filter and Search Bar controls */}
            <div className="bg-white border border-rose-100/50 p-4 sm:p-5 rounded-xs shadow-3xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Real-time search */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by client name, phone, booking ID, or service..."
                    className="w-full pl-9 pr-4 py-2 bg-rose-50/20 border border-rose-100/80 rounded-xs text-xs focus:outline-none focus:border-rose-400 focus:bg-white text-charcoal font-light transition-all"
                  />
                </div>

                {/* Filters, sorting and export actions */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Status filter dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e: any) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      className="px-3 py-1.5 bg-white border border-rose-100 rounded-xs text-xs cursor-pointer text-charcoal font-light"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending Review</option>
                      <option value="confirmed">Confirmed Only</option>
                      <option value="completed">Completed Only</option>
                      <option value="cancelled">Cancelled Only</option>
                    </select>
                  </div>

                  {/* Date sorting */}
                  <button
                    onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="px-3 py-1.5 bg-white border border-rose-100 hover:border-rose-300 text-charcoal rounded-xs text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title={`Sort Date: ${sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-light">Date: {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                  </button>

                  {/* Export CSV */}
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-1.5 bg-charcoal hover:bg-rose-500 hover:text-white text-sand-100 rounded-xs text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-3xs"
                    title="Export filtered records to CSV spreadsheet"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wider font-semibold text-[10px]">Export CSV</span>
                  </button>

                </div>
              </div>

              {/* Status breakdown helper summary pills */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-rose-50/50">
                <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400 py-1">Quick Filters:</span>
                {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => { setStatusFilter(filter); setCurrentPage(1); }}
                    className={`px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider rounded-full transition-all cursor-pointer ${
                      statusFilter === filter 
                        ? 'bg-rose-500 text-white font-extrabold shadow-3xs' 
                        : 'bg-rose-50/30 text-gray-500 border border-rose-100/30 hover:border-rose-300'
                    }`}
                  >
                    {filter} ({filter === 'all' ? totalBookings : 
                              filter === 'pending' ? pendingBookings : 
                              filter === 'confirmed' ? confirmedBookings : 
                              filter === 'completed' ? completedBookings : cancelledBookings})
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Queue Grid */}
            <div className="space-y-4">
              {paginatedBookings.length === 0 ? (
                <div className="bg-white border border-dashed border-rose-100 rounded-sm py-20 text-center shadow-3xs">
                  <Calendar className="w-12 h-12 text-rose-200 mx-auto mb-3" />
                  <h4 className="title-font text-lg text-charcoal font-medium">No Appointments Found</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto font-light leading-relaxed mt-1">
                    No beauty parlour treatment logs match your search term or status criteria. Try clearing search filters.
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                      className="mt-4 px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] uppercase tracking-wider font-bold rounded-xs cursor-pointer"
                    >
                      Clear Search & Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="admin-bookings-grid">
                  {paginatedBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className={`bg-white border p-6 shadow-3xs hover:shadow-2xs transition-all duration-300 relative rounded-sm flex flex-col justify-between ${
                        booking.status === 'confirmed' ? 'border-l-4 border-l-blue-500 border-rose-100/50' :
                        booking.status === 'completed' ? 'border-l-4 border-l-green-500 border-rose-100/50' :
                        booking.status === 'cancelled' ? 'border-l-4 border-l-red-400 border-rose-100/50' :
                        'border-l-4 border-l-amber-400 border-rose-100/50'
                      }`}
                    >
                      <div>
                        {/* Upper Header info */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif text-charcoal font-medium text-base">
                                {booking.customerName}
                              </span>
                              <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full ${
                                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800 animate-pulse'
                              }`}>
                                {booking.status === 'pending' ? 'Pending Review' : booking.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                              <span className="text-rose-600 font-semibold">
                                💅 {booking.serviceName}
                              </span>
                              <span>•</span>
                              <span className="font-mono text-charcoal font-semibold">₹{booking.price}</span>
                            </div>
                          </div>
                          
                          <div className="text-left sm:text-right">
                            <span className="text-[9px] text-gray-400 font-mono block">
                              ID: {booking.id}
                            </span>
                            <span className="text-[9px] text-gray-400 block">
                              Booked: {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info Box */}
                        <div className="bg-rose-50/20 p-3.5 border border-rose-100/25 flex flex-col gap-2 text-xs text-gray-600 rounded-xs mb-4">
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                              Date: <strong className="text-charcoal font-medium">{booking.date}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                              Slot: <strong className="text-charcoal font-medium">{booking.time}</strong>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5 border-t border-rose-100/10">
                            <a href={`tel:${booking.customerPhone}`} className="flex items-center gap-1 hover:text-rose-600 hover:underline">
                              <Phone className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                              Phone: <strong className="text-charcoal font-medium">{booking.customerPhone}</strong>
                            </a>
                            {booking.customerEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                                Email: <strong className="text-charcoal font-medium">{booking.customerEmail}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Client Notes */}
                        {booking.notes && (
                          <p className="text-xs text-gray-400 italic mb-4 p-2 bg-gray-50 border border-gray-100 rounded-xs leading-relaxed">
                            Client Notes: "{booking.notes}"
                          </p>
                        )}
                      </div>

                      {/* Interactive Controls & Status updates */}
                      <div className="flex flex-wrap gap-2 justify-between items-center pt-3 border-t border-rose-100/30 mt-2">
                        
                        {/* Edit and Delete Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(booking)}
                            className="p-1.5 border border-rose-100 hover:border-rose-400 hover:bg-rose-50 text-rose-500 rounded-xs cursor-pointer transition-all"
                            title="Edit booking parameters"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you absolutely sure you want to delete Booking ID: ${booking.id} permanently? This deletes it from the secure database.`)) {
                                onDeleteBooking(booking.id);
                              }
                            }}
                            className="p-1.5 border border-red-100 hover:border-red-400 hover:bg-red-50 text-red-500 rounded-xs cursor-pointer transition-all"
                            title="Delete booking completely"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Status Change quick actions */}
                        <div className="flex gap-1.5">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                                className="px-2.5 py-1.5 border border-red-100 text-red-600 hover:bg-red-50 text-[9px] uppercase font-bold tracking-wider rounded-xs cursor-pointer flex items-center gap-0.5"
                              >
                                <X className="w-3 h-3" /> Cancel
                              </button>
                              <button
                                onClick={() => onUpdateBookingStatus(booking.id, 'confirmed')}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] uppercase font-bold tracking-wider rounded-xs cursor-pointer flex items-center gap-0.5"
                              >
                                <Check className="w-3 h-3" /> Confirm
                              </button>
                            </>
                          )}

                          {booking.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[9px] uppercase font-bold rounded-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => onUpdateBookingStatus(booking.id, 'completed')}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-[9px] uppercase font-bold rounded-xs cursor-pointer flex items-center gap-0.5"
                              >
                                <CheckCircle className="w-3 h-3" /> Mark Completed
                              </button>
                            </>
                          )}

                          {booking.status === 'completed' && (
                            <span className="text-[10px] text-green-700 font-extrabold uppercase tracking-wider flex items-center gap-1 pr-1 bg-green-50 px-2 py-1 rounded-xs">
                              ✓ Completed
                            </span>
                          )}

                          {booking.status === 'cancelled' && (
                            <button
                              onClick={() => onUpdateBookingStatus(booking.id, 'confirmed')}
                              className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[9px] uppercase font-bold rounded-xs cursor-pointer"
                            >
                              Re-Confirm Slot
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-rose-100/30 pt-6 mt-4">
                <p className="text-xs text-gray-500 font-light">
                  Showing <strong className="font-semibold text-charcoal">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="font-semibold text-charcoal">{Math.min(currentPage * itemsPerPage, filteredAndSortedBookings.length)}</strong> of <strong className="font-semibold text-charcoal">{filteredAndSortedBookings.length}</strong> matching appointments
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-2 border border-rose-100 hover:border-rose-300 disabled:opacity-30 disabled:pointer-events-none text-charcoal rounded-xs cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 rounded-xs text-xs font-bold transition-all cursor-pointer ${
                        currentPage === idx + 1 
                          ? 'bg-rose-500 text-white shadow-3xs' 
                          : 'bg-white text-gray-600 border border-rose-100 hover:border-rose-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-2 border border-rose-100 hover:border-rose-300 disabled:opacity-30 disabled:pointer-events-none text-charcoal rounded-xs cursor-pointer transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* PANEL 2: SERVICES MENU MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100/30 pb-3 gap-3">
              <div>
                <h3 className="title-font text-xl text-charcoal font-medium">
                  Dynamic Service Catalog Builder
                </h3>
                <p className="text-xs text-gray-500 font-light mt-0.5">
                  Changes to this menu appear immediately on the customer booking portal with no code changes.
                </p>
              </div>

              {!isFormOpen && (
                <button
                  onClick={() => { resetServiceForm(); setIsFormOpen(true); }}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Add New Service
                </button>
              )}
            </div>

            {/* Inline add/edit Form */}
            {isFormOpen && (
              <div className="bg-rose-50/20 border border-rose-100 p-6 rounded-sm max-w-3xl mx-auto shadow-3xs animate-fade-in relative">
                <button 
                  onClick={resetServiceForm} 
                  className="absolute top-4 right-4 text-gray-400 hover:text-rose-500"
                >
                  <X className="w-4 h-4" />
                </button>

                <h4 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
                  {editingServiceId ? 'Edit Beauty Treatment Details' : 'Design New Beauty Treatment'}
                </h4>

                <form onSubmit={handleServiceFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                        Service Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="e.g. Luxury Chocolate Spa"
                        className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                        Category *
                      </label>
                      <select
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        placeholder="e.g. 500"
                        min="0"
                        className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                        Duration *
                      </label>
                      <input
                        type="text"
                        required
                        value={serviceDuration}
                        onChange={(e) => setServiceDuration(e.target.value)}
                        placeholder="e.g. 45 mins"
                        className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                      Service Image URL
                    </label>
                    <input
                      type="url"
                      value={serviceImage}
                      onChange={(e) => setServiceImage(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/... or blank for preset icon image"
                      className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs"
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Provide any Unsplash direct photo URL for a custom gorgeous banner presentation.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                      Description
                    </label>
                    <textarea
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                      placeholder="e.g. Deep facial massage using high-end elements for maximum skin rejuvenation."
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="serviceIsActive"
                      checked={serviceIsActive}
                      onChange={(e) => setServiceIsActive(e.target.checked)}
                      className="w-4 h-4 text-rose-500 border-rose-200 focus:ring-rose-400 rounded-xs cursor-pointer"
                    />
                    <label htmlFor="serviceIsActive" className="text-xs text-charcoal font-medium cursor-pointer">
                      Activate immediately (Show to customers on beauty menu catalog)
                    </label>
                  </div>

                  {formSuccessMessage && (
                    <div className="text-xs text-green-700 bg-green-50 p-2.5 rounded-xs border border-green-100 font-bold">
                      {formSuccessMessage}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetServiceForm}
                      className="px-4 py-2 border border-gray-200 text-gray-500 text-xs font-bold uppercase rounded-xs cursor-pointer hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Treatment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of existing services with image previews and toggles */}
            <div className="overflow-hidden border border-rose-100/50 rounded-sm bg-white shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-rose-50/40 text-[10px] uppercase tracking-wider text-rose-500 font-bold border-b border-rose-100">
                      <th className="py-3.5 px-4 w-16">Preview</th>
                      <th className="py-3.5 px-4">Service Details</th>
                      <th className="py-3.5 px-4 w-32">Category</th>
                      <th className="py-3.5 px-4 w-28 text-right">Price</th>
                      <th className="py-3.5 px-4 w-28 text-center">Status</th>
                      <th className="py-3.5 px-4 w-36 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/30 text-xs">
                    {services.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                          No services found in database. Add a new one above.
                        </td>
                      </tr>
                    ) : (
                      services.map((service) => (
                        <tr key={service.id} className="hover:bg-rose-50/10 transition-colors">
                          <td className="py-3 px-4">
                            <img 
                              src={service.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=100'} 
                              alt={service.name} 
                              className="w-10 h-10 object-cover rounded-md border border-rose-100"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-charcoal block text-sm">{service.name}</span>
                            <span className="text-gray-400 font-light text-[10px] block mt-0.5 line-clamp-1">{service.description || 'No description provided.'}</span>
                            <span className="text-gray-400 text-[10px] font-mono mt-0.5 block">⏳ {service.duration}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-semibold text-[9px] border border-rose-100/50 uppercase">
                              {service.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-charcoal">
                            ₹{service.price}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onUpdateService(service.id, { isActive: service.isActive === false })}
                              className={`px-2 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest cursor-pointer flex items-center gap-1 mx-auto transition-all ${
                                service.isActive !== false
                                  ? 'bg-green-50 border border-green-200 text-green-700'
                                  : 'bg-red-50 border border-red-200 text-red-600'
                              }`}
                              title={service.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
                            >
                              {service.isActive !== false ? (
                                <>
                                  <Eye className="w-3 h-3" /> Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" /> Hidden
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleEditServiceClick(service)}
                                className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xs cursor-pointer"
                                title="Edit service parameters"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to permanently delete "${service.name}"?`)) {
                                    onDeleteService(service.id);
                                  }
                                }}
                                className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xs cursor-pointer"
                                title="Delete service permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* PANEL 3: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100/30 pb-3 gap-3">
              <div>
                <h3 className="title-font text-xl text-charcoal font-medium">
                  Guest Reviews Moderation
                </h3>
                <p className="text-xs text-gray-500 font-light mt-0.5">
                  Approved reviews with a valid active status display instantly in the testimonial sections of the home page.
                </p>
              </div>

              {/* Filters */}
              <div className="flex bg-rose-50 p-1 gap-1 rounded-xs">
                {(['all', 'pending', 'approved'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setReviewFilter(filter)}
                    className={`px-3 py-1 text-[9px] uppercase font-bold tracking-wider rounded-xs transition-all duration-300 cursor-pointer ${
                      reviewFilter === filter 
                        ? 'bg-white text-rose-600 shadow-2xs font-extrabold' 
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
                <div className="md:col-span-2 bg-white border border-dashed border-rose-100 rounded-sm py-16 text-center">
                  <MessageSquare className="w-8 h-8 text-rose-200 mx-auto mb-3 animate-pulse" />
                  <p className="text-xs text-gray-400 italic font-light">No reviews match the selected filter.</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className={`bg-white border p-6 shadow-3xs hover:shadow-2xs transition-all duration-300 relative rounded-sm flex flex-col justify-between ${
                      review.approved 
                        ? 'border-l-4 border-l-green-500 border-rose-100/50' 
                        : 'border-l-4 border-l-amber-500 border-rose-100/50'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <span className="font-serif text-charcoal font-medium text-base block">
                            {review.customerName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Date: {review.date}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-xs tracking-wider ${
                            review.approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {review.approved ? 'Approved' : 'Pending'}
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
                      
                      <p className="text-xs sm:text-sm text-gray-600 font-light italic bg-rose-50/10 p-3 border border-rose-100/20 rounded-xs mb-4 leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t border-rose-100/30 mt-2">
                      <button
                        onClick={() => onDeleteReview(review.id)}
                        className="px-3 py-1.5 border border-red-100 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1 hover:scale-105 mr-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>

                      {review.approved ? (
                        <button
                          onClick={() => onToggleReviewApproval(review.id, false)}
                          className="px-3 py-1.5 border border-amber-200 text-amber-700 hover:bg-amber-50 text-[10px] font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1 hover:scale-105"
                        >
                          <X className="w-3.5 h-3.5" /> Hide from Home
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleReviewApproval(review.id, true)}
                          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1 shadow-xs hover:scale-105"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Review
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PANEL 4: SALON PROFILE CONFIG */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="border-b border-rose-100/30 pb-3">
              <h3 className="title-font text-xl text-charcoal font-medium">
                Salon Profile & Business Configuration
              </h3>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                Maintain contact credentials and metadata. Changes reflect globally across booking workflows and footer blocks.
              </p>
            </div>

            <div className="max-w-xl bg-white border border-rose-100 p-6 rounded-sm shadow-3xs">
              <form onSubmit={handleSettingsSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    Beauty Salon Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    WhatsApp Booking Hotline Number
                  </label>
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Customers booking appointments will receive a redirect template messaging this hotline.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    Salon Physical Address
                  </label>
                  <textarea
                    required
                    value={salonAddress}
                    onChange={(e) => setSalonAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs font-light"
                  />
                </div>

                {settingsSuccess && (
                  <div className="text-xs text-green-700 bg-green-50 p-2.5 rounded-xs border border-green-100 font-bold">
                    ✓ Salon Profile Configuration updated and saved globally!
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-charcoal text-white hover:bg-rose-500 text-xs font-bold uppercase tracking-widest rounded-xs cursor-pointer shadow-3xs flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-4 h-4" /> Save Brand Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* EDIT BOOKING MODAL */}
      {isEditModalOpen && editingBooking && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-sand-100 w-full max-w-lg rounded-xs shadow-xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-sand-100 flex justify-between items-center bg-sand-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-100 text-rose-600 rounded-xs">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="title-font text-sm font-bold uppercase tracking-wider text-charcoal">
                    Edit Appointment Parameters
                  </h3>
                  <span className="text-[9px] font-mono text-gray-400 block mt-0.5">Booking ID: {editingBooking.id}</span>
                </div>
              </div>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingBooking(null); }}
                className="text-gray-400 hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditModalSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs text-charcoal font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormPhone}
                    onChange={(e) => setEditFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormEmail}
                    onChange={(e) => setEditFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs font-light"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    Selected Service
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormServiceName}
                    onChange={(e) => setEditFormServiceName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormPrice}
                    onChange={(e) => setEditFormPrice(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs font-mono text-charcoal font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormDate}
                    onChange={(e) => setEditFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormTime}
                    onChange={(e) => setEditFormTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormStatus}
                    onChange={(e: any) => setEditFormStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs cursor-pointer text-charcoal"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                  Client Notes / Demands
                </label>
                <textarea
                  value={editFormNotes}
                  onChange={(e) => setEditFormNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-rose-100 focus:outline-none focus:border-rose-400 rounded-xs text-xs text-gray-600 font-light"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-rose-100/20">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingBooking(null); }}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold uppercase rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
