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
