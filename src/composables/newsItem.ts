import type { ContextMenuItem } from '@/composables/contextMenu'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { showContextMenu } from '@/composables/contextMenu'
import { LOAD_DELAY, NEWS_LIST } from '@/constants'
import { useMainStore } from '@/store/main'
import { usePlayerStore } from '@/store/player'
import { useSettingsStore } from '@/store/settings'
import { copyToClipboard, getCoverThumbnailUrl, getVideoUrl, isBilibiliVideo, sanitizeFilename } from '@/utils'

interface NewsItemOptions {
  news: NewsData
}

export function useNewsItem(options: NewsItemOptions) {
  const { news } = options

  const mainStore = useMainStore()
  const playerStore = usePlayerStore()
  const settings = useSettingsStore()
  const { currentSource, currentChannel } = storeToRefs(mainStore)
  const { aria2Config, newsOpenMode, showVisited } = storeToRefs(settings)

  let timer: ReturnType<typeof setTimeout> | null = null
  const isLoadCover = ref(false)
  const isCoverLoaded = ref(false)

  const newsKey = `${currentSource.value}_${currentChannel.value}_${news.remoteId}`

  const channelConfig = computed(() => NEWS_LIST[currentSource.value].channels[currentChannel.value])

  const newsUrl = computed(() => channelConfig.value.newsDetailLink.replace('{id}', String(news.remoteId)))
  const coverThumbnailUrl = computed(() => getCoverThumbnailUrl(news.coverUrl, channelConfig.value.type))
  const isNewsVisited = computed(() => mainStore.isNewsVisited(newsKey))
  // 哔哩哔哩视频无法在内置播放器中播放，仅支持跳转外部视频页
  const isBilibili = computed(() => isBilibiliVideo(news, channelConfig.value.type))

  function openNews(event: PointerEvent) {
    if (showVisited.value) {
      mainStore.setNewsVisited(newsKey)
    }

    if (newsOpenMode.value === 'browser') {
      event.preventDefault()
      window.umami?.track('a-browser-news', { key: newsKey })
      mainStore.openNewsBrowser(news)
      return
    }

    if (newsOpenMode.value === 'player') {
      if (news.video) {
        event.preventDefault()
        playerStore.setCurrentListAsPlaylist()
        playerStore.playVideo(news)
        return
      }
      event.preventDefault()
      window.umami?.track('a-browser-news', { key: newsKey })
      mainStore.openNewsBrowser(news)
    }

    if (newsOpenMode.value === 'tab') {
      window.umami?.track('a-visit-news', { key: newsKey })
    }
  }

  function openVideo() {
    playerStore.setCurrentListAsPlaylist()
    playerStore.playVideo(news)
  }

  function copyLink() {
    window.umami?.track('a-copy-news-link', { key: newsKey })
    copyToClipboard(newsUrl.value)
      .then(() => {
        useToast().success('已复制链接')
      })
      .catch((err) => {
        useToast().error(err?.message || '复制失败')
      })
  }

  function copyCoverLink() {
    window.umami?.track('a-copy-cover-link', { key: newsKey })
    copyToClipboard(news.coverUrl)
      .then(() => {
        useToast().success('已复制封面链接')
      })
      .catch((err) => {
        useToast().error(err?.message || '复制失败')
      })
  }

  async function copyVideoLink() {
    window.umami?.track('a-copy-video-link', { key: newsKey })

    getVideoUrl(news, currentSource.value, currentChannel.value)
      .then((videoUrl) => {
        copyToClipboard(videoUrl)
          .then(() => {
            useToast().success('已复制视频链接')
          })
          .catch((err) => {
            useToast().error(err?.message || '复制失败')
          })
      })
      .catch((err) => {
        useToast().error(err.message)
      })
  }

  function sendToPotPlayer() {
    window.umami?.track('a-send-to-potplayer', { key: newsKey })
    getVideoUrl(news, currentSource.value, currentChannel.value)
      .then((videoUrl) => {
        window.open(`potplayer://${videoUrl}`)
      })
      .catch((err) => {
        useToast().error(err.message)
      })
  }

  function sendToAria2() {
    window.umami?.track('a-send-to-aria2', { key: newsKey })
    const rpcId = `HYN${Date.now()}`
    getVideoUrl(news, currentSource.value, currentChannel.value)
      .then((videoUrl) => {
        const url = new URL(videoUrl) // 检测 URL 合法性
        const videoExt = url.pathname.split('.').length > 1 ? url.pathname.split('.').pop() : null
        const videoOutName = sanitizeFilename(
          aria2Config.value.filename
            .replace('{newsTitle}', sanitizeFilename(news.title))
            .replace('{ext}', videoExt || 'mp4'),
        )
        fetch(aria2Config.value.rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: rpcId,
            method: 'aria2.addUri',
            params: [`token:${aria2Config.value.rpcSecret}`, [videoUrl], {
              out: videoOutName,
            }],
          }),
        })
          .then(res => res.json())
          .then((data) => {
            if (data.error) {
              useToast().error(`aria2 返回错误：${data.error.message}`)
            }
            else {
              useToast().success('已发送至 aria2 RPC')
            }
          })
          .catch(() => {
            useToast().error('请求失败，请检测 aria2 配置')
          })
      })
  }

  function copyNewsId() {
    copyToClipboard(news.remoteId)
      .then(() => {
        useToast().success('已复制新闻ID')
      })
      .catch((err) => {
        useToast().error(err?.message || '复制失败')
      })
  }

  function copyNewsKey() {
    copyToClipboard(news.key)
      .then(() => {
        useToast().success('已复制新闻Key')
      })
      .catch((err) => {
        useToast().error(err?.message || '复制失败')
      })
  }

  function openActionMenu(event: MouseEvent | { x: number, y: number }) {
    const items: ContextMenuItem[] = [
      { label: '在新标签页打开', onClick: () => openInNewTab() },
      { label: '在内置浏览器中打开', onClick: () => openInBrowser() },
      { label: '复制链接', onClick: () => copyLink() },
    ]
    if (news.coverUrl) {
      items.push({ label: '复制封面链接', onClick: () => copyCoverLink() })
    }
    if (news.video) {
      items.push({ label: '复制视频链接', onClick: () => copyVideoLink() })
      if (isBilibili.value) {
        items.push({ label: '在哔哩哔哩中打开', onClick: () => openVideo() })
      }
      else {
        items.push(
          { label: '使用内置播放器打开', onClick: () => openVideo() },
          { label: '在 PotPlayer 中打开视频', onClick: () => sendToPotPlayer() },
          { label: '将视频发送至 aria2 下载', onClick: () => sendToAria2() },
        )
      }
    }
    items.push({
      label: '更多',
      children: [
        { label: '复制新闻ID', onClick: () => copyNewsId() },
        { label: '复制新闻Key', onClick: () => copyNewsKey() },
        { label: '复制标题', onClick: () => copyTitle() },

      ],
    })
    showContextMenu(event, items)
  }

  function copyTitle() {
    copyToClipboard(news.title)
      .then(() => {
        useToast().success('已复制标题')
      })
      .catch((err) => {
        useToast().error(err?.message || '复制失败')
      })
  }

  function openInNewTab() {
    window.umami?.track('a-visit-news', { key: newsKey })
    window.open(newsUrl.value, '_blank')
  }

  function openInBrowser() {
    window.umami?.track('a-browser-news', { key: newsKey })
    mainStore.openNewsBrowser(news)
  }

  function onImageLoaded() {
    isCoverLoaded.value = true
    mainStore.imageLoaded.add(newsKey)
  }

  onMounted(() => {
    if (mainStore.imageLoaded.has(newsKey)) {
      isLoadCover.value = true
      return
    }
    timer = setTimeout(() => {
      isLoadCover.value = true
      timer = null
    }, LOAD_DELAY)
  })

  onUnmounted(() => {
    if (timer)
      clearTimeout(timer)
  })

  return {
    channelConfig,
    coverThumbnailUrl,
    isNewsVisited,
    newsUrl,
    isLoadCover,
    isCoverLoaded,
    openNews,
    openVideo,
    openActionMenu,
    onImageLoaded,
  }
}
