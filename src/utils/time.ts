export function formatTime(time: number | string, dateOnly: boolean = false) {
  if (typeof time === 'number') {
    if (time.toString().length === 10)
      time *= 1000
  }
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  if (dateOnly) {
    return `${year}-${month}-${day}`
  }
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export function getWeek(date: string) {
  const week = ['日', '一', '二', '三', '四', '五', '六']
  return week[new Date(date).getDay()]
}
