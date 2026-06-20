<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

export interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: SelectOption[]
  placeholder?: string
  border?: boolean
}>(), {
  placeholder: '请选择',
  border: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'open': []
}>()

const show = ref(false)
const scrollContainer = useTemplateRef('listRef')

const selectedLabel = computed(() =>
  props.options.find(o => o.value === props.modelValue)?.label ?? props.placeholder,
)

function toggle() {
  show.value = !show.value
  if (show.value) {
    emit('open')
    nextTick(() => {
      (scrollContainer.value?.$el as HTMLUListElement)?.querySelector<HTMLElement>('[data-selected]')?.scrollIntoView({ block: 'nearest' })
    })
  }
}

function select(val: string) {
  emit('update:modelValue', val)
  show.value = false
}

function close() {
  show.value = false
}

defineExpose({ close })
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-1.5 rounded-xl text-sm font-medium text-gray-700 transition-colors focus:outline-none  dark:text-gray-200 "
      :class="{
        'border border-gray-200 bg-white py-1.5 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700': border,
      }"
      @click="toggle"
    >
      <slot name="trigger" :label="selectedLabel" :value="modelValue">
        {{ selectedLabel }}
      </slot>
      <LucideChevronDown class="size-3.5 shrink-0 text-gray-400 transition-transform" :class="show ? 'rotate-180' : ''" />
    </button>

    <div v-if="show" class="fixed inset-0 z-30" @click="close" />

    <Transition name="dropdown">
      <OverlayScrollbarsComponent
        v-show="show"
        ref="listRef"
        defer
        class="absolute left-0 top-full z-50 mt-1 max-h-72 min-w-max rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
        element="ul"
      >
        <li v-for="opt in options" :key="String(opt.value)">
          <button
            class="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
            :class="modelValue === opt.value
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'"
            :data-selected="modelValue === opt.value ? '' : undefined"
            @click="select(opt.value)"
          >
            <slot name="option" :option="opt" :is-selected="modelValue === opt.value">
              {{ opt.label }}
            </slot>
          </button>
        </li>
      </OverlayScrollbarsComponent>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
