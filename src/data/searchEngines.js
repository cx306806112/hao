/**
 * 搜索引擎定义。每项：
 *  { id, name, favicon, color, url, placeholder, hint }
 * `url` 为搜索 URL 前缀，最终拼接 encodeURIComponent(query)。
 * `favicon` 为站点图标 URL，用于 Tab 和搜索框徽章显示。
 */
const favicon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

export const searchEngines = [
  {
    id: 'baidu',
    name: '百度',
    favicon: favicon('baidu.com'),
    color: '#2932E1',
    url: 'https://www.baidu.com/s?wd=',
    placeholder: '百度一下，你就知道',
    hint: '中文',
  },
  {
    id: 'google',
    name: 'Google',
    favicon: favicon('google.com'),
    color: '#4285F4',
    url: 'https://www.google.com/search?q=',
    placeholder: '用 Google 搜索整个网络',
    hint: '全网',
  },
  {
    id: 'bilibili',
    name: '哔哩哔哩',
    favicon: favicon('bilibili.com'),
    color: '#FB7299',
    url: 'https://search.bilibili.com/all?keyword=',
    placeholder: '搜索 B 站视频 / UP 主',
    hint: '视频',
  },
  {
    id: 'douyin',
    name: '抖音',
    favicon: favicon('douyin.com'),
    color: '#FE2C55',
    url: 'https://www.douyin.com/search/',
    placeholder: '搜索抖音视频',
    hint: '短视频',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    favicon: favicon('youtube.com'),
    color: '#FF0000',
    url: 'https://www.youtube.com/results?search_query=',
    placeholder: 'Search YouTube videos',
    hint: '视频',
  },
  {
    id: 'x',
    name: 'X',
    favicon: favicon('twitter.com'),
    color: '#FFFFFF',
    url: 'https://twitter.com/search?q=',
    placeholder: 'Search posts on X',
    hint: '社交',
  },
  {
    id: 'github',
    name: 'GitHub',
    favicon: favicon('github.com'),
    color: '#6E5494',
    url: 'https://github.com/search?q=',
    placeholder: 'Search repos / code on GitHub',
    hint: '代码',
  },
  {
    id: 'wikipedia',
    name: '维基',
    favicon: favicon('wikipedia.org'),
    color: '#CCCCCC',
    url: 'https://zh.wikipedia.org/w/index.php?search=',
    placeholder: '搜索维基百科',
    hint: '百科',
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    favicon: favicon('xiaohongshu.com'),
    color: '#FF2442',
    url: 'https://www.xiaohongshu.com/search_result?keyword=',
    placeholder: '搜索小红书笔记',
    hint: '种草',
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    favicon: favicon('duckduckgo.com'),
    color: '#DE5833',
    url: 'https://duckduckgo.com/?q=',
    placeholder: 'Search without tracking',
    hint: '隐私',
  },
]

export const defaultEngineId = 'baidu'
