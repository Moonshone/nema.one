import { useEffect, useState } from 'react'

const productionOrigin = 'https://nema.one'
const productionAssetOrigin = 'http://nema.one'
const sameOriginApiUrl = '/api/get-artworks.php'
const productionApiUrl = `${productionOrigin}/api/get-artworks.php`
const githubPagesFallbackArtworks = [
  {
    id: 'github-pages-fallback-06',
    img_url: `${productionAssetOrigin}/Bilder/06.jpeg`,
  },
]

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const isGitHubPages = () => window.location.hostname.endsWith('github.io')

const getPublicAssetOrigin = () => (isGitHubPages() ? productionAssetOrigin : '')

const getApiUrls = () => (isGitHubPages() ? [productionApiUrl] : [sameOriginApiUrl, productionApiUrl])

const getArtworkList = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.artworks)) {
    return data.artworks
  }

  if (Array.isArray(data?.data)) {
    return data.data
  }

  return []
}

const getArtworkImageUrl = (imgUrl) => {
  if (!isFilled(imgUrl)) {
    return ''
  }

  const normalizedUrl = String(imgUrl).trim()
  const assetOrigin = getPublicAssetOrigin()

  if (/^https?:\/\//i.test(normalizedUrl)) {
    return normalizedUrl.replace(/^https:\/\/nema\.one/i, productionAssetOrigin)
  }

  if (normalizedUrl.startsWith('/')) {
    return `${assetOrigin}${normalizedUrl}`
  }

  if (normalizedUrl.startsWith('www/')) {
    return `${assetOrigin}/${normalizedUrl.slice(4)}`
  }

  if (!normalizedUrl.includes('/')) {
    return `${assetOrigin}/Bilder/${normalizedUrl}`
  }

  return `${assetOrigin}/${normalizedUrl}`
}

function Artworks({ labels }) {
  const [artworks, setArtworks] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()

    const loadArtworks = async () => {
      setStatus('loading')

      try {
        const apiResponses = await Promise.all(
          getApiUrls().map((apiUrl) =>
            fetch(apiUrl, { signal: controller.signal })
              .then((response) => (response.ok ? response.json() : null))
              .catch(() => null),
          ),
        )

        const artworkList = apiResponses.flatMap(getArtworkList)
        const visibleArtworkList =
          artworkList.length > 0 || !isGitHubPages() ? artworkList : githubPagesFallbackArtworks

        setArtworks(visibleArtworkList)
        setStatus(visibleArtworkList.length > 0 ? 'ready' : 'empty')
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
    <section className="artworksSection" id="artworks" aria-label={labels.sectionLabel}>
      {status === 'loading' && <p className="artworksMessage">{labels.loading}</p>}
      {status === 'empty' && <p className="artworksMessage">Aktuell sind keine Kunstwerke vorhanden.</p>}
      {status === 'error' && <p className="artworksMessage">Die Kunstwerke konnten nicht geladen werden.</p>}

      {status === 'ready' && (
        <div className="artworksGrid">
          {artworks.map((artwork) => {
            const imageUrl = getArtworkImageUrl(artwork.img_url)

            return (
              <article className="artworkCard" key={artwork.id ?? artwork.name}>
                {isFilled(imageUrl) && (
                  <img
                    alt={isFilled(artwork.name) ? artwork.name : labels.imageAlt}
                    className="artworkImage"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    src={imageUrl}
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
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Artworks
