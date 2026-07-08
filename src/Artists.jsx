import { getArtistDetailPath, getArtistName, isFilled } from './artistUtils.js'
import useArtists from './useArtists.js'

function Artists({ labels, language }) {
  const { artists, status } = useArtists()

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
            const detailPath = getArtistDetailPath(artist)
            const imageUrl = artist.imageUrls?.[0]
            const hasDescription = isFilled(artist.bio) || isFilled(artist.description)

            return (
              <article className="artistCardItem" key={artist.id ?? artistName}>
                <a className="artistCard" href={detailPath}>
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
                    <a href={detailPath}>{artistName}</a>
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
