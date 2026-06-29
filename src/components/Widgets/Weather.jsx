import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useGeolocation } from '../../hooks/useGeolocation'

const WMO_CODE = {
  0: { label: '晴', icon: '☀' },
  1: { label: '晴', icon: '🌤' },
  2: { label: '多云', icon: '⛅' },
  3: { label: '阴', icon: '☁' },
  45: { label: '雾', icon: '🌫' },
  48: { label: '雾凇', icon: '🌫' },
  51: { label: '小毛雨', icon: '🌦' },
  53: { label: '毛雨', icon: '🌦' },
  55: { label: '大毛雨', icon: '🌧' },
  61: { label: '小雨', icon: '🌧' },
  63: { label: '中雨', icon: '🌧' },
  65: { label: '大雨', icon: '🌧' },
  71: { label: '小雪', icon: '🌨' },
  73: { label: '中雪', icon: '🌨' },
  75: { label: '大雪', icon: '❄' },
  77: { label: '雪粒', icon: '❄' },
  80: { label: '阵雨', icon: '🌦' },
  81: { label: '中阵雨', icon: '🌧' },
  82: { label: '强阵雨', icon: '⛈' },
  95: { label: '雷暴', icon: '⛈' },
  96: { label: '雷暴冰雹', icon: '⛈' },
  99: { label: '强雷暴', icon: '⛈' },
}

/**
 * 天气小组件：Open-Meteo 免 key 接口。
 * 浏览器定位失败回退北京。
 */
export default function Weather() {
  const { coords } = useGeolocation()
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&timezone=auto`
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => {
        if (!cancelled) setData(d.current)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [coords])

  const temp = data?.temperature_2m
  const code = WMO_CODE[data?.weather_code] || { label: '—', icon: '○' }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="flex items-center gap-2"
    >
      <span className="text-2xl" title={code.label}>
        {code.icon}
      </span>
      <div className="leading-tight">
        <div className="font-display text-xl font-bold text-[var(--neon-yellow)]">
          {error ? '—' : temp != null ? `${Math.round(temp)}°` : '··'}
        </div>
        <div className="font-mono text-[10px] text-ink-faint">
          {code.label} · {coords.label}
        </div>
      </div>
    </motion.div>
  )
}
