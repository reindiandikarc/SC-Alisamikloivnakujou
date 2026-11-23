// Plugin: ping
// Ported from Alya V12 - samakan dengan V12
// Diperbarui: gambar pendamping sekarang HUD diagnostic panel canvas
//             yang digenerate ULANG setiap kali .ping dipanggil (realtime),
//             bukan lagi aset statis. Fallback ke media/server.jpg kalau
//             canvas gagal render (mis. node-canvas error di server).
// Commands: ping, statusbot, botstatus

const path = require('path')

module.exports = {
  command: ["ping", "statusbot", "botstatus"],
  tags: ['info'],
  run: async (alya, m, ctx) => {
    const { reply, replyalya } = ctx

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const { performance } = await import('perf_hooks')
    const os = await import('os')
    const fs = await import('fs')
    const moment = (await import('moment-timezone')).default
    const axios = (await import('axios')).default

    const startProcess = performance.now()

    // ================= INTERNET PING =================
    const getRealPing = async () => {
      const start = performance.now()
      try {
        await axios.get('https://www.google.com', { timeout: 5000 })
        return performance.now() - start
      } catch { return null }
    }
    const realPing = await getRealPing()

    // ================= LATENCY =================
    const getLatency = async () => {
      const start = performance.now()
      await new Promise(r => setTimeout(r, 50))
      return performance.now() - start
    }
    const latency = await getLatency()

    // ================= OS INFO =================
    let osName = 'Unknown OS'
    try {
      if (process.platform === 'linux' && fs.existsSync('/etc/os-release')) {
        const osInfo = fs.readFileSync('/etc/os-release', 'utf8')
        const name = osInfo.match(/^NAME="?(.+?)"?$/m)?.[1] || ''
        const ver = osInfo.match(/^VERSION="?(.+?)"?$/m)?.[1] || ''
        osName = `${name} ${ver}`.trim()
      } else if (process.platform === 'win32') osName = 'Windows'
      else if (process.platform === 'darwin') osName = 'macOS'
      else osName = os.type()
    } catch { osName = os.type() }

    // ================= UPTIME FORMAT =================
    const runtimeFormat = (seconds) => {
      const d = Math.floor(seconds / 86400)
      const h = Math.floor(seconds % 86400 / 3600)
      const mm = Math.floor(seconds % 3600 / 60)
      const s = Math.floor(seconds % 60)
      return `${d}d ${h}h ${mm}m ${s}s`
    }
    const runtimeShort = (seconds) => {
      const d = Math.floor(seconds / 86400)
      const h = Math.floor(seconds % 86400 / 3600)
      const mm = Math.floor(seconds % 3600 / 60)
      if (d > 0) return `${d}d ${h}h`
      if (h > 0) return `${h}h ${mm}m`
      return `${mm}m`
    }

    // ================= CPU =================
    const getCpuUsage = async (delay = 800) => {
      const start = os.cpus()
      await new Promise(r => setTimeout(r, delay))
      const end = os.cpus()
      let idle = 0, total = 0
      for (let i = 0; i < start.length; i++) {
        for (let t in start[i].times) total += end[i].times[t] - start[i].times[t]
        idle += end[i].times.idle - start[i].times.idle
      }
      return 100 - Math.round((idle / total) * 100)
    }
    const cpuUsagePercent = await getCpuUsage()

    const cpus = os.cpus()
    const cpuModel = cpus[0]?.model || 'Unknown CPU'
    const cpuCore = cpus.length
    const avgSpeed = cpus.reduce((a, c) => a + c.speed, 0) / cpuCore

    // ================= MEMORY =================
    const mem = os.totalmem()
    const free = os.freemem()

    let swapTotal = 0, swapFree = 0
    if (fs.existsSync('/proc/meminfo')) {
      const info = fs.readFileSync('/proc/meminfo', 'utf8')
      swapTotal = parseInt(info.match(/^SwapTotal:\s+(\d+)/m)?.[1] || 0) * 1024
      swapFree = parseInt(info.match(/^SwapFree:\s+(\d+)/m)?.[1] || 0) * 1024
    }

    const totalMemAll = mem + swapTotal
    const usedMemAll = (mem - free) + (swapTotal - swapFree)
    const percentUsed = ((usedMemAll / totalMemAll) * 100).toFixed(1)
    const memoryIcon = percentUsed >= 85 ? '🔴' : percentUsed >= 50 ? '🟡' : '🟢'
    const memoryStatus = percentUsed >= 85 ? 'CRITICAL' : percentUsed >= 50 ? 'NORMAL' : 'GOOD'

    // ================= FORMAT =================
    const formatp = (bytes) => {
      if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB'
      if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB'
      return (bytes / 1024).toFixed(2) + ' KB'
    }

    // ================= TIME =================
    const runtimeText = runtimeFormat(process.uptime())
    const runtimeShortText = runtimeShort(process.uptime())
    const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss')
    const tanggal = moment().tz('Asia/Jakarta').locale('id').format('dddd, D MMMM YYYY')

    // ================= RESPONSE TIME =================
    const messageTimestamp = m?.messageTimestamp || Math.floor(Date.now() / 1000)
    const userToBot = Date.now() - messageTimestamp * 1000
    const botToUser = performance.now() - startProcess
    const totalResponse = userToBot + botToUser

    // ================= STATUS =================
    const pingForQuality = realPing ?? latency
    const pingIcon = pingForQuality >= 300 ? '🔴' : pingForQuality >= 150 ? '🟡' : '🟢'
    const networkQuality =
      pingForQuality < 150 ? 'EXCELLENT' :
      pingForQuality < 300 ? 'GOOD' :
      pingForQuality < 400 ? 'BAD' : 'CRITICAL'
    const networkStatus = `${pingIcon} ${networkQuality}`

    const cpuLoad =
      cpuUsagePercent < 40 ? 'LOW LOAD' :
      cpuUsagePercent < 70 ? 'NORMAL LOAD' : 'HIGH LOAD'

    const response = `
*ALYA STATUS*
*SYSTEM MONITOR*

📡 *NETWORK STATUS*
━━━━━━━━━━━━━━━━━━━━━━
📶 Internet Ping     : ${realPing ? Math.round(realPing) + ' ms' : 'N/A'}
⏳ Latency Internal  : ${latency.toFixed(2)} ms
⚡ Total Response   : ${totalResponse.toFixed(2)} ms
📊 Network Quality  : ${networkStatus}

⏱️ *SYSTEM UPTIME*
━━━━━━━━━━━━━━━━━━━━━━
🚀 Runtime          : ${runtimeText}

🖥️ *SERVER ENVIRONMENT*
━━━━━━━━━━━━━━━━━━━━━━
💻 OS               : ${osName}
🧩 Platform         : ${os.platform()}
🏷️ Hostname         : ${os.hostname()}
🌍 Timezone         : ${Intl.DateTimeFormat().resolvedOptions().timeZone}

🧠 *CPU PERFORMANCE*
━━━━━━━━━━━━━━━━━━━━━━
🔧 Model            : ${cpuModel}
🧮 Core Count       : ${cpuCore} Cores
⚙️ Avg Speed        : ${avgSpeed.toFixed(0)} MHz
📈 Usage            : ${cpuUsagePercent} %
🔥 Load Status      : ${cpuLoad}

💾 *MEMORY MANAGEMENT*
━━━━━━━━━━━━━━━━━━━━━━
📥 Used Memory      : ${formatp(usedMemAll)}
📦 Total Memory     : ${formatp(totalMemAll)}
📉 Utilization      : ${percentUsed} %
🧠 Memory Status   : ${memoryIcon} ${memoryStatus}

📅 *DATE & TIME*
━━━━━━━━━━━━━━━━━━━━━━
🗓️ Date             : ${tanggal}
⏰ Time             : ${waktu} WIB

━━━━━━━━━━━━━━━━━━━━━━
🩺 *SYSTEM HEALTH*
🟢 Status           : ${pingIcon} OPERATIONAL
📡 Monitoring Mode  : REALTIME
━━━━━━━━━━━━━━━━━━━━━━

© Alya-Chan Assistant ✨`.trim()

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    // ================= REALTIME CANVAS CARD =================
    // Hitung jumlah plugin/command terdaftar saat ini (bukan angka beku)
    let pluginCount = 0, commandCount = 0
    try {
      const registryPath = path.join(__dirname, '..', 'cmd_registry.json')
      const regData = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
      commandCount = Object.keys(regData).length
      pluginCount = new Set(Object.values(regData)).size
    } catch {
      try {
        const cmdDir = path.join(__dirname)
        pluginCount = fs.readdirSync(cmdDir).filter(f => f.endsWith('.js')).length
      } catch { pluginCount = 0 }
    }

    const overallLevel = (percentUsed >= 85 || pingForQuality >= 400)
      ? 'bad'
      : (percentUsed >= 50 || pingForQuality >= 150 || cpuUsagePercent >= 70)
        ? 'warn'
        : 'good'
    const overallLabel = overallLevel === 'bad' ? 'CRITICAL' : overallLevel === 'warn' ? 'NOMINAL' : 'OPTIMAL'

    const cardData = {
      overall: { level: overallLevel, label: overallLabel },
      identity: {
        version: 'V20',
        owner: 'Reindiandikarc',
        pluginCount,
        commandCount
      },
      runtime: { short: runtimeShortText, full: runtimeText },
      network: {
        pingMs: Math.round(pingForQuality),
        pingText: realPing ? `${Math.round(realPing)} ms` : 'N/A',
        latencyText: `${latency.toFixed(1)} ms`,
        totalResponseText: `${totalResponse.toFixed(0)} ms`,
        quality: networkQuality
      },
      cpu: {
        usageText: `${cpuUsagePercent}%`,
        coreText: `${cpuCore} cores`,
        speedText: `${avgSpeed.toFixed(0)} MHz`,
        load: cpuLoad
      },
      memory: {
        usedText: formatp(usedMemAll),
        totalText: formatp(totalMemAll),
        percentText: `${percentUsed}%`,
        status: memoryStatus
      },
      env: {
        osText: osName,
        platform: os.platform(),
        dateText: moment().tz('Asia/Jakarta').format('DD/MM/YYYY'),
        timeText: waktu
      }
    }

    let imageBuffer = null
    try {
      const { generatePingCard } = require('../../lib/pingCard.js')
      imageBuffer = await generatePingCard(cardData)
    } catch (e) {
      console.error('[ping] gagal load/generate pingCard:', e?.message || e)
      imageBuffer = null
    }

    if (imageBuffer) {
      // Sukses: kirim canvas realtime
      await alya.sendMessage(m.chat, {
        image: imageBuffer,
        caption: response,
        contextInfo: {}
      }, { quoted: m })
      return
    }

    // ================= FALLBACK: gambar statis lama =================
    const serverImg = path.join(process.cwd(), 'media', 'server.jpg')
    if (fs.existsSync(serverImg)) {
      await alya.sendMessage(m.chat, {
        image: fs.readFileSync(serverImg),
        caption: response,
        contextInfo: {}
      }, { quoted: m })
    } else {
      await replyalya(response)
    }
  }
}
