import { useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import Aurora from '../reactbits/Aurora/Aurora'
import ErrorBoundary from '../ErrorBoundary'

/* ============================================================
   背景：react-bits Aurora 着色器流动渐变（WebGL）
   - 真实浏览器：Aurora 流动渐变动画
   - 无 WebGL 环境（如预览）：优雅降级到 CSS 海洋渐变
   - 夜晚深海 / 白天浅海两套色板
   - 滚动时整体缓慢视差上移
   ============================================================ */

// 海洋色板（Aurora colorStops）
const OCEAN_DARK = ['#021024', '#0a4d6e', '#5dd5ff']   // 深海 → 青 → 浅青
const OCEAN_LIGHT = ['#7fb8d4', '#a8d5e8', '#dbeef7']  // 浅海 → 浅青 → 近白

// 检测浏览器是否支持 WebGL（避免无头/无 GPU 环境报错）
function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export default function CyberBackground({ isLight }) {
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 28, mass: 0.9 })
  const y = useTransform(smooth, [0, 1], [0, -60])

  // 只挂载一次：无 WebGL 时直接跳过 Aurora，用 CSS 渐变
  const [webglOk] = useState(hasWebGL)

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{ background: isLight ? '#cfe8f5' : '#021024' }}
    >
      {/* 1. CSS 海洋渐变兜底（始终可见，WebGL 失败时也不会黑屏） */}
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at 50% 30%, #dbeef7 0%, #7fb8d4 50%, #3d7a9e 100%)'
            : 'radial-gradient(ellipse at 50% 30%, #0a2540 0%, #051428 50%, #021024 100%)',
        }}
      />

      {/* 2. Aurora WebGL 流动渐变（仅在有 WebGL 时挂载；错误边界兜底） */}
      {webglOk && (
        <motion.div className="absolute inset-0" style={{ y }}>
          <ErrorBoundary fallback={null}>
            <Aurora
              colorStops={isLight ? OCEAN_LIGHT : OCEAN_DARK}
              amplitude={isLight ? 1.2 : 1.0}
              blend={0.6}
              speed={0.6}
            />
          </ErrorBoundary>
        </motion.div>
      )}

      {/* 3. 顶部 / 底部暗角保证内容可读 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLight
            ? 'linear-gradient(180deg, rgba(207,232,245,0.5) 0%, transparent 20%, transparent 80%, rgba(61,122,158,0.4) 100%)'
            : 'linear-gradient(180deg, rgba(2,16,36,0.6) 0%, transparent 20%, transparent 80%, rgba(2,16,36,0.9) 100%)',
        }}
      />
    </div>
  )
}
