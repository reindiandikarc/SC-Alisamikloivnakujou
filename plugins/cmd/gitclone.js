// Plugin: gitclone
// Commands: git, github, gitclone
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['git', 'github', 'gitclone'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!args[0]) return replyalya(`Mana linknya?\nExample :\n${prefix}${command} https://github.com/DGXeon/XeonMedia`)
    if (!isUrl(args[0]) && !args[0].includes('github.com')) return replyalya(`Link invalid!!`)

    const regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
    const match = args[0].match(regex1)
    if (!match) return replyalya(`Link invalid!!`)

    const user = match[1]
    const repo = match[2].replace(/\.git$/, '')
    const url = `https://api.github.com/repos/${user}/${repo}/zipball`

    try {
      const headRes = await fetch(url, { method: 'HEAD' })
      const disposition = headRes.headers.get('content-disposition')
      const filenameMatch = disposition?.match(/attachment; filename=(.*)/)
      const filename = filenameMatch ? filenameMatch[1] : `${repo}-main`

      await alya.sendMessage(m.chat, { document: { url: url }, fileName: filename + '.zip', mimetype: 'application/zip' }, { quoted: m })
    } catch (err) {
      console.error('[gitclone] error:', err?.message || err)
      replyalya(mess.error || `❌ Gagal mengambil repo "${user}/${repo}". Pastikan repo ada dan public.`)
    }
  }
};
