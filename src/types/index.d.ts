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
    remoteId: string
    title: string
    startTime: string
    tag: string
    coverUrl: string
    video: VideoData | null
  }

  interface NewsItemData extends NewsData {
    top: number
  }

  interface NewsItemConfig {
    showBanner: boolean
    showDateWeek: boolean
    showVisited: boolean
    coverSize: CoverSize
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
    meta?: {
      video?: boolean
    }
    filter?: {
      video?: boolean
    }
  }

  interface SourceClassifyRule {
    [classifyName: string]: ClassifyRule
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
    }
  }

}
