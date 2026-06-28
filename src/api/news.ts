import request from '@/utils/request'

export function getNewsApi(
  apiBase: string,
  source: string,
  channel: string,
  params: { forceRefresh?: boolean },
) {
  return request.get(`${apiBase}/news/${source}.${channel}`, {
    params: {
      force_refresh: params.forceRefresh ? '1' : undefined,
    },
  })
}

export function getMiyousheVideoApi(apiBase: string, newsId: string) {
  return request.get(`${apiBase}/news/video/miyoushe/${newsId}`)
}

export function getNewsDetailApi(apiBase: string, newsKey: string) {
  return request.get(`${apiBase}/news/detail/${newsKey}`)
}

export function getClassifyRulesApi(apiBase: string, sourceKey: string) {
  return request.get(`${apiBase}/news/${sourceKey}/rules`)
}
