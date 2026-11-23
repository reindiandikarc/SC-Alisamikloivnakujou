// Plugin: editimg / editimage / editgambar
// Ported 100% dari Alya V10 case 'hitamkan' / live3d image editor
// Disesuaikan ke arsitektur plugin V20 (Baileys/Socketon)
// Credit: reindiandikarc

'use strict'

const axios   = require('axios')
const crypto  = require('crypto')
const fs      = require('fs')
const FormData = require('form-data')
const CryptoJS = require('crypto-js')

// ─── live3d RSA Public Key ────────────────────────────────────────────────────
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`

// ─── Helper: random alphanumeric string ──────────────────────────────────────
function randomString(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let res = ''
  for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
  return res
}

// ─── Helper: AES-CBC encrypt ─────────────────────────────────────────────────
function aesenc(data, key) {
  const k = CryptoJS.enc.Utf8.parse(key)
  return CryptoJS.AES.encrypt(data, k, {
    iv:      k,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString()
}

// ─── Helper: RSA encrypt ─────────────────────────────────────────────────────
function rsaenc(data) {
  const buffer = Buffer.from(data, 'utf8')
  return crypto.publicEncrypt(
    { key: PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING },
    buffer
  ).toString('base64')
}

// ─── Helper: generate live3d request headers ─────────────────────────────────
function genHeaders(fp = null) {
  const i = randomString(16)
  const s = rsaenc(i)
  return {
    'User-Agent':     'Mozilla/5.0',
    'Accept':         'application/json, text/plain, */*',
    'Accept-Language':'id,en-US;q=0.9,en;q=0.8',
    'origin':         'https://live3d.io',
    'referer':        'https://live3d.io/',
    'theme-version':  '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
    'fp':             fp,
    'fp1':            aesenc(`aifaceswap:${fp}`, i),
    'x-guide':        s,
    'x-sign':         aesenc(`aifaceswap:1H5tRtzsBkqXcaJ:${Date.now()}:${randomString(8)}:${s}`, i),
    'x-code':         Date.now().toString()
  }
}

// ─── Step 1: Upload gambar ke live3d ─────────────────────────────────────────
async function uploadImage(filePath) {
  const fp   = crypto.randomBytes(16).toString('hex')
  const form = new FormData()

  form.append('file',         fs.createReadStream(filePath))
  form.append('fn_name',      'demo-image-editor')
  form.append('request_from', '9')
  form.append('origin_from',  '8f3f0c7387123ae0')

  const res = await axios.post(
    'https://app-v1.live3d.io/aitools/upload-img',
    form,
    { headers: { ...genHeaders(fp), ...form.getHeaders() }, timeout: 30000 }
  )

  if (!res.data?.data?.path) throw new Error('Upload gagal: path tidak ditemukan')
  return { path: res.data.data.path, fp }
}

// ─── Step 2: Buat job AI edit ─────────────────────────────────────────────────
async function createJob(imgPath, prompt, fp) {
  const payload = {
    fn_name:      'demo-image-editor',
    call_type:    3,
    input: {
      model:         'nano_banana_2',
      source_images: [imgPath],
      prompt:        prompt,
      aspect_radio:  'auto',
      request_from:  9
    },
    request_from: 9,
    origin_from:  '8f3f0c7387123ae0'
  }

  const res = await axios.post(
    'https://app-v1.live3d.io/aitools/of/create',
    payload,
    { headers: { ...genHeaders(fp), 'Content-Type': 'application/json' }, timeout: 30000 }
  )

  if (!res.data?.data?.task_id) throw new Error('Gagal membuat task: ' + JSON.stringify(res.data))
  return res.data.data.task_id
}

// ─── Step 3: Polling status job ──────────────────────────────────────────────
async function checkJob(taskId, fp) {
  const res = await axios.post(
    'https://app-v1.live3d.io/aitools/of/check-status',
    {
      task_id:      taskId,
      fn_name:      'demo-image-editor',
      call_type:    3,
      request_from: 9,
      origin_from:  '8f3f0c7387123ae0'
    },
    { headers: { ...genHeaders(fp), 'Content-Type': 'application/json' }, timeout: 15000 }
  )

  return res.data.data
}

// ─── Core: upload → create job → polling → return URL ────────────────────────
async function live3dEdit(localImg, prompt) {
  const upload = await uploadImage(localImg)
  const taskId = await createJob(upload.path, prompt, upload.fp)

  let result
  let attempts = 0
  const maxAttempts = 30 // max ~2 menit (30 × 4 detik)

  do {
    await new Promise(r => setTimeout(r, 4000))
    result = await checkJob(taskId, upload.fp)
    attempts++
    if (attempts >= maxAttempts) throw new Error('Timeout: AI terlalu lama memproses')
  } while (result.status !== 2)

  if (!result.result_image) throw new Error('Hasil gambar tidak ditemukan')
  return 'https://temp.live3d.io/' + result.result_image
}

// ─── Plugin Export ────────────────────────────────────────────────────────────
module.exports = {
  command: ['editimg', 'editimage', 'editgambar'],
  tags:    ['ai'],
  run: async (alya, m, ctx) => {
    const {
      command, text, prefix, pushname,
      quoted, mime,
      reply, replyalya,
      db
    } = ctx

    // ── Cek gambar: harus reply gambar atau kirim gambar langsung ─────────────
    const isImgDirect  = /image/.test(mime)
    const isImgQuoted  = quoted && /image/.test((quoted.msg || quoted).mimetype || '')

    if (!isImgDirect && !isImgQuoted) {
      return replyalya(
        `🖼️ *AI Image Editor*\n\n` +
        `Cara pakai:\n` +
        `1. *Reply* foto dengan perintah:\n` +
        `   *${prefix + command}* <instruksi>\n\n` +
        `2. Atau kirim foto langsung dengan caption:\n` +
        `   *${prefix + command}* <instruksi>\n\n` +
        `📌 Contoh:\n` +
        `• \`${prefix + command} colour grading cinematic\`\n` +
        `• \`${prefix + command} buat langit jadi sunset\`\n` +
        `• \`${prefix + command} tambahkan efek vintage\``
      )
    }

    // ── Cek instruksi ─────────────────────────────────────────────────────────
    if (!text) {
      return replyalya(
        `✏️ Masukkan instruksi editing!\n\n` +
        `Contoh:\n` +
        `• \`${prefix + command} colour grading cinematic\`\n` +
        `• \`${prefix + command} buat jadi malam hari\`\n` +
        `• \`${prefix + command} tambah efek fog/kabut\``
      )
    }

    // ── Cek limit (biaya 10 limit) ────────────────────────────────────────────
    const biaya = 10
    const user  = db.users[m.sender]

    if (!user || user.limit < biaya) {
      return replyalya(
        `❌ *LIMIT TIDAK CUKUP*\n\n` +
        `• Dibutuhkan : ${biaya} Limit\n` +
        `• Sisa Limit : ${user?.limit ?? 0} Limit\n\n` +
        `💡 Top up limit terlebih dahulu!`
      )
    }

    // ── Mulai proses ──────────────────────────────────────────────────────────
    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    replyalya(
      `🎨 *AI Image Editor*\n\n` +
      `👤 User    : ${pushname}\n` +
      `✏️ Prompt  : ${text}\n` +
      `💰 Biaya   : ${biaya} Limit\n\n` +
      `_Sedang memproses... mohon tunggu ±30-60 detik_`
    )

    let mediaPath = null

    try {
      // Tentukan sumber gambar: quoted atau pesan langsung
      const src = isImgQuoted ? quoted : m
      mediaPath = await alya.downloadAndSaveMediaMessage(src)

      // Proses di live3d.io
      const hasilUrl = await live3dEdit(mediaPath, text)

      // Kurangi limit
      user.limit -= biaya

      // Kirim hasil
      await alya.sendMessage(m.chat, {
        image:   { url: hasilUrl },
        caption:
          `✅ *IMAGE EDITOR SUCCESS*\n\n` +
          `👤 User     : ${pushname}\n` +
          `✏️ Prompt   : ${text}\n` +
          `💰 Biaya    : ${biaya} Limit\n` +
          `💎 Sisa     : ${user.limit} Limit\n\n` +
          `_Powered by live3d.io × Alya Bot_`
      }, { quoted: m })

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
      console.error('[editimg] Error:', e)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(
        `❌ *Gagal memproses gambar*\n\n` +
        `Kemungkinan penyebab:\n` +
        `• Server live3d.io sedang sibuk\n` +
        `• Prompt tidak didukung\n` +
        `• Koneksi timeout\n\n` +
        `Silakan coba lagi nanti 🙏`
      )
    } finally {
      // Hapus file temp apapun hasilnya
      if (mediaPath && fs.existsSync(mediaPath)) {
        try { fs.unlinkSync(mediaPath) } catch (_) {}
      }
    }
  }
}
