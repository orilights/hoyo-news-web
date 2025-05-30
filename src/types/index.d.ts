export { }

declare global {

  interface Window {
    umami: any
  }
  interface NewsData {
    id: number
    title: string
    startTime: string
    createTime: string
    tag: string
    cover: string
    video: string | null
    duration: number | null
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
