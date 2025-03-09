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
