export const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const joinFilled = (...values) => values.filter(isFilled).map((value) => String(value).trim()).join(' ')

const latinToPersianLetters = {
  a: 'ا',
  b: 'ب',
  c: 'ک',
  d: 'د',
  e: 'ه',
  f: 'ف',
  g: 'گ',
  h: 'ه',
  i: 'ی',
  j: 'ج',
  k: 'ک',
  l: 'ل',
  m: 'م',
  n: 'ن',
  o: 'و',
  p: 'پ',
  q: 'ق',
  r: 'ر',
  s: 'س',
  t: 'ت',
  u: 'و',
  v: 'و',
  w: 'و',
  x: 'کس',
  y: 'ی',
  z: 'ز',
}

const latinToPersianDigraphs = [
  ['sch', 'ش'],
  ['sh', 'ش'],
  ['ch', 'چ'],
  ['kh', 'خ'],
  ['gh', 'غ'],
  ['zh', 'ژ'],
  ['ph', 'ف'],
  ['th', 'ت'],
  ['ck', 'ک'],
]

const transliterateLatinNameToPersian = (value) =>
  String(value)
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part) || /[^A-Za-zÀ-ž'-]/.test(part)) {
        return part
      }

      const normalizedPart = part
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

      let persianPart = ''
      let index = 0

      while (index < normalizedPart.length) {
        const digraph = latinToPersianDigraphs.find(([latin]) =>
          normalizedPart.startsWith(latin, index),
        )

        if (digraph) {
          persianPart += digraph[1]
          index += digraph[0].length
          continue
        }

        const character = normalizedPart[index]
        persianPart += latinToPersianLetters[character] ?? character
        index += 1
      }

      return persianPart
    })
    .join('')

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

  return getPersianArtistName(artist) || transliterateLatinNameToPersian(defaultArtistName)
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
