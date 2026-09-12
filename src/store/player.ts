import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { getBilibiliVideoUrl, getVideoUrl, isBilibiliVideo } from '@/utils'
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

      // 哔哩哔哩视频无法在内置播放器中播放，改为在新标签页打开视频页
      if (newsData.video && isBilibiliVideo(newsData, mainStore.channelConfig.type)) {
        window.open(getBilibiliVideoUrl(newsData.video.url), '_blank', 'noopener,noreferrer')
        return
      }

      getVideoUrl(newsData, mainStore.currentSource, mainStore.currentChannel)
        .then((videoUrl) => {
          this.title = newsData.title
          this.videoId = newsData.remoteId
          this.videoSrc = videoUrl || ''
          mainStore.showVideoPlayer = true
        })
        .catch((err) => {
          useToast().error(err.message)
        })
    },
    stopVideo() {
      const mainStore = useMainStore()
      this.title = ''
      this.videoId = ''
      this.videoSrc = ''
      mainStore.showVideoPlayer = false
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
