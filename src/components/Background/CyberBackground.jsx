import { motion } from 'motion/react'
import { useParallax } from '../../hooks/useParallax'

/* ============================================================
   星座数据：x/y 为屏幕归一化坐标 (0~1)。
   星座整体位置固定，滚动时随视差缓慢上移，营造星空缓缓流过的感觉。
   ============================================================ */
const CONSTELLATIONS = [
  {
    id: 'orion',
    name: '猎户座',
    en: 'ORION',
    accent: '#00f0ff',
    cx: 0.62,
    cy: 0.42,
    scale: 1,
    stars: [
      { x: -0.05, y: -0.10, r: 2.2 }, // Betelgeuse
      { x: 0.08, y: -0.09, r: 1.8 }, // Bellatrix
      { x: 0.03, y: 0.01, r: 1.4 }, // Mintaka
      { x: 0, y: 0.02, r: 1.5 }, // Alnilam
      { x: -0.03, y: 0.03, r: 1.4 }, // Alnitak
      { x: -0.05, y: 0.13, r: 1.8 }, // Saiph
      { x: 0.06, y: 0.12, r: 2.3 }, // Rigel
    ],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
  {
    id: 'ursa',
    name: '北斗七星',
    en: 'URSA MAJOR',
    accent: '#b16cff',
    cx: 0.22,
    cy: 0.18,
    scale: 0.9,
    stars: [
      { x: -0.05, y: 0.02, r: 1.6 },
      { x: -0.03, y: 0.04, r: 1.5 },
      { x: 0, y: 0.025, r: 1.4 },
      { x: 0.025, y: 0, r: 1.5 },
      { x: 0.05, y: -0.02, r: 1.6 },
      { x: 0.08, y: -0.04, r: 1.5 },
      { x: 0.11, y: -0.06, r: 1.7 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  },
  {
    id: 'cassiopeia',
    name: '仙后座',
    en: 'CASSIOPEIA',
    accent: '#ff2a6d',
    cx: 0.78,
    cy: 0.78,
    scale: 0.85,
    stars: [
      { x: -0.07, y: 0, r: 1.6 },
      { x: -0.035, y: -0.05, r: 1.7 },
      { x: 0, y: 0, r: 1.5 },
      { x: 0.035, y: -0.05, r: 1.7 },
      { x: 0.07, y: 0, r: 1.6 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: 'lyra',
    name: '天琴座',
    en: 'LYRA',
    accent: '#f9f002',
    cx: 0.15,
    cy: 0.55,
    scale: 0.8,
    stars: [
      { x: 0, y: -0.06, r: 2.2 }, // Vega
      { x: -0.025, y: -0.01, r: 1.3 },
      { x: 0.025, y: -0.01, r: 1.3 },
      { x: -0.02, y: 0.04, r: 1.3 },
      { x: 0.02, y: 0.04, r: 1.3 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
  },
]

/* ============================================================
   真实星云：用多层 SVG 不规则路径 + 模糊渐变模拟丝缕结构。
   每个星云由若干「团块」组成，团块颜色不同、位置错开、模糊半径不同，
   叠加出有层次感的丝缕星云（类似鹰状、玫瑰、船底座星云）。
   ============================================================ */
const NEBULAE = [
  {
    id: 'neb-rose',
    cx: 0.18,
    cy: 0.32,
    scale: 1.2,
    blobs: [
      { dx: 0, dy: 0, r: 0.32, color: 'rgba(255,42,109,0.55)', blur: 60 },
      { dx: 0.08, dy: -0.04, r: 0.26, color: 'rgba(177,108,255,0.45)', blur: 50 },
      { dx: -0.06, dy: 0.06, r: 0.22, color: 'rgba(0,240,255,0.35)', blur: 45 },
      { dx: 0.04, dy: 0.1, r: 0.18, color: 'rgba(255,200,80,0.3)', blur: 35 },
    ],
  },
  {
    id: 'neb-cyan',
    cx: 0.85,
    cy: 0.22,
    scale: 1,
    blobs: [
      { dx: 0, dy: 0, r: 0.28, color: 'rgba(0,240,255,0.5)', blur: 55 },
      { dx: -0.06, dy: 0.05, r: 0.22, color: 'rgba(120,200,255,0.4)', blur: 45 },
      { dx: 0.07, dy: -0.03, r: 0.2, color: 'rgba(177,108,255,0.35)', blur: 40 },
    ],
  },
  {
    id: 'neb-emerald',
    cx: 0.72,
    cy: 0.68,
    scale: 1.1,
    blobs: [
      { dx: 0, dy: 0, r: 0.3, color: 'rgba(57,255,140,0.4)', blur: 60 },
      { dx: 0.08, dy: 0.04, r: 0.22, color: 'rgba(0,240,200,0.35)', blur: 50 },
      { dx: -0.07, dy: -0.05, r: 0.18, color: 'rgba(180,255,120,0.3)', blur: 40 },
    ],
  },
  {
    id: 'neb-amber',
    cx: 0.45,
    cy: 0.88,
    scale: 0.9,
    blobs: [
      { dx: 0, dy: 0, r: 0.26, color: 'rgba(255,160,40,0.4)', blur: 50 },
      { dx: 0.05, dy: -0.04, r: 0.2, color: 'rgba(255,80,120,0.3)', blur: 40 },
      { dx: -0.04, dy: 0.05, r: 0.18, color: 'rgba(255,220,100,0.25)', blur: 35 },
    ],
  },
]

/* 深空背景星点 */
const STARS = Array.from({ length: 180 }, (_, i) => {
  const layer = i % 3
  return {
    id: i,
    x: Math.random(),
    y: Math.random() * 1.4 - 0.2, // 多生成一些以便视差滚动时持续可见
    size: 0.4 + Math.random() * (layer === 2 ? 1.6 : 0.9),
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 5,
    layer,
  }
})

/* 偶发流星 */
const METEORS = Array.from({ length: 2 }, (_, i) => ({
  id: `m-${i}`,
  top: 5 + Math.random() * 50,
  delay: i * 11 + Math.random() * 6,
  duration: 1.4 + Math.random() * 0.8,
  length: 100 + Math.random() * 80,
}))

export default function CyberBackground() {
  // 三层视差：远星慢、近星快
  const offsetFar = useParallax(0.05, { max: 40 })
  const offsetMid = useParallax(0.12, { max: 90 })
  const offsetNear = useParallax(0.2, { max: 160 })

  // 星座视差（中景，缓慢）
  const offsetConst = useParallax(0.1, { max: 80 })

  // 星云视差（更慢，营造深空感）
  const offsetNeb = useParallax(0.04, { max: 30 })

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
            'radial-gradient(ellipse at 30% 20%, #0c0a22 0%, #060514 40%, #020207 100%)',
        }}
      />

      {/* 2. 星云（最远层，缓慢视差 + 内部漂移） */}
      <motion.div
        className="absolute inset-0"
        style={{ y: offsetNeb }}
      >
        {NEBULAE.map((neb) => (
          <Nebula key={neb.id} neb={neb} />
        ))}
      </motion.div>

      {/* 3. 远景星点（视差最慢） */}
      <motion.div className="absolute inset-0" style={{ y: offsetFar }}>
        {STARS.filter((s) => s.layer === 0).map((s) => (
          <Star key={s.id} s={s} opacity={0.4} />
        ))}
      </motion.div>

      {/* 4. 中景星点 + 星座（一起视差） */}
      <motion.div className="absolute inset-0" style={{ y: offsetMid }}>
        {STARS.filter((s) => s.layer === 1).map((s) => (
          <Star key={s.id} s={s} opacity={0.7} />
        ))}
      </motion.div>

      {/* 5. 星座层（中景视差） */}
      <motion.div className="absolute inset-0" style={{ y: offsetConst }}>
        {CONSTELLATIONS.map((c) => (
          <Constellation key={c.id} c={c} />
        ))}
      </motion.div>

      {/* 6. 近景星点（视差最快） */}
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

      {/* 8. 暗角 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,2,7,0.5) 0%, transparent 20%, transparent 80%, rgba(2,2,7,0.85) 100%)',
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
        boxShadow: bright ? `0 0 4px #fff, 0 0 8px rgba(0,240,255,0.4)` : 'none',
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

function Nebula({ neb }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${neb.cx * 100}%`,
        top: `${neb.cy * 100}%`,
        width: `${neb.scale * 60}vmin`,
        height: `${neb.scale * 60}vmin`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        x: [0, 12, 0],
        y: [0, -8, 0],
        scale: [1, 1.04, 1],
      }}
      transition={{
        duration: 30 + Math.random() * 10,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {neb.blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${50 + b.dx * 100}%`,
            top: `${50 + b.dy * 100}%`,
            width: `${b.r * 200}%`,
            height: `${b.r * 200}%`,
            background: `radial-gradient(circle, ${b.color} 0%, ${b.color.replace(/[\d.]+\)$/, '0)')} 70%)`,
            filter: `blur(${b.blur * 0.15}px)`,
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'screen',
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 20 + i * 4,
            delay: i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
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
        width={c.scale * 280}
        height={c.scale * 280}
        viewBox="-0.5 -0.5 1 1"
        style={{ overflow: 'visible' }}
      >
        {/* 连线 */}
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
              strokeWidth={0.004}
              strokeOpacity={0.4}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 1.5, delay: 0.3 + i * 0.1 }}
              style={{ filter: `drop-shadow(0 0 0.01px ${c.accent})` }}
            />
          )
        })}
        {/* 星点 */}
        {c.stars.map((s, i) => (
          <motion.g
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2 + i * 0.08,
              type: 'spring',
              stiffness: 200,
              damping: 16,
            }}
          >
            <circle
              cx={s.x}
              cy={s.y}
              r={s.r * 0.012}
              fill={c.accent}
              opacity={0.25}
              style={{ filter: 'blur(0.01px)' }}
            />
            <circle cx={s.x} cy={s.y} r={s.r * 0.006} fill="#fff" />
            <circle cx={s.x} cy={s.y} r={s.r * 0.003} fill={c.accent} />
          </motion.g>
        ))}
      </svg>
    </motion.div>
  )
}
