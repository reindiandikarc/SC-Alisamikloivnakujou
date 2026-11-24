/**
 * © Kureza MD — Hitoshi MD V1
 * Created by Kureza
 */

// =====================================================================
//  lib/theme.js — TEMA tampilan bot (tersimpan, ganti lewat chat tanpa restart: .tema)
//
//   rich   : tema warna kartu HTML (aurora, sunset, ocean, ...)
//   unify  : true = semua kartu rich pakai warna tema (false = warna per kategori seperti biasa)
//
//  Pilihan tersimpan di database/uitheme.json (menang atas settings.js: global.uiTheme / global.uiFrame).
// =====================================================================

'use strict'

const fs = require('fs')
const path = require('path')
const { createStore } = require('./store.cjs')

const store = createStore('uitheme', { rich: '', unify: null })

// accent = [warna1, warna2] (gradien utama) • glow = warna cahaya latar • deep = warna dasar kartu
// css (opsional) = gaya tambahan khusus tema, disisipkan setelah CSS bawaan kartu • unify:true = semua kartu pakai warna tema ini
const RICH = {
  aurora: { name: 'Aurora', emoji: '🌌', accent: ['#7c5cff', '#00d4ff'], glow: ['#7c5cff', '#00d4ff', '#ff5ecb'], deep: '#0d0a16' },
  sunset: { name: 'Sunset', emoji: '🌇', accent: ['#ff7a45', '#ff3d81'], glow: ['#ff7a45', '#ff3d81', '#ffd200'], deep: '#160a0e' },
  ocean: { name: 'Ocean', emoji: '🌊', accent: ['#00c6ff', '#0072ff'], glow: ['#00c6ff', '#0072ff', '#2dd4bf'], deep: '#06101a' },
  emerald: { name: 'Emerald', emoji: '🍀', accent: ['#22c55e', '#2dd4bf'], glow: ['#22c55e', '#2dd4bf', '#a3e635'], deep: '#06130e' },
  sakura: { name: 'Sakura', emoji: '🌸', accent: ['#ff8fb8', '#c084fc'], glow: ['#ff8fb8', '#c084fc', '#fda4af'], deep: '#160b14' },
  gold: { name: 'Royal Gold', emoji: '👑', accent: ['#f7b733', '#fc4a1a'], glow: ['#f7b733', '#fc4a1a', '#ffe27a'], deep: '#150f06' },
  ruby: { name: 'Ruby', emoji: '💎', accent: ['#ff416c', '#ff4b2b'], glow: ['#ff416c', '#ff4b2b', '#a855f7'], deep: '#16080b' },
  mono: { name: 'Mono Neon', emoji: '🖤', accent: ['#e5e7eb', '#9ca3af'], glow: ['#e5e7eb', '#6b7280', '#38bdf8'], deep: '#0a0a0c' },
  // ---- tema gelap bergaya neraka ----
  neraka: {
    name: 'Neraka (Hellfire)', emoji: '🔥', accent: ['#ff2a12', '#ff9100'], glow: ['#ff2a12', '#ff9100', '#7a0010'], deep: '#080102', unify: true,
    css: ':root{--muted:#c9a39b}.card{box-shadow:0 0 0 1px rgba(255,60,25,.38),0 0 36px rgba(255,35,10,.3),0 26px 56px rgba(0,0,0,.75)}.card::after{box-shadow:inset 0 1px 0 rgba(255,140,90,.28),inset 0 -40px 60px rgba(255,40,10,.1),inset 0 0 50px rgba(120,0,0,.2)}.veil{background:linear-gradient(180deg,rgba(34,3,3,.5) 0%,rgba(16,1,2,.86) 38%,rgba(6,0,1,.98) 100%)}.grid{background-image:repeating-linear-gradient(115deg,rgba(255,70,25,.06) 0 1px,transparent 1px 23px),repeating-linear-gradient(25deg,rgba(255,70,25,.035) 0 1px,transparent 1px 37px)}.grain{background-image:radial-gradient(rgba(255,120,40,.1) 1px,transparent 1.3px)}.o1{background:#ff2a12;opacity:.5}.o2{width:320px;height:180px;left:-50px;bottom:-96px;background:radial-gradient(ellipse at 50% 100%,#ff6a00,#ff2a12 55%,transparent 72%);opacity:.62;animation:flare 3.4s ease-in-out infinite alternate}.o3{background:#7a0010;opacity:.3}.topline{height:4px;background:linear-gradient(90deg,#3b0006,#ff2a12,#ffb000,#ff2a12,#3b0006);background-size:300% 100%;animation:slide 3.6s linear infinite;box-shadow:0 0 16px rgba(255,60,20,.8)}.sp{background:#ffb066;box-shadow:0 0 9px 2px rgba(255,90,20,.85);animation:ember 4.4s ease-in infinite}.s1{top:92%}.s2{top:96%}.s3{top:88%}.s4{top:94%}.s5{top:90%}.ico{background:linear-gradient(135deg,#6b0010,#ff2a12 55%,#ff9100);box-shadow:0 0 24px rgba(255,40,10,.6),0 10px 22px rgba(0,0,0,.55)}.ico::before{border-color:rgba(255,100,50,.45);box-shadow:0 0 30px rgba(255,40,10,.7)}.title{background:linear-gradient(90deg,#fff 20%,#ffb9a0);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 9px rgba(255,45,10,.6))}.eyebrow{letter-spacing:.22em;color:#d9958a}.badge{background:rgba(255,40,10,.16);border-color:rgba(255,90,50,.45);color:#ffd9cc}.foot{color:#b57a70}@keyframes ember{0%{opacity:0;transform:translate(0,8px) scale(.5)}18%{opacity:.95}100%{opacity:0;transform:translate(10px,-120px) scale(.15)}}@keyframes flare{from{transform:translate(0,0) scale(1);opacity:.5}to{transform:translate(8px,-10px) scale(1.12);opacity:.72}}'
  },
  iblis: {
    name: 'Iblis (Demon Sigil)', emoji: '😈', accent: ['#ff1f5a', '#b44cff'], glow: ['#ff1f5a', '#b44cff', '#3a0057'], deep: '#060109', unify: true,
    css: ':root{--muted:#b7a3c9}.card{box-shadow:0 0 0 1px rgba(200,40,110,.4),0 0 38px rgba(150,40,255,.26),0 26px 56px rgba(0,0,0,.78)}.card::after{box-shadow:inset 0 1px 0 rgba(255,120,190,.26),inset 0 0 60px rgba(90,0,120,.22)}.veil{background:linear-gradient(180deg,rgba(22,3,30,.55) 0%,rgba(11,2,18,.88) 38%,rgba(4,0,8,.985) 100%)}.grid{background-image:linear-gradient(rgba(255,40,110,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(150,60,255,.05) 1px,transparent 1px);background-size:30px 30px}.grain{background-image:radial-gradient(rgba(220,120,255,.09) 1px,transparent 1.3px)}.grain::after{content:\'\';position:absolute;width:250px;height:250px;right:-80px;top:56px;border-radius:50%;border:1.5px dashed rgba(255,40,110,.34);box-shadow:inset 0 0 0 16px transparent,inset 0 0 0 17px rgba(170,70,255,.24),0 0 34px rgba(255,31,90,.16);animation:spin 46s linear infinite}.grain::before{content:\'\';position:absolute;width:150px;height:150px;left:-50px;bottom:40px;border-radius:50%;border:1.5px dotted rgba(170,70,255,.3);animation:spin 30s linear infinite reverse}.o1{background:#ff1f5a;opacity:.46}.o2{background:#7a1cff;opacity:.42}.o3{background:#2a0044;opacity:.45}.topline{height:4px;background:linear-gradient(90deg,#1d0030,#ff1f5a,#b44cff,#ff1f5a,#1d0030);background-size:300% 100%;animation:slide 4.5s linear infinite;box-shadow:0 0 16px rgba(255,31,90,.7)}.sp{background:#e9a6ff;box-shadow:0 0 9px 2px rgba(190,80,255,.85)}.ico{background:linear-gradient(135deg,#3a0057,#ff1f5a);box-shadow:0 0 24px rgba(255,31,90,.55),0 10px 22px rgba(0,0,0,.55)}.ico::before{border-color:rgba(220,110,255,.4);box-shadow:0 0 30px rgba(170,70,255,.7)}.title{background:linear-gradient(90deg,#fff 20%,#f0b4ff);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 9px rgba(200,60,255,.55))}.eyebrow{letter-spacing:.22em;color:#c293dd}.badge{background:rgba(200,40,120,.18);border-color:rgba(220,90,170,.45);color:#ffd9f0}.foot{color:#9c78b3}'
  },
  // ---- tema terang bergaya neo brutalism (CSS: lib/rich/brutal.css) ----
  // flat = palet warna datar; tiap kategori menu otomatis kebagian satu warna (stabil per nama kategori)
  brutal: {
    name: 'Neo Brutalism', emoji: '🟨', accent: ['#ffd93d', '#ff6b9d'], glow: ['#ffd93d', '#ff6b9d', '#5ac8fa'], deep: '#fff4d6',
    flat: ['#ffd93d', '#ff6b9d', '#6bcb77', '#5ac8fa', '#ff9f1c', '#b388ff', '#ff8fab', '#7ee8d9'],
    css: (() => { try { return fs.readFileSync(path.join(__dirname, 'brutal.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '') } catch { return '' } })()
  }
}

const ALIAS = {
  aurora: 'aurora', ungu: 'aurora', default: 'aurora',
  sunset: 'sunset', senja: 'sunset', oranye: 'sunset', orange: 'sunset',
  ocean: 'ocean', laut: 'ocean', biru: 'ocean',
  emerald: 'emerald', hijau: 'emerald', green: 'emerald',
  sakura: 'sakura', pink: 'sakura', bunga: 'sakura',
  gold: 'gold', emas: 'gold', royal: 'gold', kuning: 'gold',
  ruby: 'ruby', merah: 'ruby', red: 'ruby',
  mono: 'mono', hitam: 'mono', abu: 'mono', dark: 'mono',
  neraka: 'neraka', hell: 'neraka', hellfire: 'neraka', inferno: 'neraka', api: 'neraka', jahanam: 'neraka',
  iblis: 'iblis', setan: 'iblis', demon: 'iblis', devil: 'iblis', lucifer: 'iblis', sigil: 'iblis',
  brutal: 'brutal', brutalism: 'brutal', neobrutal: 'brutal', neobrutalism: 'brutal', 'neo-brutalism': 'brutal', neo: 'brutal', kotak: 'brutal'
}
const normRich = (v) => ALIAS[String(v || '').trim().toLowerCase()] || ''

const richId = () => normRich(store.data.rich) || normRich(global.uiTheme) || 'brutal'
const rich = () => RICH[richId()]
// tema neraka/iblis selalu satu warna (warna per kategori akan merusak suasananya); tema lain mengikuti .tema warna
const unify = () => (rich().unify === true ? true : typeof store.data.unify === 'boolean' ? store.data.unify : global.uiUnify === true)

function setRich(v) {
  const id = normRich(v)
  if (!id) return null
  store.data.rich = id
  store.flush()
  return id
}
function setUnify(v) {
  store.data.unify = !!v
  store.flush()
  return !!v
}

module.exports = { RICH, richId, rich, unify, setRich, setUnify, normRich }
