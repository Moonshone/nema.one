import { useEffect, useState } from 'react'
import { getArtistDetailPath, getArtistName, getRuntimeArtists, isFilled } from './artistUtils.js'

function Artists({ labels, language }) {
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
            const artistName = getArtistName(artist, language)
            const imageUrl = artist.imageUrls?.[0]
            const hasDescription = isFilled(artist.bio) || isFilled(artist.description)

            return (
              <article className="artistCardItem" key={artist.id ?? artistName}>
                <a className="artistCard" href={getArtistDetailPath(artist)}>
                  {isFilled(imageUrl) && (
                    <img
                      alt={isFilled(artistName) ? artistName : labels.imageAlt}
                      className="artistImage"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      src={imageUrl}
                    />
                  )}

                  {hasDescription && (
                    <div className="artistContent">
                      {isFilled(artist.bio) && <p>{artist.bio}</p>}
                      {isFilled(artist.description) && <p>{artist.description}</p>}
                    </div>
                  )}
                </a>

                {isFilled(artistName) && (
                  <h2 className="artistName">
                    <a href={getArtistDetailPath(artist)}>{artistName}</a>
                  </h2>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Artists
