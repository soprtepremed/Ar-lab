/* AR LAB - Supabase Initialization */

const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
// WARNING: This key is public. Ensure RLS policies are set correctly in Supabase.
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
