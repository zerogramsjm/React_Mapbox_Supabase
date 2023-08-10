import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://foqqudxikgdqubduwony.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcXF1ZHhpa2dkcXViZHV3b255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIzMTgzMDEsImV4cCI6MTk5Nzg5NDMwMX0.Onq4Q1EKgl95RB9SL8cqrxUlPDEVHLvofo40SXsgYDY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);