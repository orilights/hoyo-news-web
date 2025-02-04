<script setup lang="ts">
import { COVER_WIDTH, DEFAULT_BANNER, LOAD_DELAY, NEWS_LIST } from '@/constants'
import { state } from '@/state'
import { CoverSize } from '@/types/enum'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  news: NewsItemData
  showBanner: boolean
  showDateWeek: boolean
  coverSize: CoverSize
  game: string
  channal: string
}>()

defineEmits(['onFilter'])

let timer: NodeJS.Timeout | null = null
const loadImage = ref(false)
const imageLoaded = ref(false)
const imageKey = `${props.game}_${props.channal}_${props.news.id}`
const channalConfig = NEWS_LIST[props.game].channals[props.channal]
const coverWidth = computed(() => {
  if (props.coverSize === CoverSize.Large) {
    return channalConfig.coverWidth || COVER_WIDTH.default
  }
  if (props.coverSize === CoverSize.Medium) {
    return (channalConfig.coverWidth || COVER_WIDTH.default) / 2
  }
  return 75
})
const coverHeight = computed(() => props.coverSize === CoverSize.Large ? 150 : 75)

onMounted(() => {
  if (state.imageLoaded.has(imageKey)) {
    loadImage.value = true
    return
  }
  timer = setTimeout(() => {
    loadImage.value = true
    timer = null
  }, LOAD_DELAY)
})

onUnmounted(() => {
  if (timer)
    clearTimeout(timer)
})

function openVideo(link: string) {
  window.open(link, '_blank')
}

function copyVideoLink(text: string) {
  const input = document.createElement('input')
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
  useToast().success('已复制视频链接')
}

function getWeek(date: string) {
  const week = ['日', '一', '二', '三', '四', '五', '六']
  return week[new Date(date).getDay()]
}

function onImageLoaded() {
  imageLoaded.value = true
  state.imageLoaded.add(imageKey)
}
</script>

<template>
  <li
    :style="{
      transform: `translateY(${news.top}px)`,
    }"
    class="absolute mb-2 w-full"
  >
    <a
      :href="channalConfig.newsDetailLink.replace('{id}', String(news.id))"
      :title="news.title"
      class="group flex rounded-md border-2 border-transparent bg-white p-2 transition-colors hover:border-blue-500 sm:p-3 "
      target="_blank"
    >
      <div
        v-if="showBanner"
        class="sm relative mr-2 flex items-center justify-center md:mr-4"
        :style="{
          width: `${coverWidth}px`,
          height: `${coverHeight}px`,
        }"
      >
        <svg
          v-if="!imageLoaded"
          class="w-10"
          version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 52 100" enable-background="new 0 0 0 0" xml:space="preserve"
        >
          <circle fill="#000" stroke="none" cx="6" cy="50" r="6">
            <animate
              attributeName="opacity"
              dur="1s"
              values="0;1;0"
              repeatCount="indefinite"
              begin="0.1"
            />
          </circle>
          <circle fill="#000" stroke="none" cx="26" cy="50" r="6">
            <animate
              attributeName="opacity"
              dur="1s"
              values="0;1;0"
              repeatCount="indefinite"
              begin="0.2"
            />
          </circle>
          <circle fill="#000" stroke="none" cx="46" cy="50" r="6">
            <animate
              attributeName="opacity"
              dur="1s"
              values="0;1;0"
              repeatCount="indefinite"
              begin="0.3"
            />
          </circle>
        </svg>
        <Transition name="fade">
          <img
            v-show="imageLoaded"
            :src="loadImage ? (news.cover || DEFAULT_BANNER) : ''"
            class="absolute size-full rounded-md bg-gray-200 object-cover sm:object-contain" alt="banner"
            referrerpolicy="no-referrer"
            @load="onImageLoaded"
          >
        </Transition>
      </div>
      <div class="flex-1 overflow-hidden">
        <h2
          :title="news.title"
          class="w-full truncate font-bold transition-colors md:text-lg"
        >
          {{ news.title }}
        </h2>
        <div class="text-sm">
          ID {{ news.id }}
          <span v-if="news.video" class="text-blue-500">
            <span class="ml-2 transition-colors hover:text-blue-300" @click.stop.prevent="openVideo(news.video)">打开视频</span>
            <span class="ml-2 transition-colors hover:text-blue-300" @click.stop.prevent="copyVideoLink(news.video)">复制链接</span>
          </span>
        </div>
        <div class="text-ellipsis whitespace-nowrap text-sm">
          类型 {{ news.tag }}
          <span @click.stop.prevent="$emit('onFilter', news.tag)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline-block size-4 text-blue-500 transition-colors hover:text-blue-300">
              <path fill-rule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" clip-rule="evenodd" />
            </svg>
          </span>
        </div>
        <div class="text-sm">
          发布 {{ news.startTime }} <span v-if="showDateWeek">星期{{ getWeek(news.startTime) }}</span>
        </div>
      </div>
    </a>
  </li>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
