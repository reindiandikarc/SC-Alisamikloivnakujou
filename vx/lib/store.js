// Penyimpanan JSON kecil dengan simpan tertunda (debounce). Dipakai fitur baru: ban, warn, afk, catatan, pengingat, dll.
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '..', 'database')
const stores = new Map()

function createStore(name, defaults = {}) {
  if (stores.has(name)) return stores.get(name)

  const file = path.join(dir, `${name}.json`)
  const data = JSON.parse(JSON.stringify(defaults))
  try {
    Object.assign(data, JSON.parse(fs.readFileSync(file, 'utf8')))
  } catch {}

  let timer = null
  const write = () => {
    try {
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(file, JSON.stringify(data, null, 2))
    } catch (err) {
      console.log(`[STORE:${name}] gagal menyimpan:`, err.message)
    }
  }
  const save = () => {
    clearTimeout(timer)
    timer = setTimeout(write, 1000)
  }

  const store = { data, save, flush: () => { clearTimeout(timer); write() } }
  stores.set(name, store)
  return store
}

// Pastikan data tersimpan saat bot dimatikan/restart (pm2 mengirim SIGINT)
const flushAll = () => stores.forEach((s) => s.flush())
process.once('exit', flushAll)
// [vx] handler SIGINT/SIGTERM dilepas — shutdown dikelola Alya.

module.exports = { createStore, flushAll }
