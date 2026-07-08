export const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const joinFilled = (...values) => values.filter(isFilled).map((value) => String(value).trim()).join(' ')

const getDefaultArtistName = (artist) =>
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

const getPersianArtistName = (artist) =>
  [
    artist.name_persian,
    joinFilled(artist.Firstname_fa, artist.Lastname_fa),
    joinFilled(artist.FirstnameFa, artist.LastnameFa),
    joinFilled(artist.firstname_fa, artist.lastname_fa),
    joinFilled(artist.firstnameFa, artist.lastnameFa),
    joinFilled(artist.first_name_fa, artist.last_name_fa),
    joinFilled(artist.firstNameFa, artist.lastNameFa),
    artist.full_name_fa,
    artist.fullNameFa,
    artist.display_name_fa,
    artist.displayNameFa,
    artist.artist_name_fa,
    artist.artistNameFa,
    artist.stage_name_fa,
    artist.stageNameFa,
    artist.name_fa,
    artist.Name_fa,
    artist.nameFa,
    artist.NameFa,
  ].find(isFilled) ?? ''

export const getArtistName = (artist, language = 'de') => {
  const defaultArtistName = getDefaultArtistName(artist)

  if (language !== 'fa') {
    return defaultArtistName
  }

  return getPersianArtistName(artist) || defaultArtistName
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
