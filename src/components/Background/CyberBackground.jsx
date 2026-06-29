import { useMemo } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'

/* ============================================================
   俯瞰海洋背景：鲸鱼 + 小鱼群 + 焦散光纹
   - 滚动时鱼群整体上移（模拟下潜，鱼往上游）
   - 亮色=白天浅海，暗色=夜晚深海（鱼带生物发光）
   ============================================================ */

// 鲸鱼：大块头，缓慢横游
const WHALES = [
  { id: 'w1', baseY: 35, scale: 1.2, duration: 80, delay: 0, dir: 1 },
  { id: 'w2', baseY: 62, scale: 0.9, duration: 95, delay: -30, dir: -1 },
  { id: 'w3', baseY: 88, scale: 1.0, duration: 110, delay: -60, dir: 1 },
]

// 小鱼群：每群一群小鱼，较快移动
const FISH_SCHOOLS = [
  { id: 's1', baseY: 18, count: 14, scale: 1, duration: 35, delay: 0, dir: 1, spread: 60 },
  { id: 's2', baseY: 45, count: 10, scale: 0.8, duration: 45, delay: -15, dir: -1, spread: 50 },
  { id: 's3', baseY: 72, count: 16, scale: 0.9, duration: 40, delay: -25, dir: 1, spread: 70 },
  { id: 's4', baseY: 95, count: 12, scale: 0.7, duration: 50, delay: -8, dir: -1, spread: 55 },
]

export default function CyberBackground() {
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 28, mass: 0.9 })

  // 鱼群整体随滚动上移（下潜感）—— 滚到底时上移一屏多
  const fishY = useTransform(smooth, [0, 1], [0, -1200])

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* 1. 海洋深度渐变（俯瞰，从浅到深） */}
      <motion.div
        className="absolute inset-0"
        style={{ filter: 'brightness(var(--ocean-brightness, 1))' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, var(--ocean-grad-top) 0%, var(--ocean-grad-mid) 40%, var(--ocean-grad-bottom) 100%)',
          }}
        />
      </motion.div>

      {/* 2. 焦散光纹（水面阳光透射的网状光斑） */}
      <Caustics />

      {/* 3. 鱼群层（鲸鱼 + 小鱼）—— 随滚动上移 */}
      <motion.div
        className="absolute inset-0"
        style={{ y: fishY, height: '200%' }}
      >
        {/* 鲸鱼 */}
        {WHALES.map((w) => (
          <Whale key={w.id} w={w} />
        ))}
        {/* 小鱼群 */}
        {FISH_SCHOOLS.map((s) => (
          <FishSchool key={s.id} s={s} />
        ))}
      </motion.div>

      {/* 4. 水面光斑（顶部高光） */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '30vh',
          background:
            'linear-gradient(180deg, var(--ray-color) 0%, transparent 100%)',
        }}
      />

      {/* 5. 顶部 / 底部暗角 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, var(--vignette-top) 0%, transparent 25%, transparent 75%, var(--vignette-bottom) 100%)',
        }}
      />
    </div>
  )
}

/* ---------------- 焦散光纹 ---------------- */
function Caustics() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 'var(--caustic-opacity, 0.4)' }}>
      {/* 两层焦散纹理交叉漂动 */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
              <filter id='c'>
                <feTurbulence type='fractalNoise' baseFrequency='0.012 0.025' numOctaves='2' seed='3'/>
                <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.5 -0.3'/>
              </filter>
              <rect width='100%' height='100%' filter='url(#c)'/>
            </svg>
          `)}")`,
          backgroundSize: '600px 600px',
          mixBlendMode: 'screen',
        }}
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
              <filter id='c2'>
                <feTurbulence type='fractalNoise' baseFrequency='0.018 0.03' numOctaves='2' seed='7'/>
                <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.5 -0.4'/>
              </filter>
              <rect width='100%' height='100%' filter='url(#c2)'/>
            </svg>
          `)}")`,
          backgroundSize: '500px 500px',
          mixBlendMode: 'screen',
        }}
        animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* ---------------- 鲸鱼（SVG 俯瞰剪影） ---------------- */
function Whale({ w }) {
  const startX = w.dir > 0 ? '-15%' : '115%'
  const endX = w.dir > 0 ? '115%' : '-15%'

  return (
    <motion.div
      className="absolute"
      style={{ top: `${w.baseY}%`, width: `${180 * w.scale}px`, height: `${80 * w.scale}px` }}
      initial={{ x: startX }}
      animate={{ x: [startX, endX] }}
      transition={{
        duration: w.duration,
        delay: w.delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <svg
        viewBox="0 0 180 80"
        className="h-full w-full"
        style={{
          transform: w.dir < 0 ? 'scaleX(-1)' : 'none',
          filter: 'drop-shadow(0 8px 20px var(--fish-shadow, rgba(0,0,0,0.4)))',
        }}
      >
        {/* 鲸鱼俯瞰剪影：头部圆润，身体纺锤形，尾鳍分叉 */}
        <path
          d="M10,40 C20,25 50,18 90,20 C120,22 145,28 158,35 C168,38 175,36 178,32 C176,38 172,44 165,46 C170,52 168,58 162,60 C150,55 120,52 90,52 C50,52 25,50 15,48 C8,46 6,44 10,40 Z M165,46 C172,50 176,56 174,62 C170,58 168,52 165,46 Z"
          fill="var(--fish-fill, #0a2540)"
          opacity="var(--fish-opacity, 0.75)"
        />
        {/* 鲸鱼脊背高光 */}
        <path
          d="M30,38 C60,30 110,28 150,36 L150,42 C110,38 60,40 30,44 Z"
          fill="var(--fish-highlight, rgba(255,255,255,0.15))"
        />
        {/* 眼睛小点 */}
        <circle cx="160" cy="38" r="1.5" fill="var(--fish-eye, rgba(255,255,255,0.6))" />
      </svg>
    </motion.div>
  )
}

/* ---------------- 小鱼群 ---------------- */
function FishSchool({ s }) {
  const startX = s.dir > 0 ? '-10%' : '110%'
  const endX = s.dir > 0 ? '110%' : '-10%'

  // 每条小鱼在群内的相对偏移（随机分布）
  const fishes = useMemo(() => {
    return Array.from({ length: s.count }, (_, i) => ({
      dx: (Math.random() - 0.5) * s.spread,
      dy: (Math.random() - 0.5) * s.spread * 0.6,
      scale: 0.6 + Math.random() * 0.6,
      delay: Math.random() * 2,
    }))
  }, [s.count, s.spread])

  return (
    <motion.div
      className="absolute"
      style={{ top: `${s.baseY}%`, left: 0, width: '100%', height: `${s.spread * 2}px` }}
      initial={{ x: startX }}
      animate={{ x: [startX, endX] }}
      transition={{
        duration: s.duration,
        delay: s.delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {fishes.map((f, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${50 + f.dx * 0.5}%`,
            top: `${50 + f.dy}%`,
            width: `${24 * s.scale * f.scale}px`,
            height: `${10 * s.scale * f.scale}px`,
            transform: `translate(-50%, -50%) ${s.dir < 0 ? 'scaleX(-1)' : ''}`,
          }}
          animate={{ y: [0, -3, 0, 3, 0] }}
          transition={{ duration: 2 + Math.random(), delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 24 10" className="h-full w-full">
            {/* 小鱼：简单纺锤形 + 三角尾 */}
            <path
              d="M2,5 C5,1 14,1 19,5 C14,9 5,9 2,5 Z M18,2 L23,5 L18,8 Z"
              fill="var(--fish-fill, #0a2540)"
              opacity="var(--fish-opacity, 0.7)"
            />
          </svg>
        </motion.div>
      ))}
    </motion.div>
  )
}
