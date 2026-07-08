const getEnvValue = (...names) => names.map((name) => process.env[name]).find(Boolean) ?? ''

const normalizeSupabaseUrl = (url) => String(url).replace(/\/$/, '')

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const uniqueValues = (values) => [...new Set(values.filter(isFilled))]

const artistStorageBucket = 'Bilder'

const getArtistImagePath = (artist) =>
  [artist.img_url, artist.image_url, artist.avatar_url, artist.photo_url, artist.picture, artist.image].find(
    isFilled,
  ) ?? ''

const getArtistImageUrls = ({ artist, supabaseUrl }) => {
  const imagePath = getArtistImagePath(artist)

  if (!isFilled(imagePath)) {
    return []
  }

  const normalizedImagePath = String(imagePath).trim()

  if (/^https?:\/\//i.test(normalizedImagePath)) {
    return [normalizedImagePath]
  }

  const normalizedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl)

  if (normalizedImagePath.startsWith('/storage/v1/')) {
    return [`${normalizedSupabaseUrl}${normalizedImagePath}`]
  }

  if (normalizedImagePath.startsWith('storage/v1/')) {
    return [`${normalizedSupabaseUrl}/${normalizedImagePath}`]
  }

  const normalizedPath = normalizedImagePath.replace(/^\/+/, '')
  const pathWithoutBucket = normalizedPath.startsWith(`${artistStorageBucket}/`)
    ? normalizedPath.slice(`${artistStorageBucket}/`.length)
    : normalizedPath

  return [`${normalizedSupabaseUrl}/storage/v1/object/public/${artistStorageBucket}/${pathWithoutBucket}`]
}

export default async function handler(request, response) {
  const supabaseUrl = getEnvValue('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')
  const supabaseKey = getEnvValue(
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SECRET_KEY',
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

    const artistsWithImageUrls = (Array.isArray(artists) ? artists : []).map((artist) => ({
      ...artist,
      imageUrls: uniqueValues([...(artist.imageUrls ?? []), ...getArtistImageUrls({ artist, supabaseUrl })]),
    }))

    response.status(200).json({
      artists: artistsWithImageUrls,
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
