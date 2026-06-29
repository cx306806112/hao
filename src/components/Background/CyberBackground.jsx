import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useParallax } from '../../hooks/useParallax'

/* ============================================================
   星座数据：星点在自身局部坐标系 (-1 ~ 1)。
   所有星座垂直排列成一条"星轨"，滚动时依次经过屏幕中央。
   整体调暗，让它像星云里的 faint 结构。
   ============================================================ */
const CONSTELLATIONS = [
  {
    id: 'orion',
    name: '猎户座',
    en: 'ORION',
    accent: '#6ec8d6',
    stars: [
      { x: -0.28, y: -0.42, r: 2.6 }, // Betelgeuse
      { x: 0.34, y: -0.38, r: 2.2 }, // Bellatrix
      { x: 0.12, y: 0.02, r: 1.7 }, // Mintaka
      { x: 0, y: 0.06, r: 1.9 }, // Alnilam
      { x: -0.14, y: 0.10, r: 1.7 }, // Alnitak
      { x: -0.22, y: 0.46, r: 2.2 }, // Saiph
      { x: 0.28, y: 0.44, r: 2.8 }, // Rigel
    ],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
  {
    id: 'ursa',
    name: '北斗七星',
    en: 'URSA MAJOR',
    accent: '#a88fd6',
    stars: [
      { x: -0.40, y: -0.18, r: 2.0 },
      { x: -0.24, y: -0.08, r: 1.8 },
      { x: -0.06, y: -0.16, r: 1.7 },
      { x: 0.08, y: 0.02, r: 1.8 },
      { x: 0.24, y: 0.10, r: 2.0 },
      { x: 0.40, y: 0.22, r: 1.8 },
      { x: 0.56, y: 0.36, r: 2.2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  },
  {
    id: 'cassiopeia',
    name: '仙后座',
    en: 'CASSIOPEIA',
    accent: '#c9768e',
    stars: [
      { x: -0.40, y: 0.04, r: 2.0 },
      { x: -0.18, y: -0.36, r: 2.2 },
      { x: 0, y: 0, r: 1.9 },
      { x: 0.18, y: -0.36, r: 2.2 },
      { x: 0.40, y: 0.04, r: 2.0 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: 'lyra',
    name: '天琴座',
    en: 'LYRA',
    accent: '#c9bf76',
    stars: [
      { x: 0, y: -0.48, r: 3.0 }, // Vega
      { x: -0.18, y: -0.12, r: 1.7 },
      { x: 0.18, y: -0.12, r: 1.7 },
      { x: -0.14, y: 0.30, r: 1.7 },
      { x: 0.14, y: 0.30, r: 1.7 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
  },
  {
    id: 'pleiades',
    name: '昴宿星团',
    en: 'PLEIADES',
    accent: '#8fd694',
    stars: [
      { x: -0.18, y: -0.20, r: 1.6 },
      { x: -0.08, y: -0.08, r: 2.0 },
      { x: 0.02, y: -0.14, r: 1.4 },
      { x: 0.12, y: -0.04, r: 1.8 },
      { x: 0.02, y: 0.04, r: 1.2 },
      { x: 0.10, y: 0.14, r: 1.6 },
      { x: -0.10, y: 0.12, r: 1.4 },
      { x: 0.20, y: 0.08, r: 1.4 },
      { x: -0.04, y: 0.24, r: 1.1 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 5], [5, 6], [6, 4], [4, 1], [5, 7], [6, 8]],
  },
]

const N = CONSTELLATIONS.length

/* 真实星云纹理（氛围层，调暗） */
const NEBULA_TEXTURES = [
  {
    id: 'neb-main',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2400&q=80',
    cx: 0.5,
    cy: 0.5,
    scale: 1.4,
    opacity: 0.35,
    hue: 0,
    saturate: 1.15,
  },
]

/* 深空背景星点 */
const STARS = Array.from({ length: 140 }, (_, i) => {
  const layer = i % 3
  return {
    id: i,
    x: Math.random(),
    y: Math.random() * 1.4 - 0.2,
    size: 0.4 + Math.random() * (layer === 2 ? 1.4 : 0.8),
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 5,
    layer,
  }
})

const METEORS = Array.from({ length: 2 }, (_, i) => ({
  id: `m-${i}`,
  top: 5 + Math.random() * 50,
  delay: i * 14 + Math.random() * 6,
  duration: 1.4 + Math.random() * 0.8,
  length: 100 + Math.random() * 80,
}))

export default function CyberBackground() {
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 22,
    mass: 0.8,
  })

  // 星轨总高度：每个星座占 100vh，滚动 0~1 对应星轨从第一个移到最后一个
  // translateY 从 0 移到 -(N-1) * slotHeight
  const slotHeight = 100 // vh
  const trackY = useTransform(smoothProgress, [0, 1], [0, -(N - 1) * slotHeight])

  const offsetFar = useParallax(0.04, { max: 30 })
  const offsetMid = useParallax(0.1, { max: 70 })
  const offsetNear = useParallax(0.18, { max: 130 })
  const offsetNeb = useParallax(0.02, { max: 15 })

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* 1. 深空底色 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, #0c0a24 0%, #050514 50%, #020207 100%)',
        }}
      />

      {/* 2. 星云纹理层（氛围，很暗） */}
      <motion.div className="absolute inset-0" style={{ y: offsetNeb }}>
        {NEBULA_TEXTURES.map((n) => (
          <NebulaImage key={n.id} n={n} />
        ))}
      </motion.div>

      {/* 3. 远景星点 */}
      <motion.div className="absolute inset-0" style={{ y: offsetFar }}>
        {STARS.filter((s) => s.layer === 0).map((s) => (
          <Star key={s.id} s={s} opacity={0.3} />
        ))}
      </motion.div>

      {/* 4. 中景星点 */}
      <motion.div className="absolute inset-0" style={{ y: offsetMid }}>
        {STARS.filter((s) => s.layer === 1).map((s) => (
          <Star key={s.id} s={s} opacity={0.55} />
        ))}
      </motion.div>

      {/* 5. 星座星轨 —— 垂直排列，滚动时从上往下经过中央 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          className="relative flex flex-col items-center justify-start"
          style={{ y: trackY, width: '100vmin', height: `${N * slotHeight}vh` }}
        >
          {CONSTELLATIONS.map((c, i) => (
            <ConstellationSlot key={c.id} c={c} index={i} progress={smoothProgress} total={N} />
          ))}
        </motion.div>
      </div>

      {/* 6. 近景星点 */}
      <motion.div className="absolute inset-0" style={{ y: offsetNear }}>
        {STARS.filter((s) => s.layer === 2).map((s) => (
          <Star key={s.id} s={s} opacity={0.9} bright />
        ))}
      </motion.div>

      {/* 7. 流星 */}
      {METEORS.map((m) => (
        <motion.div
          key={m.id}
          className="absolute"
          style={{ top: `${m.top}%`, left: '-15%' }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: ['0vw', '130vw'], y: ['0vh', '50vh'], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            repeatDelay: 14 + Math.random() * 8,
            ease: 'easeIn',
          }}
        >
          <div
            style={{
              width: m.length,
              height: 1.5,
              background:
                'linear-gradient(90deg, transparent, rgba(0,240,255,0.9), #fff)',
              boxShadow:
                '0 0 8px rgba(0,240,255,0.8), 0 0 16px rgba(0,240,255,0.4)',
              transform: 'rotate(18deg)',
              transformOrigin: 'left center',
            }}
          />
        </motion.div>
      ))}

      {/* 8. 暗角 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,2,7,0.55) 0%, transparent 22%, transparent 78%, rgba(2,2,7,0.85) 100%)',
        }}
      />
    </div>
  )
}

/* ---------------- 子组件 ---------------- */

function Star({ s, opacity, bright }) {
  return (
    <motion.span
      className="absolute rounded-full bg-white"
      style={{
        left: `${s.x * 100}%`,
        top: `${s.y * 100}%`,
        width: s.size,
        height: s.size,
        boxShadow: bright ? `0 0 4px #fff, 0 0 10px rgba(0,240,255,0.3)` : 'none',
      }}
      animate={{ opacity: [opacity * 0.3, opacity, opacity * 0.3] }}
      transition={{
        duration: s.duration,
        delay: s.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

function NebulaImage({ n }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${n.cx * 100}%`,
        top: `${n.cy * 100}%`,
        width: `${n.scale * 100}vmin`,
        height: `${n.scale * 100}vmin`,
        transform: 'translate(-50%, -50%)',
        opacity: n.opacity,
        mixBlendMode: 'screen',
      }}
      animate={{
        scale: [1, 1.03, 1],
        rotate: [0, 1, 0],
      }}
      transition={{
        duration: 50,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        src={n.url}
        alt=""
        className="h-full w-full object-cover"
        style={{
          filter: `hue-rotate(${n.hue}deg) saturate(${n.saturate}) brightness(0.7) contrast(1.05)`,
          maskImage: 'radial-gradient(circle, #000 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle, #000 25%, transparent 75%)',
        }}
        loading="eager"
        crossOrigin="anonymous"
      />
    </motion.div>
  )
}

function ConstellationSlot({ c, index, progress, total }) {
  // 根据当前滚动位置计算该星座距离中央的距离：
  // 0 表示正好在中央最清晰；>=1 表示被上下相邻星座覆盖，很淡。
  const fadeOpacity = useTransform(progress, (v) => {
    const current = v * (total - 1)
    const dist = Math.abs(current - index)
    const clamped = Math.min(dist, 1.5)
    return Math.max(0.06, 1 - clamped * 0.78)
  })

  const scale = useTransform(progress, (v) => {
    const current = v * (total - 1)
    const dist = Math.abs(current - index)
    return 0.85 + Math.max(0, 1 - dist) * 0.15
  })

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{
        height: '100vh',
        width: '100vmin',
        opacity: fadeOpacity,
        scale,
      }}
    >
      <ConstellationSvg c={c} />
    </motion.div>
  )
}

function ConstellationSvg({ c }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="-0.65 -0.65 1.3 1.3"
      style={{ overflow: 'visible' }}
    >
      {/* 极淡的发光底，让星座有"嵌在星云里"的朦胧感 */}
      <circle
        cx="0"
        cy="0"
        r="0.35"
        fill={c.accent}
        opacity={0.03}
        style={{ filter: 'blur(0.08px)' }}
      />

      {/* 连线 —— 很细、半透明 */}
      {c.lines.map(([a, b], i) => {
        const sa = c.stars[a]
        const sb = c.stars[b]
        return (
          <motion.line
            key={i}
            x1={sa.x}
            y1={sa.y}
            x2={sb.x}
            y2={sb.y}
            stroke={c.accent}
            strokeWidth={0.003}
            strokeOpacity={0.22}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.22 }}
            transition={{ duration: 2, delay: 0.4 + i * 0.1 }}
          />
        )
      })}

      {/* 星点 —— 小、低对比，不抢眼 */}
      {c.stars.map((s, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.25 + i * 0.08,
            type: 'spring',
            stiffness: 200,
            damping: 18,
          }}
        >
          <circle
            cx={s.x}
            cy={s.y}
            r={s.r * 0.012}
            fill={c.accent}
            opacity={0.18}
            style={{ filter: 'blur(0.01px)' }}
          />
          <circle cx={s.x} cy={s.y} r={s.r * 0.006} fill="#fff" opacity={0.65} />
          <circle cx={s.x} cy={s.y} r={s.r * 0.003} fill={c.accent} opacity={0.8} />
        </motion.g>
      ))}
    </svg>
  )
}
