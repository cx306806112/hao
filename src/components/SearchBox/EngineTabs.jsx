import { motion } from 'motion/react'
import { searchEngines } from '../../data/searchEngines'

/**
 * 搜索引擎 Tab 列表：layoutId 滑块平滑跟随。
 * 横向可滚动，移动端友好。
 */
export default function EngineTabs({ activeId, onSelect }) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar"
      role="tablist"
      aria-label="选择搜索引擎"
    >
      {searchEngines.map((eng) => {
        const active = eng.id === activeId
        return (
          <button
            key={eng.id}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(eng.id)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs transition ${
              active
                ? 'border-transparent text-[var(--bg-base)]'
                : 'border-[var(--grid-line)] text-ink-muted hover:border-[var(--border-glow)] hover:text-ink'
            }`}
            style={active ? { background: eng.color } : undefined}
          >
            {active && (
              <motion.span
                layoutId="enginePill"
                className="absolute inset-0 -z-10 rounded-md"
                style={{ background: eng.color, boxShadow: `0 0 16px ${eng.color}` }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span
              className="flex h-4 w-4 items-center justify-center rounded-sm text-[10px] font-bold"
              style={{
                background: active ? 'rgba(0,0,0,0.25)' : `${eng.color}22`,
                color: active ? '#fff' : eng.color,
                border: active ? 'none' : `1px solid ${eng.color}55`,
              }}
            >
              {eng.glyph}
            </span>
            <span>{eng.name}</span>
          </button>
        )
      })}
    </div>
  )
}
