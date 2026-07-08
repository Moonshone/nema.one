import { useEffect, useState } from 'react'
import { getRuntimeArtists } from './artistUtils.js'

function useArtists() {
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

  return { artists, status }
}

export default useArtists
