import { useMediaQuery, useUrlSearchParams } from '@vueuse/core'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { getNewsApi } from '@/api/news'
import {
  DEFAULT_KEYWORD_BLACKLIST,
  NEWS_LIST,
  TAG_ALL,
  TAG_VIDEO,
  VISIT_PERSIST_KEY,
  VISIT_PERSIST_MAX,
} from '@/constants'
import { formatTime, getNewsTypes, getTags, limitSetSize } from '@/utils'
import { useSettingsStore } from './settings'

export const useMainStore = defineStore('main', {
  state: () => ({
    currentSource: Object.keys(NEWS_LIST)[0],
    currentChannel: Object.keys(NEWS_LIST[Object.keys(NEWS_LIST)[0]].channels)[0],
    filterTag: TAG_ALL,
    filterTags: [] as string[],
    searchStr: '',
    sortBy: 'desc' as 'asc' | 'desc',
    dateFilterStart: '',
    dateFilterEnd: '',

    newsUpdateTime: 0,
    newsLoading: false,
    newsData: [] as NewsData[],

    imageLoaded: new Set<string>(),
    newsVisited: new Set<string>(),

    customFilterCount: 0,

    showSetting: false,
    showRssInfo: false,
    showVideoPlayer: false,
    showMobileSidebar: false,
    showNewsBrowser: false,
    browsingNews: null as NewsData | null,
    isMobile: useMediaQuery('(max-width: 767px)'),

    toast: useToast(),
    queryParams: useUrlSearchParams('history'),
  }),
  getters: {
    channelConfig: (state) => {
      return NEWS_LIST[state.currentSource].channels[state.currentChannel]
    },
    searchEnabled: state => state.searchStr.trim() !== '',
    searchKeywords: (state) => {
      return state.searchStr.toLowerCase().trim().split(' ')
    },
    allTags: (state) => {
      return getTags(state.newsData, state.currentSource, state.currentChannel)
    },
    newsDataKeywordFiltered(): NewsData[] {
      let data: NewsData[] = this.newsData.slice()
      if (this.searchEnabled) {
        data = data.filter(news =>
          this.searchKeywords.every((v) => {
            const newsKey = `${news.title.toLowerCase()}${news.tags.join(' ')}${news.remoteId}`
            return newsKey.includes(v)
          }),
        )
      }
      return data
    },
    newsDataFiltered(): NewsData[] {
      let data: NewsData[] = this.newsDataKeywordFiltered.slice()

      const settings = useSettingsStore()
      if (settings.tagMultiSelect) {
        if (this.filterTags.length > 0) {
          data = data.filter(news => news.tags.some(t => this.filterTags.includes(t)))
        }
      }
      else if (this.filterTag !== TAG_ALL) {
        if (this.filterTag === TAG_VIDEO) {
          data = data.filter(news => news.video)
        }
        else if (this.allTags.some(tag => tag.name === this.filterTag)) {
          data = data.filter(news => news.tags.includes(this.filterTag))
        }
      }

      if (this.dateFilterStart) {
        data = data.filter(news =>
          new Date(news.startTime).getTime() >= new Date(`${this.dateFilterStart} 00:00:00`).getTime(),
        )
      }
      if (this.dateFilterEnd) {
        data = data.filter(news =>
          new Date(news.startTime).getTime() <= new Date(`${this.dateFilterEnd} 23:59:59`).getTime(),
        )
      }

      if (this.sortBy === 'asc')
        data.reverse()

      return data
    },
    availableTags(): TagInfo[] {
      const tags = getTags(this.newsDataKeywordFiltered, this.currentSource, this.currentChannel)
      const settings = useSettingsStore()
      if (settings.tagMultiSelect) {
        return tags.filter(tag => tag.name !== TAG_ALL && tag.name !== TAG_VIDEO)
      }
      return tags
    },
    lockBodyScroll(): boolean {
      return this.showVideoPlayer || this.showRssInfo || this.showMobileSidebar || this.showSetting || this.showNewsBrowser
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
      if (this.queryParams.source && Object.keys(NEWS_LIST).includes(this.queryParams.source as string))
        this.currentSource = this.queryParams.source as string
      if (this.queryParams.channel && Object.keys(NEWS_LIST[this.currentSource].channels).includes(this.queryParams.channel as string))
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
      const settings = useSettingsStore()

      if (force_refresh) {
        window.umami?.track('a-manual-refresh')
      }
      this.newsLoading = true
      this.newsData = []
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
              tags: Array.isArray(news.tags)
                ? news.tags
                : (news.tags
                    ? [news.tags]
                    : getNewsTypes(news, params.source, params.channel)),
              startTime: formatTime(news.startTime),
            }))
            if (settings.customFilter.enable) {
              this.newsData = this.newsData.filter(news =>
                !DEFAULT_KEYWORD_BLACKLIST.some(kw => news.title.includes(kw)),
              )
              this.customFilterCount = res.list.length - this.newsData.length
            }
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
      this.searchStr = ''
      this.filterTag = TAG_ALL
      this.filterTags = []
      delete this.queryParams.filterTag
      this.fetchData()
    },

    changeSource(newSource: string) {
      const settings = useSettingsStore()
      this.currentSource = newSource
      this.currentChannel = settings.headerSourceList.find(item => item.key === newSource)!.channels[0].key
      this.handleSourceChange()
    },

    changeChannel(newChannel: string) {
      this.currentChannel = newChannel
      this.handleSourceChange()
    },

    changeTag(tag: string) {
      const settings = useSettingsStore()
      if (settings.tagMultiSelect) {
        const idx = this.filterTags.indexOf(tag)
        if (idx === -1)
          this.filterTags.push(tag)
        else
          this.filterTags.splice(idx, 1)
      }
      else {
        if (this.filterTag === tag)
          this.filterTag = TAG_ALL
        else
          this.filterTag = tag

        if (this.filterTag === TAG_ALL)
          delete this.queryParams.filterTag
        else
          this.queryParams.filterTag = this.filterTag
      }
    },

    openNewsBrowser(news: NewsData) {
      this.browsingNews = news
      this.showNewsBrowser = true
    },
    closeNewsBrowser() {
      this.showNewsBrowser = false
      this.browsingNews = null
    },
  },
})
