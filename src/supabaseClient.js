import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);  // Debugging
console.log("Supabase Key:", supabaseKey ? "Loaded" : "Not Loaded"); // Debugging

export const supabase = createClient(supabaseUrl, supabaseKey);