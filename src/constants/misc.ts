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
  bbs_wiki: 266.6667,
  none: 0,
}

// 网格视图 - 默认列数
export const GRID_COLUMN_COUNT_DEFAULT = 4
// 网格视图 - 最小列数
export const GRID_COLUMN_COUNT_MIN = 2

// 网格视图 - 卡片最小宽度设置范围
export const GRID_CARD_WIDTH_MIN = 200
export const GRID_CARD_WIDTH_MAX = 400
export const GRID_CARD_WIDTH_STEP = 40
export const GRID_CARD_WIDTH_OPTIONS = Array.from(
  { length: (GRID_CARD_WIDTH_MAX - GRID_CARD_WIDTH_MIN) / GRID_CARD_WIDTH_STEP + 1 },
  (_, i) => ({
    value: String(GRID_CARD_WIDTH_MIN + i * GRID_CARD_WIDTH_STEP),
    label: `${GRID_CARD_WIDTH_MIN + i * GRID_CARD_WIDTH_STEP}px`,
  }),
)

// 网格视图 - 封面显示模式
export const GRID_COVER_MODE_OPTIONS = [
  { value: 'fixed', label: '固定高度' },
  { value: 'square', label: '正方形' },
]

export const TAG_ALL = '全部'
export const TAG_VIDEO = '视频'
export const TAG_OTHER = '未分类'

export const VISIT_PERSIST_MAX = 2000
export const VISIT_PERSIST_KEY = `${APP_ABBR}-newsVisited`

export const ARIA2_RPC_URL = 'http://localhost:6800/jsonrpc'

export const SETTING_TABS = [
  { key: 'general', label: '常规' },
  { key: 'source', label: '内容源' },
  { key: 'download', label: '下载' },
  { key: 'about', label: '关于' },
]

export const BUILD_DATE = document.body.getAttribute('data-build-date') || ''
export const BUILD_COMMIT = document.body.getAttribute('data-build-commit') || ''

export const DEFAULT_KEYWORD_BLACKLIST = [
  '米游币兑换中心',
  '米游币抽抽乐',
  '米游币许愿池',
  '米游币祈愿盒',
]

export const UNSAFE_CHARS_REGEX = /[#%'()*+,/;<=>?@[\\\]^`{|}]/
