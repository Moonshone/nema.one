import { useEffect, useState } from 'react'

const buildTimeSupabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const buildTimeSupabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const normalizeSupabaseUrl = (url) => String(url).replace(/\/$/, '')

const getRuntimeSupabaseConfig = async (signal) => {
  const response = await fetch('/api/supabase-config', { signal })

  if (!response.ok) {
    return {
      supabaseUrl: '',
      supabaseAnonKey: '',
    }
  }

  const config = await response.json()

  return {
    supabaseUrl: config.supabaseUrl ?? '',
    supabaseAnonKey: config.supabaseAnonKey ?? '',
  }
}


const getRuntimeArtists = async (signal) => {
  const response = await fetch('/api/artists', { signal })

  if (!response.ok) {
    return null
  }

  const data = await response.json()

  return {
    artists: Array.isArray(data.artists) ? data.artists : [],
    supabaseUrl: data.supabaseUrl ?? '',
  }
}

const getSupabaseConfig = async (signal) => {
  if (isFilled(buildTimeSupabaseUrl) && isFilled(buildTimeSupabaseAnonKey)) {
    return {
      supabaseUrl: buildTimeSupabaseUrl,
      supabaseAnonKey: buildTimeSupabaseAnonKey,
    }
  }

  return getRuntimeSupabaseConfig(signal)
}

const getArtistsApiUrl = (supabaseUrl) => {
  if (!isFilled(supabaseUrl)) {
    return ''
  }

  const searchParams = new URLSearchParams({ select: '*' })

  return `${normalizeSupabaseUrl(supabaseUrl)}/rest/v1/artists?${searchParams.toString()}`
}

const getArtistName = (artist) =>
  [artist.name, artist.full_name, artist.artist, artist.title].find(isFilled) ?? ''

const uniqueValues = (values) => [...new Set(values.filter(isFilled))]

const getArtistImageUrls = (artist, supabaseUrl) => {
  const imageUrl =
    [artist.img_url, artist.image_url, artist.avatar_url, artist.photo_url, artist.picture, artist.image].find(
      isFilled,
    ) ?? ''

  if (!isFilled(imageUrl)) {
    return []
  }

  const normalizedImageUrl = String(imageUrl).trim()

  if (/^https?:\/\//i.test(normalizedImageUrl)) {
    return [normalizedImageUrl]
  }

  if (!isFilled(supabaseUrl)) {
    return [normalizedImageUrl]
  }

  const normalizedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl)

  if (normalizedImageUrl.startsWith('/')) {
    return [`${normalizedSupabaseUrl}${normalizedImageUrl}`]
  }

  if (normalizedImageUrl.startsWith('storage/v1/')) {
    return [`${normalizedSupabaseUrl}/${normalizedImageUrl}`]
  }

  const pathParts = normalizedImageUrl.split('/').filter(Boolean)
  const firstPathPart = pathParts[0]
  const remainingPath = pathParts.slice(1).join('/')
  const lowerCaseBucket = firstPathPart?.toLowerCase()

  if (firstPathPart && remainingPath) {
    return uniqueValues([
      `${normalizedSupabaseUrl}/storage/v1/object/public/${lowerCaseBucket}/${remainingPath}`,
      `${normalizedSupabaseUrl}/storage/v1/object/public/${firstPathPart}/${remainingPath}`,
      `${normalizedSupabaseUrl}/storage/v1/object/public/${lowerCaseBucket}/${normalizedImageUrl}`,
      `${normalizedSupabaseUrl}/storage/v1/object/public/${normalizedImageUrl}`,
    ])
  }

  return [`${normalizedSupabaseUrl}/storage/v1/object/public/${normalizedImageUrl}`]
}

const useNextArtistImageUrl = (event, imageUrls) => {
  const currentIndex = Number(event.currentTarget.dataset.imageUrlIndex ?? 0)
  const nextIndex = currentIndex + 1
  const nextImageUrl = imageUrls[nextIndex]

  if (!nextImageUrl) {
    return
  }

  event.currentTarget.dataset.imageUrlIndex = String(nextIndex)
  event.currentTarget.src = nextImageUrl
}

function Artists({ labels }) {
  const [artists, setArtists] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()

    const loadArtists = async () => {
      setStatus('loading')

      try {
        const runtimeArtists = await getRuntimeArtists(controller.signal)

        if (runtimeArtists) {
          setArtists(
            runtimeArtists.artists.map((artist) => ({
              ...artist,
              imageUrls: uniqueValues([...(artist.imageUrls ?? []), ...getArtistImageUrls(artist, runtimeArtists.supabaseUrl)]),
            })),
          )
          setStatus(runtimeArtists.artists.length > 0 ? 'ready' : 'empty')
          return
        }

        const { supabaseUrl, supabaseAnonKey } = await getSupabaseConfig(controller.signal)
        const apiUrl = getArtistsApiUrl(supabaseUrl)

        if (!isFilled(apiUrl) || !isFilled(supabaseAnonKey)) {
          setArtists([])
          setStatus('missingConfig')
          return
        }

        const response = await fetch(apiUrl, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Supabase request failed with ${response.status}`)
        }

        const data = await response.json()
        const artistList = Array.isArray(data) ? data : []

        setArtists(
          artistList.map((artist) => ({
            ...artist,
            imageUrls: getArtistImageUrls(artist, supabaseUrl),
          })),
        )
        setStatus(artistList.length > 0 ? 'ready' : 'empty')
      } catch (error) {
        if (error.name !== 'AbortError') {
          setArtists([])
          setStatus('error')
        }
      }
    }

    loadArtists()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <section className="artistsSection" id="artists" aria-label={labels.sectionLabel}>
      <div className="sectionHeader">
        <h1>{labels.heading}</h1>
      </div>

      {status === 'loading' && <p className="artistsMessage">{labels.loading}</p>}
      {status === 'missingConfig' && <p className="artistsMessage">{labels.missingConfig}</p>}
      {status === 'empty' && <p className="artistsMessage">{labels.empty}</p>}
      {status === 'error' && <p className="artistsMessage">{labels.error}</p>}

      {status === 'ready' && (
        <div className="artistsGrid">
          {artists.map((artist) => {
            const artistName = getArtistName(artist)

            return (
              <article className="artistCard" key={artist.id ?? artistName}>
                {artist.imageUrls?.length > 0 && (
                  <img
                    alt={isFilled(artistName) ? artistName : labels.imageAlt}
                    className="artistImage"
                    data-image-url-index="0"
                    loading="lazy"
                    onError={(event) => useNextArtistImageUrl(event, artist.imageUrls)}
                    referrerPolicy="no-referrer"
                    src={artist.imageUrls[0]}
                  />
                )}

                <div className="artistContent">
                  {isFilled(artistName) && <h2>{artistName}</h2>}
                  {isFilled(artist.bio) && <p>{artist.bio}</p>}
                  {isFilled(artist.description) && <p>{artist.description}</p>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Artists
