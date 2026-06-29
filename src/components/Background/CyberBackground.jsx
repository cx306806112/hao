import { useEffect, useMemo, useState } from 'react'
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useScroll, useSpring, useTransform, motion } from 'motion/react'

/* 读取当前主题的 CSS 变量值 */
function cssVar(name) {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

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
  const [isLight, setIsLight] = useState(false)

  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 25, mass: 0.8 })

  // 整体视差上移（最大 80px）
  const parallaxY = useTransform(smooth, [0, 1], [0, -80])

  // 检测主题变化
  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('theme-light'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // 监听滚动进度，更新主题色（节流到 ~30fps）
  useEffect(() => {
    let raf = 0
    const unsub = smooth.on('change', (v) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setTheme(themeAt(v)))
    })
    return () => { unsub(); cancelAnimationFrame(raf) }
  }, [smooth])

  const particleColor = isLight ? '#4a5578' : '#ffffff'
  const linkOpacity = isLight ? 0.1 : 0.18

  const options = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: {
        value: isLight ? 120 : 220,
        density: { enable: true, area: 1200 },
      },
      color: { value: isLight ? [particleColor, theme.primary, theme.secondary] : [theme.primary, theme.secondary, particleColor] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.1, max: isLight ? 0.5 : 0.9 },
        animation: { enable: true, speed: 0.6, sync: false },
      },
      size: {
        value: { min: 0.4, max: 2.0 },
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
      links: {
        enable: true,
        distance: 130,
        color: theme.primary,
        opacity: linkOpacity,
        width: 0.6,
        triangles: { enable: false },
      },
      shadow: {
        enable: !isLight,
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
  }), [theme.primary, theme.secondary, isLight, particleColor, linkOpacity])

  // 背景渐变
  const spaceGradient = isLight
    ? 'radial-gradient(ellipse at 50% 45%, var(--space-grad-inner) 0%, var(--space-grad-mid) 50%, var(--space-grad-outer) 100%)'
    : 'radial-gradient(ellipse at 50% 45%, var(--space-grad-inner) 0%, var(--space-grad-mid) 50%, var(--space-grad-outer) 100%)'

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* 1. 背景渐变 */}
      <div
        className="absolute inset-0"
        style={{ background: spaceGradient }}
      />

      {/* 2. 星云光晕 */}
      <motion.div
        className="absolute inset-0"
        style={{ y: parallaxY }}
      >
        <Nebula theme={theme} isLight={isLight} />
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

      {/* 4. 顶部 / 底部暗角 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, var(--vignette-top) 0%, transparent 22%, transparent 78%, var(--vignette-bottom) 100%)`,
        }}
      />

      {/* 5. 右下角当前星域指示 */}
      <div className="absolute bottom-4 right-5 pointer-events-none font-mono text-[10px] tracking-[0.2em] text-white/30">
        <span style={{ color: theme.primary }}>●</span>{' '}
        SECTOR {String(theme.index + 1).padStart(2, '0')}/{String(THEMES.length).padStart(2, '0')}
      </div>
    </div>
  )
}

/* 星云：3 块大径向渐变叠加 */
function Nebula({ theme, isLight }) {
  const opacityMult = isLight ? 0.3 : 1
  return (
    <>
      <div
        className="absolute"
        style={{
          left: '20%', top: '15%',
          width: '70vmin', height: '70vmin',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${theme.nebula}${isLight ? '22' : '55'} 0%, ${theme.nebula}${isLight ? '11' : '22'} 30%, transparent 70%)`,
          filter: 'blur(40px)',
          mixBlendMode: 'screen',
          opacity: opacityMult,
        }}
      />
      <div
        className="absolute"
        style={{
          left: '78%', top: '60%',
          width: '60vmin', height: '60vmin',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${theme.primary}${isLight ? '22' : '44'} 0%, ${theme.primary}${isLight ? '08' : '11'} 40%, transparent 75%)`,
          filter: 'blur(50px)',
          mixBlendMode: 'screen',
          opacity: opacityMult,
        }}
      />
      <div
        className="absolute"
        style={{
          left: '50%', top: '85%',
          width: '50vmin', height: '50vmin',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${theme.secondary}${isLight ? '1a' : '33'} 0%, transparent 70%)`,
          filter: 'blur(45px)',
          mixBlendMode: 'screen',
          opacity: opacityMult,
        }}
      />
    </>
  )
}
