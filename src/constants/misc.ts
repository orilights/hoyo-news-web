export const APP_ABBR = 'GNS'

export const SHADOW_ITEM: NewsItemData = {
  remoteId: 'ShadowShadowShadowShadowShadowShadow',
  title: 'ShadowShadowShadowShadowShadowShadow',
  startTime: '2024-01-01 12:00:00',
  tag: 'ShadowShadowShadowShadowShadowShadow',
  coverUrl: '',
  video: null,
  top: -9999999,
}
export const DEFAULT_BANNER = 'https://icdn.amarea.cn/upload/2023/06/6491c83b6fa65.jpg'
export const LOAD_DELAY = 300
export const ITEM_GAP = 8
export const COVER_WIDTH = {
  default: 300,
  bbs: 323.4375,
  none: 0,
}

export const TAG_ALL = '全部'
export const TAG_VIDEO = '视频'
export const TAG_OTHER = '未分类'

export const VISIT_PERSIST_KEY = `${APP_ABBR}-newsVisited`

export const ARIA2_RPC_URL = 'http://localhost:6800/jsonrpc'

export const SETTING_TABS = [
  { key: 'general', label: '常规' },
  { key: 'download', label: '下载' },
  { key: 'about', label: '关于' },
]

export const BUILD_DATE = document.body.getAttribute('data-build-date') || ''

export const DEFAULT_KEYWORD_BLACKLIST = [
  '米游币兑换中心',
  '米游币抽抽乐',
  '米游币许愿池',
  '米游币祈愿盒',
]
