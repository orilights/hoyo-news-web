export { }

declare global {

  interface Window {
    umami: any
  }

  interface VideoData {
    url: string
    duration: number | null
  }
  interface NewsData {
    remoteId: number
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
    aria2Config: Aria2Config
  }

  interface SourceInfo {
    displayName: string
    channals: {
      [channalKey: string]: ChannelInfo
    }
  }

  interface ChannelInfo {
    displayName: string
    apiBase: string
    newsDetailLink: string
    coverWidth: number
  }

  interface ClassifyRule {
    keyword: (string | RegExp)[]
    include: number[]
    exclude: number[]
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
}
