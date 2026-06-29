import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw, Quote } from 'lucide-react'

/**
 * 一言小组件：hitokoto.cn 免 key 接口，打字机效果，30s 或点击刷新。
 */
export default function Hitokoto() {
  const [text, setText] = useState('')
  const [from, setFrom] = useState('')
  const [typed, setTyped] = useState('')
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)
  const typewriterRef = useRef(null)

  const fetchOne = () => {
    setLoading(true)
    fetch('https://v1.hitokoto.cn/?c=d&c=i&c=k&encode=json')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => {
        setText(d.hitokoto || '')
        setFrom(d.from ? `—— ${d.from}` : '')
      })
      .catch(() => {
        setText('欲戴王冠，必承其重')
        setFrom('—— hao')
      })
      .finally(() => setLoading(false))
  }

  // 打字机
  useEffect(() => {
    if (!text) return
    let i = 0
    if (typewriterRef.current) clearInterval(typewriterRef.current)
    const el = typewriterRef
    typewriterRef.current = setInterval(() => {
      i += 1
      if (i > text.length) {
        clearInterval(typewriterRef.current)
        return
      }
      // 通过 data-text 模拟（此处直接渲染截断）
      setTyped(text.slice(0, i))
    }, 40)
    return () => clearInterval(typewriterRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  // 初次 + 30s 轮询
  useEffect(() => {
    fetchOne()
    timerRef.current = setInterval(fetchOne, 30000)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="relative flex max-w-xl items-center gap-2 rounded-lg border border-[var(--grid-line)] bg-[var(--bg-glass)] px-4 py-2 backdrop-blur-md"
    >
      <Quote size={14} className="shrink-0 text-[var(--neon-purple)]" />
      <div className="min-h-[1.25rem] flex-1 text-left font-mono text-xs text-ink-muted">
        <AnimatePresence mode="wait">
          <motion.span
            key={text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {typed}
            {typed.length < text.length && (
              <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-[var(--neon-cyan)] align-middle" />
            )}
          </motion.span>
        </AnimatePresence>
        {from && typed.length >= text.length && (
          <span className="ml-2 text-[10px] text-ink-faint">{from}</span>
        )}
      </div>
      <button
        onClick={fetchOne}
        className="shrink-0 text-ink-faint transition hover:text-[var(--neon-cyan)]"
        title="换一句"
        disabled={loading}
      >
        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
      </button>
    </motion.div>
  )
}
