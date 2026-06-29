import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useParallax } from '../../hooks/useParallax'

/**
 * 宇宙星空背景：深空渐变 + 星云 + 闪烁星点 + 偶发流星 + 视差。
 * fixed 定位铺满视口，z-index: 0（在 #root 之下）。
 */
export default function CyberBackground() {
  const offsetSlow = useParallax(0.08, { max: 80 })
  const offsetMid = useParallax(0.18, { max: 160 })
  const offsetFast = useParallax(0.32, { max: 260 })

  // 三层星点，视差速率不同
  const layers = useMemo(
    () => [
      { count: 80, size: [0.5, 1.2], speed: 0.08, opacity: 0.5 }, // 远景
      { count: 50, size: [1, 2], speed: 0.18, opacity: 0.85 }, // 中景
      { count: 24, size: [1.5, 3], speed: 0.32, opacity: 1 }, // 近景
    ].map((cfg, idx) => ({
      idx,
      cfg,
      stars: Array.from({ length: cfg.count }, (_, i) => ({
        id: `${idx}-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 4,
        twinkle: Math.random() > 0.5,
      })),
    })),
    [],
  )

  // 偶发流星
  const meteors = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: `m-${i}`,
        top: 10 + Math.random() * 50,
        delay: i * 7 + Math.random() * 4,
        duration: 1.2 + Math.random() * 0.8,
        length: 80 + Math.random() * 120,
      })),
    [],
  )

  // 星云团
  const nebulae = useMemo(
    () => [
      { x: 15, y: 20, size: 50, color: 'rgba(177,108,255,0.22)' }, // 紫
      { x: 80, y: 15, size: 45, color: 'rgba(0,240,255,0.16)' }, // 青
      { x: 70, y: 75, size: 55, color: 'rgba(255,42,109,0.18)' }, // 品红
      { x: 25, y: 80, size: 40, color: 'rgba(57,255,20,0.10)' }, // 绿
    ],
    [],
  )

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* 1. 深空底色渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, #0a0a1f 0%, #050510 40%, #020207 100%)',
        }}
      />

      {/* 2. 星云团（径向光晕，缓慢漂移 + 视差） */}
      <motion.div
        className="absolute inset-0"
        style={{ y: offsetSlow }}
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        {nebulae.map((n, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              width: `${n.size}vw`,
              height: `${n.size}vw`,
              background: `radial-gradient(circle, ${n.color}, transparent 65%)`,
              filter: 'blur(30px)',
            }}
            animate={{
              x: [0, 20, 0],
              y: [0, -15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 25 + i * 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      {/* 3. 三层星点（视差） */}
      {layers.map(({ idx, cfg, stars }) => {
        const y = idx === 0 ? offsetSlow : idx === 1 ? offsetMid : offsetFast
        return (
          <motion.div
            key={idx}
            className="absolute inset-0"
            style={{ y }}
          >
            {stars.map((s) => (
              <motion.span
                key={s.id}
                className="absolute rounded-full"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: s.size,
                  height: s.size,
                  background: '#fff',
                  boxShadow: s.size > 1.5 ? '0 0 6px #fff, 0 0 12px rgba(0,240,255,0.4)' : 'none',
                }}
                animate={
                  s.twinkle
                    ? { opacity: [cfg.opacity * 0.3, cfg.opacity, cfg.opacity * 0.3] }
                    : { opacity: cfg.opacity }
                }
                transition={{
                  duration: s.duration,
                  delay: s.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )
      })}

      {/* 4. 流星 */}
      {meteors.map((m) => (
        <motion.div
          key={m.id}
          className="absolute"
          style={{ top: `${m.top}%`, left: '-10%' }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: ['0vw', '120vw'],
            y: ['0vh', '40vh'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            repeatDelay: 8 + Math.random() * 6,
            ease: 'easeIn',
          }}
        >
          <div
            className="block"
            style={{
              width: m.length,
              height: 1.5,
              background:
                'linear-gradient(90deg, transparent, rgba(0,240,255,0.9), #fff)',
              boxShadow: '0 0 8px rgba(0,240,255,0.8), 0 0 16px rgba(0,240,255,0.4)',
              transform: 'rotate(20deg)',
              transformOrigin: 'left center',
            }}
          />
        </motion.div>
      ))}

      {/* 5. 顶部 + 底部暗角，保证内容可读 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,2,7,0.7) 0%, transparent 18%, transparent 75%, rgba(2,2,7,0.9) 100%)',
        }}
      />
    </div>
  )
}
