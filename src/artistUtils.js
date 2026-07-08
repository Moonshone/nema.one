export const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const joinFilled = (...values) => values.filter(isFilled).map((value) => String(value).trim()).join(' ')

export const getArtistName = (artist) =>
  [
    joinFilled(artist.Firstname, artist.Lastname),
    joinFilled(artist.firstname, artist.lastname),
    joinFilled(artist.first_name, artist.last_name),
    joinFilled(artist.firstName, artist.lastName),
    artist.name,
    artist.Name,
    artist.full_name,
    artist.fullName,
    artist.display_name,
    artist.displayName,
    artist.artist_name,
    artist.artistName,
    artist.stage_name,
    artist.stageName,
    artist.artist,
    artist.Artist,
    artist.title,
    artist.Title,
  ].find(isFilled) ?? ''

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
