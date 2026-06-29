import { useEffect, useState } from 'react'

/**
 * 视差 hook：基于窗口滚动 Y 返回位移值。
 * @param {number} speed 速率，正值上移、负值下移；典型 0.1~0.6
 * @param {object} opts { max, throttle }
 */
export function useParallax(speed = 0.3, opts = {}) {
  const { max = 200 } = opts
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY || window.pageYOffset || 0
      setOffset(Math.max(-max, Math.min(max, y * speed)))
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
  }, [speed, max])

  return offset
}
