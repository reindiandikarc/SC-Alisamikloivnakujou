// Plugin: ailimit
// Kelola daily limit AI interaktif
// Commands: ailimit, resetailimit, cekailimit
// Author  : Generated for Alya V13

module.exports = {
  command: ['ailimit', 'resetailimit', 'cekailimit'],
  tags: ['owner', 'ai'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, prefix, q,
      sender, from, pushname,
      Ryuu, isPrem,
      reply, replyalya, replytolak,
      getDailyInfo, resetDailyLimit, DAILY_LIMIT_FREE, isPremiumUser,
      senderNumber,
    } = ctx;

    // ── .cekailimit ────────────────────────────────────────────
    if (command === 'cekailimit') {
      const target = m.quoted?.sender || sender;
      const name   = target === sender ? (pushname || 'Kamu') : target.split('@')[0];
      const info   = getDailyInfo(target);
      const prem   = isPremiumUser(target);
      const sisa   = prem ? '∞ (Premium)' : `${Math.max(0, DAILY_LIMIT_FREE - info.count)} / ${DAILY_LIMIT_FREE}`;

      return replyalya(
        `╭─「 📊 *CEK LIMIT AI HARIAN* 」\n` +
        `│\n` +
        `│ 👤 User     : ${name}\n` +
        `│ 💬 Dipakai  : ${prem ? '—' : info.count + 'x'}\n` +
        `│ ✨ Sisa     : ${sisa}\n` +
        `│ 💎 Premium  : ${prem ? 'Ya ✅' : 'Tidak ❌'}\n` +
        `│ 🔄 Reset    : Tiap tengah malam WIB\n` +
        `╰──────────────────`
      );
    }

    // ── .resetailimit ─────────────────────────────────────────
    if (command === 'resetailimit') {
      if (!Ryuu) return replytolak('Fitur khusus owner!');

      // Target: reply / mention / arg nomor
      let target = sender;
      let targetName = 'Diri sendiri';
      if (m.quoted?.sender) {
        target     = m.quoted.sender;
        targetName = target.split('@')[0];
      } else if (args[0]?.match(/^\d+/)) {
        target     = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        targetName = args[0];
      }

      resetDailyLimit(target);

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      return replyalya(
        `✅ *Limit AI harian direset!*\n\n` +
        `👤 User: ${targetName}\n` +
        `💬 Sisa: ${DAILY_LIMIT_FREE} / ${DAILY_LIMIT_FREE}\n\n` +
        `_User sekarang bisa chat AI lagi hari ini._`
      );
    }

    // ── .ailimit (info / config) ──────────────────────────────
    const info = getDailyInfo(sender);
    const prem = isPremiumUser(sender);
    const sisa = prem ? '∞ (Premium)' : `${Math.max(0, DAILY_LIMIT_FREE - info.count)}`;

    replyalya(
      `╭─「 ⏰ *AI CHAT LIMIT* 」\n` +
      `│\n` +
      `│ 👤 *${pushname || 'User'}*\n` +
      `│ 💬 Dipakai  : ${prem ? '—' : info.count + 'x hari ini'}\n` +
      `│ ✨ Sisa     : ${sisa} chat\n` +
      `│ 📏 Max/hari : ${DAILY_LIMIT_FREE}x (free)\n` +
      `│ 💎 Premium  : ${prem ? 'Aktif ✅ (Unlimited)' : 'Tidak aktif ❌'}\n` +
      `│\n` +
      `│ 🔄 Reset setiap tengah malam WIB\n` +
      `│\n` +
      `${!prem ? `│ 💡 Upgrade *Premium* untuk chat AI tanpa batas!\n│ Hubungi owner untuk info premium.\n` : '│ ✨ Kamu sudah premium! Enjoy unlimited AI~\n'}` +
      `╰──────────────────`
    );
  }
};
