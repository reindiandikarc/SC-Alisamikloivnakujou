// Shim `cheerio` untuk plugin vanXone yang memakai `import cheerio from 'cheerio'`.
// Alya memakai cheerio 1.0.0-rc.12 (ekspor bernama saja: load, ..., tanpa default),
// vanXone memakai cheerio 0.x yang punya ekspor default. Shim ini menyediakan
// keduanya tanpa mengubah versi dependensi Alya.
import * as cheerio from 'cheerio'

export default cheerio
export * from 'cheerio'
