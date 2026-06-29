import { useEffect, useState } from 'react'

/**
 * 返回 0~1 的整页滚动进度。
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const scrollTop = window.scrollY || doc.scrollTop || 0
      const height = doc.scrollHeight - doc.clientHeight
      setProgress(height > 0 ? Math.min(1, Math.max(0, scrollTop / height)) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return progress
}
