import { motion, Reorder } from 'motion/react'
import { Plus, GripVertical } from 'lucide-react'
import LinkCard from './LinkCard'

/**
 * 单个分类区块：标题 + Reorder.Group 包裹的链接卡片。
 * stagger 揭幕；编辑态可拖拽排序、显示「+ 添加」。
 */
export default function CategorySection({ category, index, editing, onReorderLinks, onDeleteLink, onAddLink }) {
  const accent = category.color || '#00f0ff'

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
      className="relative"
    >
      {/* 标题行 */}
      <div className="mb-3 flex items-center gap-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md border font-mono text-sm"
          style={{ borderColor: `${accent}66`, color: accent, boxShadow: `0 0 12px ${accent}33` }}
        >
          {category.glyph || '◆'}
        </span>
        <h2 className="font-heading text-lg font-semibold tracking-wide text-ink">
          {category.title}
        </h2>
        <span className="font-mono text-[10px] text-ink-faint">
          [{String(index + 1).padStart(2, '0')} · {category.links.length}]
        </span>
        <span
          className="ml-1 h-px flex-1"
          style={{ background: `linear-gradient(90deg, ${accent}55, transparent)` }}
        />
      </div>

      {/* 链接卡片网格 */}
      <Reorder.Group
        axis="y"
        values={category.links}
        onReorder={(newLinks) => onReorderLinks(category.id, newLinks)}
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {category.links.map((link, i) => (
          <Reorder.Item
            key={link.url + link.name + i}
            value={link}
            drag={editing}
            dragListener={editing}
            className={editing ? 'cursor-grab active:cursor-grabbing' : ''}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          >
            <div className="relative">
              {editing && (
                <GripVertical
                  size={12}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 text-ink-faint opacity-50"
                />
              )}
              <LinkCard
                link={link}
                accent={accent}
                editing={editing}
                onDelete={(l) => onDeleteLink(category.id, l)}
              />
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* 编辑态添加按钮 */}
      {editing && (
        <button
          onClick={() => onAddLink(category.id)}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--grid-line)] py-2.5 font-mono text-xs text-ink-faint transition hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)]"
        >
          <Plus size={13} /> 添加链接
        </button>
      )}
    </motion.section>
  )
}
