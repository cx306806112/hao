/**
 * 默认书签数据。结构：
 *  [{ id, title, glyph, color, links: [{ name, url, desc }] }]
 * 编辑后写入 localStorage 并覆盖此默认。
 */

const fav = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

export const defaultBookmarks = [
  {
    id: 'cat-often',
    title: '常用',
    glyph: '⚡',
    color: '#00f0ff',
    links: [
      { name: 'GitHub', url: 'https://github.com', desc: '代码托管', favicon: fav('github.com') },
      { name: 'Gmail', url: 'https://mail.google.com', desc: '谷歌邮箱', favicon: fav('mail.google.com') },
      { name: 'YouTube', url: 'https://youtube.com', desc: '视频', favicon: fav('youtube.com') },
      { name: 'Bilibili', url: 'https://bilibili.com', desc: '哔哩哔哩', favicon: fav('bilibili.com') },
      { name: '知乎', url: 'https://zhihu.com', desc: '问答社区', favicon: fav('zhihu.com') },
      { name: '微博', url: 'https://weibo.com', desc: '社交', favicon: fav('weibo.com') },
    ],
  },
  {
    id: 'cat-dev',
    title: '开发',
    glyph: '⌘',
    color: '#b16cff',
    links: [
      { name: 'GitHub', url: 'https://github.com', desc: '代码托管', favicon: fav('github.com') },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: '问答', favicon: fav('stackoverflow.com') },
      { name: 'MDN', url: 'https://developer.mozilla.org', desc: 'Web 文档', favicon: fav('developer.mozilla.org') },
      { name: 'Vite', url: 'https://vitejs.dev', desc: '构建工具', favicon: fav('vitejs.dev') },
      { name: 'React', url: 'https://react.dev', desc: 'UI 库', favicon: fav('react.dev') },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com', desc: '原子化 CSS', favicon: fav('tailwindcss.com') },
      { name: 'npm', url: 'https://npmjs.com', desc: '包管理', favicon: fav('npmjs.com') },
      { name: 'MDN CanIUse', url: 'https://caniuse.com', desc: '兼容性', favicon: fav('caniuse.com') },
    ],
  },
  {
    id: 'cat-ai',
    title: 'AI',
    glyph: '◇',
    color: '#ff2a6d',
    links: [
      { name: 'ChatGPT', url: 'https://chat.openai.com', desc: 'OpenAI', favicon: fav('chat.openai.com') },
      { name: 'Claude', url: 'https://claude.ai', desc: 'Anthropic', favicon: fav('claude.ai') },
      { name: 'Gemini', url: 'https://gemini.google.com', desc: 'Google', favicon: fav('gemini.google.com') },
      { name: 'Hugging Face', url: 'https://huggingface.co', desc: '模型社区', favicon: fav('huggingface.co') },
      { name: 'Poe', url: 'https://poe.com', desc: '多模型', favicon: fav('poe.com') },
    ],
  },
  {
    id: 'cat-design',
    title: '设计',
    glyph: '✦',
    color: '#f9f002',
    links: [
      { name: 'Figma', url: 'https://figma.com', desc: '协作设计', favicon: fav('figma.com') },
      { name: 'Dribbble', url: 'https://dribbble.com', desc: '设计灵感', favicon: fav('dribbble.com') },
      { name: 'Behance', url: 'https://behance.net', desc: '作品集', favicon: fav('behance.net') },
      { name: 'Coolors', url: 'https://coolors.co', desc: '配色生成', favicon: fav('coolors.co') },
      { name: 'Unsplash', url: 'https://unsplash.com', desc: '免版权图', favicon: fav('unsplash.com') },
      { name: 'Iconfont', url: 'https://iconfont.cn', desc: '阿里图标', favicon: fav('iconfont.cn') },
    ],
  },
  {
    id: 'cat-media',
    title: '媒体',
    glyph: '◉',
    color: '#39ff14',
    links: [
      { name: 'Bilibili', url: 'https://bilibili.com', desc: 'B 站', favicon: fav('bilibili.com') },
      { name: 'YouTube', url: 'https://youtube.com', desc: '油管', favicon: fav('youtube.com') },
      { name: 'Netflix', url: 'https://netflix.com', desc: '奈飞', favicon: fav('netflix.com') },
      { name: 'Spotify', url: 'https://open.spotify.com', desc: '音乐', favicon: fav('open.spotify.com') },
      { name: '豆瓣电影', url: 'https://movie.douban.com', desc: '影评', favicon: fav('movie.douban.com') },
      { name: 'IMDb', url: 'https://imdb.com', desc: '影视库', favicon: fav('imdb.com') },
    ],
  },
  {
    id: 'cat-tools',
    title: '工具',
    glyph: '◈',
    color: '#00f0ff',
    links: [
      { name: 'Notion', url: 'https://notion.so', desc: '笔记', favicon: fav('notion.so') },
      { name: 'WolframAlpha', url: 'https://wolframalpha.com', desc: '计算', favicon: fav('wolframalpha.com') },
      { name: 'Regex101', url: 'https://regex101.com', desc: '正则', favicon: fav('regex101.com') },
      { name: 'JSON Formatter', url: 'https://jsonformatter.org', desc: 'JSON', favicon: fav('jsonformatter.org') },
      { name: 'TinyPNG', url: 'https://tinypng.com', desc: '压缩图', favicon: fav('tinypng.com') },
      { name: 'Carbon', url: 'https://carbon.now.sh', desc: '代码截图', favicon: fav('carbon.now.sh') },
    ],
  },
]
