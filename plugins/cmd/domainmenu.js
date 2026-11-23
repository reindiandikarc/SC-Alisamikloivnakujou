// Plugin: domainmenu
// Fixed for Alya V20 + Ourin-style buttons
// Commands: aio, domainmenu

const path = require('path')

module.exports = {
  command: ["aio", "domainmenu"],
  tags: ['panel'],
  run: async (alya, m, ctx) => {
    const {
      prefix, sender, pushname,
      reply, replyalya,
      listbut3
    } = ctx

    const AlyaSad = `╔════════ • 🌐 *DOMAIN MENU* • ════════╗
┃
┣⊱ 🌐 *${prefix}subdomain* - Buat subdomain gratis
┣⊱ 🔍 *${prefix}cekdomain* - Cek ketersediaan domain
┣⊱ 🗑️ *${prefix}deldomain* - Hapus subdomain
┃
╚════════════════════════════════════╝`

    const sections = [
      {
        title: '🌐 PANEL & HOSTING',
        rows: [
          { title: '🌐 DOMAIN MENU', description: 'Fitur create subdomain', id: `${prefix}domainmenu` },
          { title: '🛠️ CPANEL MENU', description: 'Fitur create panel', id: `${prefix}cpanelmenu` },
          { title: '⚙️ PTERODACTYL', description: 'Fitur manajemen Pterodactyl', id: `${prefix}pyterodactylemenu` },
          { title: '🌊 DIGITAL OCEAN', description: 'Fitur manajemen Digital Ocean', id: `${prefix}digitaloceanmenu` }
        ]
      },
      {
        title: '🌟 MENU UTAMA',
        rows: [
          { title: '🏠 MENU UTAMA', description: 'Kembali ke menu utama', id: `${prefix}menu` },
          { title: '📦 SEMUA FITUR', description: 'Tampilkan semua list perintah bot', id: `${prefix}allmenu` }
        ]
      }
    ]

    const listnye = { title: 'NAVIGASI', sections }
    await listbut3(m.chat, AlyaSad, listnye, m)
  }
}
