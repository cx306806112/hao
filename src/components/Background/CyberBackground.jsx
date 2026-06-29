import { useEffect, useMemo, useState } from 'react'
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useScroll, useSpring, useTransform, motion } from 'motion/react'

/* ============================================================
   海洋日/夜粒子背景
   - 夜晚：月光 + 星光粒子缓缓上浮（像浮游生物发光）
   - 白天：气泡上升 + 阳光光柱穿透海水
   - 滚动时整体缓慢视差上移
   - 深度区颜色随滚动微调（海面 → 深海）
   ============================================================ */

// 海洋"深度"主题：随滚动从浅海过渡到深海，颜色越来越深
const DEPTHS = [
  { primary: '#5dd5ff', secondary: '#7fc8ff', glow: '#b8e6ff' }, // 海面
  { primary: '#3ab5e8', secondary: '#5d9fd4', glow: '#7fc8e8' },
  { primary: '#1d8fc4', secondary: '#3d7fae', glow: '#5d9fc8' },
  { primary: '#0a6a9e', secondary: '#1d5a8a', glow: '#3d8ab8' }, // 深海
]

function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`
}

function depthAt(progress) {
  const p = Math.max(0, Math.min(0.9999, progress))
  const seg = p * (DEPTHS.length - 1)
  const i = Math.floor(seg)
  const t = seg - i
  const a = DEPTHS[i]
  const b = DEPTHS[i + 1]
  return {
    primary: mixHex(a.primary, b.primary, t),
    secondary: mixHex(a.secondary, b.secondary, t),
    glow: mixHex(a.glow, b.glow, t),
    index: i,
  }
}

export default function CyberBackground() {
  return (
    <ParticlesProvider init={async (engine) => { await loadSlim(engine) }}>
      <BackgroundInner />
    </ParticlesProvider>
  )
}

function BackgroundInner() {
  const { loaded } = useParticlesProvider()
  const [depth, setDepth] = useState(depthAt(0))
  const [isLight, setIsLight] = useState(false)

  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 25, mass: 0.8 })

  // 整体视差上移（模拟水流）
  const parallaxY = useTransform(smooth, [0, 1], [0, -100])

  // 检测主题变化
  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('theme-light'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // 监听滚动，更新深度色
  useEffect(() => {
    let raf = 0
    const unsub = smooth.on('change', (v) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setDepth(depthAt(v)))
    })
    return () => { unsub(); cancelAnimationFrame(raf) }
  }, [smooth])

  // 粒子配置：夜晚=发光浮游生物 / 白天=气泡
  const options = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: {
        value: isLight ? 90 : 130,
        density: { enable: true, area: 1200 },
      },
      // 夜晚用发光色，白天用白色气泡
      color: { value: isLight ? ['#ffffff', depth.glow] : [depth.glow, depth.primary, '#ffffff'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.15, max: isLight ? 0.6 : 0.85 },
        animation: { enable: true, speed: 0.5, sync: false },
      },
      size: {
        // 白天气泡更大更圆，夜晚粒子小而亮
        value: { min: isLight ? 1 : 0.6, max: isLight ? 4 : 2.2 },
        animation: { enable: true, speed: 1.5, sync: false },
      },
      // 向上漂浮（气泡上升 / 浮游生物上浮）
      move: {
        enable: true,
        speed: isLight ? 0.8 : 0.4,
        direction: 'top',
        straight: false,
        outModes: { default: 'out' },
        random: true,
        // 水流摆动
        trail: { enable: false },
      },
      // 夜晚发光，白天不发光（气泡不发光）
      shadow: {
        enable: !isLight,
        color: depth.primary,
        blur: 6,
      },
      // 不连线（海洋不是星座）
      links: { enable: false },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: ['bubble'] },
      },
      modes: {
        bubble: {
          distance: 150,
          size: 6,
          duration: 1.5,
          opacity: 0.8,
        },
      },
    },
  }), [depth.primary, depth.glow, isLight])

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* 1. 海洋渐变背景（上浅下深，模拟水深） */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, var(--ocean-grad-top) 0%, var(--ocean-grad-mid) 45%, var(--ocean-grad-bottom) 100%)`,
        }}
      />

      {/* 2. 光柱 / 阳光穿透层 */}
      <motion.div
        className="absolute inset-0"
        style={{ y: parallaxY }}
      >
        <LightRays isLight={isLight} />
      </motion.div>

      {/* 3. 水波纹（SVG 波浪，缓慢漂动） */}
      <WaterWaves isLight={isLight} depth={depth} />

      {/* 4. 粒子层（气泡/浮游生物） */}
      <motion.div
        className="absolute inset-0"
        style={{ y: parallaxY }}
      >
        {loaded && (
          <Particles
            id="bg-particles"
            options={options}
            className="h-full w-full"
          />
        )}
      </motion.div>

      {/* 5. 月亮（夜晚）/ 太阳（白天） */}
      <CelestialBody isLight={isLight} />

      {/* 6. 顶部 / 底部暗角 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, var(--vignette-top) 0%, transparent 25%, transparent 75%, var(--vignette-bottom) 100%)`,
        }}
      />

      {/* 7. 深度指示 HUD */}
      <div className="absolute bottom-4 right-5 pointer-events-none font-mono text-[10px] tracking-[0.2em] text-white/30">
        <span style={{ color: depth.primary }}>●</span>{' '}
        DEPTH {String(depth.index + 1).padStart(2, '0')}/{String(DEPTHS.length).padStart(2, '0')}
      </div>
    </div>
  )
}

/* 光柱：从顶部斜向下穿透的几条光带 */
function LightRays({ isLight }) {
  const rays = [
    { left: '15%', width: '180px', rotate: -12, delay: 0 },
    { left: '38%', width: '220px', rotate: -8, delay: 1.2 },
    { left: '62%', width: '200px', rotate: 6, delay: 0.6 },
    { left: '82%', width: '160px', rotate: 10, delay: 1.8 },
  ]
  return (
    <div className="absolute inset-0">
      {rays.map((r, i) => (
        <motion.div
          key={i}
          className="absolute top-0"
          style={{
            left: r.left,
            width: r.width,
            height: '100vh',
            background: `linear-gradient(180deg, var(--ray-color) 0%, transparent 80%)`,
            transform: `rotate(${r.rotate}deg)`,
            transformOrigin: 'top center',
            filter: 'blur(2px)',
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            x: [0, 8, 0],
          }}
          transition={{
            duration: 8 + i,
            delay: r.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* 水波纹：底部 SVG 波浪缓慢漂动 */
function WaterWaves({ isLight, depth }) {
  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none">
      <svg
        viewBox="0 0 1440 200"
        className="w-full"
        preserveAspectRatio="none"
        style={{ height: '40vh', opacity: 0.5 }}
      >
        <motion.path
          fill={isLight ? 'rgba(255,255,255,0.15)' : `${depth.primary}1a`}
          initial={{ x: 0 }}
          animate={{ x: [0, -200, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          d="M0,80 C320,140 480,20 720,80 C960,140 1120,20 1440,80 L1440,200 L0,200 Z"
        />
        <motion.path
          fill={isLight ? 'rgba(255,255,255,0.1)' : `${depth.secondary}1a`}
          initial={{ x: -100 }}
          animate={{ x: [-100, 100, -100] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          d="M0,120 C240,60 560,180 840,120 C1080,80 1260,160 1440,120 L1440,200 L0,200 Z"
        />
      </svg>
    </div>
  )
}

/* 月亮（夜晚）/ 太阳（白天） */
function CelestialBody({ isLight }) {
  if (isLight) {
    // 太阳：右上方淡黄色光晕
    return (
      <motion.div
        className="absolute"
        style={{
          right: '8%',
          top: '8%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,245,200,0.6) 0%, rgba(255,220,150,0.2) 50%, transparent 70%)',
          filter: 'blur(8px)',
        }}
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    )
  }
  // 月亮：右上方淡蓝月光
  return (
    <motion.div
      className="absolute"
      style={{
        right: '10%',
        top: '10%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(180,220,255,0.5) 0%, rgba(120,180,220,0.15) 50%, transparent 70%)',
        filter: 'blur(6px)',
        boxShadow: '0 0 80px rgba(180,220,255,0.3)',
      }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
