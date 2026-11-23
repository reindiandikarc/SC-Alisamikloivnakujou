import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'

const CORS_PROXY = "https://cors.rifkyshre.biz.id/"
const API_BASE = "https://api-pddikti.kemdiktisaintek.go.id"
const FRONTEND_ORIGIN = "https://pddikti.kemdiktisaintek.go.id"

async function pddiktiGet(path) {
  const res = await fetch(`${CORS_PROXY}${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      "Accept": "application/json",
      "X-Cors-Spoof-Origin": FRONTEND_ORIGIN
    }
  })
  
  if (!res.ok) {
    throw new Error(`PDDIKTI API Error: HTTP ${res.status}`)
  }
  return res.json()
}

export default {
  name: 'pddikti',
  command: ['pddikti', 'mhs', 'mahasiswa', 'dosen', 'pt', 'prodi'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Search Indonesian Higher Education Database (PDDIKTI)',

  async handle(ctx) {
    const { sock, msg, args, chat, trigger } = ctx

    // 1. Parse Mode and Query
    let mode = 'all'
    let query = ''
    let detailId = ''

    if (trigger === 'pddikti') {
      mode = args[0]?.toLowerCase() || 'all'
      if (mode === 'detail') {
        detailId = args[1] || ''
      } else {
        query = args.slice(1).join(' ')
      }
    } else {
      // Direct commands: !mhs, !dosen, etc.
      mode = trigger === 'mahasiswa' ? 'mhs' : trigger
      query = args.join(' ')
    }

    // 2. Validation
    if (mode === 'detail' && !detailId) {
      return sock.sendMessage(chat, { 
        text: '❌ Please provide a Mahasiswa ID.\nExample: `!pddikti detail <id>`\n\n_Get ID from a previous search result._' 
      }, { quoted: msg })
    }
    
    if (mode !== 'detail' && !query) {
      return sock.sendMessage(chat, { 
        text: ` Please provide a search query.\n\n*Usage:*\n- \`${ctx.prefix}pddikti mhs <name/nim>\`\n- \`${ctx.prefix}dosen <name/nidn>\`\n- \`${ctx.prefix}pt <university name>\`\n- \`${ctx.prefix}prodi <study program>\`\n- \`${ctx.prefix}pddikti all <keyword>\`\n- \`${ctx.prefix}pddikti detail <mahasiswaId>\`` 
      }, { quoted: msg })
    }

    if (query.length < 3 && mode !== 'detail') {
      return sock.sendMessage(chat, { text: '❌ Query is too short (minimum 3 characters).' }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } })

    try {
      // 3. Fetch Data
      let path = ''
      if (mode === 'detail') {
        path = `/detail/mhs/${encodeURIComponent(detailId)}`
      } else if (mode === 'all') {
        path = `/pencarian/all/${encodeURIComponent(query)}`
      } else if (mode === 'mhs') {
        path = `/pencarian/mhs/${encodeURIComponent(query)}`
      } else if (mode === 'dosen') {
        path = `/pencarian/dosen/${encodeURIComponent(query)}`
      } else if (mode === 'pt') {
        path = `/pencarian/pt/${encodeURIComponent(query)}`
      } else if (mode === 'prodi') {
        path = `/pencarian/prodi/${encodeURIComponent(query)}`
      } else {
        throw new Error(`Unknown mode '${mode}'. Use: all | mhs | dosen | pt | prodi | detail`)
      }

      const data = await pddiktiGet(path)

      // 4. Format & Send Response
      let message = ''

      if (mode === 'detail') {
        if (!data?.nama) throw new Error('Student not found or invalid ID.')
        const gender = data.jenis_kelamin === 'L' ? 'Laki-laki' : data.jenis_kelamin === 'P' ? 'Perempuan' : '-'
        message = `*Detail Mahasiswa*\n\n` +
                  ` *Name:* ${data.nama}\n` +
                  `*NIM:* ${data.nim}\n` +
                  ` *Gender:* ${gender}\n` +
                  `*Degree:* ${data.jenjang}\n` +
                  `*Major:* ${data.prodi}\n` +
                  `*University:* ${data.nama_pt}\n` +
                  `*Enrolled:* ${data.tanggal_masuk || '-'}\n` +
                  `*Status:* ${data.status_saat_ini || '-'}\n` +
                  `*Type:* ${data.jenis_daftar || '-'}`
      } 
      else if (mode === 'all') {
        const mhs = Array.isArray(data.mahasiswa) ? data.mahasiswa.slice(0, 3) : []
        const dosen = Array.isArray(data.dosen) ? data.dosen.slice(0, 3) : []
        const pt = Array.isArray(data.pt) ? data.pt.slice(0, 3) : []
        const prodi = Array.isArray(data.prodi) ? data.prodi.slice(0, 3) : []
        const total = mhs.length + dosen.length + pt.length + prodi.length

        message = ` *Found ${total} results for "${query}"*\n\n`
        
        if (mhs.length) {
          message += `*Students:*\n`
          mhs.forEach(m => message += `• ${m.nama} [${m.nim}]\n  _${m.nama_prodi} @ ${m.nama_pt}_\n`)
          message += `\n`
        }
        if (dosen.length) {
          message += `*Lecturers:*\n`
          dosen.forEach(d => message += `• ${d.nama} [NIDN ${d.nidn}]\n  _${d.nama_prodi} @ ${d.nama_pt}_\n`)
          message += `\n`
        }
        if (pt.length) {
          message += `*Universities:*\n`
          pt.forEach(p => message += `• ${p.nama} _(${p.nama_singkat || p.sinkatan_pt || '-'})_\n`)
          message += `\n`
        }
        if (prodi.length) {
          message += `*Majors:*\n`
          prodi.forEach(p => message += `• ${p.nama} _@ ${p.nama_pt || '-'}_\n`)
        }
      } 
      else {
        // Single mode (mhs, dosen, pt, prodi)
        const items = Array.isArray(data) ? data.slice(0, 5) : []
        if (items.length === 0) {
          message = ` No ${mode} results found for "${query}".`
        } else {
          message = ` *Found ${items.length} ${mode} results for "${query}"*\n\n`
          items.forEach((item, i) => {
            if (mode === 'mhs') {
              message += `*${i + 1}. ${item.nama}* [${item.nim}]\n_${item.nama_prodi} @ ${item.nama_pt}_\n\n`
            } else if (mode === 'dosen') {
              message += `*${i + 1}. ${item.nama}* [NIDN ${item.nidn}]\n_${item.nama_prodi} @ ${item.nama_pt}_\n\n`
            } else if (mode === 'pt') {
              message += `*${i + 1}. ${item.nama}*\n_(${item.nama_singkat || '-'}) | Code: ${item.kode || '-'}_\n\n`
            } else if (mode === 'prodi') {
              message += `*${i + 1}. ${item.nama}*\n_@ ${item.nama_pt || '-'}_\n\n`
            }
          })
        }
      }

      await sock.sendMessage(chat, { text: message }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      logger.error('pddikti error', error)
      await sock.sendMessage(chat, { 
        text: `❌ Failed to fetch data: ${error.message}` 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}