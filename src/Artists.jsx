import { useEffect, useState } from 'react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const normalizeSupabaseUrl = (url) => String(url).replace(/\/$/, '')

const getArtistsApiUrl = () => {
  if (!isFilled(supabaseUrl)) {
    return ''
  }

  const searchParams = new URLSearchParams({ select: '*' })

  return `${normalizeSupabaseUrl(supabaseUrl)}/rest/v1/artists?${searchParams.toString()}`
}

const getArtistName = (artist) =>
  [artist.name, artist.full_name, artist.artist, artist.title].find(isFilled) ?? ''

const getArtistImageUrl = (artist) => {
  const imageUrl =
    [artist.img_url, artist.image_url, artist.avatar_url, artist.photo_url, artist.picture, artist.image].find(
      isFilled,
    ) ?? ''

  if (!isFilled(imageUrl)) {
    return ''
  }

  const normalizedImageUrl = String(imageUrl).trim()

  if (/^https?:\/\//i.test(normalizedImageUrl) || !isFilled(supabaseUrl)) {
    return normalizedImageUrl
  }

  if (normalizedImageUrl.startsWith('/')) {
    return `${normalizeSupabaseUrl(supabaseUrl)}${normalizedImageUrl}`
  }

  return normalizedImageUrl
}

function Artists({ labels }) {
  const [artists, setArtists] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()

    const loadArtists = async () => {
      setStatus('loading')

      const apiUrl = getArtistsApiUrl()

      if (!isFilled(apiUrl) || !isFilled(supabaseAnonKey)) {
        setArtists([])
        setStatus('missingConfig')
        return
      }

      try {
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

        setArtists(artistList)
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
            const imageUrl = getArtistImageUrl(artist)

            return (
              <article className="artistCard" key={artist.id ?? artistName}>
                {isFilled(imageUrl) && (
                  <img
                    alt={isFilled(artistName) ? artistName : labels.imageAlt}
                    className="artistImage"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    src={imageUrl}
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
