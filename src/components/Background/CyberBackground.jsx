import { useMemo, useState } from 'react'
import { motion, useScroll, useSpring, useMotionValueEvent } from 'motion/react'
import { useParallax } from '../../hooks/useParallax'

const DEG = Math.PI / 180

/* ============================================================
   星座数据：星点用 (lat, lon) 球面坐标（度），lon 为相对偏移。
   centerLon 由模块下方均匀分配（360/N * i）。
   ============================================================ */
const CONSTELLATIONS = [
  {
    id: 'orion',
    name: '猎户座',
    en: 'ORION',
    accent: '#00f0ff',
    stars: [
      { lat: 11, lon: -7, r: 1.6 }, // Betelgeuse
      { lat: 10, lon: 7, r: 1.4 }, // Bellatrix
      { lat: 0, lon: 3, r: 1.2 }, // Mintaka
      { lat: -1, lon: 0, r: 1.3 }, // Alnilam
      { lat: -2, lon: -3, r: 1.2 }, // Alnitak
      { lat: -12, lon: -5, r: 1.5 }, // Saiph
      { lat: -11, lon: 6, r: 1.8 }, // Rigel
    ],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
  {
    id: 'ursa',
    name: '北斗七星',
    en: 'URSA MAJOR',
    accent: '#b16cff',
    stars: [
      { lat: 10, lon: -16, r: 1.4 },
      { lat: 12, lon: -10, r: 1.3 },
      { lat: 9, lon: -2.5, r: 1.2 },
      { lat: 4, lon: 2.5, r: 1.3 },
      { lat: 1, lon: 8, r: 1.4 },
      { lat: -4, lon: 14, r: 1.3 },
      { lat: -9, lon: 19, r: 1.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  },
  {
    id: 'cassiopeia',
    name: '仙后座',
    en: 'CASSIOPEIA',
    accent: '#ff2a6d',
    stars: [
      { lat: 1, lon: -17.5, r: 1.4 },
      { lat: 12.5, lon: -9, r: 1.5 },
      { lat: 0, lon: 0, r: 1.3 },
      { lat: 12.5, lon: 9, r: 1.5 },
      { lat: 1, lon: 17.5, r: 1.4 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: 'lyra',
    name: '天琴座',
    en: 'LYRA',
    accent: '#f9f002',
    stars: [
      { lat: 16, lon: 0, r: 1.9 }, // Vega 织女
      { lat: 5, lon: -5, r: 1.2 },
      { lat: 5, lon: 5, r: 1.2 },
      { lat: -7.5, lon: -4, r: 1.2 },
      { lat: -7.5, lon: 4, r: 1.2 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
  },
  {
    id: 'pleiades',
    name: '昴宿星团',
    en: 'PLEIADES',
    accent: '#39ff14',
    stars: [
      { lat: 7.5, lon: -5, r: 1.0 },
      { lat: 5, lon: -2.5, r: 1.2 },
      { lat: 6, lon: 0, r: 0.9 },
      { lat: 4, lon: 2.5, r: 1.1 },
      { lat: 2.5, lon: -1, r: 0.8 },
      { lat: 0, lon: 1, r: 1.0 },
      { lat: 0, lon: -3.5, r: 0.9 },
      { lat: 1, lon: 4, r: 0.9 },
      { lat: -2.5, lon: -2, r: 0.7 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 5], [5, 6], [6, 4], [4, 1], [5, 7], [6, 8]],
  },
]

const N = CONSTELLATIONS.length
CONSTELLATIONS.forEach((c, i) => {
  c.centerLon = (360 / N) * i
})

/* 展开为全局星点 + 连线 */
const ALL_STARS = []
const ALL_LINES = []
const RANGES = []
{
  let gi = 0
  CONSTELLATIONS.forEach((c, ci) => {
    const start = gi
    c.stars.forEach((s) => {
      ALL_STARS.push({
        lat: s.lat,
        lon: s.lon + c.centerLon,
        r: s.r,
        accent: c.accent,
        ci,
      })
      gi++
    })
    RANGES.push({ start, end: gi - 1 })
    c.lines.forEach(([a, b]) => {
      ALL_LINES.push({
        a: start + a,
        b: start + b,
        accent: c.accent,
        ci,
        kind: 'inner',
      })
    })
  })
  // 跨星座首尾桥接，闭合环
  for (let i = 0; i < N; i++) {
    ALL_LINES.push({
      a: RANGES[i].end,
      b: RANGES[(i + 1) % N].start,
      accent: 'rgba(177,108,255,0.55)',
      ci: i,
      kind: 'bridge',
    })
  }
}

/* 球面坐标 -> 3D */
function sph(lat, lon) {
  const la = lat * DEG
  const lo = lon * DEG
  return {
    x: Math.cos(la) * Math.sin(lo),
    y: Math.sin(la),
    z: Math.cos(la) * Math.cos(lo),
  }
}
/* 绕 Y 轴旋转 */
function rotY(p, a) {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return { x: p.x * c - p.z * s, y: p.y, z: p.x * s + p.z * c }
}
const PERSP = 2.8
function proj(p) {
  const z = p.z + PERSP
  const f = PERSP / Math.max(0.1, z)
  return { sx: p.x * f, sy: -p.y * f, f, z: p.z }
}
function zOpacity(z) {
  // z 范围 -1~1；z<-0.4 消失，z>0.1 完全可见
  return Math.max(0, Math.min(1, (z + 0.4) / 0.5))
}

const NEBULAE = [
  { x: 15, y: 20, size: 50, color: 'rgba(177,108,255,0.22)' },
  { x: 80, y: 15, size: 45, color: 'rgba(0,240,255,0.16)' },
  { x: 70, y: 75, size: 55, color: 'rgba(255,42,109,0.18)' },
  { x: 25, y: 80, size: 40, color: 'rgba(57,255,20,0.10)' },
]

export default function CyberBackground() {
  const { scrollYProgress } = useScroll()
  const angleMV = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 18,
    mass: 0.6,
  })
  const [angle, setAngle] = useState(0)
  useMotionValueEvent(angleMV, 'change', (v) => setAngle(v * Math.PI * 2))

  const offsetSlow = useParallax(0.08, { max: 40 })

  // 环境星点
  const ambient = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.5 + Math.random() * 1.2,
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

  // 投影所有星点
  const projected = useMemo(
    () =>
      ALL_STARS.map((s) => {
        const p3 = sph(s.lat, s.lon)
        const p3r = rotY(p3, angle)
        const p2 = proj(p3r)
        return { ...p2, r: s.r, accent: s.accent, ci: s.ci }
      }),
    [angle],
  )

  // 当前正对的星座（平滑可见度）
  const { activeIdx, activeVis } = useMemo(() => {
    const p = angle / (Math.PI * 2)
    const norm = ((p % 1) + 1) % 1
    const idx = Math.round(norm * N) % N
    const center = (idx + 0.5) / N
    const dist = Math.min(Math.abs(norm - center), 1 - Math.abs(norm - center))
    const vis = Math.max(0, 1 - dist * N * 0.7)
    return { activeIdx: idx, activeVis: vis }
  }, [angle])
  const activeC = CONSTELLATIONS[activeIdx]

  // 按 z 排序（远到近）
  const items = useMemo(() => {
    const arr = []
    ALL_LINES.forEach((ln, i) => {
      const a = projected[ln.a]
      const b = projected[ln.b]
      if (!a || !b) return
      const op = Math.min(zOpacity(a.z), zOpacity(b.z))
      if (op < 0.01) return
      arr.push({
        type: 'line',
        z: Math.min(a.z, b.z),
        key: `l-${i}`,
        a,
        b,
        accent: ln.accent,
        op,
        kind: ln.kind,
      })
    })
    projected.forEach((s, i) => {
      const op = zOpacity(s.z)
      if (op < 0.01) return
      arr.push({ type: 'star', z: s.z, key: `s-${i}`, s, op })
    })
    arr.sort((x, y) => x.z - y.z)
    return arr
  }, [projected])

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
            'radial-gradient(ellipse at 50% 50%, #0a0a1f 0%, #050510 45%, #020207 100%)',
        }}
      />

      {/* 2. 星云团 */}
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

      {/* 3. 环境星点 */}
      <motion.div className="absolute inset-0">
        {ambient.map((s) => (
          <motion.span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.15, 0.7, 0.15] }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      {/* 4. 星座球 —— 滚动旋转 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="-1.9 -1.9 3.8 3.8"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 球面光环 */}
          <defs>
            <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="rgba(0,240,255,0)" />
              <stop offset="100%" stopColor="rgba(0,240,255,0.08)" />
            </radialGradient>
          </defs>
          <circle cx="0" cy="0" r="1.05" fill="url(#sphereGlow)" />
          <circle
            cx="0"
            cy="0"
            r="1"
            fill="none"
            stroke="rgba(0,240,255,0.10)"
            strokeWidth="0.004"
          />

          {/* 经线（赤道）淡环 */}
          <ellipse
            cx="0"
            cy="0"
            rx="1"
            ry="0.18"
            fill="none"
            stroke="rgba(177,108,255,0.10)"
            strokeWidth="0.003"
          />

          {/* 渲染连线 + 星点（已按 z 排序） */}
          {items.map((it) => {
            if (it.type === 'line') {
              return (
                <line
                  key={it.key}
                  x1={it.a.sx}
                  y1={it.a.sy}
                  x2={it.b.sx}
                  y2={it.b.sy}
                  stroke={it.accent}
                  strokeWidth={it.kind === 'bridge' ? 0.006 : 0.011}
                  strokeOpacity={it.op * (it.kind === 'bridge' ? 0.7 : 0.75)}
                  strokeDasharray={it.kind === 'bridge' ? '0.05 0.04' : undefined}
                  style={
                    it.kind === 'inner'
                      ? { filter: `drop-shadow(0 0 0.02px ${it.accent})` }
                      : undefined
                  }
                />
              )
            }
            const s = it.s
            const r = s.r * s.f * 0.04
            return (
              <g key={it.key}>
                {/* 外发光 */}
                <circle
                  cx={s.sx}
                  cy={s.sy}
                  r={r * 2.4}
                  fill={s.accent}
                  opacity={it.op * 0.18}
                  style={{ filter: 'blur(0.03px)' }}
                />
                {/* 实心星点 */}
                <circle cx={s.sx} cy={s.sy} r={r} fill="#fff" opacity={it.op} />
                <circle
                  cx={s.sx}
                  cy={s.sy}
                  r={r * 0.5}
                  fill={s.accent}
                  opacity={it.op * 0.95}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* 5. 当前星座名称 */}
      {activeVis > 0.25 && (
        <motion.div
          key={activeC.id}
          className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: Math.min(1, activeVis), y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div
            className="font-heading text-2xl font-bold tracking-[0.3em] sm:text-3xl"
            style={{ color: activeC.accent, textShadow: `0 0 14px ${activeC.accent}99` }}
          >
            {activeC.en}
          </div>
          <div className="mt-1 font-mono text-xs text-ink-faint">
            {activeC.name} · {String(activeIdx + 1).padStart(2, '0')}/
            {String(N).padStart(2, '0')}
          </div>
        </motion.div>
      )}

      {/* 6. 流星 */}
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
              boxShadow:
                '0 0 8px rgba(0,240,255,0.8), 0 0 16px rgba(0,240,255,0.4)',
              transform: 'rotate(20deg)',
              transformOrigin: 'left center',
            }}
          />
        </motion.div>
      ))}

      {/* 7. 暗角 */}
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
