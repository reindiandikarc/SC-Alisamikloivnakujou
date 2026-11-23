const fs = require("fs")

function addSewaGroup(id, waktu, sewa) {
    let position = sewa.findIndex(x => x.id === id)
    let expired = (waktu === "PERMANENT") ? "PERMANENT" : (Date.now() + toMs(waktu))
    
    // Jika ID sudah ada, update masa expired-nya. Jika belum, tambahkan baru.
    if (position !== -1) {
        sewa[position].expired = expired
    } else {
        sewa.push({ id: id, expired: expired })
    }
    
    fs.writeFileSync('./database/sewa.json', JSON.stringify(sewa, null, 2))
    return true
}

function checkSewaGroup(id, sewa) {
    return sewa.some(x => x.id === id)
}

function getSewaPosition(id, sewa) {
    return sewa.findIndex(x => x.id === id)
}

function toMs(str) {
    let number = parseInt(str)
    let unit = str[str.length - 1].toLowerCase()
    if (unit === 'd') return number * 24 * 60 * 60 * 1000
    if (unit === 'h') return number * 60 * 60 * 1000
    if (unit === 'm') return number * 60 * 1000
    if (unit === 's') return number * 1000
    if (unit === 'y') return number * 365 * 24 * 60 * 60 * 1000
    return number
}

function msToDate(ms) {
    let days = Math.floor(ms / (24 * 60 * 60 * 1000))
    let daysms = ms % (24 * 60 * 60 * 1000)
    let hours = Math.floor(daysms / (60 * 60 * 1000))
    let hoursms = ms % (60 * 60 * 1000)
    let minutes = Math.floor(hoursms / (60 * 1000))
    let minutesms = ms % (60 * 1000)
    let sec = Math.floor(minutesms / 1000)
    return days + "d " + hours + "h " + minutes + "m " + sec + "s"
}

function expiredCheck(sewa) {
    let now = Date.now()
    let filtered = sewa.filter(x => x.expired === "PERMANENT" || x.expired > now)
    fs.writeFileSync('./database/sewa.json', JSON.stringify(filtered, null, 2))
    return filtered
}

// ─── addDurationSewa: TAMBAH durasi ke entry sewa yang SUDAH ADA ───────────
// Dipakai oleh .tambahsewa — beda dengan addSewaGroup (yang overwrite/set
// expired baru dari sekarang), ini MENAMBAHKAN waktu ke expired yang sudah
// berjalan (atau ke Date.now() kalau sudah expired), supaya perpanjangan
// tidak memotong sisa waktu yang masih ada.
//
// Return: { ok, reason?, entry?, before?, after? }
function addDurationSewa(id, waktu, sewa, opts = {}) {
    const { allowCreate = false } = opts
    const position = getSewaPosition(id, sewa)

    if (position === -1) {
        if (!allowCreate) {
            return { ok: false, reason: 'NOT_FOUND' }
        }
        // Belum ada entry sama sekali → buat baru dari sekarang
        const expired = (waktu === 'PERMANENT') ? 'PERMANENT' : (Date.now() + toMs(waktu))
        const entry = { id, expired }
        sewa.push(entry)
        fs.writeFileSync('./database/sewa.json', JSON.stringify(sewa, null, 2))
        return { ok: true, entry, before: null, after: expired, created: true }
    }

    const before = sewa[position].expired

    // Kalau sudah PERMANENT, tambah durasi tidak ada efeknya — tetap PERMANENT
    if (before === 'PERMANENT') {
        return { ok: true, entry: sewa[position], before, after: 'PERMANENT', noChange: true }
    }

    // Kalau target waktu baru PERMANENT → langsung jadikan PERMANENT
    if (waktu === 'PERMANENT') {
        sewa[position].expired = 'PERMANENT'
        fs.writeFileSync('./database/sewa.json', JSON.stringify(sewa, null, 2))
        return { ok: true, entry: sewa[position], before, after: 'PERMANENT' }
    }

    // Basis penambahan: kalau sudah expired (lewat waktu), basis dari SEKARANG,
    // bukan dari angka expired lama yang sudah lewat — supaya tidak "hilang"
    // durasi tambahan ke masa lalu.
    const basis = (before > Date.now()) ? before : Date.now()
    const after = basis + toMs(waktu)

    sewa[position].expired = after
    fs.writeFileSync('./database/sewa.json', JSON.stringify(sewa, null, 2))
    return { ok: true, entry: sewa[position], before, after }
}

// ─── subtractDurationSewa: KURANGI durasi dari entry sewa yang SUDAH ADA ───
// Dipakai oleh .kurangisewa. Tidak bisa dipakai untuk membuat entry baru
// (harus sudah ada di database). Floor di Date.now() — durasi tidak akan
// dikurangi sampai ke masa lalu yang jauh, cukup sampai "expired sekarang".
//
// Return: { ok, reason?, entry?, before?, after? }
function subtractDurationSewa(id, waktu, sewa) {
    const position = getSewaPosition(id, sewa)

    if (position === -1) {
        return { ok: false, reason: 'NOT_FOUND' }
    }

    const before = sewa[position].expired

    if (before === 'PERMANENT') {
        return { ok: false, reason: 'IS_PERMANENT' }
    }

    const kurang = toMs(waktu)
    let after = before - kurang
    // Floor: tidak boleh mengurangi sampai expired di masa lalu yang absurd —
    // minimal jadi "expired sekarang" (langsung kena auto-kick interval).
    if (after < Date.now()) after = Date.now() - 1 // -1ms supaya pasti terhitung expired

    sewa[position].expired = after
    fs.writeFileSync('./database/sewa.json', JSON.stringify(sewa, null, 2))
    return { ok: true, entry: sewa[position], before, after }
}

async function remindSewa(alya, sewa) {
    for (let x of sewa) {
        if (x.expired !== "PERMANENT") {
            let remaining = x.expired - Date.now()
            if (remaining <= 24 * 60 * 60 * 1000 && remaining > 23 * 60 * 60 * 1000) {
                await alya.sendMessage(x.id, { text: "⚠️ Sewa bot akan berakhir dalam 1 hari!" })
            }
            if (remaining <= 60 * 60 * 1000 && remaining > 59 * 60 * 1000) {
                await alya.sendMessage(x.id, { text: "⚠️ Sewa bot akan berakhir dalam 1 jam!" })
            }
        }
    }
}

async function getGcName(id) {
    try {
        let metadata = await global.alya.groupMetadata(id)
        return metadata.subject
    } catch {
        return "Tidak diketahui"
    }
}

function addPendingSewa(link, waktu) {
    if (!fs.existsSync('./database/pendingSewa.json')) fs.writeFileSync('./database/pendingSewa.json', '[]')
    let pending = JSON.parse(fs.readFileSync('./database/pendingSewa.json'))
    pending.push({ link, waktu })
    fs.writeFileSync('./database/pendingSewa.json', JSON.stringify(pending, null, 2))
}

function getPendingSewa() {
    if (!fs.existsSync('./database/pendingSewa.json')) fs.writeFileSync('./database/pendingSewa.json', '[]')
    return JSON.parse(fs.readFileSync('./database/pendingSewa.json'))
}

function clearPendingSewa(link) {
    if (!fs.existsSync('./database/pendingSewa.json')) return
    let pending = JSON.parse(fs.readFileSync('./database/pendingSewa.json'))
    pending = pending.filter(x => x.link !== link)
    fs.writeFileSync('./database/pendingSewa.json', JSON.stringify(pending, null, 2))
}

module.exports = { 
    addSewaGroup, 
    checkSewaGroup, 
    getSewaPosition, 
    toMs, 
    msToDate, 
    expiredCheck, 
    addDurationSewa,
    subtractDurationSewa,
    remindSewa, 
    getGcName,
    addPendingSewa,
    getPendingSewa,
    clearPendingSewa
}