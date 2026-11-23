// Plugin: botstatus
// Auto-generated from Alya V12
// Commands: statusbot, botstatus

const path = require('path')

module.exports = {
  command: ["statusbot", "botstatus"],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

        await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        const { performance } = await import('perf_hooks')
        const os = await import('os')
        const fs = await import('fs')
        const moment = (await import('moment-timezone')).default
        const axios = (await import('axios')).default

        const startProcess = performance.now()

        // =================INTERNET PING =================
        const getRealPing = async () => {
            const start = performance.now()
            try {
                await axios.get('https://www.google.com', { timeout: 5000 })
                return performance.now() - start
            } catch {
                return null
            }
        }
        const realPing = await getRealPing()

        // ================= 📶 LATENCY =================
        const getLatency = async () => {
            const start = performance.now()
            await new Promise(r => setTimeout(r, 50))
            return performance.now() - start
        }
        const latency = await getLatency()

        // ================= 🖥️ OS INFO =================
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
        } catch {
            osName = os.type()
        }

        // ================= ⏱️ UPTIME FORMAT =================
        const runtimeFormat = (seconds) => {
            const d = Math.floor(seconds / 86400)
            const h = Math.floor(seconds % 86400 / 3600)
            const m = Math.floor(seconds % 3600 / 60)
            const s = Math.floor(seconds % 60)
            return `${d}d ${h}h ${m}m ${s}s`
        }

        // ================= 🧠 CPU =================
        const getCpuUsage = async (delay = 800) => {
            const start = os.cpus()
            await new Promise(r => setTimeout(r, delay))
            const end = os.cpus()
            let idle = 0, total = 0
            for (let i = 0; i < start.length; i++) {
                for (let t in start[i].times) {
                    total += end[i].times[t] - start[i].times[t]
                }
                idle += end[i].times.idle - start[i].times.idle
            }
            return 100 - Math.round((idle / total) * 100)
        }
        const cpuUsagePercent = await getCpuUsage()

        const cpus = os.cpus()
        const cpuModel = cpus[0]?.model || 'Unknown CPU'
        const cpuCore = cpus.length
        const avgSpeed = cpus.reduce((a, c) => a + c.speed, 0) / cpuCore

        // ================= 💾 MEMORY =================
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
    	const memoryIcon =
        percentUsed >= 85 ? '🔴' :
        percentUsed >= 50 ? '🟡' :
        '🟢'

    	const memoryStatus =
        percentUsed >= 85 ? 'CRITICAL' :
        percentUsed >= 50 ? 'NORMAL' :
        'GOOD'
        // ================= 🕒 TIME =================
        const runtimeText = runtimeFormat(process.uptime())
        const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss')
        const tanggal = moment().tz('Asia/Jakarta').locale('id').format('dddd, D MMMM YYYY')

        // ================= ⚡ RESPONSE TIME =================
        const messageTimestamp = m?.messageTimestamp || Math.floor(Date.now() / 1000)
        const userToBot = Date.now() - messageTimestamp * 1000
        const botToUser = performance.now() - startProcess
        const totalResponse = userToBot + botToUser

        // ================= 🩺 STATUS & QUALITY =================
        const pingForQuality = realPing ?? latency
    	const pingIcon =
        pingForQuality >= 300 ? '🔴' :
        pingForQuality >= 150 ? '🟡' :
        '🟢'
    	const networkQuality =
        pingForQuality < 150 ? 'EXCELLENT' :
        pingForQuality < 300 ? 'GOOD' :
        pingForQuality < 400 ? 'BAD' :
        'CRITICAL'

    	const networkStatus = `${pingIcon} ${networkQuality}`
        const cpuLoad =
            cpuUsagePercent < 40 ? 'LOW LOAD' :
            cpuUsagePercent < 70 ? 'NORMAL LOAD' :
            'HIGH LOAD'

    // ================= 📊 Chart =================
    const pingMs = realPing ? Math.round(realPing) : 0
    const maxPing = 950
    const safePing = Math.min(pingMs, maxPing)

    const imgChart = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
      type: 'gauge',
      data: {
        datasets: [
          {
            value: safePing, //
            data: [150, 300, 500],
            backgroundColor: ['#2ECC71', '#F1C40F', '#E74C3C'],
            borderWidth: 2
          }
        ],
        labels: ['Normal', 'Warning', 'Critical']
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'ALYA CHAN ASSISTENT'
        },
        needle: {
          radiusPercentage: 2,
          widthPercentage: 3,
          lengthPercentage: 80,
          color: '#000'
        },
        valueLabel: {
          formatter: function () {
            return pingMs + ' ms' //
          },
          color: '#000',
          fontSize: 28,
          backgroundColor: 'transparent',
          bottomMarginPercentage: 10
        },
        plugins: {
          datalabels: {
            display: true,
            color: '#fff',
            font: { size: 14, weight: 'bold' },
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex]
            }
          }
        }
      }
    }))}`

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

    © Alya-Chan Assistant ✨
    `.trim()

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        await alya.sendMessage(m.chat, {
            image: fs.readFileSync('./media/server.jpg'),
            caption: response,
            contextInfo: {}
        }, { quoted: m })
  }
}
