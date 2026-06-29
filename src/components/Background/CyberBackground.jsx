import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useParallax } from '../../hooks/useParallax'
import { useScrollProgress } from '../../hooks/useScrollProgress'

/**
 * 星座数据：归一化坐标 (0~100)，r 为星点半径。
 * lines 为 stars 索引对数组。
 */
const CONSTELLATIONS = [
  {
    id: 'orion',
    name: '猎户座',
    en: 'ORION',
    accent: '#00f0ff',
    stars: [
      { x: 35, y: 28, r: 1.6 }, // Betelgeuse 左上肩
      { x: 65, y: 30, r: 1.4 }, // Bellatrix 右上肩
      { x: 56, y: 50, r: 1.2 }, // Mintaka 腰带
      { x: 50, y: 52, r: 1.3 }, // Alnilam
      { x: 44, y: 54, r: 1.2 }, // Alnitak
      { x: 40, y: 74, r: 1.5 }, // Saiph 左脚
      { x: 62, y: 72, r: 1.8 }, // Rigel 右脚
    ],
    lines: [
      [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6],
    ],
  },
  {
    id: 'ursa',
    name: '北斗七星',
    en: 'URSA MAJOR',
    accent: '#b16cff',
    stars: [
      { x: 18, y: 30, r: 1.4 },
      { x: 30, y: 25, r: 1.3 },
      { x: 45, y: 32, r: 1.2 },
      { x: 55, y: 42, r: 1.3 },
      { x: 66, y: 48, r: 1.4 },
      { x: 78, y: 58, r: 1.3 },
      { x: 88, y: 68, r: 1.5 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    ],
  },
  {
    id: 'cassiopeia',
    name: '仙后座',
    en: 'CASSIOPEIA',
    accent: '#ff2a6d',
    stars: [
      { x: 15, y: 48, r: 1.4 },
      { x: 32, y: 25, r: 1.5 },
      { x: 50, y: 50, r: 1.3 },
      { x: 68, y: 25, r: 1.5 },
      { x: 85, y: 48, r: 1.4 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4],
    ],
  },
  {
    id: 'lyra',
    name: '天琴座',
    en: 'LYRA',
    accent: '#f9f002',
    stars: [
      { x: 50, y: 18, r: 1.9 }, // Vega 织女星
      { x: 40, y: 40, r: 1.2 },
      { x: 60, y: 40, r: 1.2 },
      { x: 42, y: 65, r: 1.2 },
      { x: 58, y: 65, r: 1.2 },
    ],
    lines: [
      [0, 1], [0, 2], [1, 3], [2, 4], [3, 4],
    ],
  },
  {
    id: 'pleiades',
    name: '昴宿星团',
    en: 'PLEIADES',
    accent: '#39ff14',
    stars: [
      { x: 40, y: 35, r: 1.0 },
      { x: 45, y: 40, r: 1.2 },
      { x: 50, y: 38, r: 0.9 },
      { x: 55, y: 42, r: 1.1 },
      { x: 48, y: 45, r: 0.8 },
      { x: 52, y: 50, r: 1.0 },
      { x: 43, y: 50, r: 0.9 },
      { x: 58, y: 48, r: 0.9 },
      { x: 46, y: 55, r: 0.7 },
    ],
    lines: [],
  },
]

const NEBULAE = [
  { x: 15, y: 20, size: 50, color: 'rgba(177,108,255,0.22)' },
  { x: 80, y: 15, size: 45, color: 'rgba(0,240,255,0.16)' },
  { x: 70, y: 75, size: 55, color: 'rgba(255,42,109,0.18)' },
  { x: 25, y: 80, size: 40, color: 'rgba(57,255,20,0.10)' },
]

/**
 * 计算某星座在滚动进度 p (0~1) 下的可见度。
 * 中心最亮，相邻重叠淡入淡出。
 */
function visibility(i, p) {
  const n = CONSTELLATIONS.length
  const center = (i + 0.5) / n
  const dist = Math.abs(p - center)
  const r = 1.4 / n
  if (dist >= r) return 0
  const t = dist / r
  return 1 - t * t // 平方衰减，中心 1 边缘 0
}

export default function CyberBackground() {
  const progress = useScrollProgress()
  const offsetSlow = useParallax(0.08, { max: 60 })
  const offsetMid = useParallax(0.18, { max: 120 })

  // 环境星点（不随星座切换）
  const ambient = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.5 + Math.random() * 1.3,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
      })),
    [],
  )

  // 流星
  const meteors = useMemo(
    () =>
      Array.from({ length: 2 }, (_, i) => ({
        id: `m-${i}`,
        top: 10 + Math.random() * 50,
        delay: i * 9 + Math.random() * 5,
        duration: 1.2 + Math.random() * 0.6,
        length: 90 + Math.random() * 80,
      })),
    [],
  )

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
            'radial-gradient(ellipse at 50% 0%, #0a0a1f 0%, #050510 45%, #020207 100%)',
        }}
      />

      {/* 2. 星云团（环境光晕） */}
      <motion.div
        className="absolute inset-0"
        style={{ y: offsetSlow }}
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        {NEBULAE.map((n, i) => (
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
            animate={{ x: [0, 18, 0], y: [0, -12, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 25 + i * 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      {/* 3. 环境星点（视差中景） */}
      <motion.div className="absolute inset-0" style={{ y: offsetMid }}>
        {ambient.map((s) => (
          <motion.span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      {/* 4. 星座层 —— 随滚动切换 */}
      <div className="absolute inset-0">
        {CONSTELLATIONS.map((c, i) => {
          const v = visibility(i, progress)
          if (v <= 0.001) return null
          return (
            <ConstellationLayer key={c.id} c={c} v={v} />
          )
        })}

        {/* 当前星座名称指示 */}
        <ConstellationLabel progress={progress} />
      </div>

      {/* 5. 流星 */}
      {meteors.map((m) => (
        <motion.div
          key={m.id}
          className="absolute"
          style={{ top: `${m.top}%`, left: '-10%' }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: ['0vw', '120vw'], y: ['0vh', '40vh'], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            repeatDelay: 10 + Math.random() * 6,
            ease: 'easeIn',
          }}
        >
          <div
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

      {/* 6. 暗角 */}
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

/* ---------------- 子组件 ---------------- */

function ConstellationLayer({ c, v }) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity: v }}
      animate={{ scale: 0.92 + v * 0.08 }}
      transition={{ duration: 0.3 }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 连线 */}
        {c.lines.map(([a, b], idx) => {
          const sa = c.stars[a]
          const sb = c.stars[b]
          return (
            <motion.line
              key={idx}
              x1={sa.x}
              y1={sa.y}
              x2={sb.x}
              y2={sb.y}
              stroke={c.accent}
              strokeWidth={0.15}
              strokeOpacity={0.5 * v}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 * v }}
              transition={{ duration: 0.8, delay: 0.1 + idx * 0.08 }}
              style={{ filter: `drop-shadow(0 0 1px ${c.accent})` }}
            />
          )
        })}

        {/* 星点 */}
        {c.stars.map((s, idx) => (
          <motion.g
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: v }}
            transition={{
              duration: 0.5,
              delay: idx * 0.06,
              type: 'spring',
              stiffness: 200,
              damping: 18,
            }}
          >
            {/* 外发光 */}
            <circle
              cx={s.x}
              cy={s.y}
              r={s.r * 1.6}
              fill={c.accent}
              opacity={0.25}
              style={{ filter: 'blur(2px)' }}
            />
            {/* 实心星点 */}
            <circle cx={s.x} cy={s.y} r={s.r * 0.55} fill="#fff" />
            <circle
              cx={s.x}
              cy={s.y}
              r={s.r * 0.3}
              fill={c.accent}
              opacity={0.9}
            />
          </motion.g>
        ))}
      </svg>
    </motion.div>
  )
}

function ConstellationLabel({ progress }) {
  // 当前最亮的星座
  const n = CONSTELLATIONS.length
  let active = 0
  let max = -1
  for (let i = 0; i < n; i++) {
    const v = visibility(i, progress)
    if (v > max) {
      max = v
      active = i
    }
  }
  if (max < 0.35) return null
  const c = CONSTELLATIONS[active]
  return (
    <motion.div
      key={c.id}
      className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: Math.min(1, max), y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="font-heading text-2xl font-bold tracking-[0.3em] sm:text-3xl"
        style={{ color: c.accent, textShadow: `0 0 12px ${c.accent}88` }}
      >
        {c.en}
      </div>
      <div className="mt-1 font-mono text-xs text-ink-faint">
        {c.name} · {String(active + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}
      </div>
    </motion.div>
  )
}
