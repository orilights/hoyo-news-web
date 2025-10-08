import { useMediaQuery } from '@vueuse/core'
import { CoverSize } from '@/types/enum'

export function useCoverSize() {
  const windowWidth = {
    sm: useMediaQuery('(min-width: 640px)'),
    md: useMediaQuery('(min-width: 768px)'),
  }
  const coverSize = computed(() => {
    if (windowWidth.md.value)
      return CoverSize.Large
    if (windowWidth.sm.value)
      return CoverSize.Medium
    return CoverSize.Small
  })

  return { coverSize }
}
