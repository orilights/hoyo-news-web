<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { ContextMenuItem } from '@/composables/contextMenu'
import { LucideChevronRight } from '@lucide/vue'
import { useMediaQuery } from '@vueuse/core'
import { closeContextMenu, useContextMenu } from '@/composables/contextMenu'

const { visible, x, y, items } = useContextMenu()
const isMobile = useMediaQuery('(max-width: 768px)')

const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref<CSSProperties>({ visibility: 'hidden' })
const menuMeasured = ref(false)

const EDGE_MARGIN = 8

function positionMainMenu(): void {
  const el = menuRef.value
  if (!el)
    return

  const rect = el.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = x.value
  let top = y.value

  // 右边界检测
  if (left + rect.width + EDGE_MARGIN > vw) {
    left = Math.max(EDGE_MARGIN, left - rect.width)
  }
  // 下边界检测
  if (top + rect.height + EDGE_MARGIN > vh) {
    top = Math.max(EDGE_MARGIN, top - rect.height)
  }
  // 左边界兜底
  if (left < EDGE_MARGIN) {
    left = EDGE_MARGIN
  }
  // 上边界兜底
  if (top < EDGE_MARGIN) {
    top = EDGE_MARGIN
  }

  menuStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    visibility: 'visible',
  }
  menuMeasured.value = true
}

const itemRefs = ref<Record<number, HTMLElement | null>>({})
const activeSubMenuIndex = ref<number | null>(null)
const subMenuRef = ref<HTMLElement | null>(null)
const subMenuStyle = ref<CSSProperties>({ visibility: 'hidden' })
const hoverTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)

watch(visible, (val) => {
  if (val) {
    menuMeasured.value = false
    menuStyle.value = { visibility: 'hidden' }
    nextTick(() => {
      positionMainMenu()
    })
  }
  else {
    menuMeasured.value = false
    activeSubMenuIndex.value = null
  }
})

const SUBMENU_HOVER_DELAY = 200
const SUBMENU_LEAVE_DELAY = 150

const activeSubMenuItems = computed<ContextMenuItem[]>(() => {
  if (activeSubMenuIndex.value === null)
    return []
  return items.value[activeSubMenuIndex.value]?.children ?? []
})

function getItemRef(index: number): HTMLElement | null {
  return itemRefs.value[index] ?? null
}

function setItemRef(index: number, el: Element | ComponentPublicInstance | null): void {
  if (el instanceof HTMLElement) {
    itemRefs.value[index] = el
  }
  else if (el && '$el' in el) {
    itemRefs.value[index] = (el as { $el: HTMLElement }).$el
  }
  else {
    itemRefs.value[index] = null
  }
}

function clearTimers(): void {
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value)
    hoverTimer.value = null
  }
  if (leaveTimer.value) {
    clearTimeout(leaveTimer.value)
    leaveTimer.value = null
  }
}

function openSubMenu(index: number): void {
  clearTimers()
  hoverTimer.value = setTimeout(() => {
    activeSubMenuIndex.value = index
    nextTick(() => {
      positionSubMenu(index)
    })
  }, SUBMENU_HOVER_DELAY)
}

function closeSubMenu(): void {
  clearTimers()
  leaveTimer.value = setTimeout(() => {
    activeSubMenuIndex.value = null
  }, SUBMENU_LEAVE_DELAY)
}

function cancelCloseSubMenu(): void {
  if (leaveTimer.value) {
    clearTimeout(leaveTimer.value)
    leaveTimer.value = null
  }
}

function positionSubMenu(parentIndex: number): void {
  const parentEl = getItemRef(parentIndex)
  const subEl = subMenuRef.value
  if (!parentEl || !subEl)
    return

  const parentRect = parentEl.getBoundingClientRect()
  const subRect = subEl.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  // 默认：子菜单出现在父项右侧，顶部对齐
  let left = parentRect.right + 4
  let top = parentRect.top

  // 右边界检测：若右侧空间不足，翻转到左侧
  if (left + subRect.width + EDGE_MARGIN > vw) {
    left = parentRect.left - subRect.width - 4
  }
  // 下边界检测
  if (top + subRect.height + EDGE_MARGIN > vh) {
    top = Math.max(EDGE_MARGIN, vh - subRect.height - EDGE_MARGIN)
  }
  // 左/上边界兜底
  if (left < EDGE_MARGIN) {
    left = EDGE_MARGIN
  }
  if (top < EDGE_MARGIN) {
    top = EDGE_MARGIN
  }

  subMenuStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    visibility: 'visible',
  }
}

function onSubMenuEnter(): void {
  cancelCloseSubMenu()
}

function onSubMenuLeave(): void {
  closeSubMenu()
}

watch(activeSubMenuIndex, (index) => {
  if (index !== null) {
    subMenuStyle.value = { visibility: 'hidden' }
    nextTick(() => {
      positionSubMenu(index)
    })
  }
})

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    closeContextMenu()
  }
}

function onClickOutside(e: MouseEvent): void {
  const target = e.target as HTMLElement | null
  if (!target)
    return
  // 点击的是菜单或子菜单内部，不关闭
  if (menuRef.value?.contains(target) || subMenuRef.value?.contains(target))
    return
  closeContextMenu()
}

watch(visible, (val) => {
  if (val) {
    document.addEventListener('keydown', onKeydown)
    if (!isMobile.value) {
      // 延迟注册，避免当前触发的 click 事件立即关闭菜单
      nextTick(() => {
        document.addEventListener('click', onClickOutside)
      })
    }
  }
  else {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('click', onClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onClickOutside)
  clearTimers()
})

function onItemClick(item: ContextMenuItem): void {
  if (item.disabled || item.children?.length)
    return
  item.onClick?.()
  closeContextMenu()
}

function onMobileSubMenuToggle(index: number): void {
  if (activeSubMenuIndex.value === index) {
    activeSubMenuIndex.value = null
  }
  else {
    activeSubMenuIndex.value = index
    nextTick(() => {
      positionSubMenu(index)
    })
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- 移动端遮罩 -->
    <Transition name="fade">
      <div
        v-if="visible && isMobile"
        class="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
        @click="closeContextMenu"
      />
    </Transition>

    <Transition name="context-menu">
      <div
        v-show="visible"
        ref="menuRef"
        class="fixed z-[9999] min-w-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        :class="{
          '!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2': isMobile,
        }"
        :style="isMobile ? {} : menuStyle"
      >
        <template v-for="(item, index) in items" :key="item.key ?? index">
          <hr v-if="item.divided" class="my-1 border-gray-100">
          <div
            :ref="(el: any) => setItemRef(index, el)"
            class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors"
            :class="{
              'cursor-not-allowed opacity-50': item.disabled,
              'text-gray-700 hover:bg-gray-100': !item.disabled && activeSubMenuIndex !== index,
              'bg-gray-100 text-gray-900': activeSubMenuIndex === index,
            }"
            @click="item.disabled ? undefined : item.children?.length ? (isMobile ? onMobileSubMenuToggle(index) : undefined) : onItemClick(item)"
            @mouseenter="!isMobile && !item.disabled && item.children?.length ? openSubMenu(index) : undefined"
            @mouseleave="!isMobile && item.children?.length ? closeSubMenu() : undefined"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              class="size-4 shrink-0 text-gray-500"
            />

            <span class="flex-1 truncate whitespace-nowrap">
              <component :is="item.label" v-if="typeof item.label !== 'string'" />
              <template v-else>{{ item.label }}</template>
            </span>

            <LucideChevronRight
              v-if="item.children?.length"
              class="size-3.5 shrink-0 text-gray-400"
            />
          </div>
        </template>

        <div
          v-if="items.length === 0 && menuMeasured"
          class="px-3 py-2 text-sm text-gray-400"
        >
          无可用操作
        </div>
      </div>
    </Transition>

    <Transition name="context-menu">
      <div
        v-if="activeSubMenuIndex !== null && activeSubMenuItems.length > 0 && !isMobile"
        ref="subMenuRef"
        class="fixed z-[10000] min-w-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        :style="subMenuStyle"
        @mouseenter="onSubMenuEnter"
        @mouseleave="onSubMenuLeave"
      >
        <template v-for="(item, index) in activeSubMenuItems" :key="item.key ?? index">
          <hr v-if="item.divided" class="my-1 border-gray-100">
          <div
            class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors"
            :class="{
              'cursor-not-allowed opacity-50': item.disabled,
              'text-gray-700 hover:bg-gray-100': !item.disabled,
            }"
            @click="item.disabled ? undefined : onItemClick(item)"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              class="size-4 shrink-0 text-gray-500"
            />
            <span class="flex-1 truncate whitespace-nowrap">
              <component :is="item.label" v-if="typeof item.label !== 'string'" />
              <template v-else>{{ item.label }}</template>
            </span>
          </div>
        </template>
      </div>
    </Transition>

    <Transition name="context-menu">
      <div
        v-if="activeSubMenuIndex !== null && activeSubMenuItems.length > 0 && isMobile"
        class="fixed z-[10000] min-w-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        style="left: 50%; top: 50%; transform: translate(-50%, -50%)"
      >
        <div
          class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100"
          @click="activeSubMenuIndex = null"
        >
          <LucideChevronRight class="size-3.5 shrink-0 rotate-180" />
          <span>返回</span>
        </div>
        <hr class="my-1 border-gray-100">
        <template v-for="(item, index) in activeSubMenuItems" :key="item.key ?? index">
          <hr v-if="item.divided" class="my-1 border-gray-100">
          <div
            class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors"
            :class="{
              'cursor-not-allowed opacity-50': item.disabled,
              'text-gray-700 hover:bg-gray-100': !item.disabled,
            }"
            @click="item.disabled ? undefined : onItemClick(item)"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              class="size-4 shrink-0 text-gray-500"
            />
            <span class="flex-1 truncate whitespace-nowrap">
              <component :is="item.label" v-if="typeof item.label !== 'string'" />
              <template v-else>{{ item.label }}</template>
            </span>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.context-menu-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
