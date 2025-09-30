import type { PluginOption } from 'vite'
import { execSync } from 'node:child_process'
import process from 'node:process'

function getCommitSha(): string {
  try {
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      return process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 8)
    }

    const fullSha = execSync('git rev-parse HEAD', {
      encoding: 'utf8',
      cwd: process.cwd(),
    }).trim()

    return fullSha.substring(0, 8)
  }
  catch (error) {
    console.warn('failed to get commit SHA:', error)
    return ''
  }
}

const buildInfoPlugin: PluginOption = {
  name: 'build-info-plugin',
  transformIndexHtml(html) {
    const buildDate = new Date().toISOString()
    const commitSha = getCommitSha()
    return html.replace(
      '<body',
      `<body data-build-date="${buildDate}" data-build-commit="${commitSha}"`,
    )
  },
}

export default buildInfoPlugin
