const getEnvValue = (...names) => names.map((name) => process.env[name]).find(Boolean) ?? ''

const normalizeSupabaseUrl = (url) => String(url).replace(/\/$/, '')

export default async function handler(request, response) {
  const supabaseUrl = getEnvValue('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')
  const supabaseKey = getEnvValue(
    'SUPABASE_SERVICE_ROLE_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
  )
  const artistsTable = getEnvValue('SUPABASE_ARTISTS_TABLE') || 'artists'

  response.setHeader('Cache-Control', 'no-store')

  if (!supabaseUrl || !supabaseKey) {
    response.status(500).json({
      error: 'Supabase server configuration is missing.',
      artists: [],
    })
    return
  }

  const searchParams = new URLSearchParams({ select: '*' })
  const artistsUrl = `${normalizeSupabaseUrl(supabaseUrl)}/rest/v1/${encodeURIComponent(
    artistsTable,
  )}?${searchParams.toString()}`

  try {
    const supabaseResponse = await fetch(artistsUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    const responseText = await supabaseResponse.text()
    const artists = responseText ? JSON.parse(responseText) : []

    if (!supabaseResponse.ok) {
      response.status(supabaseResponse.status).json({
        error: 'Supabase artists request failed.',
        details: artists,
        artists: [],
      })
      return
    }

    response.status(200).json({
      artists: Array.isArray(artists) ? artists : [],
      supabaseUrl,
    })
  } catch (error) {
    response.status(500).json({
      error: 'Supabase artists request failed.',
      details: error instanceof Error ? error.message : String(error),
      artists: [],
    })
  }
}
