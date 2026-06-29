import { motion } from 'motion/react'
import { useScrollProgress } from '../hooks/useScrollProgress'

/**
 * 顶部霓虹滚动进度条。scaleX 0→1，cyan→magenta 渐变。
 */
export default function ScrollProgress() {
  const progress = useScrollProgress()
  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left"
      style={{
        background:
          'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple), var(--neon-magenta))',
        boxShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-magenta)',
        scaleX: progress,
      }}
      aria-hidden="true"
    />
  )
}
