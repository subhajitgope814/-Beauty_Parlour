import { createClient } from '@supabase/supabase-js';
import { Booking } from '../types';

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
    // Standardize object for Supabase insertion using standard PostgreSQL snake_case column names
    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          id: booking.id,
          customer_id: booking.customerId,
          customer_name: booking.customerName,
          customer_email: booking.customerEmail,
          customer_phone: booking.customerPhone,
          service_id: booking.serviceId,
          service_name: booking.serviceName,
          date: booking.date,
          time: booking.time,
          status: booking.status,
          notes: booking.notes || '',
          price: booking.price,
          created_at: booking.createdAt
        }
      ]);

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
 * Fetches all bookings from Supabase.
 */
export async function fetchBookingsFromSupabase(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*');

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
      customerId: row.customer_id || row.customerId || '',
      customerName: row.customer_name || row.customerName || '',
      customerEmail: row.customer_email || row.customerEmail || '',
      customerPhone: row.customer_phone || row.customerPhone || '',
      serviceId: row.service_id || row.serviceId || '',
      serviceName: row.service_name || row.serviceName || '',
      date: row.date || '',
      time: row.time || '',
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
export async function updateBookingStatusInSupabase(bookingId: string, status: 'confirmed' | 'cancelled'): Promise<boolean> {
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
