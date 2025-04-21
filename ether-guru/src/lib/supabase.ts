import { createBrowserClient } from '@supabase/ssr'  

export function createClient() {  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||  
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {  
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_* env vars')  
  }  

  return createBrowserClient(  
    process.env.NEXT_PUBLIC_SUPABASE_URL,  
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  
  )  
}