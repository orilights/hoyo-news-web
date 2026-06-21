<script setup lang="ts">
import DOMPurify from 'dompurify'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { getNewsDetailApi } from '@/api/news'
import { useMainStore } from '@/store/main'
import { VideoType } from '@/types/enum'
import { getMiyousheVideo } from '@/utils/data'
import LoadingIndicator from './common/LoadingIndicator.vue'

const MHY_VOD_REGEX = /<div[^>]*class="[^"]*mhy-vod[^"]*"[^>]*><\/div>/
const HTML_TAG_REGEX = /<[^>]+>/

const mainStore = useMainStore()
const { showNewsBrowser, browsingNews, channelConfig, newsDataFiltered } = storeToRefs(mainStore)

const isLoading = ref(false)
const loadError = ref(false)
const shadowHost = ref<HTMLDivElement | null>(null)
let shadowRoot: ShadowRoot | null = null

const browsingIndex = computed(() => {
  if (!browsingNews.value)
    return -1
  return newsDataFiltered.value.findIndex(n => n.remoteId === browsingNews.value!.remoteId)
})

const prevNews = computed(() => {
  if (browsingIndex.value <= 0)
    return null
  return newsDataFiltered.value[browsingIndex.value - 1]
})

const nextNews = computed(() => {
  if (browsingIndex.value < 0 || browsingIndex.value >= newsDataFiltered.value.length - 1)
    return null
  return newsDataFiltered.value[browsingIndex.value + 1]
})

function navigateTo(news: NewsData) {
  mainStore.openNewsBrowser(news)
}

function renderToShadowDom(html: string) {
  if (!shadowHost.value)
    return

  // 如果 shadow root 不存在或宿主元素被 v-if 重建，则重新 attach
  if (!shadowRoot || shadowRoot.host !== shadowHost.value) {
    shadowRoot = shadowHost.value.attachShadow({ mode: 'open' })
    // 拦截链接点击，在新标签页打开（仅首次 attach 时绑定）
    shadowRoot.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (anchor && anchor.href) {
        e.preventDefault()
        window.open(anchor.href, '_blank', 'noopener,noreferrer')
      }
    })
  }

  shadowRoot.innerHTML = ''
  const style = document.createElement('style')
  style.textContent = 'img,table,video,figure,object,embed,svg{max-width:100%!important;height:auto!important}video{width: 100%;max-height:500px;margin-left:auto;margin-right:auto}body{margin:0}'
  shadowRoot.appendChild(style)
  const container = document.createElement('div')
  container.innerHTML = html
  shadowRoot.appendChild(container)
}

watch(browsingNews, async (val) => {
  if (val && showNewsBrowser.value) {
    isLoading.value = true
    loadError.value = false
    try {
      const res = await getNewsDetailApi(channelConfig.value.apiBase, val.key) as unknown as NewsDetailData
      let content = DOMPurify.sanitize(res.content, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'b', 'i', 'u', 's', 'strong', 'em', 'sub', 'sup', 'blockquote', 'pre', 'code', 'video', 'source', 'figure', 'figcaption', 'details', 'summary', 'iframe'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'id', 'width', 'height', 'style', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'type', 'data-*'],
      })
      // 替换米游社视频占位 div 为 video 元素（HTML 内容场景）
      if (res.video?.type === VideoType.MIYOUSHE_POST && content.includes('mhy-vod')) {
        try {
          const videoUrl = await getMiyousheVideo(mainStore.currentSource, mainStore.currentChannel, res.video.url)
          const videoEl = `<video controls preload="metadata" src="${videoUrl}"></video>`
          content = content.replace(MHY_VOD_REGEX, videoEl)
        }
        catch {
          // 视频链接获取失败，移除占位 div
          content = content.replace(MHY_VOD_REGEX, '')
        }
      }

      // 纯文本内容：保留换行符；若有米游社视频则前置 video 元素
      const hasHtmlTags = HTML_TAG_REGEX.test(content)
      if (!hasHtmlTags && content.trim()) {
        if (res.video?.type === VideoType.MIYOUSHE_POST) {
          try {
            const videoUrl = await getMiyousheVideo(mainStore.currentSource, mainStore.currentChannel, res.video.url)
            content = `<video controls preload="metadata" src="${videoUrl}"></video>`
              + `<div style="white-space:pre-wrap">${content}</div>`
          }
          catch {
            content = `<div style="white-space:pre-wrap">${content}</div>`
          }
        }
        else {
          content = `<div style="white-space:pre-wrap">${content}</div>`
        }
      }

      await nextTick()
      renderToShadowDom(content)
    }
    catch (err: any) {
      loadError.value = true
      useToast().error(`新闻加载失败: ${err?.message ?? '未知错误'}`)
    }
    finally {
      isLoading.value = false
    }
  }
  else {
    loadError.value = false
    if (shadowRoot) {
      shadowRoot.innerHTML = ''
    }
  }
})

onUnmounted(() => {
  shadowRoot = null
})

const newsTitle = computed(() => browsingNews.value?.title ?? '')
</script>

<template>
  <DialogContainer :show="showNewsBrowser" :title="newsTitle" :width="700" full-height @close="mainStore.closeNewsBrowser()">
    <div class="flex size-full flex-col">
      <div v-if="browsingNews?.startTime" class="mb-2 flex shrink-0 items-center gap-1 text-xs text-gray-500">
        <LucideClock class="size-3.5" />
        <span>{{ browsingNews.startTime }}</span>
      </div>
      <div class="min-h-0 flex-1 overflow-hidden">
        <LoadingIndicator v-if="isLoading" class="mx-auto mt-16 size-[40px]" />
        <div v-else-if="loadError" class="flex size-full items-center justify-center text-gray-400">
          加载失败
        </div>
        <div
          v-show="!isLoading && !loadError"
          ref="shadowHost"
          class="size-full overflow-auto"
        />
      </div>
      <div v-if="prevNews || nextNews" class="mt-3 flex shrink-0 gap-2 border-t pt-3 text-xs">
        <button
          v-if="prevNews"
          class="flex min-w-0 flex-1 items-center gap-1 rounded-md border px-2 py-1 text-left transition-colors hover:border-blue-500 disabled:opacity-30"
          @click="navigateTo(prevNews)"
        >
          <LucideChevronLeft class="size-4 shrink-0 text-gray-400" />
          <span class="truncate">{{ prevNews.title }}</span>
        </button>
        <div v-else class="flex-1" />
        <button
          v-if="nextNews"
          class="flex min-w-0 flex-1 items-center justify-end gap-1 rounded-md border px-2 py-1 text-right transition-colors hover:border-blue-500"
          @click="navigateTo(nextNews)"
        >
          <span class="truncate">{{ nextNews.title }}</span>
          <LucideChevronRight class="size-4 shrink-0 text-gray-400" />
        </button>
        <div v-else class="flex-1" />
      </div>
    </div>
  </DialogContainer>
</template>
