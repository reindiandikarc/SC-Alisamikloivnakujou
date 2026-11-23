// Plugin: obfuscate
// Commands: obfus, enc, obfuscate
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['obfus', 'enc', 'obfuscate'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!q) return replyalya(`Example ${prefix+command} const xeonbot = require('@whiskeysockets/baileys')`)

    try {
      const JavaScriptObfuscator = require('javascript-obfuscator')
      const obfuscationResult = JavaScriptObfuscator.obfuscate(q, {
        compact: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1
      })
      replyalya(`Success\n${obfuscationResult.getObfuscatedCode()}`)
    } catch (e) {
      console.error('[obfuscate] error:', e?.message || e)
      replyalya(`❌ Gagal mengobfuscate kode.\n_${e?.message || ''}_`)
    }
  }
};
