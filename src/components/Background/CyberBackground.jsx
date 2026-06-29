import { useMemo, useState } from 'react'
import { motion, useScroll, useSpring, useMotionValueEvent } from 'motion/react'

const DEG = Math.PI / 180

/* ============================================================
   星座数据：星点用 (lat, lon) 球面坐标（度）。
   每个星座占据球面一段 lat 区间，centerLat 由下方均匀分配。
   滚动驱动绕 X 轴旋转，让星座从球底 → 正面 → 球顶依次经过视野。
   星座整体更大、铺满屏幕，并带专属星云。
   ============================================================ */
const CONSTELLATIONS = [
  {
    id: 'orion',
    name: '猎户座',
    en: 'ORION',
    accent: '#00f0ff',
    nebula: 'rgba(0,240,255,0.28)',
    stars: [
      { lat: 8, lon: -10, r: 2.4 }, // Betelgeuse
      { lat: 7, lon: 11, r: 2.0 }, // Bellatrix
      { lat: -1, lon: 5, r: 1.6 }, // Mintaka
      { lat: -2, lon: 0, r: 1.8 }, // Alnilam
      { lat: -3, lon: -5, r: 1.6 }, // Alnitak
      { lat: -14, lon: -8, r: 2.0 }, // Saiph
      { lat: -13, lon: 9, r: 2.6 }, // Rigel
    ],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
    // 星云在星座局部坐标系（lat 偏移, lon 偏移）
    clouds: [
      { dLat: -2, dLon: 0, size: 26, color: 'rgba(255,42,109,0.18)' }, // M42 猎户大星云
      { dLat: 6, dLon: -8, size: 18, color: 'rgba(0,240,255,0.12)' },
    ],
  },
  {
    id: 'ursa',
    name: '北斗七星',
    en: 'URSA MAJOR',
    accent: '#b16cff',
    nebula: 'rgba(177,108,255,0.24)',
    stars: [
      { lat: 14, lon: -22, r: 2.0 },
      { lat: 17, lon: -14, r: 1.8 },
      { lat: 12, lon: -4, r: 1.6 },
      { lat: 5, lon: 3, r: 1.8 },
      { lat: 1, lon: 11, r: 2.0 },
      { lat: -6, lon: 19, r: 1.8 },
      { lat: -12, lon: 26, r: 2.2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    clouds: [{ dLat: 3, dLon: -8, size: 30, color: 'rgba(177,108,255,0.16)' }],
  },
  {
    id: 'cassiopeia',
    name: '仙后座',
    en: 'CASSIOPEIA',
    accent: '#ff2a6d',
    nebula: 'rgba(255,42,109,0.26)',
    stars: [
      { lat: 2, lon: -25, r: 2.0 },
      { lat: 18, lon: -13, r: 2.2 },
      { lat: 0, lon: 0, r: 1.8 },
      { lat: 18, lon: 13, r: 2.2 },
      { lat: 2, lon: 25, r: 2.0 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    clouds: [
      { dLat: 9, dLon: 0, size: 24, color: 'rgba(255,42,109,0.18)' },
      { dLat: -4, dLon: 14, size: 20, color: 'rgba(249,240,2,0.10)' },
    ],
  },
  {
    id: 'lyra',
    name: '天琴座',
    en: 'LYRA',
    accent: '#f9f002',
    nebula: 'rgba(249,240,2,0.24)',
    stars: [
      { lat: 22, lon: 0, r: 2.8 }, // Vega 织女
      { lat: 7, lon: -7, r: 1.6 },
      { lat: 7, lon: 7, r: 1.6 },
      { lat: -10, lon: -6, r: 1.6 },
      { lat: -10, lon: 6, r: 1.6 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
    clouds: [
      { dLat: -10, dLon: 0, size: 28, color: 'rgba(57,255,20,0.14)' }, // 环状星云 M57
      { dLat: 22, dLon: 0, size: 22, color: 'rgba(249,240,2,0.18)' },
    ],
  },
  {
    id: 'pleiades',
    name: '昴宿星团',
    en: 'PLEIADES',
    accent: '#39ff14',
    nebula: 'rgba(57,255,20,0.22)',
    stars: [
      { lat: 11, lon: -7, r: 1.4 },
      { lat: 7, lon: -3.5, r: 1.8 },
      { lat: 8, lon: 0, r: 1.2 },
      { lat: 6, lon: 3.5, r: 1.6 },
      { lat: 4, lon: -1, r: 1.0 },
      { lat: 0, lon: 1.5, r: 1.4 },
      { lat: 0, lon: -5, r: 1.2 },
      { lat: 1, lon: 6, r: 1.2 },
      { lat: -3, lon: -3, r: 0.9 },
    ],
    lines: [],
    clouds: [
      { dLat: 4, dLon: 0, size: 40, color: 'rgba(0,240,255,0.18)' }, // 反射星云
      { dLat: 0, dLon: -3, size: 28, color: 'rgba(57,255,20,0.14)' },
    ],
  },
]

const N = CONSTELLATIONS.length
// 每个星座的中心纬度，从球底(-90) 到球顶(+90) 均匀分布
// 这样滚动时星座依次从下到上经过正面
CONSTELLATIONS.forEach((c, i) => {
  c.centerLat = -80 + (160 / (N - 1)) * i // -80, -40, 0, 40, 80
})

/* 展开为全局星点 + 连线 + 星云 */
const ALL_STARS = []
const ALL_LINES = []
const ALL_CLOUDS = []
const RANGES = []
{
  let gi = 0
  CONSTELLATIONS.forEach((c) => {
    const start = gi
    c.stars.forEach((s) => {
      ALL_STARS.push({
        lat: s.lat + c.centerLat,
        lon: s.lon,
        r: s.r,
        accent: c.accent,
        cid: c.id,
      })
      gi++
    })
    RANGES.push({ start, end: gi - 1, cid: c.id })
    c.lines.forEach(([a, b]) => {
      ALL_LINES.push({
        a: start + a,
        b: start + b,
        accent: c.accent,
        cid: c.id,
        kind: 'inner',
      })
    })
    c.clouds.forEach((cl, k) => {
      ALL_CLOUDS.push({
        lat: cl.dLat + c.centerLat,
        lon: cl.dLon,
        size: cl.size,
        color: cl.color,
        cid: c.id,
        key: `${c.id}-${k}`,
      })
    })
  })
  // 跨星座首尾桥接：上一个星座末点 → 下一个星座首点（竖向连接）
  for (let i = 0; i < N - 1; i++) {
    ALL_LINES.push({
      a: RANGES[i].end,
      b: RANGES[i + 1].start,
      accent: 'rgba(177,108,255,0.5)',
      cid: `${RANGES[i].cid}-${RANGES[i + 1].cid}`,
      kind: 'bridge',
    })
  }
  // 最后回到第一个，闭合环
  ALL_LINES.push({
    a: RANGES[N - 1].end,
    b: RANGES[0].start,
    accent: 'rgba(177,108,255,0.5)',
    cid: `${RANGES[N - 1].cid}-${RANGES[0].cid}`,
    kind: 'bridge',
  })
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
/* 绕 X 轴旋转（竖向滚动 → 上下转动） */
function rotX(p, a) {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c }
}
const PERSP = 2.4
function proj(p) {
  const z = p.z + PERSP
  const f = PERSP / Math.max(0.1, z)
  return { sx: p.x * f, sy: -p.y * f, f, z: p.z }
}
function zOpacity(z) {
  // z 范围 -1~1；z<-0.5 消失，z>0 完全可见
  return Math.max(0, Math.min(1, (z + 0.5) / 0.5))
}

/* 环境深空星点 */
const AMBIENT = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  lat: (Math.random() - 0.5) * 170, // 全球随机
  lon: (Math.random() - 0.5) * 360,
  size: 0.4 + Math.random() * 1.0,
  delay: Math.random() * 5,
  duration: 3 + Math.random() * 5,
}))

export default function CyberBackground() {
  const { scrollYProgress } = useScroll()
  // 滚动 0→1 对应旋转 -PI/2 → +PI/2（让最底星座到最顶星座依次转过来）
  const angleMV = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.7,
  })
  const [angle, setAngle] = useState(-Math.PI / 2)
  useMotionValueEvent(angleMV, 'change', (v) => {
    setAngle(-Math.PI / 2 + v * Math.PI)
  })

  // 投影所有星点
  const projected = useMemo(
    () =>
      ALL_STARS.map((s) => {
        const p3 = sph(s.lat, s.lon)
        const p3r = rotX(p3, angle)
        const p2 = proj(p3r)
        return { ...p2, r: s.r, accent: s.accent, cid: s.cid, lat: s.lat, lon: s.lon }
      }),
    [angle],
  )

  // 投影星云
  const projectedClouds = useMemo(
    () =>
      ALL_CLOUDS.map((c) => {
        const p3 = sph(c.lat, c.lon)
        const p3r = rotX(p3, angle)
        const p2 = proj(p3r)
        return { ...p2, size: c.size, color: c.color, cid: c.cid, key: c.key }
      }),
    [angle],
  )

  // 当前正对的星座
  const { activeIdx, activeVis } = useMemo(() => {
    // angle 从 -PI/2 到 +PI/2，对应星座 0 到 N-1
    const t = (angle + Math.PI / 2) / Math.PI // 0~1
    const idx = Math.max(0, Math.min(N - 1, Math.round(t * (N - 1))))
    const center = idx / (N - 1)
    const dist = Math.abs(t - center)
    const vis = Math.max(0, 1 - dist * (N - 1) * 0.6)
    return { activeIdx: idx, activeVis: vis }
  }, [angle])
  const activeC = CONSTELLATIONS[activeIdx]

  // 投影环境星点
  const ambientProj = useMemo(
    () =>
      AMBIENT.map((s) => {
        const p3 = sph(s.lat, s.lon)
        const p3r = rotX(p3, angle)
        const p2 = proj(p3r)
        return { ...p2, size: s.size, delay: s.delay, duration: s.duration, id: s.id }
      }),
    [angle],
  )

  // 按 z 排序所有可见项
  const items = useMemo(() => {
    const arr = []
    projectedClouds.forEach((c) => {
      const op = zOpacity(c.z)
      if (op < 0.01) return
      arr.push({ type: 'cloud', z: c.z, key: `c-${c.key}`, c, op })
    })
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
    ambientProj.forEach((s) => {
      const op = zOpacity(s.z) * 0.5
      if (op < 0.01) return
      arr.push({ type: 'ambient', z: s.z, key: `a-${s.id}`, s, op })
    })
    arr.sort((x, y) => x.z - y.z)
    return arr
  }, [projected, projectedClouds, ambientProj])

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

      {/* 2. 星座球 —— 滚动竖向旋转 */}
      <div className="absolute inset-0">
        <svg
          viewBox="-1.85 -1.85 3.7 3.7"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor="rgba(0,240,255,0)" />
              <stop offset="100%" stopColor="rgba(0,240,255,0.10)" />
            </radialGradient>
          </defs>
          {/* 球面外光晕 */}
          <circle cx="0" cy="0" r="1.15" fill="url(#sphereGlow)" />

          {/* 渲染（按 z 排序：cloud → line → star → ambient） */}
          {items.map((it) => {
            if (it.type === 'cloud') {
              const c = it.c
              const r = (c.size / 100) * c.f * 1.6
              return (
                <g key={it.key}>
                  <circle
                    cx={c.sx}
                    cy={c.sy}
                    r={r}
                    fill={c.color}
                    opacity={it.op * 0.85}
                    style={{ filter: 'blur(0.05px)' }}
                  />
                  <circle
                    cx={c.sx}
                    cy={c.sy}
                    r={r * 1.6}
                    fill={c.color}
                    opacity={it.op * 0.3}
                    style={{ filter: 'blur(0.12px)' }}
                  />
                </g>
              )
            }
            if (it.type === 'line') {
              return (
                <line
                  key={it.key}
                  x1={it.a.sx}
                  y1={it.a.sy}
                  x2={it.b.sx}
                  y2={it.b.sy}
                  stroke={it.accent}
                  strokeWidth={it.kind === 'bridge' ? 0.008 : 0.014}
                  strokeOpacity={it.op * (it.kind === 'bridge' ? 0.7 : 0.85)}
                  strokeDasharray={it.kind === 'bridge' ? '0.06 0.05' : undefined}
                  strokeLinecap="round"
                  style={
                    it.kind === 'inner'
                      ? { filter: `drop-shadow(0 0 0.025px ${it.accent})` }
                      : undefined
                  }
                />
              )
            }
            if (it.type === 'ambient') {
              const s = it.s
              const r = s.size * s.f * 0.006
              return (
                <circle
                  key={it.key}
                  cx={s.sx}
                  cy={s.sy}
                  r={r}
                  fill="#fff"
                  opacity={it.op}
                />
              )
            }
            // star
            const s = it.s
            const r = s.r * s.f * 0.045
            return (
              <g key={it.key}>
                {/* 外发光 */}
                <circle
                  cx={s.sx}
                  cy={s.sy}
                  r={r * 3}
                  fill={s.accent}
                  opacity={it.op * 0.2}
                  style={{ filter: 'blur(0.05px)' }}
                />
                <circle
                  cx={s.sx}
                  cy={s.sy}
                  r={r * 1.8}
                  fill={s.accent}
                  opacity={it.op * 0.35}
                />
                {/* 实心星点 */}
                <circle cx={s.sx} cy={s.sy} r={r} fill="#fff" opacity={it.op} />
                <circle
                  cx={s.sx}
                  cy={s.sy}
                  r={r * 0.55}
                  fill={s.accent}
                  opacity={it.op * 0.95}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* 3. 当前星座名称（大标题，铺满感） */}
      {activeVis > 0.2 && (
        <motion.div
          key={activeC.id}
          className="pointer-events-none absolute inset-x-0 bottom-[14vh] flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: Math.min(1, activeVis), y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="font-heading text-4xl font-black tracking-[0.35em] sm:text-6xl"
            style={{
              color: activeC.accent,
              textShadow: `0 0 20px ${activeC.accent}, 0 0 40px ${activeC.accent}66`,
            }}
          >
            {activeC.en}
          </div>
          <div className="mt-2 font-mono text-xs tracking-[0.4em] text-ink-faint sm:text-sm">
            {activeC.name} · {String(activeIdx + 1).padStart(2, '0')}/
            {String(N).padStart(2, '0')}
          </div>
        </motion.div>
      )}

      {/* 4. 暗角（上下渐变，让中心更聚焦） */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,2,7,0.8) 0%, transparent 25%, transparent 75%, rgba(2,2,7,0.95) 100%)',
        }}
      />
    </div>
  )
}
