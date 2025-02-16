export { }

declare global {
  interface NewsData {
    id: number
    title: string
    startTime: string
    createTime: string
    tag: string
    cover: string
    video: string | null
  }

  interface NewsItemData extends NewsData {
    top: number
  }

  interface GameInfo {
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
  }

  interface GameClassifyRule {
    [classifyName: string]: ClassifyRule
  }
}
