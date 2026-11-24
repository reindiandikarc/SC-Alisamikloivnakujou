'use strict';

const { runAIInteractive, resolveAIPrompt } = require('../../machine/interactive_ai');
const { isVpsStatusQuery, getVpsStatus, formatVpsStatus } = require('../../lib/vps-status');

module.exports = {
  command: ['ai', 'alya'],
  tags   : ['ai'],
  run    : async (alya, m, ctx) => {
    if (m.key.fromMe || m.isBaileys) return;

    const { text, pushname, replyalya, prefix, botNumber } = ctx;
    const userText = typeof text === 'string' ? text : '';

    if (isVpsStatusQuery(userText)) {
      console.log('[VPS] .ai status query -> jawaban lokal');
      return replyalya(formatVpsStatus(getVpsStatus({ socket: alya }), { prefix }));
    }

    const engine = typeof ctx.runAIInteractive === 'function' ? ctx.runAIInteractive : runAIInteractive;
    const rawLid = alya.user?.lid || '';
    const botLid = typeof alya.decodeJid === 'function' ? alya.decodeJid(rawLid) : rawLid;
    const prompt = resolveAIPrompt(m, userText, botNumber || '', botLid);

    return engine({
      body     : prompt.text,
      m        : m,
      alya     : alya,
      from     : ctx.from || m.chat,
      sender   : ctx.sender || m.sender,
      pushname : pushname || m.pushName,
      isGroup  : !!(m.isGroup ?? ctx.isGroup),
    });
  },
};
