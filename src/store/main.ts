import { useUrlSearchParams } from '@vueuse/core'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { getNewsApi } from '@/api/news'
import { DEFAULT_KEYWORD_BLACKLIST, NEWS_LIST, TAG_ALL, TAG_VIDEO, VISIT_PERSIST_KEY, VISIT_PERSIST_MAX } from '@/constants'
import { formatTime, getNewsType, getTags, limitSetSize } from '@/utils'
import { useSettingsStore } from './settings'

export const useMainStore = defineStore('main', {
  state: () => ({
    currentSource: Object.keys(NEWS_LIST)[0],
    currentChannel: Object.keys(NEWS_LIST[Object.keys(NEWS_LIST)[0]].channels)[0],
    availableTags: [] as TagInfo[],
    filterTag: TAG_ALL,
    searchStr: '',
    sortBy: 'desc' as 'asc' | 'desc',
    dateFilterStart: '',
    dateFilterEnd: '',

    newsUpdateTime: 0,
    newsLoading: false,
    newsData: [] as NewsData[],

    imageLoaded: new Set<string>(),
    newsVisited: new Set<string>(),

    headerSticky: false,
    customFilterCount: 0,

    toast: useToast(),
    queryParams: useUrlSearchParams('history'),
  }),
  getters: {
    channelConfig: (state) => {
      return NEWS_LIST[state.currentSource].channels[state.currentChannel]
    },
    searchEnabled: state => state.searchStr.trim() !== '',
    newsDataFiltered() {
      const settings = useSettingsStore()

      let data: NewsData[]
      if (this.searchEnabled) {
        data = this.newsData.filter(news =>
          this.searchStr.toLowerCase().trim().split(' ').every((v) => {
            const newsKey = news.title.toLowerCase() + news.remoteId
            return newsKey.includes(v)
          }),
        )
      }
      else if (this.filterTag === TAG_ALL) {
        data = this.newsData.slice()
      }
      else if (this.filterTag === TAG_VIDEO) {
        data = this.newsData.filter(news => news.video)
      }
      else if (!this.availableTags.find(tag => tag.name === this.filterTag)) {
        data = this.newsData.slice()
      }
      else {
        data = this.newsData.filter(news => news.tag === this.filterTag)
      }
      if (this.dateFilterStart) {
        data = data.filter(news => new Date(news.startTime).getTime() >= new Date(`${this.dateFilterStart} 00:00:00`).getTime())
      }
      if (this.dateFilterEnd) {
        data = data.filter(news => new Date(news.startTime).getTime() <= new Date(`${this.dateFilterEnd} 23:59:59`).getTime())
      }
      const originalCount = data.length
      if (settings.customFilter.enable) {
        data = data.filter(news => !DEFAULT_KEYWORD_BLACKLIST.some(kw => news.title.includes(kw)))
      }

      this.customFilterCount = originalCount - data.length

      return data
    },

    newsDataSorted() {
      const data = this.newsDataFiltered.slice()

      if (this.sortBy === 'asc')
        data.reverse()

      return data as NewsData[]
    },
  },
  actions: {
    initialize() {
      const visited = localStorage.getItem(VISIT_PERSIST_KEY)
      if (visited) {
        try {
          this.newsVisited = new Set(JSON.parse(visited))
        }
        catch (e) {
          console.error('获取新闻访问记录失败', e)
        }
      }
      if (this.queryParams.filterTag)
        this.filterTag = this.queryParams.filterTag as string
      if (this.queryParams.source)
        this.currentSource = this.queryParams.source as string
      if (this.queryParams.channel)
        this.currentChannel = this.queryParams.channel as string
      else
        this.currentChannel = Object.keys(NEWS_LIST[this.currentSource].channels)[0]
    },
    isNewsVisited(newsKey: string) {
      return this.newsVisited.has(newsKey)
    },
    setNewsVisited(newsKey: string) {
      this.newsVisited.add(newsKey)
      this.persistVisitRecord()
    },
    persistVisitRecord() {
      limitSetSize(this.newsVisited, VISIT_PERSIST_MAX)
      localStorage.setItem(VISIT_PERSIST_KEY, JSON.stringify(Array.from(this.newsVisited)))
    },

    fetchData(force_refresh = false) {
      if (force_refresh) {
        window.umami?.track('a-manual-refresh')
      }
      this.newsLoading = true
      this.newsData = []
      this.availableTags = []
      const params = {
        source: this.currentSource,
        channel: this.currentChannel,
      }
      const apiBase = this.channelConfig.apiBase
      getNewsApi(apiBase, params.source, params.channel, { forceRefresh: force_refresh })
        .then((res: any) => {
          if (params.source !== this.currentSource || params.channel !== this.currentChannel) {
            return
          }
          if (res) {
            this.newsData = res.list.map((news: any) => ({
              ...news,
              remoteId: Number(news.remoteId),
              tag: news.tags || getNewsType(news, params.source, params.channel).type,
              startTime: formatTime(news.startTime),
            }))
            this.availableTags = getTags(this.newsData, params.source, params.channel)
            this.newsUpdateTime = res.lastSync
          }
        })
        .catch((err) => {
          this.toast.error(`获取新闻数据失败: ${err?.message ?? '未知错误'}`)
          this.newsUpdateTime = 0
          console.error(err)
        })
        .finally(() => {
          this.newsLoading = false
        })
    },

    handleSourceChange() {
      this.queryParams.source = this.currentSource
      this.queryParams.channel = this.currentChannel
      this.filterTag = TAG_ALL
      delete this.queryParams.filterTag
      this.fetchData()
    },

    changeSource(newSource: string) {
      this.currentSource = newSource
      this.currentChannel = Object.keys(NEWS_LIST[newSource].channels)[0]
      this.handleSourceChange()
    },

    changeChannel(newChannel: string) {
      this.currentChannel = newChannel
      this.handleSourceChange()
    },

    changeTag(tag: string) {
      this.searchStr = ''
      if (this.filterTag === tag)
        this.filterTag = TAG_ALL
      else
        this.filterTag = tag

      if (this.filterTag === TAG_ALL)
        delete this.queryParams.filterTag
      else
        this.queryParams.filterTag = this.filterTag
    },
  },
})
