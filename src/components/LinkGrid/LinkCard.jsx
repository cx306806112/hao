import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Trash2 } from 'lucide-react'

/**
 * 单个链接卡片：3D tilt 跟随鼠标 + 霓虹 hover glow。
 * 编辑态显示删除按钮。
 */
export default function LinkCard({ link, accent, editing, onDelete }) {
  const ref = useRef(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 18 })
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 18 })

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(link)
  }

  return (
    <motion.a
      ref={ref}
      href={editing ? undefined : link.url}
      target={editing ? undefined : '_blank'}
      rel="noopener noreferrer"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 600 }}
      whileHover={{ scale: editing ? 1 : 1.04 }}
      whileTap={{ scale: editing ? 1 : 0.97 }}
      className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-lg border border-[var(--grid-line)] bg-[var(--bg-glass)] p-3 backdrop-blur-md"
    >
      {/* hover 霓虹边光 */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 14px ${accent}33, 0 0 16px ${accent}44` }}
      />
      {/* 顶部高光线 */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
      />

      {/* favicon */}
      <span
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border"
        style={{ borderColor: `${accent}44`, background: `${accent}11` }}
      >
        {link.favicon ? (
          <img
            src={link.favicon}
            alt=""
            className="h-6 w-6"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span className="font-mono text-xs" style={{ color: accent }}>
            {link.name?.[0] || '·'}
          </span>
        )}
      </span>

      {/* 文字 */}
      <span className="relative min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">
          {link.name}
        </span>
        {link.desc && (
          <span className="block truncate font-mono text-[11px] text-ink-faint">
            {link.desc}
          </span>
        )}
      </span>

      {/* 删除按钮 */}
      {editing && (
        <button
          onClick={handleDelete}
          className="relative flex h-7 w-7 items-center justify-center rounded text-ink-faint transition hover:bg-[var(--neon-magenta)] hover:text-white"
          title="删除"
        >
          <Trash2 size={13} />
        </button>
      )}
    </motion.a>
  )
}
