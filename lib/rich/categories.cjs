/**
 * © Kureza MD — Hitoshi MD V1
 * Created by Kureza
 */

// lib/categories.js — satu-satunya sumber nama kategori fitur (menu mode button & rich, folder plugins/<kategori>/, .addfitur).
// Data ada di lib/categories.json: urutan tampil, ikon, label, deskripsi, dan alias (mis. "download" -> "downloader").

'use strict'
const data = require('./categories.json')

const ORDER = data.order
const META = data.meta
const ALIAS = data.alias

// nama kategori apa pun -> nama baku. Kategori yang belum dikenal dibiarkan apa adanya (huruf kecil) supaya fitur custom tetap tampil.
function canon(cat) {
  const c = String(cat || '').trim().toLowerCase()
  if (!c) return 'tools'
  return ALIAS[c] || c
}
const known = (cat) => !!META[canon(cat)]
const iconOf = (cat) => (META[canon(cat)] || {}).icon || '📂'
const labelOf = (cat) => (META[canon(cat)] || {}).label || String(cat).toUpperCase()
const descOf = (cat) => (META[canon(cat)] || {}).desc || `Kumpulan perintah ${String(cat).toLowerCase()}`
// urutan tampil: kategori baku dulu (sesuai ORDER), sisanya (custom) alfabetis di belakang
const sortCats = (list) => [...list].sort((a, b) => {
  const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b)
  return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b)
})

module.exports = { ORDER, META, ALIAS, canon, known, iconOf, labelOf, descOf, sortCats }
