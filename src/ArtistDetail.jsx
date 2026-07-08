import { useEffect, useMemo, useState } from 'react'
import { getArtistDetailPath, getArtistName, getRuntimeArtists, isFilled } from './artistUtils.js'

function ArtistDetail({ labels }) {
  const [artists, setArtists] = useState([])
  const [status, setStatus] = useState('loading')
  const currentPath = window.location.pathname

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

  const artist = useMemo(
    () => artists.find((artistItem) => getArtistDetailPath(artistItem) === currentPath),
    [artists, currentPath],
  )

  const artistName = artist ? getArtistName(artist) : ''
  const imageUrl = artist?.imageUrls?.[0]

  return (
    <section className="artistsSection artistDetailSection" aria-label={labels.detailSectionLabel}>
      <a className="artistBackLink" href="/">
        {labels.backToArtists}
      </a>

      {status === 'loading' && <p className="artistsMessage">{labels.loading}</p>}
      {status === 'empty' && <p className="artistsMessage">{labels.empty}</p>}
      {status === 'error' && <p className="artistsMessage">{labels.error}</p>}

      {status === 'ready' && !artist && <p className="artistsMessage">{labels.notFound}</p>}

      {status === 'ready' && artist && (
        <article className="artistDetailCard">
          {isFilled(imageUrl) && (
            <img
              alt={isFilled(artistName) ? artistName : labels.imageAlt}
              className="artistDetailImage"
              referrerPolicy="no-referrer"
              src={imageUrl}
            />
          )}

          <div className="artistDetailContent">
            {isFilled(artistName) && <h1>{artistName}</h1>}
            {isFilled(artist.bio) && <p>{artist.bio}</p>}
            {isFilled(artist.description) && <p>{artist.description}</p>}
          </div>
        </article>
      )}
    </section>
  )
}

export default ArtistDetail
