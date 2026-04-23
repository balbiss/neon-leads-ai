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

    // Criar cliente com Service Role para validar o usuário de forma definitiva
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('Erro de autenticação detalhado:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError }), { status: 401, headers: corsHeaders })
    }

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()
    const { extraction_id, source, name } = body
    const config = body.config_json || body.config || {}

    const { data: profile } = await supabase.from('profiles').select('apify_key').eq('user_id', user.id).single()
    if (!profile?.apify_key) {
      return new Response(JSON.stringify({ error: 'Apify key missing' }), { status: 400, headers: corsHeaders })
    }

    const searchKeyword = config.keyword || config.queries?.[0] || 'clinicas'
    const city = config.city || ''
    const limit = config.limit || 10

    // Payload V18 - CORREÇÃO DO IDIOMA E PROXY
    const input = {
      "searchStringsArray": [searchKeyword],
      "locationQuery": city,
      "maxCrawledPlacesPerSearch": limit,
      "language": "pt-BR", 
      "searchMatching": "all",
      "scrapePlaceDetailPage": true,
      "scrapeContacts": true,
      "maximumLeadsEnrichmentRecords": 5,
      "scrapeSocialMediaProfiles": {
        "facebooks": true,
        "instagrams": true,
        "youtubes": true,
        "tiktoks": true,
        "twitters": true
      },
      "proxyConfiguration": {
        "useApifyProxy": true
      },
      "website": "allPlaces",
      "skipClosedPlaces": false
    }

    const actorId = 'compass~crawler-google-places'
    const apifyUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${profile.apify_key}`
    
    console.log(`[v18] Tentativa de Run com Ator: ${actorId} para extração ${extraction_id}`)

    const apifyResponse = await fetch(apifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const runData = await apifyResponse.json()

    if (!apifyResponse.ok) {
      console.error('ERRO APIFY DETALHADO:', JSON.stringify(runData, null, 2))
      const errorMsg = runData.error?.message || runData.message || 'Falha na validação do payload no Apify'
      return new Response(JSON.stringify({ 
        error: 'Erro de Validação Apify', 
        message: errorMsg,
        details: runData 
      }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const runId = runData.data.id

    await supabase.from('extractions').update({
      status: 'running',
      apify_run_id: runId
    }).eq('id', extraction_id || '')

    return new Response(JSON.stringify({ 
      status: 'success', 
      message: 'Extração iniciada com sucesso!',
      run_id: runId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Erro crítico na v18:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
