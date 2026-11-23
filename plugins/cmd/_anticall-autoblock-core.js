// Core: anticallbot + autoblockbot listener registration
// Dipakai bersama oleh plugins/cmd/anticallbot.js dan plugins/cmd/autoblockbot.js
// supaya listener HANYA didaftarkan sekali per proses bot, walau kedua
// plugin dimuat/dijalankan terpisah.
//
// PENTING: Handler lama untuk fitur ini di index.js ('call' listener) dan
// alya.js (blok AUTOBLOCKBOT) sudah DINONAKTIFKAN (dikomentari) supaya tidak
// terjadi reject/block dobel. File ini sekarang menjadi satu-satunya sumber
// eksekusi untuk kedua fitur.

'use strict';

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', '..', 'database', 'anticall-autoblock.json');

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    }
  } catch (_) {}
  return { anticall: false, autoblockbot: false, whitelist: [] };
}

function saveStore(data) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[anticallbot/autoblockbot] Gagal menyimpan store:', err.message);
  }
}

function normalizeJid(jidOrNumber) {
  if (!jidOrNumber) return '';
  return String(jidOrNumber).includes('@') ? jidOrNumber : `${jidOrNumber}@s.whatsapp.net`;
}

// ------------------------------------------------------------------
// Listener registration — hanya dipasang SEKALI per proses bot,
// walaupun dipanggil dari dua plugin berbeda (anticallbot.js & autoblockbot.js)
// dan walaupun plugin di-reload berkali-kali oleh loader command.
// ------------------------------------------------------------------
function registerListenersOnce(alya) {
  if (!alya || alya._anticallAutoblockRegistered) return;
  alya._anticallAutoblockRegistered = true;

  // --- Anti Call: auto-reject + auto-block penelepon ---
  alya.ev.on('call', async (calls) => {
    const store = loadStore();
    if (!store.anticall) return;

    for (const call of calls) {
      if (call.status !== 'offer') continue; // hanya proses panggilan masuk, bukan status lain

      const callerJid = call.from;
      const callerNum = (callerJid || '').split('@')[0];
      const isOwnerCaller = Array.isArray(global.owner) && global.owner.includes(callerNum);
      if (isOwnerCaller) continue; // owner tidak pernah direject/diblokir

      try {
        await alya.rejectCall(call.id, callerJid);
      } catch (err) {
        console.error('[anticallbot] Gagal menolak panggilan:', err.message);
      }

      try {
        await alya.updateBlockStatus(callerJid, 'block');
      } catch (err) {
        console.error('[anticallbot] Gagal memblokir penelepon:', err.message);
      }

      console.log(`[anticallbot] Menolak & memblokir panggilan dari ${callerJid}`);
    }
  });

  // --- Auto Block DM: blokir siapapun yang chat pribadi ke bot ---
  alya.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const store = loadStore();
    if (!store.autoblockbot) return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;

      const chatJid = msg.key.remoteJid;
      const senderJid = msg.key.participant || chatJid;

      const isGroup = chatJid.endsWith('@g.us');
      const isStatus = chatJid === 'status@broadcast';
      if (isGroup || isStatus) continue; // hanya proses chat pribadi

      const ownerJids = (global.owner || []).map((o) => normalizeJid(Array.isArray(o) ? o[0] : o));
      const whitelist = (store.whitelist || []).map(normalizeJid);
      const isExempt = ownerJids.includes(senderJid) || whitelist.includes(senderJid);
      if (isExempt) continue;

      try {
        await alya.sendMessage(chatJid, {
          text: '⚠️ Bot ini tidak menerima chat pribadi. Nomor kamu akan diblokir.',
        });
      } catch (_) {}

      try {
        await alya.updateBlockStatus(senderJid, 'block');
        console.log(`[autoblockbot] Memblokir ${senderJid} karena DM pribadi.`);
      } catch (err) {
        console.error('[autoblockbot] Gagal memblokir pengirim:', err.message);
      }
    }
  });
}

module.exports = { loadStore, saveStore, normalizeJid, registerListenersOnce };
