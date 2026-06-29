import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'

import CyberBackground from './components/Background/CyberBackground'
import Scanlines from './components/Background/Scanlines'
import ScrollProgress from './components/ScrollProgress'
import Navbar from './components/Navbar'
import SearchBox from './components/SearchBox/SearchBox'
import LinkGrid from './components/LinkGrid/LinkGrid'
import EditBookmarkModal from './components/LinkGrid/EditBookmarkModal'
import Clock from './components/Widgets/Clock'
import Weather from './components/Widgets/Weather'
import Hitokoto from './components/Widgets/Hitokoto'

import { useLocalStorage } from './hooks/useLocalStorage'
import { applyTheme } from './lib/theme'
import { defaultBookmarks } from './data/defaultBookmarks'

export default function App() {
  const [theme] = useLocalStorage('hao:theme', 'dark')
  const [bookmarks, setBookmarks] = useLocalStorage('hao:bookmarks', defaultBookmarks)
  const [editing, setEditing] = useState(false)

  // modal state
  const [modal, setModal] = useState({
    open: false,
    mode: 'link', // 'link' | 'category'
    targetCategoryId: null,
    initialValues: null,
  })

  // 应用主题
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // ---------- 书签操作 ----------
  const handleReorderLinks = (catId, newLinks) => {
    setBookmarks((cats) => cats.map((c) => (c.id === catId ? { ...c, links: newLinks } : c)))
  }

  const handleDeleteLink = (catId, link) => {
    setBookmarks((cats) =>
      cats.map((c) =>
        c.id === catId
          ? { ...c, links: c.links.filter((l) => !(l.url === link.url && l.name === link.name)) }
          : c,
      ),
    )
  }

  const handleAddLink = (catId) => {
    setModal({ open: true, mode: 'link', targetCategoryId: catId, initialValues: null })
  }

  const handleAddCategory = () => {
    setModal({ open: true, mode: 'category', targetCategoryId: null, initialValues: null })
  }

  const handleModalSubmit = (value) => {
    if (modal.mode === 'link') {
      setBookmarks((cats) =>
        cats.map((c) =>
          c.id === modal.targetCategoryId ? { ...c, links: [...c.links, value] } : c,
        ),
      )
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        title: value.title,
        glyph: value.glyph,
        color: value.color,
        links: [],
      }
      setBookmarks((cats) => [...cats, newCat])
    }
    setModal((m) => ({ ...m, open: false }))
  }

  const handleResetBookmarks = () => {
    if (window.confirm('确定重置为默认书签？当前编辑将被清除。')) {
      setBookmarks(defaultBookmarks)
    }
  }

  const categories = useMemo(() => bookmarks, [bookmarks])

  return (
    <>
      <CyberBackground />
      <Scanlines />
      <ScrollProgress />
      <Navbar
        editing={editing}
        onToggleEdit={() => setEditing((v) => !v)}
        onResetBookmarks={handleResetBookmarks}
      />

      <main id="top" className="relative z-10">
        {/* ===== Hero ===== */}
        <section className="relative mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-5 pt-20 text-center">
          {/* 顶部 widgets 行 */}
          <motion.div
            className="mb-8 flex w-full max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Clock />
            <div className="hidden h-8 w-px bg-[var(--grid-line)] sm:block" />
            <Weather />
          </motion.div>

          {/* Logo / 标题 */}
          <motion.h1
            className="font-display text-7xl font-black tracking-[0.15em] sm:text-8xl"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="glitch neon-text" data-text="hao">
              hao
            </span>
          </motion.h1>

          {/* tagline */}
          <motion.p
            className="mt-3 font-mono text-xs text-ink-muted sm:text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="text-[var(--neon-magenta)]">{'> '}</span>
            personal cyber navigation
            <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-[var(--neon-cyan)] align-middle" />
          </motion.p>

          {/* 搜索框 */}
          <div className="mt-8 w-full">
            <SearchBox />
          </div>

          {/* 一言 */}
          <motion.div
            className="mt-6 flex w-full justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Hitokoto />
          </motion.div>

          {/* 向下提示 */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 1.2, duration: 2.4, repeat: Infinity }}
          >
            <span className="font-mono text-[10px] text-ink-faint">▼ scroll</span>
          </motion.div>
        </section>

        {/* ===== Link Grid ===== */}
        <section className="relative mt-4">
          <div className="mx-auto mb-8 max-w-6xl px-5">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-2xl font-bold tracking-wide text-ink">
                导航<span className="neon-text">.links</span>
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-[var(--neon-cyan)] to-transparent" />
              {editing && (
                <span className="font-mono text-[10px] text-[var(--neon-green)]">
                  ● editing
                </span>
              )}
            </div>
          </div>
          <LinkGrid
            categories={categories}
            editing={editing}
            onReorderLinks={handleReorderLinks}
            onDeleteLink={handleDeleteLink}
            onAddLink={handleAddLink}
            onAddCategory={handleAddCategory}
          />
        </section>

        {/* ===== Footer ===== */}
        <footer className="relative z-10 border-t border-[var(--grid-line)] py-8">
          <div className="mx-auto max-w-6xl px-5 text-center font-mono text-[11px] text-ink-faint">
            <p>
              <span className="neon-text">hao</span> · {new Date().getFullYear()} ·
              cyberpunk navigation · mseeks.com
            </p>
            <p className="mt-1 opacity-60">
              built with React · Vite · Motion · Tailwind
            </p>
          </div>
        </footer>
      </main>

      {/* 编辑弹窗 */}
      <EditBookmarkModal
        open={modal.open}
        mode={modal.mode}
        initialValues={modal.initialValues}
        onSubmit={handleModalSubmit}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />
    </>
  )
}
