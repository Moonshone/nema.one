import { useEffect, useState } from 'react'

const apiUrl = '/api/get-artworks.php'

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

function Artworks({ labels }) {
  const [artworks, setArtworks] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()

    const loadArtworks = async () => {
      setStatus('loading')

      try {
        const response = await fetch(apiUrl, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Artwork API returned ${response.status}`)
        }

        const data = await response.json()
        const artworkList = Array.isArray(data) ? data : []

        setArtworks(artworkList)
        setStatus(artworkList.length > 0 ? 'ready' : 'empty')
      } catch (error) {
        if (error.name !== 'AbortError') {
          setArtworks([])
          setStatus('error')
        }
      }
    }

    loadArtworks()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <section className="artworksSection" id="artworks" aria-labelledby="artworks-heading">
      <div className="sectionHeader">
        <p className="eyebrow">{labels.eyebrow}</p>
        <h2 id="artworks-heading">{labels.heading}</h2>
      </div>

      {status === 'loading' && <p className="artworksMessage">{labels.loading}</p>}
      {status === 'empty' && <p className="artworksMessage">Aktuell sind keine Kunstwerke vorhanden.</p>}
      {status === 'error' && <p className="artworksMessage">Die Kunstwerke konnten nicht geladen werden.</p>}

      {status === 'ready' && (
        <div className="artworksGrid">
          {artworks.map((artwork) => (
            <article className="artworkCard" key={artwork.id ?? artwork.name}>
              {isFilled(artwork.img_url) && (
                <img
                  alt={isFilled(artwork.name) ? artwork.name : labels.imageAlt}
                  className="artworkImage"
                  loading="lazy"
                  src={artwork.img_url}
                />
              )}

              <div className="artworkContent">
                {isFilled(artwork.name) && <h3>{artwork.name}</h3>}

                <dl className="artworkMeta">
                  {isFilled(artwork.artist) && (
                    <div>
                      <dt>{labels.artist}</dt>
                      <dd>{artwork.artist}</dd>
                    </div>
                  )}
                  {isFilled(artwork.date) && (
                    <div>
                      <dt>{labels.date}</dt>
                      <dd>{artwork.date}</dd>
                    </div>
                  )}
                  {isFilled(artwork.price) && (
                    <div>
                      <dt>{labels.price}</dt>
                      <dd>{artwork.price}</dd>
                    </div>
                  )}
                </dl>

                {isFilled(artwork.description) && (
                  <p className="artworkDescription">{artwork.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Artworks
