// module.js — Alya V20
// ⚠️ FIX PENTING: sebelumnya SEMUA paket di-require() mentah tanpa proteksi.
// Kejadian nyata: figlet versi tertentu (bug import.meta.url di build CJS-nya)
// melempar exception SAAT DI-REQUIRE, dan karena file ini di-require langsung
// oleh index.js/alya.js, satu paket rusak itu menjatuhkan SELURUH BOT sebelum
// sempat konek WhatsApp sama sekali (crash total, bukan silent-fail biasa).
//
// Sekarang pakai safeRequire(): kalau sebuah paket gagal di-load, dicatat jelas
// ke console (nama paket + pesan error) dan hasilnya `null` — bot TETAP NYALA,
// fitur yang tidak butuh paket itu tetap jalan normal. Fitur yang benar-benar
// butuh paket yang gagal itu akan error dengan pesan jelas SAAT dipakai
// (bukan bikin seluruh proses mati duluan di startup).
'use strict';

function safeRequire(pkgName, requireAlias) {
  try {
    return require(requireAlias || pkgName);
  } catch (e) {
    console.error(`[module.js] ❌ Gagal load paket "${pkgName}": ${e.message}`);
    console.error(`[module.js]    Fitur yang bergantung pada "${pkgName}" tidak akan berfungsi sampai paket ini diperbaiki (cek versi di package.json / jalankan npm install ulang).`);
    return null;
  }
}

module.exports = {
modul: {
	axios: safeRequire('axios'),
	boom: safeRequire('@hapi/boom'),
	baileys: safeRequire('@whiskeysockets/baileys'),
	chalk: safeRequire('chalk'),
	crypto: safeRequire('crypto'),
	cheerio: safeRequire('cheerio'),
	child_process: safeRequire('child_process'),
	cookie: safeRequire('cookie'),
	fs: safeRequire('fs'),
	fsx: safeRequire('fs-extra'),
	fetch: safeRequire('node-fetch'),
	figlet: safeRequire('figlet'),
	FormData: safeRequire('form-data'),
	FileType: safeRequire('file-type'),
	ffmpeg: safeRequire('fluent-ffmpeg'),
	got: safeRequire('got'),
	gimage: safeRequire('g-i-s'),
	google: safeRequire('google-it'),
	googleTTS: safeRequire('google-tts-api'),
	human: safeRequire('human-readable'),
	jsobfus: safeRequire('javascript-obfuscator'),
	Jimp: safeRequire('jimp'),
	jsdom: safeRequire('jsdom'),
	keyeddb: safeRequire('@adiwajshing/keyed-db'),
	lodash: safeRequire('lodash'),
	moment: safeRequire('moment-timezone'),
	ms: safeRequire('ms'),
	miniget: safeRequire('miniget'),
	maker: safeRequire('mumaker'),
	nodecron: safeRequire('node-cron'),
	nodeid3: safeRequire('node-id3'),
	nodeytm: safeRequire('node-youtube-music'),
	os: safeRequire('os'),
	objectquery: safeRequire('object-query-string'),
	path: safeRequire('path'),
	perf_hooks: safeRequire('perf_hooks'),
	pino: safeRequire('pino'),
	parsems: safeRequire('parse-ms'),
	process: safeRequire('process'),
	PhoneNumber: safeRequire('awesome-phonenumber'),
	qs: safeRequire('qs'),
    qrcodeterminal: safeRequire('qrcode-terminal'),
    qrcode: safeRequire('qrcode'),
    request: safeRequire('request'),
    scrapePrimbon: safeRequire('scrape-primbon'),
    speed: safeRequire('performance-now'),
    stream: safeRequire('stream'),
    syntaxerror: safeRequire('syntax-error'),
    util: safeRequire('util'),
    yargs: safeRequire('yargs'),
    yts: safeRequire('yt-search'),
    yt: safeRequire('youtube-yts'),
    webp: safeRequire('node-webpmux')

}
}
