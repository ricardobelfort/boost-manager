import { createClient } from 'npm:@supabase/supabase-js@2'

// This Edge Function checks if a user is locked out due to too many failed login attempts
// Authorization header is now optional
Deno.serve(async (req) => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json',
    }

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers })
    }

    // Parse the request body to get the email
    const { email } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ code: 400, message: 'Email is required' }),
        { status: 400, headers }
      )
    }

    // Create a Supabase client with the service role key
    // This bypasses RLS to check the auth.users table
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Query the database to check if the user is locked out
    const { data, error } = await supabase
      .from('user_login_attempts')
      .select('attempts, locked_until')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ code: 500, message: 'Internal server error' }),
        { status: 500, headers }
      )
    }

    // If no record found or not locked, user is not locked out
    if (!data || !data.locked_until) {
      return new Response(
        JSON.stringify({ locked: false }),
        { status: 200, headers }
      )
    }

    // Check if the lockout period has expired
    const now = new Date()
    const lockedUntil = new Date(data.locked_until)
    
    if (now > lockedUntil) {
      // Lockout period has expired, reset the record
      await supabase
        .from('user_login_attempts')
        .update({ attempts: 0, locked_until: null })
        .eq('email', email)
      
      return new Response(
        JSON.stringify({ locked: false }),
        { status: 200, headers }
      )
    }

    // User is still locked out
    return new Response(
      JSON.stringify({ 
        locked: true, 
        lockedUntil: data.locked_until,
        message: `Account is temporarily locked. Please try again after ${lockedUntil.toLocaleString()}.`
      }),
      { status: 200, headers }
    )
    
  } catch (error) {
    console.error('Error in check-lockout function:', error)
    return new Response(
      JSON.stringify({ code: 500, message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})