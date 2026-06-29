import { useCallback, useEffect, useState } from 'react'

/**
 * 通用 localStorage 读写 hook，自动 JSON 序列化。
 * @param {string} key storage 键名
 * @param {*} initial 默认值（或返回默认值的函数）
 */
export function useLocalStorage(key, initial) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return resolveInitial(initial)
    try {
      const raw = window.localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : resolveInitial(initial)
    } catch {
      return resolveInitial(initial)
    }
  }, [key, initial])

  const [value, setValue] = useState(readValue)

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* ignore quota / private mode */
        }
        return resolved
      })
    },
    [key],
  )

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    setValue(resolveInitial(initial))
  }, [key, initial])

  // 跨标签页同步
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) setValue(readValue())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, readValue])

  return [value, set, remove]
}

function resolveInitial(initial) {
  return typeof initial === 'function' ? initial() : initial
}
