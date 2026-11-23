// lib/sendDynamicMenu.js
//
// Kirim menu interaktif WhatsApp.
//
// Perbaikan: jalur lama merakit `viewOnceMessage > interactiveMessage`
// manual lalu `relayMessage` tanpa node `biz`. Di reinkabaileys (Baileys 7
// RC) tombol baru tampil bila node `biz/native_flow` ikut terkirim — itu
// sebabnya pesan masuk sebagai teks polos tanpa tombol.
// Sekarang memakai MessageBuilder bawaan fork (MB.Button), yang sudah
// menyertakan node `biz` lewat `additionalNodes` saat `send()`.
'use strict';

const { MB } = require('@whiskeysockets/baileys');

// nativeFlowMessage single_select punya batas praktis ~10 rows per section.
const MAX_ROWS_PER_SECTION = 10;

/**
 * Kirim WhatsApp list-menu interaktif.
 * @param {string} chat - JID tujuan (m.chat)
 * @param {string} bodyText - Teks body di atas tombol menu
 * @param {{title: string, sections: Array<{title: string, rows: Array<{title:string, description?:string, id:string}>}>}} listData
 * @param {object} m - objek pesan (untuk quoted reply)
 * @param {object} conn - koneksi alya
 */
async function sendDynamicMenu(chat, bodyText, listData, m, conn) {
  if (!listData || !Array.isArray(listData.sections)) {
    throw new Error('sendDynamicMenu: listData.sections harus berupa array');
  }

  const safeSections = listData.sections.map((sec) => ({
    title: sec.title || '',
    rows: (sec.rows || []).slice(0, MAX_ROWS_PER_SECTION).map((r) => ({
      header: '',
      title: r.title || '',
      description: r.description || '',
      id: r.id,
    })),
  }));

  const builder = new MB.Button(conn)
    .setBody(bodyText || '')
    .addSelection(listData.title || 'LIHAT MENU');

  for (const sec of safeSections) {
    builder.makeSection(sec.title);
    for (const row of sec.rows) {
      builder.makeRow(row.header, row.title, row.description, row.id);
    }
  }

  // MB.Button.send() menambahkan node biz/interactive/native_flow secara
  // eksplisit lewat additionalNodes — inilah yang bikin tombol tampil.
  return await builder.send(chat, m ? { quoted: m } : {});
}

module.exports = { sendDynamicMenu };
