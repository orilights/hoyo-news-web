import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    title: '',
    videoSrc: '',
  }),
  actions: {
    playVideo(title: string, src: string) {
      this.title = title
      this.videoSrc = src
    },
    stopVideo() {
      this.title = ''
      this.videoSrc = ''
    },
  },
})
