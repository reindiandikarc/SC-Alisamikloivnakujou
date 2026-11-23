// Plugin: generateimages
// Commands: generateimages
// Owner only - Generate gambar AI multi-model via cutout.pro
// Pure dari V10 Alya (case 'generateimages': case 'aiimg': owner only)

'use strict'

const axios = require('axios')

module.exports = {
  command: ['generateimages'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const {
      command, text, q,
      Ryuu,
      reply, replyalya, replytolak,
      mess,
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)

    async function generateImages(prompt) {
      const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      const userAgentList = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36'
      ]
      const models = [
        "Glowing Forest",
        "Vector Art",
        "Princess",
        "LoL",
        "Realistic Anime",
        "West Coast",
        "Blue Rhapsody",
        "Graffiti",
        "Clown",
        "Elf"
      ]

      let pull = []

      for (let i = 0; i < models.length; i++) {
        const randomUserAgent = userAgentList[Math.floor(Math.random() * userAgentList.length)]

        const source = await axios.post(
          'https://restapi.cutout.pro/web/ai/generateImage/generateAsync',
          {
            prompt: prompt,
            style: models[i],
            quantity: 1,
            width: 512,
            height: 512
          },
          {
            headers: {
              "Content-Type": "application/json",
              "User-Agent": randomUserAgent,
              "X-Forwarded-For": randomIP,
              "Referer": "https://www.cutout.pro/zh-CN/ai-art-generation/upload"
            }
          }
        )

        const data = source.data
        if (!data.data || !data.data.batchId) {
          throw new Error(`无法从 POST 响应中检索 batchId ${models[i]}`)
        }

        const batchId = data.data.batchId
        let status = false

        while (!status) {
          const txt2img = await axios.get(
            `https://restapi.cutout.pro/web/ai/generateImage/getGenerateImageTaskResult?batchId=${batchId}`,
            {
              headers: {
                "Accept": "application/json, text/plain, */*",
                "User-Agent": randomUserAgent,
                "X-Forwarded-For": randomIP,
                "Referer": "https://www.cutout.pro/zh-CN/ai-art-generation/upload"
              }
            }
          )

          const image = txt2img.data.data.text2ImageVoList
          status = image.every(image => image.status === 1)

          if (status) {
            const model_result = image.map((image, index) => ({
              model: models[i],
              url: image.resultUrl,
              creator_scrape: "INS"
            }))
            pull = pull.concat(model_result)
          } else {
            await new Promise(resolve => setTimeout(resolve, 0))
          }
        }
      }

      return { result: pull }
    }

    if (!text) return m.reply("[!] Contoh penggunaan: " + command + " <prompt>\n\n" +
      "Pilihan prompt:\n" +
      "- Glowing Forest\n" +
      "- Vector Art\n" +
      "- Princess\n" +
      "- LoL\n" +
      "- Realistic Anime\n" +
      "- West Coast\n" +
      "- Blue Rhapsody\n" +
      "- Graffiti\n" +
      "- Clown\n" +
      "- Elf"
    )

    reply('_foto akan segera di kirim ke private chat.._')
    let { result } = await generateImages(text)
    for (let res of result) {
      await alya.sendFile(m.sender, res.url, '', `Model: \`${res.model}\``, m)
    }
  }
}
