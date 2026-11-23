// Plugin: autoco
// Auto-generated from Alya V12
// Commands: autoco

const path = require('path')

module.exports = {
  command: ["autoco"],
  tags: ['general'],
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
      waifuList, husbuList, pler, setting, user
    } = ctx

        if (!m.isGroup) return replytolak("❗ *Fitur ini hanya bisa digunakan di grup.*");
        if (!isAdmins && !Ryuu) return replytolak("🔒 *Perintah ini hanya bisa digunakan oleh admin grup atau owner bot.*");

        const groupId = m.chat;

        if (!autoCloseDB[groupId]) {
            autoCloseDB[groupId] = {
                status: false,
                tutup: '',
                buka: ''
            };
        }

        if (args[0] === 'on') {
            if (!autoCloseDB[groupId].tutup || !autoCloseDB[groupId].buka) {
                autoCloseDB[groupId].status = false;
                saveAutoClose();
                return replyalya(`⚠️ *Jadwal belum disetel!*\n\nGunakan format:\n.autoco set 22:00|06:00`);
            }

            autoCloseDB[groupId].status = true;
            saveAutoClose();
            return replyalya(`✅ *Auto Close/Open Diaktifkan!*\n\n📌 Jadwal Saat Ini:\n🔒 Tutup: *${autoCloseDB[groupId].tutup} WIB*\n🔓 Buka: *${autoCloseDB[groupId].buka} WIB*`);
        }

        else if (args[0] === 'off') {
            autoCloseDB[groupId].status = false;
            saveAutoClose();
            return replyalya(`🔴 *Auto Close/Open Dinonaktifkan!*`);
        }

        // 🗑️ .autoco del
        else if (args[0] === 'del') {
            if (!autoCloseDB[groupId]) {
                return replyalya(`⚠️ *Grup ini belum memiliki data Auto Close.*`);
            }
            delete autoCloseDB[groupId];
            saveAutoClose();
            return replyalya(`🗑️ *Data Auto Close grup ini berhasil dihapus!*\n🔕 Auto Close otomatis dinonaktifkan.`);
        }

        // 🕓 .autoco set 22:00|06:00
        else if (args[0] === 'set') {
            if (!args[1] || !args[1].includes('|')) {
                return replyalya(`❗ *Format salah!*\n\nContoh:\n.autoco set 22:00|06:00`);
            }

            const [jamTutup, jamBuka] = args[1].split('|').map(x => x.trim());
            const isValidTime = str => /^([01]\d|2[0-3]):([0-5]\d)$/.test(str);

            if (!isValidTime(jamTutup) || !isValidTime(jamBuka)) {
                return replyalya(`⚠️ *Format jam salah!*\nGunakan format 24 jam, contoh:\n.autoco set 22:00|06:00`);
            }

            const jadwalLama = `🔒 Tutup: *${autoCloseDB[groupId].tutup || '-'}*\n🔓 Buka: *${autoCloseDB[groupId].buka || '-' }*`;

            autoCloseDB[groupId].tutup = jamTutup;
            autoCloseDB[groupId].buka = jamBuka;

            try {
                saveAutoClose();
                return replyalya(`📆 *Jadwal Auto Close Diperbarui!*

    🆕 *Jadwal Baru:*
    🔒 Tutup: *${jamTutup} WIB*
    🔓 Buka: *${jamBuka} WIB*

    🗂️ *Jadwal Sebelumnya:*
    ${jadwalLama}

    ✅ Ketik *.autoco on* untuk mulai mengaktifkan.`);
            } catch (e) {
                console.error('❗ Gagal menyimpan:', e.message);
                return replyalya(`❌ *Gagal menyimpan jadwal!*\nPeriksa izin file autoco.json.`);
            }
        }

        // 📋 .autoco
        else {
            return replyalya(`📌 *Menu Auto Close/Open Grup*

    🕓 *.autoco set <tutup>|<buka>*
    Contoh: *.autoco set 22:00|06:00*

    🟢 *.autoco on* – Aktifkan
    🔴 *.autoco off* – Nonaktifkan
    🗑️ *.autoco del* – Hapus data grup ini`);
        }
  }
}
