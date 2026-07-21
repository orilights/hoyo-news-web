import type { VNode } from 'vue'

export interface ContextMenuItem {
  /** 唯一标识，用于 key */
  key?: string
  /** 显示文本，支持字符串或 VNode */
  label?: string | VNode
  /** 左侧图标 VNode */
  icon?: VNode
  /** 是否禁用 */
  disabled?: boolean
  /** 是否在上方显示分割线 */
  divided?: boolean
  /** 点击回调 */
  onClick?: () => void
  /** 子菜单项 */
  children?: ContextMenuItem[]
}

export interface ContextMenuPosition {
  x: number
  y: number
}

const visible = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const menuItems = ref<ContextMenuItem[]>([])

export function closeContextMenu(): void {
  visible.value = false
}

/**
 * 弹出上下文菜单
 * @param position 弹出位置，支持 MouseEvent 或 { x, y }
 * @param items 菜单配置列表
 */
export function showContextMenu(
  position: ContextMenuPosition | MouseEvent,
  items: ContextMenuItem[],
): void {
  visible.value = false

  let x: number
  let y: number
  if ('clientX' in position) {
    x = position.clientX
    y = position.clientY
  }
  else {
    x = position.x
    y = position.y
  }

  nextTick(() => {
    menuX.value = x
    menuY.value = y
    menuItems.value = items
    visible.value = true
  })
}

export function useContextMenu() {
  return {
    visible,
    x: menuX,
    y: menuY,
    items: menuItems,
    showContextMenu,
    closeContextMenu,
  }
}
