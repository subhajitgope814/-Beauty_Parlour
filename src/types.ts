export type UserRole = 'customer' | 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Simulated secure pass
  name: string;
  role: UserRole;
  phone?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  price: number;
  createdAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  approved: boolean; // Admin review system
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string; // e.g. "45 mins"
  description: string;
  image: string;
}

export interface AdminSettings {
  adminMobileNumber: string;
  salonName: string;
  salonAddress: string;
}
