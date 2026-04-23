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

    const { extraction_id } = await req.json()

    const { data: extraction, error: extError } = await supabase
      .from('extractions')
      .select('*')
      .eq('id', extraction_id)
      .eq('user_id', user.id)
      .single()

    if (extError || !extraction) {
      return new Response(JSON.stringify({ error: 'Extraction not found' }), { status: 404, headers: corsHeaders })
    }

    if (extraction.status === 'completed' || extraction.status === 'error') {
      return new Response(JSON.stringify({ status: extraction.status }), { status: 200, headers: corsHeaders })
    }

    const { data: profile } = await supabase.from('profiles').select('apify_key, credits_used').eq('user_id', user.id).single()
    const apifyKey = profile?.apify_key

    if (!apifyKey || !extraction.apify_run_id) {
      return new Response(JSON.stringify({ error: 'Missing Apify configuration' }), { status: 400, headers: corsHeaders })
    }

    // Check Apify Status
    const apifyStatusResp = await fetch(`https://api.apify.com/v2/actor-runs/${extraction.apify_run_id}?token=${apifyKey}`)
    const run = await apifyStatusResp.json()

    if (run.data.status === 'RUNNING' || run.data.status === 'READY') {
      return new Response(JSON.stringify({ status: 'running' }), { status: 200, headers: corsHeaders })
    }

    if (run.data.status !== 'SUCCEEDED') {
      await supabase.from('extractions').update({ status: 'error', error_message: `Apify run failed with status: ${run.data.status}` }).eq('id', extraction_id)
      return new Response(JSON.stringify({ status: 'error' }), { status: 200, headers: corsHeaders })
    }

    // Fetch Dataset
    const datasetResp = await fetch(`https://api.apify.com/v2/datasets/${run.data.defaultDatasetId}/items?token=${apifyKey}`)
    const items = await datasetResp.json()

    // Normalize
    const leads = items.map((item: any) => {
      let normalized: any = {
        user_id: user.id,
        extraction_id: extraction_id,
        source: extraction.source,
        extra_data_json: item
      }

      if (extraction.source === 'google_maps') {
        normalized.name = item.title
        normalized.phone = item.phone
        normalized.address = item.address
        normalized.city = item.city
        normalized.website = item.website
        normalized.rating = item.totalScore
        normalized.category = item.categoryName
        // Prioridade para WhatsApp: Campo específico > Telefone principal
        normalized.whatsapp = item.phone
        if (item.contactDetails?.whatsapp || item.whatsapp) {
          normalized.whatsapp = item.contactDetails?.whatsapp || item.whatsapp
        }
      } else if (extraction.source === 'vivareal' || extraction.source === 'zap') {
        normalized.name = item.advertiserName
        normalized.phone = item.advertiserPhone
        normalized.email = item.advertiserEmail
        normalized.address = item.address
        normalized.city = item.city
      } else if (extraction.source === 'instagram') {
        normalized.name = item.fullName
        normalized.instagram_handle = item.username
        normalized.phone = item.businessPhoneNumber
        normalized.email = item.businessEmail
      }

      return normalized
    })

    // Bulk Insert Leads
    if (leads.length > 0) {
      const { error: insertError } = await supabase.from('leads').insert(leads)
      if (insertError) throw insertError
    }

    // Update Extraction & Profile
    await supabase.from('extractions').update({
      status: 'completed',
      leads_count: leads.length
    }).eq('id', extraction_id)

    await supabase.rpc('increment_credits', { p_user_id: user.id, p_count: leads.length })
    // Note: increment_credits is a simple function we need in SQL or we can do it manually:
    await supabase.from('profiles').update({ 
      credits_used: (profile as any).credits_used + leads.length 
    }).eq('user_id', user.id)

    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'extraction_completed',
      description: `Finalizada extração ${extraction.source}. ${leads.length} leads importados.`,
      metadata_json: { extraction_id, leads_count: leads.length }
    })

    return new Response(JSON.stringify({ status: 'completed', leads_count: leads.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})
