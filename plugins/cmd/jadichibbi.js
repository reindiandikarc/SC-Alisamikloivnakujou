// Plugin: jadichibbi
// Auto-generated from Alya V12
// Commands: chibbi, jadichibbi

const path = require('path')

module.exports = {
  command: ["chibbi", "jadichibbi"],
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

    try {
        let biaya = 10
        let user = global.db.users[m.sender]
        let before = user.limit

        if (before < biaya) {
            return m.reply(`*AKSES DITOLAK*\n\nLimit Anda tidak mencukupi.\n\n• Dibutuhkan: ${biaya}\n• Sisa Limit: ${before}`)
        }

        if (!/image/.test(mime)) return m.reply(`Kirim atau balas gambar dengan perintah:\n*.hijabkan*`)

        const prompt = "buat orang/karakter ini menjadi karakter versi chibby nya tanpa mengubah style pakaiannya"

        await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        const axios = require("axios")
        const crypto = require("crypto")
        const fs = require("fs")
        const FormData = require("form-data")
        const CryptoJS = require("crypto-js")

        function randomString(len){
            const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
            let res=""
            for(let i=0;i<len;i++) res+=chars.charAt(Math.floor(Math.random()*chars.length))
            return res
        }

        const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
    0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
    AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
    r/myG9S+9cR5huTuFQIDAQAB
    -----END PUBLIC KEY-----`

        function aesenc(data,key){
            const k=CryptoJS.enc.Utf8.parse(key)
            const encrypted=CryptoJS.AES.encrypt(data,k,{
                iv:k,
                mode:CryptoJS.mode.CBC,
                padding:CryptoJS.pad.Pkcs7
            })
            return encrypted.toString()
        }

        function rsaenc(data){
            const buffer=Buffer.from(data,'utf8')
            const encrypted=crypto.publicEncrypt(
                {key:PUBLIC_KEY,padding:crypto.constants.RSA_PKCS1_PADDING},
                buffer
            )
            return encrypted.toString('base64')
        }

        function genHeaders(fp=null){
            const i = randomString(16)
            const s = rsaenc(i)
            return {
                'User-Agent':'Mozilla/5.0',
                'Accept':'application/json, text/plain, */*',
                'Accept-Language':'id,en-US;q=0.9,en;q=0.8',
                'origin':'https://live3d.io',
                'referer':'https://live3d.io/',
                'theme-version':'83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
                'fp': fp,
                'fp1': aesenc(`aifaceswap:${fp}`, i),
                'x-guide': s,
                'x-sign': aesenc(`aifaceswap:1H5tRtzsBkqXcaJ:${Date.now()}:${randomString(8)}:${s}`, i),
                'x-code': Date.now().toString()
            }
        }

        async function uploadImage(path){
            const fp = crypto.randomBytes(16).toString('hex')
            const form = new FormData()

            form.append('file', fs.createReadStream(path))
            form.append('fn_name','demo-image-editor')
            form.append('request_from','9')
            form.append('origin_from','8f3f0c7387123ae0')

            const res = await axios.post(
                'https://app-v1.live3d.io/aitools/upload-img',
                form,
                { headers: { ...genHeaders(fp), ...form.getHeaders() } }
            )

            return { path: res.data.data.path, fp }
        }

        async function createJob(imgPath, prompt, fp){
            const payload = {
                fn_name:'demo-image-editor',
                call_type:3,
                input:{
                    model:'nano_banana_2',
                    source_images:[imgPath],
                    prompt: prompt,
                    aspect_radio:'auto',
                    request_from:9
                },
                request_from:9,
                origin_from:'8f3f0c7387123ae0'
            }

            const res = await axios.post(
                'https://app-v1.live3d.io/aitools/of/create',
                payload,
                { headers: { ...genHeaders(fp), 'Content-Type':'application/json' } }
            )

            return res.data.data.task_id
        }

        async function checkJob(taskId, fp){
            const res = await axios.post(
                'https://app-v1.live3d.io/aitools/of/check-status',
                {
                    task_id: taskId,
                    fn_name:'demo-image-editor',
                    call_type:3,
                    request_from:9,
                    origin_from:'8f3f0c7387123ae0'
                },
                { headers: { ...genHeaders(fp), 'Content-Type':'application/json' } }
            )

            return res.data.data
        }

        async function live3dEdit(localImg, prompt){
            const upload = await uploadImage(localImg)
            const taskId = await createJob(upload.path, prompt, upload.fp)

            let result
            do {
                await new Promise(r => setTimeout(r, 4000))
                result = await checkJob(taskId, upload.fp)
            } while(result.status !== 2)

            return 'https://temp.live3d.io/' + result.result_image
        }

        const media = await alya.downloadAndSaveMediaMessage(quoted)
        const hasil = await live3dEdit(media, prompt)

        user.limit -= biaya

        await alya.sendMessage(m.chat,{
            image:{url:hasil},
            caption: `*IMAGE EDITOR SUCCESS*\n\n` +
                     `• *Mode:* Jadi chibby\n` +
                     `• *Biaya:* ${biaya} Limit\n` +
                     `• *Sisa:* ${user.limit} Limit`
        },{quoted:m})

        fs.unlinkSync(media)
        await alya.sendMessage(m.chat,{react:{text:"✅",key:m.key}})

    } catch(e) {
        console.error(e)
        m.reply('Gagal memproses gambar. Silakan coba lagi nanti.')
    }
  }
}
