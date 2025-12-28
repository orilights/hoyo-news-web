import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { getVideoUrl } from '@/utils'
import { useMainStore } from './main'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    title: '',
    videoId: '',
    videoSrc: '',
    playlist: [] as NewsData[],
  }),
  actions: {
    playVideo(newsData: NewsData) {
      const mainStore = useMainStore()
      window.umami?.track('a-play-video', { key: `${mainStore.changeSource}_${mainStore.currentChannel}_${newsData.remoteId}` })
      getVideoUrl(newsData, mainStore.currentSource, mainStore.currentChannel)
        .then((videoUrl) => {
          this.title = newsData.title
          this.videoId = newsData.remoteId
          this.videoSrc = videoUrl || ''
        })
        .catch((err) => {
          useToast().error(err.message)
        })
    },
    stopVideo() {
      this.title = ''
      this.videoId = ''
      this.videoSrc = ''
    },
    setPlaylist(playlist: NewsData[] = []) {
      this.playlist = playlist
    },
    setCurrentListAsPlaylist() {
      const mainStore = useMainStore()
      this.setPlaylist(mainStore.newsDataFiltered.filter(news => news.video !== null))
    },
  },
})
