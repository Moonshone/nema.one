import { useEffect, useState } from 'react'

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const getArtistName = (artist) =>
  [artist.name, artist.full_name, artist.artist, artist.title].find(isFilled) ?? ''

const getRuntimeArtists = async (signal) => {
  const response = await fetch('/api/artists', { signal })

  if (!response.ok) {
    throw new Error(`Artists request failed with ${response.status}`)
  }

  const data = await response.json()

  return Array.isArray(data.artists) ? data.artists : []
}

function Artists({ labels }) {
  const [artists, setArtists] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()

    const loadArtists = async () => {
      setStatus('loading')

      try {
        const artistList = await getRuntimeArtists(controller.signal)

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
      {status === 'empty' && <p className="artistsMessage">{labels.empty}</p>}
      {status === 'error' && <p className="artistsMessage">{labels.error}</p>}

      {status === 'ready' && (
        <div className="artistsGrid">
          {artists.map((artist) => {
            const artistName = getArtistName(artist)
            const imageUrl = artist.imageUrls?.[0]

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
