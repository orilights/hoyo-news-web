<script setup lang="ts">
import AnimationText from '@/components/common/AnimationText.vue'
import { NEWS_LIST } from '@/constants'

defineProps<{
  disabled: boolean
  source: string
  channal: string
}>()

const emit = defineEmits(['changeSource', 'changeChannal', 'update:sticky'])

const headerRef = ref<HTMLElement | null>(null)
const sticky = ref(false)

onMounted(() => {
  document.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  sticky.value = (headerRef.value?.getBoundingClientRect().top || 0) === 0 && window.scrollY > 0
  emit('update:sticky', sticky.value)
}
</script>

<template>
  <div
    ref="headerRef"
    class="header sticky top-0 z-10 pt-2 backdrop-blur transition-all"
    :class="{
      'mx-[-8px] bg-[#f3f4f6]/80 pl-2 pr-4 md:mx-[-32px] md:px-8': sticky,
    }"
  >
    <div
      class="mb-2 flex flex-wrap gap-1"
      :class="{
        'pr-4': sticky,
      }"
    >
      <button
        v-for="[source_key, source_info] in Object.entries(NEWS_LIST)" :key="source_key"
        class="flex shrink-0 items-center overflow-hidden rounded-full border p-1 transition-colors"
        :class="{
          'hover:border-blue-500': !disabled,
          'border-blue-500 text-blue-500': source === source_key,
        }"
        :disabled="disabled || source === source_key"
        @click="emit('changeSource', source_key)"
      >
        <img
          class="size-6 rounded-full md:size-8"
          :alt="source_info.displayName"
          :src="`./images/icon/${source_key}-48px.png`"
        >
        <AnimationText :show="source === source_key">
          <span class="mx-1 sm:mx-2">
            {{ source_info.displayName }}
          </span>
        </AnimationText>
      </button>
    </div>

    <div class="mb-2 overflow-x-auto whitespace-nowrap">
      <button
        v-for="[channal_key, channal_info] in Object.entries(NEWS_LIST[source].channals)" :key="channal_key"
        class="border-b-2 bg-transparent px-2 py-1 transition-colors"
        :class="{
          'hover:text-blue-500': !disabled,
          'border-blue-500 text-blue-500': channal === channal_key,
        }"
        :disabled="disabled || channal === channal_key"
        @click="emit('changeChannal', channal_key)"
      >
        {{ channal_info.displayName }}
      </button>
    </div>
  </div>
</template>
