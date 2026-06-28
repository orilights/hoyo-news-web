import type { ChannelType } from '@/types/enum'
import { getMiyousheVideoApi } from '@/api/news'
import { NEWS_LIST, TAG_OTHER, TAG_UNCLASSIFIED_VIDEO } from '@/constants'
import { VideoType } from '@/types/enum'
import { sanitizeFilename } from '.'

function deserializeKeywords(keywords: (string | SerializableKeywordRegex)[]): (string | RegExp)[] {
  return keywords.map((kw) => {
    if (typeof kw === 'string')
      return kw
    return new RegExp(kw.$regex, kw.$flags || '')
  })
}

function deserializeRule(rule: Record<string, unknown>): ClassifyRule {
  return {
    ...rule,
    keyword: deserializeKeywords((rule.keyword || []) as (string | SerializableKeywordRegex)[]),
  } as unknown as ClassifyRule
}

export function deserializeRules(json: SourceClassifyRuleGroups): SourceClassifyRule {
  const flat: SourceClassifyRule = {}
  for (const [groupName, rules] of Object.entries(json)) {
    for (const [ruleName, rule] of Object.entries(rules)) {
      flat[ruleName] = deserializeRule({ ...rule, group: groupName } as unknown as Record<string, unknown>)
    }
  }
  return flat
}

export function getClassifyRules(
  source: string,
  channel: string,
  rulesRecord?: Record<string, Record<string, SourceClassifyRuleGroups>> | null,
): SourceClassifyRule | undefined {
  if (!rulesRecord)
    return undefined

  const sourceRule = rulesRecord[source] || {}
  let classifyGroups: SourceClassifyRuleGroups | undefined
  for (const ruleKey in sourceRule) {
    if (channel.startsWith(ruleKey)) {
      classifyGroups = sourceRule[ruleKey]
      break
    }
  }
  if (!classifyGroups) {
    classifyGroups = sourceRule._default
  }
  if (!classifyGroups)
    return undefined

  return deserializeRules(classifyGroups)
}

export function getTags(
  newsList: NewsData[],
  source: string,
  channel: string,
  rulesRecord?: Record<string, Record<string, SourceClassifyRuleGroups>> | null,
): TagInfo[] {
  const tempTags: Record<string, TagInfo> = {}
  const classifyRules = getClassifyRules(source, channel, rulesRecord)
  let videoCount = 0

  newsList.forEach((news) => {
    if (news.video) {
      videoCount += 1
    }
    for (const type of news.tags) {
      if (tempTags[type] === undefined) {
        tempTags[type] = {
          name: type,
          count: 1,
          video: classifyRules?.[type]?.meta?.video || false,
        }
      }
      else {
        tempTags[type].count += 1
      }
    }
  })

  // 按 classifyRules 定义顺序输出标签，非规则定义的标签追加到最后
  const orderedTags: TagInfo[] = []
  if (classifyRules) {
    for (const [tagName, rule] of Object.entries(classifyRules)) {
      const tag = tempTags[tagName]
      if (tag) {
        tag.group = rule.group
        orderedTags.push(tag)
        delete tempTags[tagName]
      }
    }
  }
  // 统计未分类视频数量（标签中包含「未分类视频」的新闻）
  const unclassifiedVideoCount = newsList.filter(
    news => news.tags.includes(TAG_UNCLASSIFIED_VIDEO),
  ).length

  // 将未分类视频计入「未分类」标签，避免 tempTags 中出现重复的特殊标签
  if (tempTags[TAG_UNCLASSIFIED_VIDEO]) {
    delete tempTags[TAG_UNCLASSIFIED_VIDEO]
  }

  // 未在规则中定义但有新闻的标签（如「未分类」）追加在最后
  for (const tag of Object.values(tempTags)) {
    orderedTags.push(tag)
  }

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
    {
      name: TAG_UNCLASSIFIED_VIDEO,
      count: unclassifiedVideoCount,
      video: true,
    },
    ...orderedTags,
  ]
}

function doesRuleMatch(news: NewsData, channel: string, rule: ClassifyRule): boolean {
  const { title, remoteId, video } = news

  // exclude 黑名单
  if (rule.exclude?.some((excludeKey) => {
    const [excludeChannel, excludeId] = excludeKey.split('.')
    return channel.startsWith(excludeChannel) && excludeId === remoteId
  })) {
    return false
  }

  // include 白名单：最高优先级，匹配后跳过其他检查
  if (rule.include?.some((includeKey) => {
    const [includeChannel, includeId] = includeKey.split('.')
    return channel.startsWith(includeChannel) && includeId === remoteId
  })) {
    return true
  }

  // filter 前置过滤
  if (rule.filter?.video === true && !video)
    return false
  if (rule.filter?.video === false && video)
    return false

  if (rule.dateRule) {
    const date = new Date(news.startTime)
    if (date.getMonth() === rule.dateRule.month && date.getDate() === rule.dateRule.day) {
      let titleOk = true
      if (rule.titlePrefix || rule.titleContains) {
        titleOk = false
        if (rule.titlePrefix && title.trim().startsWith(rule.titlePrefix))
          titleOk = true
        if (rule.titleContains && title.trim().includes(rule.titleContains))
          titleOk = true
      }
      if (titleOk)
        return true
    }
  }
  else if (rule.titlePrefix || rule.titleContains) {
    let titleOk = false
    if (rule.titlePrefix && title.trim().startsWith(rule.titlePrefix))
      titleOk = true
    if (rule.titleContains && title.trim().includes(rule.titleContains))
      titleOk = true
    if (titleOk)
      return true
  }

  // keyword 关键词匹配
  for (const keyword of rule.keyword) {
    if (typeof keyword === 'string') {
      if (title.includes(keyword))
        return true
    }
    else if (keyword instanceof RegExp) {
      if (keyword.test(title))
        return true
    }
  }

  return false
}

/**
 * 分类引擎：全规则并行匹配，通过 excludeTags 实现互斥，不依赖规则排列顺序。
 * 每条新闻可匹配多个标签。
 */
export function getNewsTypes(
  news: NewsData,
  source: string,
  channel: string,
  rulesRecord?: Record<string, Record<string, SourceClassifyRuleGroups>> | null,
): string[] {
  const classifyRules = getClassifyRules(source, channel, rulesRecord)

  if (!classifyRules)
    return [TAG_OTHER]

  // Pass 1: 收集所有候选标签
  const candidates: string[] = []
  for (const [type, rule] of Object.entries(classifyRules)) {
    if (doesRuleMatch(news, channel, rule)) {
      candidates.push(type)
    }
  }

  // Pass 2: 通过 excludeTags 过滤（通用规则被更具体的规则排除）
  const candidateSet = new Set(candidates)
  const result = candidates.filter((tag) => {
    const rule = classifyRules[tag]
    if (rule?.excludeTags?.some(excludedTag => candidateSet.has(excludedTag))) {
      return false
    }
    return true
  })

  const finalResult = result.length > 0 ? result : [TAG_OTHER]

  // 视频新闻若无标签，追加「未分类视频」
  if (news.video && result.length === 0) {
    finalResult.push(TAG_UNCLASSIFIED_VIDEO)
  }

  return finalResult
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

export function getChannels(source: string, includeChannelTypes: ChannelType[] = []) {
  const channels = Object.entries(NEWS_LIST[source].channels)
    .map(([key, value]) => ({
      key,
      label: value.displayName,
    }))
  if (includeChannelTypes.length) {
    return channels.filter(channel => includeChannelTypes.includes(NEWS_LIST[source].channels[channel.key].type))
  }
  return channels
}

export function getVideoUrl(data: NewsData, source: string, channel: string): Promise<string> {
  if (data.video?.type === VideoType.MIYOUSHE_POST) {
    return getMiyousheVideo(source, channel, data.video!.url)
  }
  return Promise.resolve(data.video!.url)
}
