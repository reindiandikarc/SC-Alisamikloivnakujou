// Pengganti kecil paket "lowdb" (LowSync + JSONFileSync) supaya tidak perlu dependensi baru.
import fs from 'fs'
export class JSONFileSync {
  constructor(file) { this.file = file }
  read() { try { return JSON.parse(fs.readFileSync(this.file, 'utf8')) } catch { return null } }
  write(data) {
    const tmp = this.file + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
    fs.renameSync(tmp, this.file)
  }
}
export class LowSync {
  constructor(adapter, defaults) { this.adapter = adapter; this.data = defaults }
  read() { const d = this.adapter.read(); this.data = d === null || d === undefined ? null : d }
  write() { this.adapter.write(this.data) }
}
