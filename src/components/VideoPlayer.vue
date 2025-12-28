<script setup lang="ts">
import type Artplayer from 'artplayer'
import { storeToRefs } from 'pinia'
import { DEFAULT_BANNER } from '@/constants'
import { usePlayerStore } from '@/store/player'
import { useSettingsStore } from '@/store/settings'
import LoadingIndicator from './common/LoadingIndicator.vue'
import Switch from './common/Switch.vue'
import IconClose from './icon/IconClose.vue'

const ArtPlayer = defineAsyncComponent({
  loader: () => import('./player/ArtPlayer.vue'),
  loadingComponent: LoadingIndicator,
})

const playerStore = usePlayerStore()
const settings = useSettingsStore()

const { title, videoId, videoSrc, playlist } = storeToRefs(playerStore)
const { autoPlayNext } = storeToRefs(settings)

const artInstance = ref<Artplayer | null>(null)
const playlistScrollContainer = ref<HTMLDivElement | null>(null)

const playingIndex = computed(() => {
  if (!videoId.value || playlist.value.length === 0) {
    return -1
  }
  return playlist.value.findIndex(item => item.remoteId === videoId.value)
})

function handleWheel(event: WheelEvent) {
  if (playlistScrollContainer.value) {
    event.preventDefault()
    playlistScrollContainer.value.scrollLeft += event.deltaY
  }
}

watch(videoSrc, () => {
  if (artInstance.value) {
    artInstance.value.url = videoSrc.value
    artInstance.value.play()
  }
})

watch(playingIndex, (newIndex) => {
  if (newIndex === -1 || !playlistScrollContainer.value)
    return

  nextTick(() => {
    const container = playlistScrollContainer.value
    if (!container)
      return

    const items = container.querySelectorAll('button')
    const targetItem = items[newIndex] as HTMLElement
    if (!targetItem)
      return

    const containerRect = container.getBoundingClientRect()
    const itemRect = targetItem.getBoundingClientRect()

    const itemLeft = itemRect.left - containerRect.left
    const itemRight = itemRect.right - containerRect.left

    const containerWidth = container.clientWidth

    const isFullyVisible = itemLeft >= 0 && itemRight <= containerWidth

    const sideOffset = 40

    if (!isFullyVisible) {
      if (itemLeft < 0) {
        container.scrollTo({
          left: Math.max(0, container.scrollLeft + itemLeft - sideOffset),
          behavior: 'smooth',
        })
      }
      else if (itemRight > containerWidth) {
        container.scrollTo({
          left: Math.min(
            container.scrollWidth,
            container.scrollLeft + (itemRight - containerWidth) + sideOffset,
          ),
          behavior: 'smooth',
        })
      }
    }
  })
}, { immediate: true })

const playerOption = computed(() => ({
  url: videoSrc.value,
  fullscreen: true,
  playbackRate: true,
  aspectRatio: true,
  setting: true,
}))

function handleGetInstance(instance: Artplayer | null = null) {
  artInstance.value = instance
}

function handlePlayNext() {
  if (autoPlayNext.value && playingIndex.value !== -1) {
    const nextIndex = playingIndex.value === playlist.value.length - 1 ? 0 : playingIndex.value + 1
    playerStore.playVideo(playlist.value[nextIndex])
  }
}
</script>

<template>
  <div v-show="videoSrc" class="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/30 backdrop-blur-sm">
    <div class="w-full max-w-[960px] rounded-lg bg-white p-4 shadow-md">
      <div class="mb-4 flex items-center justify-between">
        <div>{{ title }}</div>
        <button @click="playerStore.stopVideo()">
          <IconClose class="size-5 text-gray-500 hover:text-black" />
        </button>
      </div>
      <ArtPlayer
        v-if="videoSrc"
        class="mx-auto"
        :option="playerOption"
        @get-instance="handleGetInstance"
        @video-ended="handlePlayNext"
        @destroy="handleGetInstance"
      />
      <div v-if="playlist" class="mt-2 rounded-lg border border-slate-200 bg-slate-100 p-2">
        <div class="flex justify-between">
          播放列表
          <div class="flex items-center">
            自动连播<Switch v-model="autoPlayNext" class="ml-2" />
          </div>
        </div>
        <div ref="playlistScrollContainer" class="mt-2 w-full overflow-x-auto" @wheel="handleWheel">
          <div class="flex space-x-2 pb-2">
            <button
              v-for="(item, index) in playlist"
              :key="index"
              class="relative w-[200px] shrink-0 overflow-hidden whitespace-nowrap rounded-md bg-white text-sm hover:bg-slate-200"
              :title="item.title"
              @click="playerStore.playVideo(item)"
            >
              <div v-if="index === playingIndex" class="pointer-events-none absolute inset-0 rounded-md border-2 border-blue-500" />
              <img class="h-[100px] w-full" loading="lazy" :src="item.coverUrl || DEFAULT_BANNER">
              <div class="overflow-hidden text-ellipsis object-cover object-center p-2 text-sm">
                {{ item.title }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
