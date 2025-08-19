import { getMiyousheVideoApi } from '@/api/news'
import { NEWS_CLASSIFY_RULE, NEWS_LIST, TAG_OTHER } from '@/constants'
import { sanitizeFilename } from '.'

export function getTags(newsList: NewsData[], source: string, channel: string): TagInfo[] {
  const tempTags: Record<string, TagInfo> = {}
  const classifyRules = NEWS_CLASSIFY_RULE[source]
  let videoCount = 0

  newsList.forEach((news) => {
    if (news.video) {
      videoCount += 1
    }
    const type = news.tag
    if (tempTags[type] === undefined) {
      tempTags[type] = {
        name: type,
        count: 1,
        video: (classifyRules?.[type]?.meta?.video && channel === 'web_cn') || false,
      }
    }
    else {
      tempTags[type].count += 1
    }
  })

  return [
    {
      name: '全部',
      count: newsList.length,
      video: false,
    },
    {
      name: '视频',
      count: videoCount,
      video: true,
    },
    ...Object.values(tempTags).sort((a, b) => b.count - a.count),
  ]
}

export function getNewsType(news: NewsData, source: string, channel: string): { type: string, rule?: ClassifyRule } {
  const { title, remoteId, video } = news
  const classifyRules = NEWS_CLASSIFY_RULE[source]
  if (!classifyRules)
    return { type: TAG_OTHER }
  for (const [type, rule] of Object.entries(classifyRules)) {
    if (rule.include?.some((includeKey) => {
      const [includeChannel, includeId] = includeKey.split('.')
      if (channel.startsWith(includeChannel) && includeId === remoteId)
        return true
      return false
    })) {
      return { type, rule }
    }
  }
  for (const [type, rule] of Object.entries(classifyRules)) {
    if (rule.exclude?.includes(`${channel}.${remoteId}`))
      continue

    if (channel === 'web_cn' && rule.meta?.video && !video)
      continue

    for (const keyword of rule.keyword) {
      if (typeof keyword === 'string') {
        if (title.includes(keyword))
          return { type, rule }
      }
      else if (keyword instanceof RegExp) {
        if (keyword.test(title))
          return { type, rule }
      }
    }
  }
  return { type: TAG_OTHER }
}

export function getAria2DownloadTask(news: NewsData[]): string {
  return news.map((news) => {
    const fileExt = news.video!.url.split('.').pop()
    return `${news.video!.url}\n  out=${sanitizeFilename(news.title)}.${fileExt}`
  }).join('\n')
}

export async function getMiyousheVideo(source: string, channel: string, newsId: string): Promise<string> {
  const apiBase = NEWS_LIST[source].channels[channel].apiBase
  return getMiyousheVideoApi(apiBase, newsId)
    .then((res: any) => {
      return res.videoUrl
    })
    .catch((err) => {
      throw new Error(`获取视频信息失败：${err?.message ?? '未知错误'}`)
    })
}
