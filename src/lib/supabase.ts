import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email service using Supabase Edge Functions
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Database helpers
export const db = {
  // Schools
  getSchools: async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Students
  getStudents: async (schoolId?: string) => {
    let query = supabase
      .from('students')
      .select(`
        *,
        school:schools(name),
        bnpl_applications(*)
      `)
      .order('created_at', { ascending: false });
    
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // BNPL Applications
  getBNPLApplications: async (filters?: any) => {
    let query = supabase
      .from('bnpl_applications')
      .select(`
        *,
        student:students(*),
        school:schools(name)
      `)
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Payments
  getPayments: async (filters?: any) => {
    let query = supabase
      .from('payments')
      .select(`
        *,
        bnpl_application:bnpl_applications(
          *,
          student:students(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};