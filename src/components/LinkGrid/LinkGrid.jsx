import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import CategorySection from './CategorySection'

/**
 * 链接网格容器：渲染所有分类区块。
 * 编辑态底部提供「+ 添加分类」。
 */
export default function LinkGrid({ categories, editing, onReorderLinks, onDeleteLink, onAddLink, onAddCategory }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-5">
      {categories.map((cat, i) => (
        <CategorySection
          key={cat.id}
          category={cat}
          index={i}
          editing={editing}
          onReorderLinks={onReorderLinks}
          onDeleteLink={onDeleteLink}
          onAddLink={onAddLink}
        />
      ))}

      {editing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center"
        >
          <button
            onClick={onAddCategory}
            className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--neon-purple)] px-6 py-3 font-mono text-sm text-[var(--neon-purple)] transition hover:shadow-[0_0_20px_rgba(177,108,255,0.3)]"
          >
            <Plus size={15} /> 添加分类
          </button>
        </motion.div>
      )}

      {/* 底部留白 */}
      <div className="h-24" />
    </div>
  )
}
