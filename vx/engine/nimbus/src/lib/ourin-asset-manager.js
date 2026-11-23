// getAssetBuffer(nama) -> Buffer | null. Aset dibaca dari ourin/assets/<nama>[.png|.jpg|.webp|.ttf|.otf].
// "pp-kosong" (foto profil kosong) dibuat otomatis kalau filenya tidak ada.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets')
// indeks aset: nama (tanpa ekstensi / dengan ekstensi) -> path, dari ourin/assets dan assets/ (rekursif)
const ROOTS = [dir, path.join(dir, '..', '..', 'assets')]
let index = null
function buildIndex() {
  index = new Map()
  const walk = (d, depth = 0) => {
    let list = []
    try { list = fs.readdirSync(d, { withFileTypes: true }) } catch { return }
    for (const e of list) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) { if (depth < 4) walk(p, depth + 1) } else {
        const base = e.name.replace(/\.[^.]+$/, '')
        if (!index.has(e.name)) index.set(e.name, p)
        if (!index.has(base)) index.set(base, p)
      }
    }
  }
  for (const r of ROOTS) walk(r)
}
export function assetPath(name) { if (!index) buildIndex(); return index.get(name) || null }
const EXT = ['', '.png', '.jpg', '.jpeg', '.webp', '.ttf', '.otf', '.bin']
const cache = new Map()

function defaultAvatar() {
  try {
    const { createCanvas } = require('@napi-rs/canvas')
    const c = createCanvas(512, 512)
    const g = c.getContext('2d')
    g.fillStyle = '#dfe5e7'; g.fillRect(0, 0, 512, 512)
    g.fillStyle = '#ffffff'
    g.beginPath(); g.arc(256, 200, 92, 0, Math.PI * 2); g.fill()
    g.beginPath(); g.ellipse(256, 470, 170, 150, 0, 0, Math.PI * 2); g.fill()
    return c.toBuffer('image/png')
  } catch { return null }
}

export function hasAsset(name) {
  return !!assetPath(name) || EXT.some((e) => fs.existsSync(path.join(dir, name + e)) && fs.statSync(path.join(dir, name + e)).isFile())
}

export function getAssetBuffer(name) {
  if (cache.has(name)) return cache.get(name)
  let out = null
  const ap = assetPath(name)
  if (ap) { try { out = fs.readFileSync(ap) } catch {} }
  if (!out) for (const e of EXT) {
    const p = path.join(dir, name + e)
    try { if (fs.statSync(p).isFile()) { out = fs.readFileSync(p); break } } catch {}
  }
  if (!out && name === 'pp-kosong') out = defaultAvatar()
  if (out) cache.set(name, out)
  return out
}
export default getAssetBuffer

// dipakai ourin-uploader asli
export function updateAssetAndSave(key, buffer, filepath) {
  cache.set(key, buffer)
  try { if (filepath && !/^https?:/.test(filepath)) fs.writeFileSync(path.resolve(process.cwd(), filepath), buffer) } catch {}
}
export function preloadAssets() {}
