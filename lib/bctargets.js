// ════════════════════════════════════════════════════════════════
// lib/bctargets.js — Shared Broadcast Target Resolver
// Dipakai oleh: broadcast.js, bcscheduled.js, bcbulk.js, bcmediapack.js
//
// PENTING: store.chats adalah instance KeyedDB (@adiwajshing/keyed-db),
// BUKAN plain object. Object.keys(store.chats) akan mengembalikan
// property internal KeyedDB (array, dict, dst), BUKAN daftar JID!
// Harus pakai store.chats.all() yang mengembalikan array of chat
// object berbentuk { id, ... }.
// ════════════════════════════════════════════════════════════════

/**
 * Ambil daftar JID target broadcast.
 * @param {object} alya  - instance socket Baileys
 * @param {object} store - in-memory store dari Baileys (ctx.store)
 * @param {'gc'|'dm'|'all'} mode
 * @returns {Promise<string[]>}
 */
async function getTargetList(alya, store, mode) {
  // ── Grup: pakai groupFetchAllParticipating() — paling akurat & selalu live ──
  let groupIds = [];
  try {
    const groups = await alya.groupFetchAllParticipating();
    groupIds = Object.keys(groups || {});
  } catch {
    try {
      groupIds = (store?.chats?.all?.() || [])
        .filter(c => c?.id?.endsWith('@g.us'))
        .map(c => c.id);
    } catch { groupIds = []; }
  }

  // ── Kontak/DM: dari store.chats (chat yang pernah berinteraksi dengan bot) ──
  let dmIds = [];
  try {
    dmIds = (store?.chats?.all?.() || [])
      .filter(c => c?.id?.endsWith('@s.whatsapp.net'))
      .map(c => c.id);
  } catch { dmIds = []; }

  // Fallback jika store kosong: pakai global.db.chats / global.db.users
  if (dmIds.length === 0) {
    try {
      const fromDb = Object.keys(global.db?.chats || {})
        .filter(id => id.endsWith('@s.whatsapp.net'));
      if (fromDb.length) dmIds = fromDb;
    } catch {}
    if (dmIds.length === 0) {
      try {
        const fromUsers = Object.keys(global.db?.users || {})
          .filter(id => id.endsWith('@s.whatsapp.net'));
        if (fromUsers.length) dmIds = fromUsers;
      } catch {}
    }
  }

  // Dedup
  groupIds = [...new Set(groupIds)];
  dmIds    = [...new Set(dmIds)];

  if (mode === 'gc')  return groupIds;
  if (mode === 'dm')  return dmIds;
  if (mode === 'all') return [...groupIds, ...dmIds];
  return [...groupIds, ...dmIds];
}

module.exports = { getTargetList };
