import { defineStore } from 'pinia'
import { VISIT_PERSIST_KEY, VISIT_PERSIST_MAX } from '@/constants'
import { limitSetSize } from '@/utils'

export const useMainStore = defineStore('main', {
  state: () => ({
    imageLoaded: new Set<string>(),
    newsVisited: new Set<string>(),
  }),
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
  },
})
