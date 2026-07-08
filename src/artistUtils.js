export const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

export const getArtistName = (artist) =>
  [artist.name, artist.full_name, artist.artist, artist.title].find(isFilled) ?? ''

const slugify = (value) =>
  String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const getArtistDetailPath = (artist) => {
  const identifier = [artist.slug, artist.id, getArtistName(artist)].find(isFilled)
  const slug = slugify(identifier || 'artist')

  return `/artists/${encodeURIComponent(slug)}`
}

export const getRuntimeArtists = async (signal) => {
  const response = await fetch('/api/artists', { signal })

  if (!response.ok) {
    throw new Error(`Artists request failed with ${response.status}`)
  }

  const data = await response.json()

  return Array.isArray(data.artists) ? data.artists : []
}
