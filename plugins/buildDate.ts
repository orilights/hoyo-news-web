import type { PluginOption } from 'vite'

const buildDatePlugin: PluginOption = {
  name: 'build-date-plugin',
  transformIndexHtml(html) {
    const buildDate = new Date().toISOString()
    return html.replace(
      '<body',
      `<body data-build-date="${buildDate}"`,
    )
  },
}

export default buildDatePlugin
