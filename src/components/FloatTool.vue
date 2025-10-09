<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import IconArrowDown from '@/components/icon/IconArrowDown.vue'
import IconArrowUp from '@/components/icon/IconArrowUp.vue'
import IconJump from '@/components/icon/IconJump.vue'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import { event, formatTime } from '@/utils'

const toast = useToast()
const mainStore = useMainStore()
const settings = useSettingsStore()
const { useGridView } = storeToRefs(settings)
const { sortBy, newsDataFiltered } = storeToRefs(mainStore)

const showDialogJump = ref(false)
const jumpDate = ref('')

const dateRange = computed(() => {
  const range = { min: '', max: '' }
  if (newsDataFiltered.value.length) {
    if (sortBy.value === 'asc') {
      range.min = formatTime(newsDataFiltered.value[0].startTime, true)
      range.max = formatTime(newsDataFiltered.value[newsDataFiltered.value.length - 1].startTime, true)
    }
    else {
      range.min = formatTime(newsDataFiltered.value[newsDataFiltered.value.length - 1].startTime, true)
      range.max = formatTime(newsDataFiltered.value[0].startTime, true)
    }
  }
  return range
})

watch(jumpDate, (val) => {
  if (val) {
    handleScrollByDate()
  }
})

onMounted(() => {
  document.addEventListener('click', (event) => {
    if (showDialogJump.value) {
      if ((event.target as HTMLElement).closest('.dialog-jump') === null)
        showDialogJump.value = false
    }
  })
})

function scrollTo(target: 'top' | 'bottom') {
  if (target === 'top')
    document.body.scrollIntoView({ behavior: 'smooth', block: 'start' })
  else
    document.body.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

function changeDate(go: number) {
  if (jumpDate.value) {
    const date = new Date(jumpDate.value)
    date.setDate(date.getDate() + go)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    jumpDate.value = `${year}-${month}-${day}`
    handleScrollByDate()
  }
  else {
    toast.warning('请先选择日期')
  }
}

function handleChangeDialogJumpVisible() {
  if (useGridView.value) {
    toast.warning('网格视图暂不支持跳转功能')
    return
  }
  showDialogJump.value = !showDialogJump.value
  if (showDialogJump.value) {
    window.umami?.track('d-jump')
  }
}

function handleScrollByDate() {
  event.emit('scrollByDate', jumpDate.value)
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-20 flex items-end gap-2">
    <Transition name="popup-dialog">
      <div v-show="showDialogJump" class="dialog-jump rounded-lg bg-white p-4 shadow-md">
        <div class="font-bold">
          跳转到日期
        </div>
        <div class="my-2 flex items-center">
          <input
            v-model="jumpDate" v-bind="dateRange" type="date"
            class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
          >
        </div>
        <button class="rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500" @click="changeDate(-1)">
          向前
        </button>
        <button
          class="ml-2 rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500"
          @click="changeDate(1)"
        >
          向后
        </button>
      </div>
    </Transition>
    <div class="flex flex-col">
      <button
        class="dialog-jump rounded-t-lg border border-gray-300 bg-white p-2 transition-colors hover:z-20 hover:border-blue-500 hover:text-blue-500"
        @click="handleChangeDialogJumpVisible"
      >
        <IconJump class="size-4" />
      </button>
      <button
        class="-mt-px border border-gray-300 bg-white p-2 transition-colors hover:z-20 hover:border-blue-500 hover:text-blue-500"
        @click="scrollTo('top')"
      >
        <IconArrowUp class="size-4" />
      </button>
      <button
        class="-mt-px rounded-b-lg border border-gray-300 bg-white p-2 transition-colors hover:z-20 hover:border-blue-500 hover:text-blue-500"
        @click="scrollTo('bottom')"
      >
        <IconArrowDown class="size-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>
