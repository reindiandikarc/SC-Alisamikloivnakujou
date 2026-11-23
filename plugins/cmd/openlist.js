// Plugin: openlist
// Commands: openlist
// Deskripsi: Kirim pesan dengan button list yang mengarah ke addlist per-grup
// Penggunaan: .openlist key|response pesan

const path = require('path')
const fs = require('fs')

// ── Helper: baca & tulis db openlist (terpisah dari list-message.json) ──────
const DB_PATH = './database/openlist-db.json'

function readOpenListDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2))
      return []
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(raw) || []
  } catch (e) {
    return []
  }
}

function writeOpenListDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

function getGroupEntries(groupId, db) {
  return db.filter(x => x.groupId === groupId)
}

function entryExists(groupId, key, db) {
  return db.some(x => x.groupId === groupId && x.key === key.toLowerCase())
}

function addEntry(groupId, key, responseText, db) {
  db.push({ groupId, key: key.toLowerCase(), response: responseText })
  writeOpenListDB(db)
}

function deleteEntry(groupId, key, db) {
  const idx = db.findIndex(x => x.groupId === groupId && x.key === key.toLowerCase())
  if (idx === -1) return false
  db.splice(idx, 1)
  writeOpenListDB(db)
  return true
}

// ── Module Export ─────────────────────────────────────────────────────────────
module.exports = {
  command: ['openlist', 'addopenlist', 'delopenlist', 'liststore'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user,
      db_respon_list
    } = ctx

    // Semua command ini khusus grup
    if (!m.isGroup) return replytolak('❌ Fitur ini khusus untuk grup!')

    const groupId = m.chat
    const db = readOpenListDB()

    // ══════════════════════════════════════════════════════════════
    // .openlist key|teks pesan
    // Mengirim pesan disertai tombol list yang isinya item addlist grup ini
    // ══════════════════════════════════════════════════════════════
    if (command === 'openlist') {
      if (!q || !q.includes('|')) {
        return reply(
          `╔═══ 📋 *OPENLIST* ═══╗\n` +
          `┃\n` +
          `┣ Cara pakai:\n` +
          `┣ *${prefix}openlist key|teks pesan*\n` +
          `┃\n` +
          `┣ Contoh:\n` +
          `┣ *${prefix}openlist menu|Pilih produk kami:*\n` +
          `┃\n` +
          `┣ 💡 *key* = nama tombol di list\n` +
          `┣ 💡 *teks* = pesan yang dikirim\n` +
          `┃\n` +
          `┣ Tombol list otomatis mengarah ke\n` +
          `┗ item yang sudah di-*addopenlist*`
        )
      }

      const key = q.split('|')[0].trim().toLowerCase()
      const pesanTeks = q.split('|').slice(1).join('|').trim()

      if (!pesanTeks) return reply(`❌ Teks pesan tidak boleh kosong!\n\nContoh: *${prefix}openlist ${key}|Halo! Pilih menu di bawah ini:*`)

      // Ambil semua item addlist dari grup ini (dari db_respon_list global)
      // Ini terintegrasi dengan .addlist yang sudah ada
      const grupItems = typeof db_respon_list !== 'undefined'
        ? db_respon_list.filter(x => x.id === groupId)
        : []

      // Juga ambil dari openlist-db untuk item tambahan via .addopenlist
      const openItems = getGroupEntries(groupId, db)

      // Gabung kedua sumber, tambahkan key dari openlist khusus
      const rows = []

      // Item dari .addlist (list-message.json) — tampil di button
      for (const item of grupItems) {
        rows.push({
          title: item.key.toUpperCase(),
          description: item.response && item.response.length > 40
            ? item.response.substring(0, 40) + '...'
            : (item.response || ''),
          id: item.key
        })
      }

      // Item tambahan dari .addopenlist (openlist-db.json)
      for (const item of openItems) {
        // Hindari duplikat key
        if (!rows.some(r => r.id === item.key)) {
          rows.push({
            title: item.key.toUpperCase(),
            description: item.response && item.response.length > 40
              ? item.response.substring(0, 40) + '...'
              : (item.response || ''),
            id: item.key
          })
        }
      }

      if (rows.length === 0) {
        return reply(
          `⚠️ Belum ada item list di grup ini!\n\n` +
          `Tambahkan dulu dengan:\n` +
          `*${prefix}addopenlist key|respons*\n` +
          `atau\n` +
          `*${prefix}addlist key|respons*`
        )
      }

      const listPayload = {
        title: `📋 ${key.toUpperCase()}`,
        sections: [
          {
            title: `Daftar Menu — ${groupName || 'Grup'}`,
            highlight_label: '',
            rows: rows
          }
        ]
      }

      // Kirim pakai listbut2 (fungsi global Alya)
      if (typeof listbut2 === 'function') {
        await listbut2(m.chat, pesanTeks, listPayload, m)
      } else {
        // Fallback: kirim pakai sendMessage langsung
        await alya.sendMessage(m.chat, {
          text: pesanTeks,
          footer: `📋 Ketik salah satu key untuk melihat isinya`,
          buttons: rows.slice(0, 3).map(r => ({
            buttonId: r.id,
            buttonText: { displayText: r.title },
            type: 1
          })),
          headerType: 1
        }, { quoted: m })
      }

      return
    }

    // ══════════════════════════════════════════════════════════════
    // .addopenlist key|respons
    // Tambah item ke openlist khusus grup ini
    // ══════════════════════════════════════════════════════════════
    if (command === 'addopenlist') {
      if (!isAdmins) return replytolak('❌ Fitur khusus Admin!')

      if (!q || !q.includes('|')) {
        return reply(
          `╔═══ ➕ *ADDOPENLIST* ═══╗\n` +
          `┃\n` +
          `┣ Cara pakai:\n` +
          `┣ *${prefix}addopenlist key|respons*\n` +
          `┃\n` +
          `┣ Contoh:\n` +
          `┣ *${prefix}addopenlist kaos|Kami jual kaos premium\\nHarga: 75rb*\n` +
          `┃\n` +
          `┣ 💡 *key* = nama yang muncul di tombol list\n` +
          `┗ 💡 *respons* = pesan saat key dipilih`
        )
      }

      const key = q.split('|')[0].trim().toLowerCase()
      const respons = q.split('|').slice(1).join('|').trim()

      if (!key || !respons) return reply(`❌ Key dan respons tidak boleh kosong!`)
      if (key.length > 24) return reply(`❌ Key terlalu panjang! Maksimal 24 karakter.`)

      if (entryExists(groupId, key, db)) {
        return reply(
          `⚠️ Key *${key}* sudah ada di grup ini!\n\n` +
          `Gunakan *${prefix}delopenlist ${key}* untuk menghapusnya dulu.`
        )
      }

      addEntry(groupId, key, respons, db)

      return reply(
        `✅ *Berhasil tambah item openlist!*\n\n` +
        `🔑 Key : *${key}*\n` +
        `📝 Respons : ${respons.length > 60 ? respons.substring(0, 60) + '...' : respons}\n\n` +
        `_Tampilkan list dengan: ${prefix}openlist ${key}|teks pesan_`
      )
    }

    // ══════════════════════════════════════════════════════════════
    // .delopenlist key
    // Hapus item openlist dari grup ini
    // ══════════════════════════════════════════════════════════════
    if (command === 'delopenlist') {
      if (!isAdmins) return replytolak('❌ Fitur khusus Admin!')

      if (!q) {
        return reply(
          `╔═══ 🗑️ *DELOPENLIST* ═══╗\n` +
          `┃\n` +
          `┣ Cara pakai:\n` +
          `┗ *${prefix}delopenlist key*\n\n` +
          `Contoh: *${prefix}delopenlist kaos*`
        )
      }

      const key = q.trim().toLowerCase()

      if (!entryExists(groupId, key, db)) {
        return reply(`❌ Key *${key}* tidak ditemukan di grup ini!`)
      }

      deleteEntry(groupId, key, db)
      return reply(`✅ Item *${key}* berhasil dihapus dari openlist grup ini.`)
    }

    // ══════════════════════════════════════════════════════════════
    // .liststore
    // Tampilkan semua item openlist yang terdaftar di grup ini
    // ══════════════════════════════════════════════════════════════
    if (command === 'liststore') {
      // Ambil dari openlist-db
      const openItems = getGroupEntries(groupId, db)

      // Ambil juga dari addlist (db_respon_list global)
      const listItems = typeof db_respon_list !== 'undefined'
        ? db_respon_list.filter(x => x.id === groupId)
        : []

      const totalOpen = openItems.length
      const totalList = listItems.length
      const totalAll = totalOpen + totalList

      if (totalAll === 0) {
        return reply(
          `📭 *Belum ada item tersimpan di grup ini!*\n\n` +
          `Tambahkan dengan:\n` +
          `• *${prefix}addopenlist key|respons* — untuk openlist\n` +
          `• *${prefix}addlist key|respons* — untuk list biasa`
        )
      }

      let teks = `╔════ 🏪 *LISTSTORE GRUP* ════╗\n`
      teks += `┃ Grup : *${groupName || groupId}*\n`
      teks += `┃ Total item : *${totalAll}*\n`
      teks += `╠══════════════════════════════╣\n`

      if (totalOpen > 0) {
        teks += `┃\n`
        teks += `┣ 📋 *OPENLIST* (${totalOpen} item)\n`
        teks += `┃ ─────────────────────────\n`
        openItems.forEach((item, i) => {
          const preview = item.response.length > 35
            ? item.response.substring(0, 35) + '...'
            : item.response
          teks += `┃ ${i + 1}. 🔑 *${item.key}*\n`
          teks += `┃    └ ${preview}\n`
        })
      }

      if (totalList > 0) {
        teks += `┃\n`
        teks += `┣ 📝 *ADDLIST* (${totalList} item)\n`
        teks += `┃ ─────────────────────────\n`
        listItems.forEach((item, i) => {
          const preview = (item.response || '').length > 35
            ? (item.response || '').substring(0, 35) + '...'
            : (item.response || '')
          teks += `┃ ${i + 1}. 🔑 *${item.key}*\n`
          teks += `┃    └ ${item.isImage ? '🖼️ Gambar' : preview}\n`
        })
      }

      teks += `┃\n`
      teks += `╠══════════════════════════════╣\n`
      teks += `┃ Cara pakai:\n`
      teks += `┃ • *${prefix}openlist key|pesan* — tampil list button\n`
      teks += `┃ • *${prefix}addopenlist key|respons* — tambah item\n`
      teks += `┃ • *${prefix}delopenlist key* — hapus item\n`
      teks += `┃ • *${prefix}dellist key* — hapus item addlist\n`
      teks += `╚══════════════════════════════╝`

      return reply(teks)
    }
  }
}
