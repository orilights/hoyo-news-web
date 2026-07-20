<script setup lang="ts">
import DOMPurify from 'dompurify'
import { formatTime } from '@/utils'

const props = defineProps<{
  result: SearchResult
  linkTemplate: string
}>()

defineEmits<{
  open: [result: SearchResult]
}>()

const link = computed(() => props.linkTemplate.replace('{id}', String(props.result.remoteId)))

const safeTitle = computed(() =>
  DOMPurify.sanitize(props.result.matches.title, { ALLOWED_TAGS: ['em'] }),
)

const safeContent = computed(() =>
  DOMPurify.sanitize(props.result.matches.content, { ALLOWED_TAGS: ['em'] }),
)
</script>

<template>
  <li>
    <a
      :href="link"
      :title="result.title"
      target="_blank"
      class="block cursor-pointer rounded-md border-2 border-transparent bg-white p-3 transition-colors hover:border-blue-500"
      @click.prevent="$emit('open', result)"
    >
      <h2 class="mb-1 text-sm font-bold text-gray-800 transition-colors group-hover:text-blue-600" v-html="safeTitle" />
      <p
        class="line-clamp-2 text-xs leading-relaxed text-gray-500"
        v-html="safeContent"
      />
      <div class="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
        <LucideClock class="size-3 shrink-0" />
        <span>{{ formatTime(result.startTime) }}</span>
      </div>
    </a>
  </li>
</template>
