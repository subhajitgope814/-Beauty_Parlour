import { createClient } from '@supabase/supabase-js';
import { Booking, Review, Service } from '../types';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jnhcswiajmdoxdhgfjvd.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bWgm4nmXD-Nj1KKrVrhDCw_U2xzXcZz';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global Error Tracking & Subscription
export let lastSupabaseError: any = null;
let errorListeners: ((err: any) => void)[] = [];

export function subscribeToSupabaseErrors(listener: (err: any) => void) {
  errorListeners.push(listener);
  if (lastSupabaseError) {
    listener(lastSupabaseError);
  }
  return () => {
    errorListeners = errorListeners.filter(l => l !== listener);
  };
}

export function clearSupabaseError() {
  lastSupabaseError = null;
  errorListeners.forEach(l => l(null));
}

function setLastSupabaseError(err: any) {
  lastSupabaseError = err;
  errorListeners.forEach(l => l(err));
}

/**
 * Saves a new booking into Supabase database 'bookings' table.
 * If the insert fails because the table doesn't exist or is not structured,
 * we handle the error gracefully while notifying via console.
 */
export async function saveBookingToSupabase(booking: Booking): Promise<{ success: boolean; error: any }> {
  try {
    // Standardize object for Supabase insertion using standard PostgreSQL snake_case column names.
    // We insert BOTH the new columns (user_id, booking_date, booking_time) and legacy ones for total fallback safety.
    const payload: any = {
      id: booking.id,
      user_id: booking.customerId, // Map to auth.uid()
      customer_id: booking.customerId,
      customer_name: booking.customerName,
      customer_email: booking.customerEmail,
      customer_phone: booking.customerPhone,
      service_id: booking.serviceId,
      service_name: booking.serviceName,
      booking_date: booking.date, // Map to booking_date
      booking_time: booking.time, // Map to booking_time
      date: booking.date,
      time: booking.time,
      status: booking.status,
      notes: booking.notes || '',
      price: booking.price,
      created_at: booking.createdAt
    };

    const { error } = await supabase
      .from('bookings')
      .insert([payload]);

    if (error) {
      console.warn('Supabase message inserting into bookings:', error);
      setLastSupabaseError(error);
      return { success: false, error };
    }

    console.log('Successfully saved booking to Supabase:', booking.id);
    // Clear any previous error on successful operation
    clearSupabaseError();
    return { success: true, error: null };
  } catch (err) {
    console.warn('Failed to communicate with Supabase:', err);
    setLastSupabaseError(err);
    return { success: false, error: err };
  }
}

/**
 * Fetches bookings from Supabase, scoped by userId if not admin.
 */
export async function fetchBookingsFromSupabase(userId?: string, isAdmin?: boolean): Promise<Booking[]> {
  try {
    let query = supabase.from('bookings').select('*');

    // Filter by user_id if they are a customer to implement multi-layered security
    if (userId && !isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase message fetching bookings:', error);
      setLastSupabaseError(error);
      return [];
    }

    if (!data) return [];

    // Clear any previous error on successful operation
    clearSupabaseError();

    return data.map((row: any) => ({
      id: row.id,
      customerId: row.user_id || row.customer_id || row.customerId || '',
      customerName: row.customer_name || row.customerName || '',
      customerEmail: row.customer_email || row.customerEmail || '',
      customerPhone: row.customer_phone || row.customerPhone || '',
      serviceId: row.service_id || row.serviceId || '',
      serviceName: row.service_name || row.serviceName || '',
      date: row.booking_date || row.date || row.bookingDate || '',
      time: row.booking_time || row.time || row.bookingTime || '',
      status: row.status || 'pending',
      notes: row.notes || '',
      price: typeof row.price === 'number' ? row.price : parseFloat(row.price || 0),
      createdAt: row.created_at || row.createdAt || new Date().toISOString()
    }));
  } catch (err) {
    console.warn('Failed to fetch bookings from Supabase:', err);
    setLastSupabaseError(err);
    return [];
  }
}

/**
 * Updates a booking status in Supabase.
 */
export async function updateBookingStatusInSupabase(bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.warn('Supabase message updating booking status:', error);
      setLastSupabaseError(error);
      return false;
    }
    
    // Clear any previous error on successful operation
    clearSupabaseError();
    return true;
  } catch (err) {
    console.warn('Failed to update booking status in Supabase:', err);
    setLastSupabaseError(err);
    return false;
  }
}

/**
 * Updates an entire booking's details in Supabase.
 */
export async function updateBookingInSupabase(bookingId: string, updatedFields: Partial<Booking>): Promise<boolean> {
  try {
    const payload: any = {};
    if (updatedFields.customerName !== undefined) payload.customer_name = updatedFields.customerName;
    if (updatedFields.customerPhone !== undefined) payload.customer_phone = updatedFields.customerPhone;
    if (updatedFields.customerEmail !== undefined) payload.customer_email = updatedFields.customerEmail;
    if (updatedFields.serviceName !== undefined) payload.service_name = updatedFields.serviceName;
    if (updatedFields.serviceId !== undefined) payload.service_id = updatedFields.serviceId;
    if (updatedFields.date !== undefined) {
      payload.booking_date = updatedFields.date;
      payload.date = updatedFields.date;
    }
    if (updatedFields.time !== undefined) {
      payload.booking_time = updatedFields.time;
      payload.time = updatedFields.time;
    }
    if (updatedFields.price !== undefined) payload.price = updatedFields.price;
    if (updatedFields.notes !== undefined) payload.notes = updatedFields.notes;
    if (updatedFields.status !== undefined) payload.status = updatedFields.status;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('bookings')
      .update(payload)
      .eq('id', bookingId);

    if (error) {
      console.warn('Supabase message updating booking:', error);
      setLastSupabaseError(error);
      return false;
    }

    clearSupabaseError();
    return true;
  } catch (err) {
    console.warn('Failed to update booking in Supabase:', err);
    setLastSupabaseError(err);
    return false;
  }
}

/**
 * Deletes a booking from Supabase.
 */
export async function deleteBookingFromSupabase(bookingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.warn('Supabase message deleting booking:', error);
      setLastSupabaseError(error);
      return false;
    }

    clearSupabaseError();
    return true;
  } catch (err) {
    console.warn('Failed to delete booking from Supabase:', err);
    setLastSupabaseError(err);
    return false;
  }
}

/**
 * Saves a new review into Supabase 'reviews' table.
 */
export async function saveReviewToSupabase(review: Review): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          id: review.id,
          customer_name: review.customerName,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          approved: review.approved
        }
      ]);

    if (error) {
      console.warn('Supabase message inserting into reviews:', error);
      setLastSupabaseError(error);
      return { success: false, error };
    }

    console.log('Successfully saved review to Supabase:', review.id);
    clearSupabaseError();
    return { success: true, error: null };
  } catch (err) {
    console.warn('Failed to communicate with Supabase for review:', err);
    setLastSupabaseError(err);
    return { success: false, error: err };
  }
}

/**
 * Fetches all reviews from Supabase.
 */
export async function fetchReviewsFromSupabase(): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase message fetching reviews:', error);
      setLastSupabaseError(error);
      return [];
    }

    if (!data) return [];

    clearSupabaseError();

    return data.map((row: any) => ({
      id: row.id,
      customerName: row.customer_name || row.customerName || '',
      rating: typeof row.rating === 'number' ? row.rating : parseInt(row.rating || 5),
      comment: row.comment || '',
      date: row.date || '',
      approved: row.approved !== undefined ? row.approved : true
    }));
  } catch (err) {
    console.warn('Failed to fetch reviews from Supabase:', err);
    setLastSupabaseError(err);
    return [];
  }
}

/**
 * Updates a review's approval status in Supabase.
 */
export async function updateReviewApprovalInSupabase(reviewId: string, approved: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ approved })
      .eq('id', reviewId);

    if (error) {
      console.warn('Supabase message updating review approval status:', error);
      setLastSupabaseError(error);
      return false;
    }

    clearSupabaseError();
    return true;
  } catch (err) {
    console.warn('Failed to update review approval in Supabase:', err);
    setLastSupabaseError(err);
    return false;
  }
}

/**
 * Deletes a review from Supabase.
 */
export async function deleteReviewFromSupabase(reviewId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.warn('Supabase message deleting review:', error);
      setLastSupabaseError(error);
      return false;
    }

    clearSupabaseError();
    return true;
  } catch (err) {
    console.warn('Failed to delete review from Supabase:', err);
    setLastSupabaseError(err);
    return false;
  }
}

/**
 * Fetches all services from Supabase.
 */
export async function fetchServicesFromSupabase(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase message fetching services:', error);
      setLastSupabaseError(error);
      return [];
    }

    if (!data) return [];

    clearSupabaseError();

    return data.map((row: any) => ({
      id: row.id,
      name: row.name || '',
      category: row.category || '',
      description: row.description || '',
      price: typeof row.price === 'number' ? row.price : parseFloat(row.price || 0),
      duration: row.duration || '',
      image: row.image_url || row.image || '',
      isActive: row.is_active !== undefined ? row.is_active : true
    }));
  } catch (err) {
    console.warn('Failed to fetch services from Supabase:', err);
    setLastSupabaseError(err);
    return [];
  }
}

/**
 * Saves a new service into Supabase.
 */
export async function saveServiceToSupabase(service: Service): Promise<{ success: boolean; error: any }> {
  try {
    const payload: any = {
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image_url: service.image || '',
      is_active: service.isActive !== undefined ? service.isActive : true
    };

    // Standard UUID check
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(service.id);
    if (isUuid) {
      payload.id = service.id;
    }

    const { error } = await supabase
      .from('services')
      .insert([payload]);

    if (error) {
      console.warn('Supabase message inserting service:', error);
      setLastSupabaseError(error);
      return { success: false, error };
    }

    console.log('Successfully saved service to Supabase');
    clearSupabaseError();
    return { success: true, error: null };
  } catch (err) {
    console.warn('Failed to save service to Supabase:', err);
    setLastSupabaseError(err);
    return { success: false, error: err };
  }
}

/**
 * Updates an existing service in Supabase.
 */
export async function updateServiceInSupabase(serviceId: string, service: Partial<Service>): Promise<boolean> {
  try {
    const payload: any = {};
    if (service.name !== undefined) payload.name = service.name;
    if (service.category !== undefined) payload.category = service.category;
    if (service.description !== undefined) payload.description = service.description;
    if (service.price !== undefined) payload.price = service.price;
    if (service.duration !== undefined) payload.duration = service.duration;
    if (service.image !== undefined) payload.image_url = service.image;
    if (service.isActive !== undefined) payload.is_active = service.isActive;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', serviceId);

    if (error) {
      console.warn('Supabase message updating service:', error);
      setLastSupabaseError(error);
      return false;
    }

    clearSupabaseError();
    return true;
  } catch (err) {
    console.warn('Failed to update service in Supabase:', err);
    setLastSupabaseError(err);
    return false;
  }
}

/**
 * Deletes a service from Supabase.
 */
export async function deleteServiceFromSupabase(serviceId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      console.warn('Supabase message deleting service:', error);
      setLastSupabaseError(error);
      return false;
    }

    clearSupabaseError();
    return true;
  } catch (err) {
    console.warn('Failed to delete service from Supabase:', err);
    setLastSupabaseError(err);
    return false;
  }
}

