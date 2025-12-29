import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Plant {
  id: string;
  name: string;
  description: string;
  care_info: string;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  plant_id: string;
  plant_name: string;
  plant_price: number;
  quantity: number;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Delivered';
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
// --- TEMPORARY CONNECTION TEST ---
async function testConnection() {
  try {
    const { data, error } = await supabase.from('plants').select('*').limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully!');
      console.log('Fetched sample data:', data);
    }
  } catch (err) {
    console.error('❌ Error testing Supabase connection:', err);
  }
}

testConnection();
// --- END TEST ---