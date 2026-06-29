import { useMemo } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'

/* ============================================================
   俯瞰真实海洋背景：真实鱼图（鱼头朝上）+ 焦散光纹
   - 向下滚动时鱼群整体上移（鱼往上游）
   - 亮色=白天浅海，暗色=夜晚深海
   ============================================================ */

// 图片生成 API：生成俯瞰鱼图，鱼头朝上
const IMG_API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'
const fishImgUrl = (prompt, size = 'portrait_4_3') =>
  `${IMG_API}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`

// 真实鲸鱼图（俯瞰，鱼头朝上）
const WHALE_IMG = fishImgUrl(
  'aerial top-down view of a humpback whale swimming upward, viewed from directly above, whale head pointing to top of image, dark blue whale body with white markings, deep blue ocean water background, photorealistic, centered, dorsal view',
  'portrait_4_3',
)
// 真实小鱼图（俯瞰，鱼头朝上）
const FISH_IMG = fishImgUrl(
  'aerial top-down view of a small tropical fish swimming upward, viewed from directly above, fish head pointing to top of image, silver and blue striped fish, turquoise clear ocean water background, photorealistic, centered, dorsal view',
  'portrait_4_3',
)
// 真实鳐鱼/蝠鲼图（俯瞰，鱼头朝上）—— 增加多样性
const MANTA_IMG = fishImgUrl(
  'aerial top-down view of a manta ray gliding upward, viewed from directly above, head pointing to top of image, dark black ray with white belly visible, deep blue ocean water, photorealistic, centered, dorsal view',
  'portrait_4_3',
)

// 鲸鱼/蝠鲼：大块头，缓慢向上游
const BIG_FISH = [
  { id: 'b1', baseX: 20, baseY: 30, scale: 1.0, duration: 90, delay: 0, img: WHALE_IMG },
  { id: 'b2', baseX: 65, baseY: 55, scale: 1.1, duration: 100, delay: -40, img: MANTA_IMG },
  { id: 'b3', baseX: 35, baseY: 80, scale: 0.9, duration: 85, delay: -20, img: WHALE_IMG },
]

// 小鱼群：每群一群小鱼
const FISH_SCHOOLS = [
  { id: 's1', baseX: 50, baseY: 15, count: 8, scale: 1, duration: 30, delay: 0, spread: 80 },
  { id: 's2', baseX: 25, baseY: 42, count: 6, scale: 0.85, duration: 38, delay: -12, spread: 70 },
  { id: 's3', baseX: 75, baseY: 68, count: 10, scale: 0.9, duration: 35, delay: -20, spread: 90 },
  { id: 's4', baseX: 40, baseY: 92, count: 7, scale: 0.75, duration: 42, delay: -8, spread: 60 },
]

export default function CyberBackground() {
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 28, mass: 0.9 })

  // 鱼群整体随滚动上移（下潜感，鱼往上游）
  const fishY = useTransform(smooth, [0, 1], [0, -1100])

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* 1. 海洋深度渐变（俯瞰，从浅到深） */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, var(--ocean-grad-top) 0%, var(--ocean-grad-mid) 40%, var(--ocean-grad-bottom) 100%)',
        }}
      />

      {/* 2. 焦散光纹（水面阳光透射的网状光斑） */}
      <Caustics />

      {/* 3. 鱼群层 —— 鱼头朝上，向下滚动时鱼往上游 */}
      <motion.div
        className="absolute inset-0"
        style={{ y: fishY, height: '200%' }}
      >
        {BIG_FISH.map((b) => (
          <BigFish key={b.id} b={b} />
        ))}
        {FISH_SCHOOLS.map((s) => (
          <FishSchool key={s.id} s={s} />
        ))}
      </motion.div>

      {/* 4. 水面顶部光斑 */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '30vh',
          background: 'linear-gradient(180deg, var(--ray-color) 0%, transparent 100%)',
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

/* ---------------- 大鱼（鲸鱼/蝠鲼，鱼头朝上） ---------------- */
function BigFish({ b }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${b.baseX}%`,
        top: `${b.baseY}%`,
        width: `${200 * b.scale}px`,
        height: `${260 * b.scale}px`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{ y: ['0%', '-8%', '0%'], x: ['0%', '3%', '0%', '-3%', '0%'] }}
      transition={{
        duration: b.duration,
        delay: b.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        src={b.img}
        alt=""
        className="h-full w-full object-cover rounded-[40%]"
        style={{
          filter: 'drop-shadow(0 10px 30px var(--fish-shadow)) brightness(var(--fish-brightness, 1))',
          mixBlendMode: 'var(--fish-blend, normal)',
        }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    </motion.div>
  )
}

/* ---------------- 小鱼群（鱼头朝上，群体向上游） ---------------- */
function FishSchool({ s }) {
  const fishes = useMemo(() => {
    return Array.from({ length: s.count }, () => ({
      dx: (Math.random() - 0.5) * s.spread,
      dy: (Math.random() - 0.5) * s.spread * 1.2,
      scale: 0.6 + Math.random() * 0.5,
      delay: Math.random() * 3,
      duration: 2.5 + Math.random() * 2,
    }))
  }, [s.count, s.spread])

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${s.baseX}%`,
        top: `${s.baseY}%`,
        width: `${s.spread * 3}px`,
        height: `${s.spread * 3}px`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{ y: ['0%', '-6%', '0%'], x: ['0%', '2%', '0%', '-2%', '0%'] }}
      transition={{
        duration: s.duration,
        delay: s.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {fishes.map((f, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${50 + f.dx * 0.4}%`,
            top: `${50 + f.dy * 0.4}%`,
            width: `${40 * s.scale * f.scale}px`,
            height: `${52 * s.scale * f.scale}px`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ y: [0, -4, 0, 4, 0] }}
          transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src={FISH_IMG}
            alt=""
            className="h-full w-full object-cover rounded-[40%]"
            style={{
              filter: 'drop-shadow(0 4px 12px var(--fish-shadow)) brightness(var(--fish-brightness, 1))',
              mixBlendMode: 'var(--fish-blend, normal)',
            }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
