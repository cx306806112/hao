import { motion } from 'motion/react'
import { Pencil, Check, RotateCcw } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

/**
 * 顶部导航栏：左 Logo + 右 操作区（主题切换 / 编辑态切换）。
 */
export default function Navbar({ editing, onToggleEdit, onResetBookmarks }) {
  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        {/* Logo */}
        <a
          href="#top"
          className="group flex items-center gap-2 font-display text-2xl font-black tracking-widest"
        >
          <span
            className="glitch neon-text"
            data-text="hao"
          >
            hao
          </span>
          <span className="hidden font-mono text-[10px] text-ink-faint sm:inline">
            // mseeks
          </span>
        </a>

        {/* 右侧操作 */}
        <div className="flex items-center gap-2">
          {editing && (
            <button
              onClick={onResetBookmarks}
              className="flex items-center gap-1 rounded border border-[var(--grid-line)] bg-[var(--bg-glass)] px-3 py-1.5 font-mono text-xs text-ink-muted transition hover:border-[var(--neon-yellow)] hover:text-[var(--neon-yellow)]"
              title="重置为默认书签"
            >
              <RotateCcw size={12} />
              重置
            </button>
          )}
          <button
            onClick={onToggleEdit}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-xs transition ${
              editing
                ? 'border-[var(--neon-green)] text-[var(--neon-green)] shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                : 'border-[var(--grid-line)] text-ink-muted hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)]'
            }`}
            title="切换编辑模式"
          >
            {editing ? <Check size={13} /> : <Pencil size={13} />}
            {editing ? '完成' : '编辑'}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  )
}
