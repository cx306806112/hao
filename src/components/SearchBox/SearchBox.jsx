import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, CornerDownLeft } from 'lucide-react'
import { searchEngines, defaultEngineId } from '../../data/searchEngines'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import EngineTabs from './EngineTabs'

/**
 * 主搜索框：
 * - 可切换搜索引擎（Tab + layoutId 滑块）
 * - 切换时图标 / placeholder crossfade
 * - 快捷键：/ 聚焦、Ctrl+K 唤起、Enter 跳转
 * - 记忆上次选择的引擎（localStorage）
 */
export default function SearchBox() {
  const [engineId, setEngineId] = useLocalStorage('hao:engine', defaultEngineId)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const engine = useMemo(
    () => searchEngines.find((e) => e.id === engineId) || searchEngines[0],
    [engineId],
  )

  // 快捷键
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase()
      const typing = tag === 'input' || tag === 'textarea'
      // Ctrl/Cmd + K 唤起
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        return
      }
      // / 聚焦（非输入态）
      if (e.key === '/' && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const submit = (e) => {
    e?.preventDefault()
    const q = query.trim()
    if (!q) {
      inputRef.current?.focus()
      return
    }
    window.open(engine.url + encodeURIComponent(q), '_self')
  }

  // 切换引擎（Tab/Shift+Tab 在输入框内时切换引擎）
  const cycleEngine = (dir) => {
    const idx = searchEngines.findIndex((e) => e.id === engine.id)
    const next = (idx + dir + searchEngines.length) % searchEngines.length
    setEngineId(searchEngines[next].id)
  }

  return (
    <motion.form
      onSubmit={submit}
      className="relative mx-auto w-full max-w-2xl"
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
    >
      {/* 引擎 Tabs */}
      <EngineTabs activeId={engine.id} onSelect={setEngineId} />

      {/* 搜索框主体 */}
      <div
        className="hud-corners group relative flex items-center gap-3 rounded-xl border bg-[var(--bg-glass-strong)] px-4 py-3.5 backdrop-blur-xl transition"
        style={{
          borderColor: `${engine.color}66`,
          boxShadow: `0 0 30px ${engine.color}22, inset 0 0 16px rgba(0,0,0,0.3)`,
        }}
      >
        {/* 引擎图标徽章 —— 显示 favicon */}
        <AnimatePresence mode="wait">
          <motion.span
            key={engine.id}
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
            style={{
              background: `${engine.color}22`,
              boxShadow: `0 0 16px ${engine.color}44`,
              border: `1px solid ${engine.color}55`,
            }}
            initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0, rotate: 20 }}
            transition={{ duration: 0.2 }}
          >
            {engine.favicon && (
              <img
                src={engine.favicon}
                alt=""
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
          </motion.span>
        </AnimatePresence>

        {/* input + placeholder crossfade —— placeholder 居中 */}
        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            {!query && (
              <motion.span
                key={engine.id}
                className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-mono text-sm text-ink-faint"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {engine.placeholder}
              </motion.span>
            )}
          </AnimatePresence>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault()
                cycleEngine(e.shiftKey ? -1 : 1)
              }
            }}
            className="w-full bg-transparent text-center font-mono text-base text-ink outline-none placeholder:text-transparent"
            aria-label="搜索输入"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-xs transition hover:brightness-125"
          style={{
            background: `${engine.color}1f`,
            color: engine.color,
            border: `1px solid ${engine.color}55`,
          }}
        >
          <Search size={13} />
          <span className="hidden sm:inline">搜索</span>
          <CornerDownLeft size={11} className="hidden sm:inline opacity-60" />
        </button>
      </div>

      {/* 提示行 */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[10px] text-ink-faint">
        <span>
          <kbd className="rounded border border-[var(--grid-line)] px-1">/</kbd> 聚焦 ·{' '}
          <kbd className="rounded border border-[var(--grid-line)] px-1">Tab</kbd> 切换引擎 ·{' '}
          <kbd className="rounded border border-[var(--grid-line)] px-1">Ctrl</kbd>+
          <kbd className="rounded border border-[var(--grid-line)] px-1">K</kbd> 唤起
        </span>
        <span className="opacity-70">{engine.hint}</span>
      </div>
    </motion.form>
  )
}
