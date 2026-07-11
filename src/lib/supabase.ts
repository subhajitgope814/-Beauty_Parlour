import { createClient } from '@supabase/supabase-js';
import { Booking } from '../types';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://scmyauujzbzrlgwiebtm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3D0Baa7TBNlPHUJ9WBovvw_f1oVqHeI';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Saves a new booking into Supabase database 'bookings' table.
 * If the insert fails because the table doesn't exist or is not structured,
 * we handle the error gracefully while notifying via console.
 */
export async function saveBookingToSupabase(booking: Booking): Promise<{ success: boolean; error: any }> {
  try {
    // Standardize object for Supabase insertion (lowercase snake_case and camelCase options)
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
          created_at: booking.createdAt,
          // Support both snake_case and camelCase column formats in case the user's table is styled differently
          customerId: booking.customerId,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          serviceId: booking.serviceId,
          serviceName: booking.serviceName,
          createdAt: booking.createdAt,
        }
      ]);

    if (error) {
      console.error('Supabase error inserting into bookings:', error);
      return { success: false, error };
    }

    console.log('Successfully saved booking to Supabase:', booking.id);
    return { success: true, error: null };
  } catch (err) {
    console.error('Failed to communicate with Supabase:', err);
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
      console.error('Supabase error fetching bookings:', error);
      return [];
    }

    if (!data) return [];

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
    console.error('Failed to fetch bookings from Supabase:', err);
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
      console.error('Supabase error updating booking status:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update booking status in Supabase:', err);
    return false;
  }
}
