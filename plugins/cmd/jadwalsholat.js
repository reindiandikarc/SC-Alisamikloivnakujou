// Plugin: jadwalsholat
// Commands: jadwalsholat, sholat
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['jadwalsholat', 'sholat'],
  tags: ['islami'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

try {

let kota = text ? text : "Jakarta"

await alya.sendMessage(m.chat, { react: { text: "🕌", key: m.key }})

let res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(kota)}&country=Indonesia&method=11`)
let json = await res.json()

if (!json.data) return reply(`❌ Kota *${kota}* tidak ditemukan`)

let data = json.data.timings
let tanggal = json.data.date.gregorian
let hijriyah = json.data.date.hijri

let now = new Date()

let wib = new Date(now.toLocaleString("en-US",{timeZone:"Asia/Jakarta"}))

let jam = String(wib.getHours()).padStart(2,'0')
let menit = String(wib.getMinutes()).padStart(2,'0')
let waktuSekarang = `${jam}:${menit}`

function toMinutes(time){
let [h,m] = time.split(':')
return parseInt(h)*60 + parseInt(m)
}

let nowMinutes = toMinutes(waktuSekarang)

let waktu = [
{nama:"Subuh", jam:data.Fajr},
{nama:"Dzuhur", jam:data.Dhuhr},
{nama:"Ashar", jam:data.Asr},
{nama:"Maghrib", jam:data.Maghrib},
{nama:"Isya", jam:data.Isha}
]

let nextSholat = "Subuh"
let nextTime = data.Fajr

for (let i of waktu){
if (nowMinutes < toMinutes(i.jam)){
nextSholat = i.nama
nextTime = i.jam
break
  }
}

let teks = `╔══════════════════════════╗
┃    🕌 *JADWAL SHOLAT*    
┃ 📍 Kota : *${kota}*
┃ 📅 ${tanggal.weekday}, ${tanggal.day} ${tanggal.month.en} ${tanggal.year}
┃ 🌙 ${hijriyah.day} ${hijriyah.month.en} ${hijriyah.year}
╠══════════════════════════╣
┃ 🌅 Subuh   : *${data.Fajr}*
┃ ☀️  Dzuhur  : *${data.Dhuhr}*
┃ 🌤️ Ashar   : *${data.Asr}*
┃ 🌇 Maghrib : *${data.Maghrib}*
┃ 🌙 Isya    : *${data.Isha}*
╠══════════════════════════╣
┃ ⏰ Sekarang  : *${waktuSekarang} WIB*
┃ ⏭️ Sholat berikutnya:
┃    *${nextSholat}* pukul *${nextTime}*
╚══════════════════════════╝`

await reply(teks)

} catch(e) {
  await reply(`❌ Gagal mengambil jadwal sholat.\n\nPastikan nama kota benar, contoh:\n*.jadwalsholat Surabaya*`)
}
  }
}
