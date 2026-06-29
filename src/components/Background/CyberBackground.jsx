import { motion } from 'motion/react'
import { useParallax } from '../../hooks/useParallax'

/* ============================================================
   星座数据：x/y 为屏幕归一化坐标 (0~1)。
   星座故意"藏"在星云亮度较高的区域，连线细、星点小。
   滚动时整体缓慢视差上移。
   ============================================================ */
const CONSTELLATIONS = [
  {
    id: 'orion',
    name: '猎户座',
    en: 'ORION',
    accent: '#a0f0ff',
    cx: 0.5,
    cy: 0.48,
    scale: 1.05,
    stars: [
      { x: -0.055, y: -0.11, r: 2.0 },
      { x: 0.075, y: -0.10, r: 1.7 },
      { x: 0.025, y: 0.00, r: 1.3 },
      { x: 0, y: 0.015, r: 1.4 },
      { x: -0.025, y: 0.03, r: 1.3 },
      { x: -0.05, y: 0.12, r: 1.7 },
      { x: 0.06, y: 0.11, r: 2.1 },
    ],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
  {
    id: 'ursa',
    name: '北斗七星',
    en: 'URSA MAJOR',
    accent: '#d8b8ff',
    cx: 0.18,
    cy: 0.22,
    scale: 0.85,
    stars: [
      { x: -0.05, y: 0.02, r: 1.5 },
      { x: -0.03, y: 0.04, r: 1.4 },
      { x: 0, y: 0.025, r: 1.3 },
      { x: 0.025, y: 0, r: 1.4 },
      { x: 0.05, y: -0.02, r: 1.5 },
      { x: 0.08, y: -0.04, r: 1.4 },
      { x: 0.11, y: -0.06, r: 1.6 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  },
  {
    id: 'cassiopeia',
    name: '仙后座',
    en: 'CASSIOPEIA',
    accent: '#ffb8d0',
    cx: 0.82,
    cy: 0.74,
    scale: 0.8,
    stars: [
      { x: -0.07, y: 0, r: 1.5 },
      { x: -0.035, y: -0.05, r: 1.6 },
      { x: 0, y: 0, r: 1.4 },
      { x: 0.035, y: -0.05, r: 1.6 },
      { x: 0.07, y: 0, r: 1.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
]

/* 真实星云纹理：NASA/哈勃风格的彩色丝缕星云。可替换为本地图片。 */
const NEBULA_TEXTURES = [
  {
    id: 'neb-main',
    // 经典蟹状/船底座风格星云 (Unsplash，可替换成本地资源)
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2400&q=80',
    cx: 0.5,
    cy: 0.45,
    scale: 1.25,
    opacity: 0.55,
    hue: 0,
    saturate: 1.25,
  },
  {
    id: 'neb-side',
    // 猎户/玫瑰星云风格
    url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=2000&q=80',
    cx: 0.12,
    cy: 0.7,
    scale: 0.9,
    opacity: 0.35,
    hue: -15,
    saturate: 1.1,
  },
  {
    id: 'neb-top',
    url: 'https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?w=2000&q=80',
    cx: 0.88,
    cy: 0.18,
    scale: 0.8,
    opacity: 0.3,
    hue: 30,
    saturate: 1.2,
  },
]

/* 深空背景星点 */
const STARS = Array.from({ length: 160 }, (_, i) => {
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
  delay: i * 12 + Math.random() * 6,
  duration: 1.4 + Math.random() * 0.8,
  length: 100 + Math.random() * 80,
}))

export default function CyberBackground() {
  const offsetFar = useParallax(0.04, { max: 30 })
  const offsetMid = useParallax(0.1, { max: 70 })
  const offsetNear = useParallax(0.18, { max: 130 })
  const offsetConst = useParallax(0.08, { max: 50 })
  const offsetNeb = useParallax(0.03, { max: 20 })

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* 1. 深空底色 + 细微星光噪点 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, #0c0a24 0%, #050514 50%, #020207 100%)',
        }}
      />

      {/* 2. 真实星云纹理层（最远，最慢视差） */}
      <motion.div
        className="absolute inset-0"
        style={{ y: offsetNeb }}
      >
        {NEBULA_TEXTURES.map((n) => (
          <NebulaImage key={n.id} n={n} />
        ))}
      </motion.div>

      {/* 3. 远景星点 */}
      <motion.div className="absolute inset-0" style={{ y: offsetFar }}>
        {STARS.filter((s) => s.layer === 0).map((s) => (
          <Star key={s.id} s={s} opacity={0.35} />
        ))}
      </motion.div>

      {/* 4. 中景星点 */}
      <motion.div className="absolute inset-0" style={{ y: offsetMid }}>
        {STARS.filter((s) => s.layer === 1).map((s) => (
          <Star key={s.id} s={s} opacity={0.65} />
        ))}
      </motion.div>

      {/* 5. 星座层（藏在星云里） */}
      <motion.div className="absolute inset-0" style={{ y: offsetConst }}>
        {CONSTELLATIONS.map((c) => (
          <Constellation key={c.id} c={c} />
        ))}
      </motion.div>

      {/* 6. 近景星点 */}
      <motion.div className="absolute inset-0" style={{ y: offsetNear }}>
        {STARS.filter((s) => s.layer === 2).map((s) => (
          <Star key={s.id} s={s} opacity={1} bright />
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
            repeatDelay: 12 + Math.random() * 8,
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

      {/* 8. 暗角（让中间内容可读） */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,2,7,0.45) 0%, transparent 22%, transparent 78%, rgba(2,2,7,0.8) 100%)',
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
        boxShadow: bright ? `0 0 4px #fff, 0 0 10px rgba(0,240,255,0.35)` : 'none',
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
        width: `${n.scale * 100}vw`,
        height: `${n.scale * 100}vw`,
        minWidth: `${n.scale * 100}vh`,
        minHeight: `${n.scale * 100}vh`,
        transform: 'translate(-50%, -50%)',
        opacity: n.opacity,
        mixBlendMode: 'screen',
      }}
      animate={{
        scale: [1, 1.03, 1],
        rotate: [0, 1, 0],
      }}
      transition={{
        duration: 40 + Math.random() * 20,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        src={n.url}
        alt=""
        className="h-full w-full object-cover"
        style={{
          filter: `hue-rotate(${n.hue}deg) saturate(${n.saturate}) brightness(0.85) contrast(1.1)`,
          maskImage: 'radial-gradient(circle, #000 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle, #000 30%, transparent 80%)',
        }}
        loading="eager"
        crossOrigin="anonymous"
      />
    </motion.div>
  )
}

function Constellation({ c }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${c.cx * 100}%`,
        top: `${c.cy * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <svg
        width={c.scale * 260}
        height={c.scale * 260}
        viewBox="-0.5 -0.5 1 1"
        style={{ overflow: 'visible' }}
      >
        {/* 极淡的发光底 */}
        <circle
          cx="0"
          cy="0"
          r="0.18"
          fill={c.accent}
          opacity={0.04}
          style={{ filter: 'blur(0.04px)' }}
        />

        {/* 连线 —— 很细，半隐半现，像星云里的"尘埃连线" */}
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
              strokeWidth={0.0025}
              strokeOpacity={0.28}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.28 }}
              transition={{ duration: 2, delay: 0.5 + i * 0.12 }}
              style={{ filter: `drop-shadow(0 0 0.008px ${c.accent})` }}
            />
          )
        })}

        {/* 星点 —— 很小，像星云里的亮星 */}
        {c.stars.map((s, i) => (
          <motion.g
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.3 + i * 0.1,
              type: 'spring',
              stiffness: 200,
              damping: 16,
            }}
          >
            <circle
              cx={s.x}
              cy={s.y}
              r={s.r * 0.010}
              fill={c.accent}
              opacity={0.2}
              style={{ filter: 'blur(0.008px)' }}
            />
            <circle cx={s.x} cy={s.y} r={s.r * 0.005} fill="#fff" />
            <circle cx={s.x} cy={s.y} r={s.r * 0.0025} fill={c.accent} />
          </motion.g>
        ))}
      </svg>
    </motion.div>
  )
}
