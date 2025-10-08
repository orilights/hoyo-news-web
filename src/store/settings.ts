import { defineStore } from 'pinia'
import { ARIA2_RPC_URL } from '@/constants'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    showCover: true,
    showDateWeek: false,
    showVisited: false,
    useGridView: false,
    fullWidth: false,
    aria2Config: {
      rpcUrl: ARIA2_RPC_URL,
      rpcSecret: '',
      filename: '{newsTitle}.{ext}',
    },
    customFilter: {
      enable: true,
    },
  }),
  getters: {
    newsItemConfig: (state) => {
      return {
        showBanner: state.showCover,
        showDateWeek: state.showDateWeek,
        showVisited: state.showVisited,
      }
    },
  },
  persist: true,
})
