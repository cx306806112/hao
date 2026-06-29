import { useEffect, useMemo, useState } from 'react'
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useScroll, useSpring, useTransform, motion } from 'motion/react'

/* ============================================================
   滚动联动的星空粒子背景
   - tsparticles 渲染深空星点 + 近邻连线（伪星座）+ 漂浮星尘
   - 颜色随滚动进度在 5 个"星域主题"间过渡（青→紫→品红→琥珀→翡翠）
   - 整体随滚动缓慢视差上移
   ============================================================ */

// 5 个星域主题：每个对应一段滚动区间，颜色 + 星云调色不同
const THEMES = [
  { id: 'cyan',    primary: '#00f0ff', secondary: '#4a9eff', nebula: '#0080ff' },
  { id: 'violet',  primary: '#b16cff', secondary: '#7a4dff', nebula: '#6a3aff' },
  { id: 'magenta', primary: '#ff2a6d', secondary: '#ff5e9c', nebula: '#c01a5a' },
  { id: 'amber',   primary: '#ffb454', secondary: '#ff7e3a', nebula: '#cc5a1a' },
  { id: 'emerald', primary: '#5ff0a8', secondary: '#22d3a0', nebula: '#10b07a' },
]

// 混合两个 hex 颜色
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

// 根据滚动进度 0~1 计算当前主题颜色（在相邻主题间线性插值）
function themeAt(progress) {
  const p = Math.max(0, Math.min(0.9999, progress))
  const seg = p * (THEMES.length - 1)
  const i = Math.floor(seg)
  const t = seg - i
  const a = THEMES[i]
  const b = THEMES[i + 1]
  return {
    primary: mixHex(a.primary, b.primary, t),
    secondary: mixHex(a.secondary, b.secondary, t),
    nebula: mixHex(a.nebula, b.nebula, t),
    index: i,
    t,
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
  const [theme, setTheme] = useState(themeAt(0))

  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 25, mass: 0.8 })

  // 整体视差上移（最大 80px）
  const parallaxY = useTransform(smooth, [0, 1], [0, -80])

  // 监听滚动进度，更新主题色（节流到 ~30fps）
  useEffect(() => {
    let raf = 0
    const unsub = smooth.on('change', (v) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setTheme(themeAt(v)))
    })
    return () => { unsub(); cancelAnimationFrame(raf) }
  }, [smooth])

  const options = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: {
        value: 220,
        density: { enable: true, area: 1200 },
      },
      color: { value: [theme.primary, theme.secondary, '#ffffff'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.15, max: 0.9 },
        animation: { enable: true, speed: 0.6, sync: false },
      },
      size: {
        value: { min: 0.4, max: 2.2 },
        animation: { enable: true, speed: 1.2, sync: false },
      },
      move: {
        enable: true,
        speed: 0.25,
        direction: 'top',
        straight: false,
        outModes: { default: 'out' },
        random: true,
      },
      // 近邻连线 —— 伪星座效果，颜色随主题变
      links: {
        enable: true,
        distance: 130,
        color: theme.primary,
        opacity: 0.18,
        width: 0.6,
        triangles: { enable: false },
      },
      // 星点辉光
      shadow: {
        enable: true,
        color: theme.primary,
        blur: 4,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: ['grab'] },
      },
      modes: {
        grab: {
          distance: 180,
          links: { opacity: 0.5, color: theme.primary },
        },
      },
    },
  }), [theme.primary, theme.secondary])

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
            'radial-gradient(ellipse at 50% 45%, #0c0a24 0%, #050514 50%, #020207 100%)',
        }}
      />

      {/* 2. 星云光晕 —— 大块径向渐变，颜色随滚动主题变 */}
      <motion.div
        className="absolute inset-0"
        style={{ y: parallaxY }}
      >
        <Nebula theme={theme} />
      </motion.div>

      {/* 3. 粒子星点 + 近邻连线 */}
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

      {/* 4. 顶部 / 底部暗角保证内容可读 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,2,7,0.55) 0%, transparent 22%, transparent 78%, rgba(2,2,7,0.85) 100%)',
        }}
      />

      {/* 5. 右下角当前星域指示（极简 HUD） */}
      <div className="absolute bottom-4 right-5 pointer-events-none font-mono text-[10px] tracking-[0.2em] text-white/30">
        <span style={{ color: theme.primary }}>●</span>{' '}
        SECTOR {String(theme.index + 1).padStart(2, '0')}/{String(THEMES.length).padStart(2, '0')}
      </div>
    </div>
  )
}

/* 星云：3 块大径向渐变叠加，颜色随主题变 */
function Nebula({ theme }) {
  return (
    <>
      <div
        className="absolute"
        style={{
          left: '20%', top: '15%',
          width: '70vmin', height: '70vmin',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${theme.nebula}55 0%, ${theme.nebula}22 30%, transparent 70%)`,
          filter: 'blur(40px)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '78%', top: '60%',
          width: '60vmin', height: '60vmin',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${theme.primary}44 0%, ${theme.primary}11 40%, transparent 75%)`,
          filter: 'blur(50px)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '50%', top: '85%',
          width: '50vmin', height: '50vmin',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${theme.secondary}33 0%, transparent 70%)`,
          filter: 'blur(45px)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
}
