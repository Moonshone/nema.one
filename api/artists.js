const ARTIST_IMAGE_BUCKET = 'Bilder'
const DEFAULT_ARTISTS_TABLE = 'artists'

const getEnvValue = (...names) => names.map((name) => process.env[name]).find(Boolean) ?? ''
const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''
const normalizeSupabaseUrl = (url) => String(url).replace(/\/$/, '')
const uniqueValues = (values) => [...new Set(values.filter(isFilled))]

const getArtistImagePath = (artist) =>
  [artist.img_url, artist.image_url, artist.avatar_url, artist.photo_url, artist.picture, artist.image].find(
    isFilled,
  ) ?? ''

const getArtistImageUrls = (artist, supabaseUrl) => {
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
  const pathWithoutBucket = normalizedPath.startsWith(`${ARTIST_IMAGE_BUCKET}/`)
    ? normalizedPath.slice(`${ARTIST_IMAGE_BUCKET}/`.length)
    : normalizedPath

  return [`${normalizedSupabaseUrl}/storage/v1/object/public/${ARTIST_IMAGE_BUCKET}/${pathWithoutBucket}`]
}

const getArtistsWithImageUrls = (artists, supabaseUrl) =>
  artists.map((artist) => ({
    ...artist,
    imageUrls: uniqueValues([...(artist.imageUrls ?? []), ...getArtistImageUrls(artist, supabaseUrl)]),
  }))

export default async function handler(_request, response) {
  const supabaseUrl = getEnvValue('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')
  const supabaseKey = getEnvValue(
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SECRET_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
  )
  const artistsTable = getEnvValue('SUPABASE_ARTISTS_TABLE') || DEFAULT_ARTISTS_TABLE

  response.setHeader('Cache-Control', 'no-store')

  if (!supabaseUrl || !supabaseKey) {
    response.status(500).json({
      error: 'Supabase server configuration is missing.',
      artists: [],
    })
    return
  }

  const artistsUrl = `${normalizeSupabaseUrl(supabaseUrl)}/rest/v1/${encodeURIComponent(
    artistsTable,
  )}?${new URLSearchParams({ select: '*' })}`

  try {
    const supabaseResponse = await fetch(artistsUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    const responseText = await supabaseResponse.text()
    const payload = responseText ? JSON.parse(responseText) : []

    if (!supabaseResponse.ok) {
      response.status(supabaseResponse.status).json({
        error: 'Supabase artists request failed.',
        details: payload,
        artists: [],
      })
      return
    }

    const artists = Array.isArray(payload) ? payload : []

    response.status(200).json({
      artists: getArtistsWithImageUrls(artists, supabaseUrl),
    })
  } catch (error) {
    response.status(500).json({
      error: 'Supabase artists request failed.',
      details: error instanceof Error ? error.message : String(error),
      artists: [],
    })
  }
}
