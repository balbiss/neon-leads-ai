import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders })
    }

    // Explicitly using the legacy anon key for verification to match the frontend signature
    const LEGACY_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdnltdGZ4YXp4endtbHZna2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODIyMzYsImV4cCI6MjA5MDA1ODIzNn0.B7yqjuFhmTOpIlsSl5RsMLxTaNiktiXuKlcoYia-ymA'
    
    // 1. Verify user identity using their own token
    const userClient = createClient(supabaseUrl, LEGACY_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    })
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await userClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          message: authError?.message || 'Invalid or expired token',
          details: authError 
        }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Use service role client to fetch data (bypassing RLS safely)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const [
      { count: totalLeads },
      { count: runningExtractions },
      { data: enrichmentPhones },
      { data: enrichmentEmails },
      { data: profile },
      { data: leadsBySource },
      { data: extractionsHistory },
      { data: recentActivity }
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('extractions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'running'),
      supabase.from('leads').select('id').eq('user_id', user.id).not('phone', 'is', null),
      supabase.from('leads').select('id').eq('user_id', user.id).not('email', 'is', null),
      supabase.from('profiles').select('credits_used, credits_limit').eq('user_id', user.id).single(),
      supabase.rpc('get_leads_by_source', { p_user_id: user.id }),
      supabase.rpc('get_extractions_7_days', { p_user_id: user.id }),
      supabase.from('activity_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    ])

    const enrichmentCount = new Set([...(enrichmentPhones || []).map(l => l.id), ...(enrichmentEmails || []).map(l => l.id)]).size
    const enrichmentRate = totalLeads ? ((enrichmentCount / totalLeads) * 100).toFixed(1) : "0"

    return new Response(JSON.stringify({
      stats: {
        total_leads: totalLeads || 0,
        running_extractions: runningExtractions || 0,
        enrichment_rate: enrichmentRate,
        credits_used: profile?.credits_used || 0,
        credits_limit: profile?.credits_limit || 500
      },
      leads_by_source: leadsBySource || [],
      extractions_history: extractionsHistory || [],
      recent_activity: recentActivity || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})
