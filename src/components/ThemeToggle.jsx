import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sun, Moon } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

/**
 * 深/浅主题切换：圆形 clip-path 扩散动画。
 * 主题持久化在 localStorage('hao:theme')。
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('hao:theme', 'dark')
  const [reveal, setReveal] = useState(null) // { x, y } 触发扩散
  const btnRef = useRef(null)

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    // 记录按钮中心位置用于扩散
    const rect = btnRef.current?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top + rect.height / 2 : 0
    setReveal({ x, y })
    // 动画过半时切换主题
    setTimeout(() => {
      setTheme(next)
      const root = document.documentElement
      if (next === 'light') {
        root.classList.add('theme-light')
        root.classList.remove('dark')
      } else {
        root.classList.remove('theme-light')
        root.classList.add('dark')
      }
    }, 250)
    setTimeout(() => setReveal(null), 600)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="flex h-9 w-9 items-center justify-center rounded border border-[var(--grid-line)] bg-[var(--bg-glass)] text-ink-muted transition hover:border-[var(--neon-yellow)] hover:text-[var(--neon-yellow)]"
        title={theme === 'dark' ? '切换到日间赛博' : '切换到深色赛博'}
        aria-label="切换主题"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={15} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={15} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* 圆形扩散遮罩 */}
      <AnimatePresence>
        {reveal && (
          <motion.div
            className="fixed inset-0 z-[55] pointer-events-none"
            style={{
              background:
                theme === 'dark'
                  ? 'var(--bg-base)'
                  : 'var(--bg-base)',
              clipPath: `circle(0px at ${reveal.x}px ${reveal.y}px)`,
            }}
            initial={{ clipPath: `circle(0px at ${reveal.x}px ${reveal.y}px)` }}
            animate={{
              clipPath: `circle(150vh at ${reveal.x}px ${reveal.y}px)`,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
