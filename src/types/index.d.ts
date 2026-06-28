import type { ChannelType } from './enum'

export { }

declare global {

  interface Window {
    umami: any
  }

  interface VideoData {
    type: VideoType
    url: string
    duration: number | null
  }
  interface NewsData {
    key: string
    remoteId: string
    title: string
    startTime: string
    tags: string[]
    coverUrl: string
    video: VideoData | null
  }

  interface NewsItemData extends NewsData {
    top: number
  }

  interface NewsItemConfig {
    showCover: boolean
    showDateWeek: boolean
    showVisited: boolean
    coverSize: CoverSize
    coverMode: 'fixed' | 'square'
  }

  interface SourceInfo {
    displayName: string
    channels: {
      [channelKey: string]: ChannelInfo
    }
  }

  interface HeaderSourceInfo {
    key: string
    displayName: string
    channels: {
      key: string
      label: string
    }[]
  }

  interface ChannelInfo {
    displayName: string
    type: ChannelType
    apiBase: string
    newsDetailLink: string
    coverWidth: number
    allowForceRefresh?: boolean
    rss?: boolean
  }

  interface ClassifyRule {
    keyword: (string | RegExp)[]
    include?: string[]
    exclude?: string[]
    excludeTags?: string[]
    group?: string
    meta?: {
      video?: boolean
    }
    filter?: {
      video?: boolean
    }
    dateRule?: { month: number, day: number }
    titlePrefix?: string
    titleContains?: string
  }

  interface SerializableKeywordRegex {
    $regex: string
    $flags?: string
  }

  interface SourceClassifyRule {
    [classifyName: string]: ClassifyRule
  }

  interface SourceClassifyRuleGroups {
    [groupName: string]: SourceClassifyRule
  }

  interface Aria2Config {
    rpcUrl: string
    rpcSecret: string
    filename: string
  }

  interface TagInfo {
    name: string
    count: number
    video: boolean
    group?: string
  }

  interface NewsDetailSource {
    key: string
    name: string
  }
  interface NewsDetailData {
    key: string
    remoteId: string
    title: string
    content: string
    coverUrl: string
    startTime: string
    tags: string
    state: string
    source: NewsDetailSource
    video: VideoData | null
  }

  interface SourceCustomData {
    key: string
    channels: {
      key: string
      enable: boolean
    }[]
  }

  interface ChannelCustomData {
    key: ChannelType
    enable: boolean
  }

  interface RssFilterCache {
    [cacheKey: string]: {
      whitelist: string[]
      blacklist: string[]
      contentWhitelist?: string[]
      contentBlacklist?: string[]
    }
  }

}
