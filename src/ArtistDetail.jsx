import { useMemo } from 'react'
import { getArtistDetailPath, getArtistName, isFilled } from './artistUtils.js'
import useArtists from './useArtists.js'

function ArtistDetail({ labels, language }) {
  const { artists, status } = useArtists()
  const currentPath = window.location.pathname

  const artist = useMemo(
    () => artists.find((artistItem) => getArtistDetailPath(artistItem) === currentPath),
    [artists, currentPath],
  )

  const artistName = artist ? getArtistName(artist, language) : ''
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
