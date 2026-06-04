// supabaseClient.js
// Cliente global de Supabase para Proyecto MEMORIA.

const SUPABASE_URL = "https://mipzjnwtdaicowrfpctc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Ka4xaxYSGMM8TnMSN3za-A_VJTXltQY";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);