<script setup lang="ts">
import LoadingIndicatorImage from '@/components/common/LoadingIndicatorImage.vue'
import IconFilter from '@/components/icon/IconFilter.vue'
import { DEFAULT_BANNER, LOAD_DELAY, NEWS_LIST } from '@/constants'
import { state } from '@/state'
import { CoverSize } from '@/types/enum'
import { getWeek, sanitizeFilename } from '@/utils'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  news: NewsItemData
  source: string
  channal: string
  config: NewsItemConfig
}>()

const emit = defineEmits(['changeFilter', 'visit'])

let timer: NodeJS.Timeout | null = null
const newsKey = `${props.source}_${props.channal}_${props.news.id}`

const loadImage = ref(false)
const imageLoaded = ref(false)
const showAction = ref(false)

const channalConfig = computed(() => NEWS_LIST[props.source].channals[props.channal])
const coverWidth = computed(() => {
  if (props.config.coverSize === CoverSize.Large) {
    return channalConfig.value.coverWidth
  }
  if (props.config.coverSize === CoverSize.Medium) {
    return (channalConfig.value.coverWidth) / 2
  }
  return 75
})
const coverHeight = computed(() => props.config.coverSize === CoverSize.Large ? 150 : 75)
const isNewsVisited = computed(() => state.newsVisited.has(newsKey))

onMounted(() => {
  if (state.imageLoaded.has(newsKey)) {
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

function sendToPotPlayer(link: string) {
  window.open(`potplayer://${link}`)
}

function sendToAria2(link: string) {
  const rpcId = `HYN${new Date().getTime()}`
  const videoExt = link.split('.').pop()
  const videoOutName = sanitizeFilename(
    props.config.aria2Config.filename
      .replace('{newsTitle}', sanitizeFilename(props.news.title))
      .replace('{ext}', videoExt || 'mp4'),
  )
  fetch(props.config.aria2Config.rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: rpcId,
      method: 'aria2.addUri',
      params: [`token:${props.config.aria2Config.rpcSecret}`, [link], {
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
}

function onImageLoaded() {
  imageLoaded.value = true
  state.imageLoaded.add(newsKey)
}

function onClick() {
  if (!props.config.showVisited)
    return
  state.newsVisited.add(newsKey)
  emit('visit')
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
      @click="onClick"
    >
      <div
        v-if="config.showBanner && channalConfig.coverWidth"
        class="sm relative mr-2 flex shrink-0 items-center justify-center md:mr-4"
        :style="{
          width: `${coverWidth}px`,
          height: `${coverHeight}px`,
        }"
      >
        <LoadingIndicatorImage
          v-if="!imageLoaded"
          class="w-10"
        />
        <Transition name="fade">
          <img
            v-show="imageLoaded"
            :src="loadImage ? (news.cover || DEFAULT_BANNER) : ''"
            class="absolute size-full rounded-md bg-gray-100 object-cover sm:object-contain"
            alt="banner"
            referrerpolicy="no-referrer"
            @load="onImageLoaded"
          >
        </Transition>
      </div>
      <div class="min-w-0 flex-1">
        <h2
          :title="news.title"
          class="w-full truncate font-bold transition-colors md:text-lg"
          :class="{
            'text-gray-400': config.showVisited && isNewsVisited,
          }"
        >
          {{ news.title }}
        </h2>
        <div class="text-xs md:text-sm">
          <div>
            ID {{ news.id }}
            <span v-if="news.video" class="relative text-blue-500">
              <span
                class="ml-2 transition-colors hover:text-blue-300"
                title="在新标签页中打开视频"
                @click.stop.prevent="openVideo(news.video)"
              >
                打开视频
              </span>
              <span
                class="ml-2 transition-colors hover:text-blue-300"
                title="展开/收起更多操作"
                @click.stop.prevent="showAction = !showAction"
              >
                更多操作
              </span>
              <Transition name="popup-action">
                <div
                  v-show="showAction" class="absolute right-[-150px] top-0 z-30 w-[146px] rounded-md border bg-white text-black"
                  @click.stop.prevent
                >
                  <button
                    class="w-full px-2 py-0.5 text-left transition-colors hover:bg-black/10"
                    title="复制视频链接至剪贴板"
                    @click="showAction = false;copyVideoLink(news.video)"
                  >
                    复制链接
                  </button>
                  <button
                    class="w-full px-2 py-0.5 text-left transition-colors hover:bg-black/10"
                    title="在 PotPlayer 中打开视频"
                    @click="showAction = false;sendToPotPlayer(news.video)"
                  >
                    在 PotPlayer 中打开
                  </button>
                  <button
                    class="w-full px-2 py-0.5 text-left transition-colors hover:bg-black/10"
                    title="将视频发送至 aria2 下载"
                    @click="showAction = false;sendToAria2(news.video)"
                  >
                    发送至 aria2 下载
                  </button>
                </div>
              </Transition>
            </span>
          </div>
          <div class="text-ellipsis whitespace-nowrap">
            类型 {{ news.tag }}
            <span title="筛选此标签" @click.stop.prevent="$emit('changeFilter', news.tag)">
              <IconFilter class="inline-block size-3 text-blue-500 transition-colors hover:text-blue-300 md:size-4" />
            </span>
          </div>
          <div>
            发布 {{ news.startTime }} <span v-if="config.showDateWeek">星期{{ getWeek(news.startTime) }}</span>
          </div>
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
