import { User, Booking, Review, Service, AdminSettings } from '../types';

// Default Services
const DEFAULT_SERVICES: Service[] = [
  {
    id: 's-threading',
    name: 'Threading',
    category: 'Threading',
    price: 30,
    duration: '10 mins',
    description: 'Precision threading hair removal for eyebrow shaping or full face glow.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    id: 's-fruit-facial',
    name: 'Fruit Facial',
    category: 'Facial',
    price: 1000,
    duration: '45 mins',
    description: 'Rich organic fruit extracts facial to bring back a natural, healthy glow.',
    image: 'https://images.unsplash.com/photo-1590156546746-c22221b33256?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    id: 's-bridal-facial',
    name: 'Bridal Brightening Facial',
    category: 'Facial',
    price: 2000,
    duration: '60 mins',
    description: 'Premium bridal brightening facial for an elite, radiant look.',
    image: 'https://images.unsplash.com/photo-1590156546746-c22221b33256?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    id: 's-v-cut',
    name: 'V Cut',
    category: 'Hair Cutting',
    price: 200,
    duration: '30 mins',
    description: 'Stylish V-cut hair style to add flair and layered bounce.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    id: 's-u-cut',
    name: 'U Cut',
    category: 'Hair Cutting',
    price: 70,
    duration: '25 mins',
    description: 'Elegant U-cut styling for natural volume and layering.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    id: 's-normal-cut',
    name: 'Normal Cut',
    category: 'Hair Cutting',
    price: 60,
    duration: '15 mins',
    description: 'Classic trim or basic hair cut to keep ends healthy and styled.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    id: 's-normal-spa',
    name: 'Normal Hair Spa',
    category: 'Hair Spa',
    price: 500,
    duration: '45 mins',
    description: 'Relaxing steam and cream hair spa for deeply hydrated follicles.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    id: 's-creatine-spa',
    name: 'Creatine Hair Spa',
    category: 'Hair Spa',
    price: 1500,
    duration: '60 mins',
    description: 'Advanced creatine hair therapy to repair deep damage and restore shine.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    id: 's-gold-facial',
    name: 'Gold Facial',
    category: 'Facial',
    price: 1200,
    duration: '60 mins',
    description: 'Luxury gold-dust treatment for instant brightening and deep skin nutrition.',
    image: 'https://images.unsplash.com/photo-1590156546746-c22221b33256?auto=format&fit=crop&q=80&w=400',
    isActive: true
  }
];

// Initial Users
const DEFAULT_USERS: User[] = [
  {
    id: 'u-admin',
    email: 'trisha123@gmail.com',
    passwordHash: 'Trisha@123',
    name: 'Trisha Day',
    role: 'admin',
    phone: '8132935520'
  },
  {
    id: 'u-staff',
    email: 'staff@trisha.com',
    passwordHash: 'staff123',
    name: 'Sarah Jenkins',
    role: 'staff',
    phone: '+1 (555) 014-9988'
  },
  {
    id: 'u-cust',
    email: 'customer@trisha.com',
    passwordHash: 'customer123',
    name: 'Emily Watson',
    role: 'customer',
    phone: '+1 (555) 012-3456'
  }
];

// Default Bookings
const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    customerId: 'u-cust',
    customerName: 'Emily Watson',
    customerEmail: 'customer@trisha.com',
    customerPhone: '+1 (555) 012-3456',
    serviceId: 's1',
    serviceName: "Woman's Cut & Style",
    date: '2026-07-15',
    time: '10:00 AM',
    status: 'confirmed',
    price: 60,
    notes: 'Likes the ends texturized.',
    createdAt: '2026-07-08T09:30:00Z'
  },
  {
    id: 'b2',
    customerId: 'u-cust2',
    customerName: 'Melissa Vance',
    customerEmail: 'melissa@example.com',
    customerPhone: '+1 (555) 033-4411',
    serviceId: 's5',
    serviceName: 'Balayage Hand-Paint',
    date: '2026-07-16',
    time: '02:00 PM',
    status: 'pending',
    price: 350,
    notes: 'Wants cool blonde tones.',
    createdAt: '2026-07-08T11:15:00Z'
  },
  {
    id: 'b3',
    customerId: 'u-cust3',
    customerName: 'Sienna Miller',
    customerEmail: 'sienna@example.com',
    customerPhone: '+1 (555) 044-8899',
    serviceId: 's3',
    serviceName: 'Global Colour',
    date: '2026-07-18',
    time: '11:30 AM',
    status: 'pending',
    price: 180,
    notes: 'Gloss treatment requested too.',
    createdAt: '2026-07-09T08:00:00Z'
  }
];

// Default Reviews
const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'r1',
    customerName: 'Emily Watson',
    rating: 5,
    comment: 'The team at Trisha Beauty Parlour is incredible! Sarah did an amazing job with my hair cut and styling. Will definitely return.',
    date: '2026-07-02',
    approved: true
  },
  {
    id: 'r2',
    customerName: 'Jessica Alba',
    rating: 5,
    comment: 'Absolute luxury service. The salon design is stunning and the coffee was premium. Balayage looks very natural.',
    date: '2026-07-05',
    approved: true
  },
  {
    id: 'r3',
    customerName: 'Laura Dern',
    rating: 4,
    comment: 'Very professional. The Keratin therapy really smoothened out my curls nicely. Clean and elegant studio.',
    date: '2026-07-07',
    approved: true
  },
  {
    id: 'r4',
    customerName: 'Sophia Taylor',
    rating: 5,
    comment: 'New review awaiting moderation! The makeup session was outstanding, exactly what I requested.',
    date: '2026-07-09',
    approved: false
  }
];

const DEFAULT_SETTINGS: AdminSettings = {
  adminMobileNumber: '8132935520',
  salonName: 'Trisha Beauty Parlour',
  salonAddress: '23 Jolaibari, Belonia Road Colony, Kalir Bazar, South Tripura District, Tripura, India.'
};

// LocalStorage helpers
export const storage = {
  getUsers(): User[] {
    const val = localStorage.getItem('meraki_users');
    if (!val) {
      localStorage.setItem('meraki_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      const users: User[] = JSON.parse(val);
      let changed = false;
      const updatedUsers = users.map(user => {
        if (user.role === 'admin') {
          if (user.email !== 'trisha123@gmail.com' || user.passwordHash !== 'Trisha@123' || user.name !== 'Trisha Day' || user.phone !== '8132935520') {
            user.email = 'trisha123@gmail.com';
            user.passwordHash = 'Trisha@123';
            user.name = 'Trisha Day';
            user.phone = '8132935520';
            changed = true;
          }
        }
        return user;
      });
      if (changed) {
        localStorage.setItem('meraki_users', JSON.stringify(updatedUsers));
        return updatedUsers;
      }
      return users;
    } catch (e) {
      localStorage.setItem('meraki_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
  },

  saveUsers(users: User[]) {
    localStorage.setItem('meraki_users', JSON.stringify(users));
  },

  getBookings(): Booking[] {
    const val = localStorage.getItem('meraki_bookings');
    if (!val) {
      localStorage.setItem('meraki_bookings', JSON.stringify(DEFAULT_BOOKINGS));
      return DEFAULT_BOOKINGS;
    }
    return JSON.parse(val);
  },

  saveBookings(bookings: Booking[]) {
    localStorage.setItem('meraki_bookings', JSON.stringify(bookings));
  },

  getReviews(): Review[] {
    const val = localStorage.getItem('meraki_reviews');
    if (!val) {
      localStorage.setItem('meraki_reviews', JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    return JSON.parse(val);
  },

  saveReviews(reviews: Review[]) {
    localStorage.setItem('meraki_reviews', JSON.stringify(reviews));
  },

  getSettings(): AdminSettings {
    const val = localStorage.getItem('meraki_settings');
    if (!val) {
      localStorage.setItem('meraki_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      const settings = JSON.parse(val);
      let changed = false;
      if (settings.adminMobileNumber === '+1 (555) 987-6543') {
        settings.adminMobileNumber = '8132935520';
        changed = true;
      }
      if (settings.salonName === 'MERAKI Hair Studio' || settings.salonName === 'Meraki Hair Studio') {
        settings.salonName = 'Trisha Beauty Parlour';
        changed = true;
      }
      if (settings.salonAddress === '124 Nelson Street, City Center') {
        settings.salonAddress = '23 Jolaibari, Belonia Road Colony, Kalir Bazar, South Tripura District, Tripura, India.';
        changed = true;
      }
      if (changed) {
        localStorage.setItem('meraki_settings', JSON.stringify(settings));
      }
      return settings;
    } catch (e) {
      localStorage.setItem('meraki_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AdminSettings) {
    localStorage.setItem('meraki_settings', JSON.stringify(settings));
  },

  getServices(): Service[] {
    const val = localStorage.getItem('meraki_services');
    if (!val) {
      localStorage.setItem('meraki_services', JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    try {
      return JSON.parse(val);
    } catch (e) {
      return DEFAULT_SERVICES;
    }
  },

  saveServices(services: Service[]) {
    localStorage.setItem('meraki_services', JSON.stringify(services));
  }
};
