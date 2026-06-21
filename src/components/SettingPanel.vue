<script setup lang="ts">
import type { ChannelType } from '@/types/enum'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import Draggable from 'vuedraggable'
import DropdownSelect from '@/components/common/DropdownSelect.vue'
import Switch from '@/components/common/Switch.vue'
import Tabs from '@/components/common/Tabs.vue'
import { BUILD_COMMIT, BUILD_DATE, GRID_CARD_WIDTH_OPTIONS, GRID_COVER_MODE_OPTIONS, NEWS_LIST, SETTING_TABS } from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import { getChannelLabel } from '@/types/enum'
import { exportFile, formatTime, getAria2DownloadTask } from '@/utils'

const toast = useToast()
const mainStore = useMainStore()
const settings = useSettingsStore()
const { currentChannel, newsDataFiltered, customFilterCount, isMobile, showSetting } = storeToRefs(mainStore)
const {
  showCover,
  showDateWeek,
  showVisited,
  useWebPlayer,
  useNewsBrowser,
  sourceSelectStyle,
  useGridView,
  gridCardMinWidth,
  gridCoverMode,
  aria2Config,
  customFilter,
  autoHideHeader,
  sourceCustom,
  channelCustom,
} = storeToRefs(settings)

const currentTab = ref('general')
const expandSource = ref('')
const sourceDragging = ref(false)

const dragOptions = {
  animation: 200,
  group: 'description',
  disabled: false,
  ghostClass: 'ghost',
}

const gridCardMinWidthStr = computed({
  get: () => String(gridCardMinWidth.value),
  set: (v) => { gridCardMinWidth.value = Number(v) },
})

watch(() => customFilter.value.enable, () => {
  mainStore.handleSourceChange()
})

function exportVideos() {
  window.umami?.track('a-export-videos')
  const videoList = newsDataFiltered.value.filter(news => news.video)
  if (videoList.length === 0) {
    toast.warning('当前没有可导出的视频')
    return
  }
  if (currentChannel.value.startsWith('bbs_cn')) {
    toast.warning('米游社暂不支持导出视频下载任务')
    return
  }

  exportFile({
    filename: 'videos.txt',
    content: getAria2DownloadTask(videoList),
  })
  toast.success('导出下载任务成功')
}

function changeExpandSource(key: string) {
  if (expandSource.value === key)
    expandSource.value = ''
  else
    expandSource.value = key
}

function changeSourceVisibility(sourceKey: string) {
  const source = sourceCustom.value.find(source => source.key === sourceKey)
  const enabledSources = sourceCustom.value.filter(source => source.channels.some((channel: any) => channel.enable))
  if (enabledSources.length === 1 && enabledSources[0].key === sourceKey) {
    toast.warning('需至少保留一个内容源')
    return
  }

  if (source) {
    const sourceDisabled = source.channels.every((channel: any) => !channel.enable)
    source.channels.forEach((channel: any) => {
      channel.enable = sourceDisabled
    })
  }
}

function toggleChannelTypeEnable(channelType: ChannelType) {
  const enabledChannelTypes = channelCustom.value.filter(channel => channel.enable)
  if (enabledChannelTypes.length === 1 && enabledChannelTypes[0].key === channelType) {
    toast.warning('需至少保留一个内容源')
    return
  }
  channelCustom.value.forEach((channel) => {
    if (channel.key === channelType) {
      channel.enable = !channel.enable
    }
  })
  settings.initCustomData()
}

function onSourceDragStart() {
  changeExpandSource('')
  sourceDragging.value = true
}

function onSourceDragEnd() {
  sourceDragging.value = false
}
</script>

<template>
  <DialogContainer :show="showSetting" title="设置" @close="showSetting = false">
    <div class="text-sm">
      <Tabs v-model:selected-key="currentTab" class="mb-3" :tabs="SETTING_TABS" />
      <div>
        <template v-if="currentTab === 'general'">
          <div class="mb-2 flex items-center">
            <span class="flex-1">网格视图</span>
            <Switch v-model="useGridView" class="ml-2" />
          </div>
          <div v-if="useGridView" class="mb-2 flex items-center">
            <span class="flex-1">卡片最小宽度</span>
            <DropdownSelect
              v-model="gridCardMinWidthStr"
              :options="GRID_CARD_WIDTH_OPTIONS"
            />
          </div>
          <div class="mb-2 flex items-center">
            <span class="flex-1">显示封面</span>
            <Switch v-model="showCover" class="ml-2" />
          </div>
          <div v-if="useGridView && showCover" class="mb-2 flex items-center">
            <span class="flex-1">封面显示模式</span>
            <DropdownSelect
              v-model="gridCoverMode"
              :options="GRID_COVER_MODE_OPTIONS"
            />
          </div>
          <div class="mb-2 flex items-center">
            <span class="flex-1">发布时间显示星期</span>
            <Switch v-model="showDateWeek" class="ml-2" />
          </div>
          <div class="mb-2 flex items-center">
            <span class="flex-1">置灰已阅读新闻</span>
            <Switch v-model="showVisited" class="ml-2" />
          </div>
          <div class="mb-2 flex items-center">
            <span class="flex-1">使用内置浏览器</span>
            <Switch v-model="useNewsBrowser" class="ml-2" />
          </div>
          <div class="mb-2 flex items-center">
            <span class="flex-1">使用内置播放器</span>
            <Switch v-model="useWebPlayer" class="ml-2" />
          </div>
          <div class="mb-2 flex items-center">
            <span class="flex-1">新闻源选择样式</span>
            <DropdownSelect
              v-model="sourceSelectStyle"
              :options="[{ value: 'dropdown', label: '下拉' }, { value: 'tab', label: 'Tab' }]"
            />
          </div>
          <div v-if="isMobile" class="mb-2 flex items-center">
            <span class="flex-1">自动隐藏顶栏</span>
            <Switch v-model="autoHideHeader" class="ml-2" />
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <span class="flex-1">启用内置关键词过滤</span>
              <Switch v-model="customFilter.enable" class="ml-2" />
            </div>
            <div v-if="customFilter.enable" class="text-xs">
              当前页面过滤数量：{{ customFilterCount }}
            </div>
          </div>
          <div class="mb-2">
            <button
              class="rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500"
              @click="exportVideos"
            >
              导出本页视频至 aria2 任务
            </button>
          </div>
        </template>
        <template v-if="currentTab === 'source'">
          <button
            class="mb-2 rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500"
            @click="settings.resetSourceCustom()"
          >
            恢复本页默认设置
          </button>
          <div class="mb-2 flex flex-wrap gap-1 text-xs">
            <div
              v-for="channelState in channelCustom" :key="channelState.key"
              class="cursor-pointer break-keep rounded-md border px-1 py-0.5 transition-all "
              :class="{
                'border-blue-500 bg-blue-500 text-white': channelState.enable,
                'hover:border-blue-400 hover:text-blue-400': !channelState.enable,
              }"
              @click="toggleChannelTypeEnable(channelState.key)"
            >
              {{ getChannelLabel(channelState.key) }}
            </div>
          </div>
          <OverlayScrollbarsComponent
            defer
            class="mx-[-16px] max-h-[400px] select-none px-4"
            :options="{
              scrollbars: { autoHide: 'scroll' },
            }"
          >
            <Draggable
              v-model="sourceCustom"
              v-bind="dragOptions"
              :group="{ name: 'source' }"
              item-key="key"
              handle=".handle-source"
              @start="onSourceDragStart"
              @end="onSourceDragEnd"
            >
              <template #item="{ element }">
                <div
                  class="mb-1 rounded-md border px-2 py-1 transition-colors"
                  :class="{
                    'hover:border-gray-400': !sourceDragging,
                    'border-gray-400': expandSource === element.key,
                  }"
                >
                  <div class="flex cursor-pointer items-center gap-2" @click="changeExpandSource(element.key)">
                    <img class="size-6 rounded-full" :src="`./images/icon/${element.key}-48px.png`">
                    <div class="flex-1" :class="{ 'text-gray-400': element.channels.every((channel: any) => !channel.enable) }">
                      {{ NEWS_LIST[element.key].displayName }}
                    </div>
                    <LucideEye
                      v-if="element.channels.some((channel: any) => channel.enable)"
                      class="size-4 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                      @click.stop="changeSourceVisibility(element.key)"
                    />
                    <LucideEyeOff
                      v-else
                      class="size-4 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                      @click.stop="changeSourceVisibility(element.key)"
                    />
                    <LucideGripVertical class="handle-source size-4 cursor-move text-gray-400 transition-colors hover:text-gray-600" />
                    <LucideChevronDown
                      class="size-4 text-gray-400 transition-transform"
                      :class="{
                        'rotate-180': expandSource === element.key,
                      }"
                    />
                  </div>
                  <div v-show="expandSource === element.key" class="mt-2">
                    <Draggable
                      v-model="element.channels"
                      v-bind="dragOptions"
                      :group="{ name: `channel-${element.key}` }"
                      item-key="key"
                      class="flex cursor-move flex-col gap-1"
                    >
                      <template #item="{ element: channel }">
                        <div class="flex items-center justify-between rounded border px-1 py-0.5">
                          <span class="text-sm transition-colors" :class="{ 'text-gray-400': !channel.enable }">
                            {{ NEWS_LIST[element.key].channels[channel.key].displayName }}
                          </span>
                          <LucideEye
                            v-if="channel.enable"
                            class="size-4 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                            @click.stop="channel.enable = false"
                          />
                          <LucideEyeOff
                            v-else
                            class="size-4 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                            @click.stop="channel.enable = true"
                          />
                        </div>
                      </template>
                    </Draggable>
                  </div>
                </div>
              </template>
            </Draggable>
          </OverlayScrollbarsComponent>
        </template>
        <template v-if="currentTab === 'download'">
          <div class="mb-2">
            <div class="mb-1">
              aria2 RPC地址
            </div>
            <input
              v-model="aria2Config.rpcUrl" type="text"
              class="w-full rounded-md border border-black/20 bg-transparent px-1.5 py-0.5 text-sm outline-blue-500 transition-colors hover:border-blue-500"
            >
          </div>
          <div class="mb-2">
            <div class="mb-1">
              aria2 RPC密钥
            </div>
            <input
              v-model="aria2Config.rpcSecret" type="text"
              class="w-full rounded-md border border-black/20 bg-transparent px-1.5 py-0.5 text-sm outline-blue-500 transition-colors hover:border-blue-500"
            >
          </div>
        </template>
        <template v-if="currentTab === 'about'">
          <div class="mb-2 flex items-center rounded-xl border p-2 text-sm">
            <img src="/favicon.png" class="mr-2 size-12">
            <div>
              <div class="font-bold">
                HoyoNews
              </div>
              <div>
                一个用于检索米哈游旗下游戏官方发布 新闻/视频 的小工具
              </div>
            </div>
          </div>
          <div class="mb-2 flex items-center gap-2">
            <span class="flex-1">开发者</span>
            <a href="https://orilight.top" target="_blank" class="text-blue-500 hover:underline">
              OriLight
            </a>
          </div>
          <div class="mb-2 flex items-center gap-2">
            <span class="flex-1">Github</span>
            <a
              href="https://github.com/orilights/hoyo-news-web" target="_blank"
              class="text-blue-500 hover:underline"
            >
              hoyo-news-web
            </a>
          </div>
          <div class="mb-2 flex items-center gap-2">
            <span class="flex-1">构建时间</span>
            <span>
              {{ formatTime(BUILD_DATE) }}
              <template v-if="BUILD_COMMIT">
                (<a
                  :href="`https://github.com/orilights/hoyo-news-web/commit/${BUILD_COMMIT}`" target="_blank"
                  class="text-blue-500 hover:underline"
                >
                  {{ BUILD_COMMIT }}
                </a>)
              </template>
            </span>
          </div>
        </template>
      </div>
    </div>
  </DialogContainer>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>
