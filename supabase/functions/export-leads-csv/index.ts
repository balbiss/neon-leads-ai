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

    const { source, status, city, ids } = await req.json().catch(() => ({}))

    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)

    if (source) query = query.eq('source', source)
    if (status) query = query.eq('status', status)
    if (city) query = query.ilike('city', `%${city}%`)
    if (ids && ids.length > 0) query = query.in('id', ids)

    const { data: leads, error: fetchError } = await query

    if (fetchError) throw fetchError

    // CSV Generation
    const headers = ['Nome', 'Telefone', 'WhatsApp', 'Email', 'Cidade', 'Estado', 'Fonte', 'Status', 'Website', 'Instagram', 'Data']
    const rows = leads.map(l => [
      l.name || '',
      l.phone || '',
      l.whatsapp || '',
      l.email || '',
      l.city || '',
      l.state || '',
      l.source || '',
      l.status || '',
      l.website || '',
      l.instagram_handle || '',
      new Date(l.created_at).toLocaleDateString('pt-BR')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="leads_visita_ia.csv"',
      },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})
