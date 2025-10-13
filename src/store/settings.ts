import { defineStore } from 'pinia'
import { APP_ABBR, ARIA2_RPC_URL, NEWS_LIST } from '@/constants'

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
    autoHideHeader: false,
    sourceCustom: [] as SourceCustomData[],
  }),
  getters: {
    newsItemConfig: (state) => {
      return {
        showBanner: state.showCover,
        showDateWeek: state.showDateWeek,
        showVisited: state.showVisited,
      }
    },
    headerSourceList() {
      const list: HeaderSourceInfo[] = []
      this.sourceCustom.forEach((source) => {
        if (source.channels.every(channel => !channel.enable))
          return

        const sourceInfo = NEWS_LIST[source.key]
        if (sourceInfo) {
          list.push({
            key: source.key,
            displayName: sourceInfo.displayName,
            channels: source.channels
              .filter(channel => channel.enable)
              .map(channel => ({
                key: channel.key,
                label: sourceInfo.channels[channel.key].displayName,
              })),
          })
        }
      })
      return list
    },
  },
  actions: {
    initialize() {
      this.initCustomData()
      this.tryMigrateFromV1Settings()
    },
    initCustomData() {
      Object.keys(NEWS_LIST).forEach((sourceKey) => {
        if (!this.sourceCustom.find(item => item.key === sourceKey)) {
          this.sourceCustom.push({ key: sourceKey, channels: [] })
        }
        const source = this.sourceCustom.find(item => item.key === sourceKey)
        Object.keys(NEWS_LIST[sourceKey].channels).forEach((channelKey) => {
          if (!source!.channels.find(item => item.key === channelKey)) {
            source!.channels.push({ key: channelKey, enable: true })
          }
        })
      })
    },
    resetSourceCustom() {
      this.sourceCustom = []
      this.initCustomData()
    },
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
