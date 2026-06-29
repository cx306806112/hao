import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useParallax } from '../../hooks/useParallax'

/**
 * 赛博朋克背景：径向光晕 mesh + 透视网格地平线 + 浮动粒子 + 视差。
 * 使用 fixed 定位铺满视口，z-index: 0（在 #root 之下）。
 */
export default function CyberBackground() {
  const offsetSlow = useParallax(0.12, { max: 120 })
  const offsetFast = useParallax(0.32, { max: 240 })

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 10,
        color: ['#00f0ff', '#ff2a6d', '#b16cff', '#f9f002'][i % 4],
      })),
    [],
  )

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--bg-base)]" aria-hidden="true">
      {/* 1. 径向光晕 mesh */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 20%, rgba(0,240,255,0.18), transparent 60%),' +
            'radial-gradient(50% 45% at 80% 25%, rgba(255,42,109,0.16), transparent 60%),' +
            'radial-gradient(70% 60% at 50% 100%, rgba(177,108,255,0.20), transparent 70%)',
          y: offsetSlow,
        }}
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 2. 透视网格地平线 */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[140vh] w-[200vw] -translate-x-1/2 -translate-y-1/2"
        style={{
          y: offsetFast,
          backgroundImage:
            'linear-gradient(var(--grid-line) 1px, transparent 1px),' +
            'linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform:
            'perspective(600px) rotateX(62deg) translateY(0)',
          transformStyle: 'preserve-3d',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 80%)',
        }}
        animate={{
          backgroundPositionX: ['0px', '60px'],
          backgroundPositionY: ['0px', '60px'],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* 3. 水平霓虹地平线 */}
      <motion.div
        className="absolute left-0 right-0 top-1/2 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-magenta), transparent)',
          boxShadow: '0 0 20px var(--neon-cyan), 0 0 40px var(--neon-magenta)',
          y: offsetSlow,
        }}
      />

      {/* 4. 浮动粒子 */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* 5. 顶部暗角渐变，保证内容可读 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,7,13,0.65) 0%, transparent 25%, transparent 75%, rgba(7,7,13,0.85) 100%)',
        }}
      />
    </div>
  )
}
