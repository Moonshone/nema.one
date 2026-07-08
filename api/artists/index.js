const getEnvValue = (...names) => names.map((name) => process.env[name]).find(Boolean) ?? ''

const normalizeSupabaseUrl = (url) => String(url).replace(/\/$/, '')

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const uniqueValues = (values) => [...new Set(values.filter(isFilled))]

const artistStorageBucket = 'Bilder'

const getArtistImagePath = (artist) =>
  [artist.img_url, artist.image_url, artist.avatar_url, artist.photo_url, artist.picture, artist.image].find(
    isFilled,
  ) ?? ''

const getStoragePathCandidates = (imagePath) => {
  if (!isFilled(imagePath) || /^https?:\/\//i.test(imagePath)) {
    return []
  }

  const normalizedImagePath = String(imagePath).trim().replace(/^\/+/, '')

  if (!isFilled(normalizedImagePath) || normalizedImagePath.startsWith('storage/v1/')) {
    return []
  }

  const pathWithoutBucket = normalizedImagePath.startsWith(`${artistStorageBucket}/`)
    ? normalizedImagePath.slice(`${artistStorageBucket}/`.length)
    : normalizedImagePath

  return [{ bucket: artistStorageBucket, path: pathWithoutBucket }]
}

const getPublicImageUrlCandidates = (supabaseUrl, imagePath) => {
  if (!isFilled(imagePath)) {
    return []
  }

  const normalizedImagePath = String(imagePath).trim()
  const normalizedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl)

  if (/^https?:\/\//i.test(normalizedImagePath)) {
    return [normalizedImagePath]
  }

  if (normalizedImagePath.startsWith('/storage/v1/')) {
    return [`${normalizedSupabaseUrl}${normalizedImagePath}`]
  }

  if (normalizedImagePath.startsWith('storage/v1/')) {
    return [`${normalizedSupabaseUrl}/${normalizedImagePath}`]
  }

  return getStoragePathCandidates(normalizedImagePath).map(
    ({ bucket, path }) => `${normalizedSupabaseUrl}/storage/v1/object/public/${bucket}/${path}`,
  )
}

const getSignedImageUrl = async ({ supabaseUrl, supabaseKey, bucket, path }) => {
  const normalizedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl)
  const signUrl = `${normalizedSupabaseUrl}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

  const signResponse = await fetch(signUrl, {
    body: JSON.stringify({ expiresIn: 60 * 60 * 24 }),
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!signResponse.ok) {
    return ''
  }

  const signData = await signResponse.json()
  const signedUrl = signData.signedURL ?? signData.signedUrl ?? ''

  if (!isFilled(signedUrl)) {
    return ''
  }

  if (/^https?:\/\//i.test(signedUrl)) {
    return signedUrl
  }

  return signedUrl.startsWith('/storage/v1')
    ? `${normalizedSupabaseUrl}${signedUrl}`
    : `${normalizedSupabaseUrl}/storage/v1${signedUrl}`
}

const getImageUrls = async ({ artist, supabaseUrl, supabaseKey }) => {
  const imagePath = getArtistImagePath(artist)
  const publicImageUrls = getPublicImageUrlCandidates(supabaseUrl, imagePath)
  const storagePathCandidates = getStoragePathCandidates(imagePath)
  const signedImageUrls = await Promise.all(
    storagePathCandidates.map((candidate) => getSignedImageUrl({ ...candidate, supabaseUrl, supabaseKey })),
  )

  return uniqueValues([...signedImageUrls, ...publicImageUrls])
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

    const artistsWithImageUrls = await Promise.all(
      (Array.isArray(artists) ? artists : []).map(async (artist) => ({
        ...artist,
        imageUrls: await getImageUrls({ artist, supabaseKey, supabaseUrl }),
      })),
    )

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
