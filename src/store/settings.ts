import { defineStore } from 'pinia'
import { APP_ABBR, ARIA2_RPC_URL } from '@/constants'

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
  actions: {
    tryMigrateFromV1Settings() {
      const settingsV1Keys = Object.keys(localStorage).filter(key =>
        key.startsWith(`${APP_ABBR}-settings-`),
      )
      if (settingsV1Keys.length === 0)
        return

      settingsV1Keys.forEach((key) => {
        const settingKey = key.replace(`${APP_ABBR}-settings-`, '')
        try {
          if (settingKey in this.$state) {
            // @ts-expect-error ignore
            this[settingKey] = JSON.parse(localStorage.getItem(key) as string)
          }
        }
        catch (e) {
          console.error('Failed to migrate setting:', key, e)
        }
        localStorage.removeItem(key)
      })
    },
  },
  persist: {
    key: `${APP_ABBR}-settings@2`,
  },
})
