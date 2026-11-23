import { CHAT, logger } from '../../_runtime/core-shim.js'

const API = 'https://api.github.com'
const UA = 'LuminarisMD-GitHubDownloader/1.0'

export function parseGitHubInput(args = []) {
  const first = String(args[0] || '').trim()
  let username = ''
  let repo = ''
  let branch = ''

  if (/github\.com\//i.test(first)) {
    const match = first.match(/github\.com\/([^/?#]+)\/([^/?#]+)/i)
    if (match) {
      username = match[1]
      repo = match[2].replace(/\.git$/i, '')
    }

    const tree = first.match(/github\.com\/[^/]+\/[^/]+\/tree\/([^?#]+)/i)
    if (tree) branch = decodeURIComponent(tree[1])
    else branch = String(args[1] || '').trim()
  } else {
    username = first
    repo = String(args[1] || '').trim()
    branch = String(args[2] || '').trim()
  }

  return { username, repo, branch }
}

function validName(value) {
  return /^[A-Za-z0-9_.-]+$/.test(value)
}

function formatSize(kilobytes) {
  const size = Number(kilobytes) || 0
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} GB`
  if (size >= 1024) return `${(size / 1024).toFixed(2)} MB`
  return `${size} KB`
}

function helpText(prefix) {
  return [
    '📥 *GITHUB DOWNLOADER*',
    'Unduh repository GitHub sebagai file ZIP.',
    '',
    '*Cara pakai*',
    `• ${prefix}githubdl <user> <repo> [branch]`,
    `• ${prefix}githubdl <link-repo>`,
    `• ${prefix}githubdl <link-repo/tree/branch>`,
    '',
    '*Contoh*',
    `> ${prefix}githubdl niceplugin NiceBot main`,
    `> ${prefix}githubdl https://github.com/user/repo`,
    `> ${prefix}githubdl https://github.com/user/repo/tree/dev`,
    '',
    '_Kalau branch tidak diisi, branch default repository yang dipakai._'
  ].join('\n')
}

function archiveUrl(username, repo, branch) {
  // Slash pada nama branch (mis. feature/foo) tetap dipertahankan.
  const encodedBranch = encodeURIComponent(branch).replace(/%2F/gi, '/')
  return `https://github.com/${username}/${repo}/archive/refs/heads/${encodedBranch}.zip`
}

export default {
  name: 'githubdl',
  command: ['githubdl', 'gitdl', 'gitclone', 'repodownload'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Unduh repository GitHub sebagai ZIP',

  async handle(ctx) {
    const prefix = ctx.prefix || '!'
    const parsed = parseGitHubInput(ctx.args)

    if (!parsed.username) return ctx.reply(helpText(prefix))
    if (!parsed.repo) {
      return ctx.reply([
        '❌ *Nama repository belum diisi.*',
        '',
        `Contoh: *${prefix}githubdl user repo main*`,
        `Atau: *${prefix}githubdl https://github.com/user/repo*`
      ].join('\n'))
    }

    if (!validName(parsed.username) || !validName(parsed.repo)) {
      return ctx.reply('❌ *Nama user atau repository tidak valid.*')
    }
    if (parsed.branch && /[\r\n]/.test(parsed.branch)) {
      return ctx.reply('❌ *Nama branch tidak valid.*')
    }

    await ctx.reply.react('⏳')
    await ctx.reply('⏳ *Mengambil informasi repository...*')

    try {
      const repoRes = await fetch(`${API}/repos/${encodeURIComponent(parsed.username)}/${encodeURIComponent(parsed.repo)}`, {
        headers: {
          accept: 'application/vnd.github+json',
          'user-agent': UA
        },
        signal: AbortSignal.timeout(30_000)
      })

      if (repoRes.status === 404) {
        await ctx.reply.react('❌')
        return ctx.reply(`❌ *Repository tidak ditemukan.*\n\n> \`${parsed.username}/${parsed.repo}\``)
      }
      if (repoRes.status === 403) {
        await ctx.reply.react('❌')
        return ctx.reply('❌ *Batas akses GitHub API tercapai.*\n\n> Coba lagi beberapa saat lagi.')
      }
      if (!repoRes.ok) {
        await ctx.reply.react('❌')
        return ctx.reply(`❌ *Gagal mengambil data repository* (HTTP ${repoRes.status}).`)
      }

      const repoData = await repoRes.json()
      const branch = parsed.branch || repoData.default_branch || 'main'
      const zipUrl = archiveUrl(parsed.username, parsed.repo, branch)

      const check = await fetch(zipUrl, {
        method: 'HEAD',
        headers: { 'user-agent': UA },
        redirect: 'follow',
        signal: AbortSignal.timeout(30_000)
      })

      if (!check.ok) {
        await ctx.reply.react('❌')
        return ctx.reply([
          '❌ *Branch tidak ditemukan.*',
          '',
          `> Branch: \`${branch}\``,
          `> Branch default: \`${repoData.default_branch || 'main'}\``
        ].join('\n'))
      }

      const description = String(repoData.description || '').trim()
      const text = [
        '📥 *GITHUB DOWNLOAD*',
        '',
        '╭──〔 📦 *REPOSITORY* 〕──⬣',
        `│ 📁 ${repoData.full_name}`,
        `│ 📝 ${description ? description.slice(0, 100) : '-'}`,
        `│ 🌿 Branch: ${branch}`,
        `│ ⭐ Stars: ${repoData.stargazers_count ?? 0}`,
        `│ 🍴 Forks: ${repoData.forks_count ?? 0}`,
        `│ 📏 Ukuran: ${formatSize(repoData.size)}`,
        '╰────────────────⬣',
        '',
        '⏳ *Mengirim file ZIP...*'
      ].join('\n')

      await ctx.reply(text)

      const safeBranch = branch.replace(/[^A-Za-z0-9_.-]+/g, '-')
      await ctx.sock.sendMessage(ctx.chat, {
        document: { url: zipUrl },
        fileName: `${parsed.repo}-${safeBranch}.zip`,
        mimetype: 'application/zip',
        caption: `📦 *${repoData.full_name}*\n🌿 Branch: ${branch}`
      }, { quoted: ctx.msg })

      await ctx.reply.react('✅')
    } catch (error) {
      logger.error('githubdl: gagal mengunduh repository', error)
      await ctx.reply.react('❌')
      await ctx.reply([
        '❌ *Gagal mengunduh repository.*',
        '',
        `> ${error.message}`,
        '',
        '> Pastikan repository publik dan koneksi stabil.'
      ].join('\n'))
    }
  }
}

export const __test = {
  parseGitHubInput,
  archiveUrl,
  formatSize
}
