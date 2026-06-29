import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const pad = (n) => String(n).padStart(2, '0')

/**
 * 数字霓虹时钟：Orbitron 字体，每秒更新。
 */
export default function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="flex flex-col items-center gap-1 sm:items-start"
    >
      <div className="font-display text-3xl font-black tracking-wider neon-text sm:text-4xl">
        <span className="tabular-nums">{pad(now.getHours())}</span>
        <span className="animate-flicker text-[var(--neon-magenta)]">:</span>
        <span className="tabular-nums">{pad(now.getMinutes())}</span>
        <span className="text-xl text-ink-faint sm:text-2xl">
          <span className="animate-flicker">:</span>
          <span className="tabular-nums">{pad(now.getSeconds())}</span>
        </span>
      </div>
      <div className="font-mono text-xs text-ink-muted">
        {now.getFullYear()}/{pad(now.getMonth() + 1)}/{pad(now.getDate())} · {WEEK[now.getDay()]}
      </div>
    </motion.div>
  )
}
