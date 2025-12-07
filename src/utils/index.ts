export * from './data'
export * from './event'
export * from './time'

export function exportFile(
  {
    filename,
    content,
    type = 'text/plain',
  }: {
    filename: string
    content: string | Blob
    type?: string
  },
) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function limitSetSize(set: Set<any>, maxSize: number) {
  for (const value of set) {
    if (set.size <= maxSize)
      break
    set.delete(value)
  }
}

export function sanitizeFilename(filename: string) {
  return filename
    .replace(/\|/g, '丨')
    .replace(/:/g, '：')
    .replace(/[<>"/\\?*]/g, '')
    .trim()
}

export async function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  else {
    const input = document.createElement('input')
    input.value = text
    document.body.appendChild(input)
    input.select()
    const success = document.execCommand('copy')
    document.body.removeChild(input)
    if (!success) {
      throw new Error('复制失败')
    }
  }
}

export function highlightText(text: string, keywords: string[]) {
  if (!keywords.length)
    return text

  const regex = new RegExp(keywords.join('|'), 'gi')
  return text.replace(regex, match => `<em>${match}</em>`)
}
