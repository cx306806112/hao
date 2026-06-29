/**
 * 主题应用工具：在 <html> 上切换 theme-light class。
 * 默认深色（赛博），theme-light 为日间赛博变体。
 */
export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('theme-light')
    root.classList.remove('dark')
  } else {
    root.classList.remove('theme-light')
    root.classList.add('dark')
  }
}

export function getPreferredTheme() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const saved = window.localStorage.getItem('hao:theme')
    if (saved) return JSON.parse(saved)
  } catch {
    /* ignore */
  }
  return 'dark'
}

/**
 * 内联脚本：在首屏渲染前同步应用主题，避免闪烁。
 */
export const themeInlineScript = `
(function(){
  try {
    var t = JSON.parse(localStorage.getItem('hao:theme') || '"dark"');
    var root = document.documentElement;
    if (t === 'light') { root.classList.add('theme-light'); root.classList.remove('dark'); }
    else { root.classList.add('dark'); }
  } catch(e){ document.documentElement.classList.add('dark'); }
})();
`
