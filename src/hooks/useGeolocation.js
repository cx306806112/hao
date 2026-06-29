import { useEffect, useState } from 'react'

const FALLBACK = { lat: 39.9042, lon: 116.4074, label: '北京' }

/**
 * 地理定位 hook：尝试获取浏览器定位，失败回退北京。
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(FALLBACK)
  const [status, setStatus] = useState('idle') // idle | loading | ok | denied

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('denied')
      return
    }
    setStatus('loading')
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: '本地' })
        setStatus('ok')
      },
      () => {
        setStatus('denied')
      },
      { enableHighAccuracy: false, maximumAge: 600000, timeout: 8000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  return { coords, status }
}
