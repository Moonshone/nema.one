export const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const joinFilled = (...values) => values.filter(isFilled).map((value) => String(value).trim()).join(' ')

const pickFilled = (values) => values.find(isFilled) ?? ''

const getDefaultArtistName = (artist) =>
  pickFilled([
    joinFilled(artist.Firstname, artist.Lastname),
    artist.name,
    artist.full_name,
    artist.artist,
    artist.title,
  ])

const getPersianArtistName = (artist) => pickFilled([artist.name_persian])

export const getArtistName = (artist, language = 'de') => {
  const defaultArtistName = getDefaultArtistName(artist)

  return language === 'fa' ? getPersianArtistName(artist) || defaultArtistName : defaultArtistName
}

const slugify = (value) =>
  String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const getArtistDetailPath = (artist) => {
  const identifier = pickFilled([artist.slug, artist.id, getDefaultArtistName(artist)])

  return `/artists/${encodeURIComponent(slugify(identifier || 'artist'))}`
}

export const getRuntimeArtists = async (signal) => {
  const response = await fetch('/api/artists', { signal })

  if (!response.ok) {
    throw new Error(`Artists request failed with ${response.status}`)
  }

  const data = await response.json()

  return Array.isArray(data.artists) ? data.artists : []
}
