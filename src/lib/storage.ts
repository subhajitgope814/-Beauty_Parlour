import { User, Booking, Review, Service, AdminSettings } from '../types';

// Default Services
const DEFAULT_SERVICES: Service[] = [
  // Threading
  {
    id: 's-thread-1',
    name: 'Eyebrow Threading',
    category: 'Threading',
    price: 50,
    duration: '10 mins',
    description: 'Perfectly shaped and balanced eyebrows using professional threading techniques.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-thread-2',
    name: 'Upper Lip Threading',
    category: 'Threading',
    price: 40,
    duration: '5 mins',
    description: 'Gentle hair removal for a flawless and clean upper lip area.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-thread-3',
    name: 'Forehead Threading',
    category: 'Threading',
    price: 50,
    duration: '10 mins',
    description: 'Smooth and clean forehead threading hair removal.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-thread-4',
    name: 'Chin Threading',
    category: 'Threading',
    price: 50,
    duration: '10 mins',
    description: 'Quick and neat hair removal for the chin area.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-thread-5',
    name: 'Full Face Threading',
    category: 'Threading',
    price: 300,
    duration: '30 mins',
    description: 'Complete facial threading service for full face glow and cleanliness.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
  },

  // Waxing
  {
    id: 's-wax-1',
    name: 'Underarm Waxing',
    category: 'Waxing',
    price: 150,
    duration: '15 mins',
    description: 'Smooth and long-lasting hair removal for underarms.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-wax-2',
    name: 'Half Hand Waxing',
    category: 'Waxing',
    price: 300,
    duration: '20 mins',
    description: 'Premium wax application for smooth hands up to elbows.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-wax-3',
    name: 'Full Hand Waxing',
    category: 'Waxing',
    price: 500,
    duration: '35 mins',
    description: 'Complete hand waxing service for silky and glowing skin.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-wax-4',
    name: 'Half Leg Waxing',
    category: 'Waxing',
    price: 400,
    duration: '25 mins',
    description: 'Quick leg wax covering lower legs to knees.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-wax-5',
    name: 'Full Leg Waxing',
    category: 'Waxing',
    price: 700,
    duration: '45 mins',
    description: 'Full leg waxing using hydrating natural waxes.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-wax-6',
    name: 'Full Body Waxing',
    category: 'Waxing',
    price: 2500,
    duration: '120 mins',
    description: 'Comprehensive luxury full body waxing therapy.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400'
  },

  // Facial
  {
    id: 's-face-1',
    name: 'Cleanup',
    category: 'Facial',
    price: 500,
    duration: '30 mins',
    description: 'Quick cleansing, exfoliation, blackhead removal, and nourishing face pack.',
    image: 'https://images.unsplash.com/photo-1590156546746-c22221b33256?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-face-2',
    name: 'Fruit Facial',
    category: 'Facial',
    price: 800,
    duration: '45 mins',
    description: 'Rich organic fruit extracts facial to bring back a natural, healthy glow.',
    image: 'https://images.unsplash.com/photo-1590156546746-c22221b33256?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-face-3',
    name: 'Gold Facial',
    category: 'Facial',
    price: 1500,
    duration: '60 mins',
    description: 'Luxury gold dust treatment for bridal glow, skin brightening, and elasticity.',
    image: 'https://images.unsplash.com/photo-1590156546746-c22221b33256?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-face-4',
    name: 'Diamond Facial',
    category: 'Facial',
    price: 2000,
    duration: '60 mins',
    description: 'Premium diamond serum facial for instant skin polishing and wrinkle defense.',
    image: 'https://images.unsplash.com/photo-1590156546746-c22221b33256?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-face-5',
    name: 'Hydra Facial',
    category: 'Facial',
    price: 4500,
    duration: '75 mins',
    description: 'Advanced medical-grade hydration facial utilizing deep extraction and rich serum infusion.',
    image: 'https://images.unsplash.com/photo-1590156546746-c22221b33256?auto=format&fit=crop&q=80&w=400'
  },

  // Hair
  {
    id: 's-hair-1',
    name: 'Hair Cut',
    category: 'Hair',
    price: 400,
    duration: '40 mins',
    description: 'Bespoke custom haircuts tailored to suit your dynamic face shape.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-hair-2',
    name: 'Hair Wash',
    category: 'Hair',
    price: 200,
    duration: '15 mins',
    description: 'Relaxing scalp wash using prestige clinical shampoo and nourishing conditioner.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-hair-3',
    name: 'Blow Dry',
    category: 'Hair',
    price: 400,
    duration: '30 mins',
    description: 'Voluminous bouncy style blowout that maintains shine all day long.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-hair-4',
    name: 'Hair Spa',
    category: 'Hair',
    price: 1200,
    duration: '60 mins',
    description: 'Deep nourishing steam and herbal cream massage spa to repair dry, damaged follicles.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-hair-5',
    name: 'Hair Color',
    category: 'Hair',
    price: 2500,
    duration: '120 mins',
    description: 'Rich global color or high-definition balayage highlights.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-hair-6',
    name: 'Smoothening',
    category: 'Hair',
    price: 7000,
    duration: '180 mins',
    description: 'Semi-permanent hair smoothing treatment for frizz-free straight tresses.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-hair-7',
    name: 'Rebonding',
    category: 'Hair',
    price: 8000,
    duration: '210 mins',
    description: 'Intense chemical rebonding to achieve super straight, glass-like hair.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-hair-8',
    name: 'Keratin Treatment',
    category: 'Hair',
    price: 9000,
    duration: '150 mins',
    description: 'Protein infusion to restore hair bonds, soften curls, and maximize shine.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-hair-9',
    name: 'Botox Treatment',
    category: 'Hair',
    price: 12000,
    duration: '150 mins',
    description: 'Advanced anti-aging deep reconstruction hair therapy for ultimate softness and bounce.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=400'
  },

  // Makeup
  {
    id: 's-make-1',
    name: 'Party Makeup',
    category: 'Makeup',
    price: 3000,
    duration: '60 mins',
    description: 'Glowy HD makeup, false lashes, and customized styling for any celebrations.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-make-2',
    name: 'Bridal Makeup',
    category: 'Makeup',
    price: 18000,
    duration: '180 mins',
    description: 'Ultimate signature airbrush or HD bridal makeup package including draping and hair.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=400'
  },

  // Nail Care
  {
    id: 's-nail-1',
    name: 'Manicure',
    category: 'Nail Care',
    price: 600,
    duration: '35 mins',
    description: 'Relaxing hand massage, cuticle care, shaping, and premium polish application.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-nail-2',
    name: 'Pedicure',
    category: 'Nail Care',
    price: 800,
    duration: '45 mins',
    description: 'Relaxing warm water feet spa, scrub exfoliation, massage, and nail care.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-nail-3',
    name: 'Gel Polish',
    category: 'Nail Care',
    price: 1000,
    duration: '30 mins',
    description: 'Long lasting high-gloss chip-resistant UV gel polish.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-nail-4',
    name: 'Nail Extension',
    category: 'Nail Care',
    price: 3000,
    duration: '90 mins',
    description: 'Premium acrylic or gel nail extensions with beautiful custom art.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400'
  },

  // Skin Care
  {
    id: 's-skin-1',
    name: 'De-Tan',
    category: 'Skin Care',
    price: 600,
    duration: '30 mins',
    description: 'Quick tan removal pack to instantly brighten sun-exposed skin.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-skin-2',
    name: 'Bleach',
    category: 'Skin Care',
    price: 400,
    duration: '20 mins',
    description: 'Herbal or gold facial bleach for immediate radiance and golden tint.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-skin-3',
    name: 'Body Polishing',
    category: 'Skin Care',
    price: 3000,
    duration: '90 mins',
    description: 'Luxurious whole body scrub exfoliation, massage oil, and glow-cream pack.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400'
  },

  // Mehendi
  {
    id: 's-meh-1',
    name: 'Hand Mehendi',
    category: 'Mehendi',
    price: 800,
    duration: '45 mins',
    description: 'Beautiful traditional or arabic hand mehendi application.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-meh-2',
    name: 'Bridal Mehendi',
    category: 'Mehendi',
    price: 5000,
    duration: '240 mins',
    description: 'Intricate custom premium bridal mehendi covering full hands and legs.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400'
  },

  // Massage
  {
    id: 's-massage-1',
    name: 'Head Massage',
    category: 'Massage',
    price: 500,
    duration: '30 mins',
    description: 'Calming hot oil head massage to relieve tension and stress.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's-massage-2',
    name: 'Body Massage',
    category: 'Massage',
    price: 2000,
    duration: '60 mins',
    description: 'Rejuvenating full body deep tissue massage with natural wellness oils.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400'
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
  salonAddress: '124 Nelson Street, City Center'
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
    return DEFAULT_SERVICES; // Static for service definitions, editable if needed
  }
};
