<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import ChannelInfo from '@/components/ChannelInfo.vue'
import LoadingIndicator from '@/components/common/LoadingIndicator.vue'
import FloatTool from '@/components/FloatTool.vue'
import Header from '@/components/Header.vue'
import IconSetting from '@/components/icon/IconSetting.vue'
import NewsGridView from '@/components/news/NewsGridView.vue'
import NewsListView from '@/components/news/NewsListView.vue'
import NewsFilter from '@/components/NewsFilter.vue'
import SettingPanel from '@/components/SettingPanel.vue'
import { CONFIG_API } from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'

const mainStore = useMainStore()
const settings = useSettingsStore()
const { headerSticky, newsLoading } = storeToRefs(mainStore)
const {
  useGridView,
  fullWidth,
} = storeToRefs(settings)

const toast = useToast()

const showDialogSetting = ref(false)

onMounted(() => {
  mainStore.initialize()
  settings.tryMigrateFromV1Settings()

  fetchNotice()
  mainStore.fetchData()
})

function fetchNotice() {
  fetch(`${CONFIG_API}/hoyonews.notice`)
    .then(res => res.json())
    .then((res) => {
      if (res['hoyonews.notice']) {
        toast.info(res['hoyonews.notice'], {
          timeout: 10000,
          closeOnClick: false,
          draggable: false,
        })
      }
    })
    .catch((err) => {
      toast.error('获取公告数据失败')
      console.error(err)
    })
}

function handleChangeDialogSettingVisible() {
  showDialogSetting.value = !showDialogSetting.value
  if (showDialogSetting.value) {
    window.umami?.track('d-setting')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-sm transition-[font-size] md:text-base">
    <div
      class="relative mx-2 py-2 md:mx-4 xl:px-0" :class="{
        'lg:mx-auto lg:w-[960px]': !fullWidth,
        'lg:mx-10': fullWidth,
      }"
    >
      <div class="flex items-center justify-between">
        <h1 class="py-6 text-2xl font-bold transition-[font-size]">
          米哈游官网新闻检索
        </h1>
      </div>

      <div class="sticky top-0 z-20">
        <div
          class="absolute right-0 top-[-54px] w-full" :class="{
            '!top-4': headerSticky,
          }"
        >
          <div class="absolute right-0 flex gap-4">
            <button class="setting" @click="handleChangeDialogSettingVisible">
              <IconSetting class="size-6" />
            </button>
          </div>

          <SettingPanel v-model:visible="showDialogSetting" />
        </div>
      </div>

      <Header />

      <ChannelInfo />

      <NewsFilter />

      <div v-if="newsLoading" class="flex flex-col items-center gap-2 py-16">
        <LoadingIndicator class="size-[60px]" />
        <span class="text-lg">数据加载中</span>
      </div>

      <NewsListView v-if="!useGridView" />

      <NewsGridView v-if="useGridView" />

      <FloatTool />
    </div>
  </div>
</template>

<style>
body {
  overflow-y: scroll;
}

.popup-setting-enter-active,
.popup-setting-leave-active,
.popup-dialog-enter-active,
.popup-dialog-leave-active,
.popup-action-enter-active,
.popup-action-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-setting-enter-from,
.popup-setting-leave-to {
  opacity: 0;
  transform: translate(10px, -10px) scale(0.9);
}

.popup-dialog-enter-from,
.popup-dialog-leave-to {
  opacity: 0;
  transform: translateX(10px) scale(0.9);
}

.popup-action-enter-from,
.popup-action-leave-to {
  opacity: 0;
  transform: translate(-15px, -5px) scale(0.9);
}
</style>
