import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

const COLOR_PRESETS = ['#00f0ff', '#ff2a6d', '#b16cff', '#f9f002', '#39ff14', '#ff8a00']
const GLYPHS = ['◆', '⚡', '⌘', '◇', '✦', '◉', '◈', '★', '▲', '●']

const favFromUrl = (url) => {
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`
  } catch {
    return ''
  }
}

/**
 * 通用编辑弹窗：
 *  - mode='link': 添加/编辑链接 (name, url, desc)
 *  - mode='category': 添加分类 (title, glyph, color)
 *  - initialValues: 预填值（编辑时）
 *  - onSubmit: 提交回调
 */
export default function EditBookmarkModal({ open, mode = 'link', initialValues, onSubmit, onClose }) {
  const [form, setForm] = useState(() => buildInitial(mode, initialValues))

  useEffect(() => {
    if (open) setForm(buildInitial(mode, initialValues))
  }, [open, mode, initialValues])

  // Esc 关闭
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const submit = (e) => {
    e.preventDefault()
    if (mode === 'link') {
      const url = form.url.trim()
      if (!url) return
      const fullUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
      onSubmit?.({
        name: form.name.trim() || new URL(fullUrl).hostname.replace('www.', ''),
        url: fullUrl,
        desc: form.desc.trim(),
        favicon: favFromUrl(fullUrl),
      })
    } else {
      if (!form.title.trim()) return
      onSubmit?.({
        title: form.title.trim(),
        glyph: form.glyph,
        color: form.color,
        links: initialValues?.links || [],
      })
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.form
            onSubmit={submit}
            className="hud-corners relative w-full max-w-md rounded-xl border border-[var(--neon-cyan)] bg-[var(--bg-glass-strong)] p-5 backdrop-blur-xl"
            style={{ boxShadow: '0 0 30px rgba(0,240,255,0.3)' }}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold neon-text">
                {mode === 'link'
                  ? initialValues?.name
                    ? '编辑链接'
                    : '添加链接'
                  : '添加分类'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-faint transition hover:text-[var(--neon-magenta)]"
              >
                <X size={18} />
              </button>
            </div>

            {mode === 'link' ? (
              <div className="space-y-3">
                <Field label="名称">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="GitHub"
                    className="input"
                    autoFocus
                  />
                </Field>
                <Field label="网址">
                  <input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="github.com"
                    className="input"
                  />
                </Field>
                <Field label="描述（可选）">
                  <input
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    placeholder="代码托管"
                    className="input"
                  />
                </Field>
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="分类名称">
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="阅读"
                    className="input"
                    autoFocus
                  />
                </Field>
                <Field label="图标">
                  <div className="flex flex-wrap gap-1.5">
                    {GLYPHS.map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setForm({ ...form, glyph: g })}
                        className={`flex h-8 w-8 items-center justify-center rounded border text-sm transition ${
                          form.glyph === g
                            ? 'border-[var(--neon-cyan)] text-[var(--neon-cyan)]'
                            : 'border-[var(--grid-line)] text-ink-muted hover:text-ink'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="主题色">
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setForm({ ...form, color: c })}
                        className={`h-8 w-8 rounded-full border-2 transition ${
                          form.color === c ? 'scale-110' : 'scale-100'
                        }`}
                        style={{
                          background: c,
                          borderColor: form.color === c ? '#fff' : 'transparent',
                          boxShadow: `0 0 10px ${c}`,
                        }}
                      />
                    ))}
                  </div>
                </Field>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[var(--grid-line)] px-4 py-2 font-mono text-xs text-ink-muted transition hover:text-ink"
              >
                取消
              </button>
              <button
                type="submit"
                className="rounded-lg border border-[var(--neon-cyan)] bg-[var(--neon-cyan)] px-4 py-2 font-mono text-xs font-semibold text-[var(--bg-base)] transition hover:brightness-110"
              >
                确认
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] text-ink-faint">{label}</span>
      {children}
    </label>
  )
}

function buildInitial(mode, init) {
  if (mode === 'link') {
    return {
      name: init?.name || '',
      url: init?.url || '',
      desc: init?.desc || '',
    }
  }
  return {
    title: init?.title || '',
    glyph: init?.glyph || '◆',
    color: init?.color || COLOR_PRESETS[0],
  }
}
