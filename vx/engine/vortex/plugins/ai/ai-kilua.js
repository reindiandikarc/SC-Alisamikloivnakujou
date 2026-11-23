module.exports = async function (__naren_imp, __naren_meta) {


let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Masukkan teks.\nContoh: .kilua kamu siapa?")

  try {
    const prompt = encodeURIComponent(
      "Kamu adalah Killua Zoldyck dari anime Hunter x Hunter. " +
      "Kamu berbicara dengan gaya santai, sedikit usil, cuek tapi peduli, " +
      "suka cokelat, dan jangan menyebut dirimu sebagai AI."
    )

    const query = encodeURIComponent(text)
    const url = `https://api.deline.web.id/ai/openai?text=${query}&prompt=${prompt}`

    const res = await fetch(url)
    const data = await res.json()

    if (!data.status || !data.result) {
      return m.reply("AI Kilua tidak merespon.")
    }

    await conn.sendMessage(m.chat, {
      text: data.result,
      contextInfo: {
        externalAdReply: {
          title: "Killua Zoldyck AI",
          thumbnail: global.thumb,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply("Terjadi error saat menghubungi AI Kilua.")
  }
}

handler.help = ['kilua <teks>']
handler.tags = ['ai']
handler.command = /^kilua$/i
handler.limit = true

const __naren_default = handler;

;return { default: __naren_default };
}
