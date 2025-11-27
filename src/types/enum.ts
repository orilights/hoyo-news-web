export enum CoverSize {
  Small,
  Medium,
  Large,
}

export enum VideoType {
  /** 直链 */
  LINK = 'link',
  /** 米游社文章ID */
  MIYOUSHE_POST = 'miyoushe',
}

export enum ChannelType {
  /** 官方网站-新闻 */
  WEBSITE_NEWS = 'website_news',
  /** 官方网站-新闻-海外 */
  WEBSITE_NEWS_OS = 'website_news_os',
  /** 米游社-新闻-聚合分类 */
  MIYOUSHE_NEWS = 'miyoushe_news',
  /** 米游社-新闻-子分类 */
  MIYOUSHE_NEWS_SUB = 'miyoushe_news_sub',
  /** 米游社-崩坏3WIKI */
  MIYOUSHE_BH3_WIKI = 'miyoushe_bh3_wiki',
}

export function getChannelLabel(type: ChannelType) {
  switch (type) {
    case ChannelType.WEBSITE_NEWS:
      return '官网'
    case ChannelType.WEBSITE_NEWS_OS:
      return '官网-国际服'
    case ChannelType.MIYOUSHE_NEWS:
      return '米游社'
    case ChannelType.MIYOUSHE_NEWS_SUB:
      return '米游社-子分类'
    case ChannelType.MIYOUSHE_BH3_WIKI:
      return '米游社-崩坏3WIKI'
  }
}
