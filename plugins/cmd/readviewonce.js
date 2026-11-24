'use strict'
















const {
  asBuffer,
  extractMedia,
  findContextInfo,
  findMediaCandidates,
  downloadFromMediaObj,
  downloadV20Style,
  mediaTypeFromMime,
  candidateJids
} = require('../../lib/rvo-extract')
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys')
const { recoverViewOnce } = require('../../lib/rvo-recover')
const { relayContentFromQuoted } = require('../../lib/rvo-relay')

const numOnly = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
const sameJid = (a, b) => !!(a && b && numOnly(a) === numOnly(b))

const dbg = (msg) => {
  if (process.env.ALYA_BUTTON_DEBUG === '1') console.log('[RVO_DEBUG] ' + msg)
}

const keyShape = (obj, depth = 0) => {
  if (!obj || typeof obj !== 'object' || depth > 3) return ''
  const skip = /mediaKey|fileEncSha256|fileSha256|hash|token|secret/i
  return Object.keys(obj).filter(k => !skip.test(k)).slice(0, 24).map(k => {
    const v = obj[k]
    const inner = v && typeof v === 'object' && !Buffer.isBuffer(v) && !(v instanceof Uint8Array)
      ? '{' + keyShape(v, depth + 1) + '}' : ''
    return k + inner
  }).join(',')
}

function cacheEntryMatches(entry, m, jids, quotedSender, exact) {
  if (!entry || typeof entry !== 'object') return false
  if (entry.fromMe && !entry.vo) return false
  if (entry.chat && !jids.some(jid => sameJid(jid, entry.chat))) return false
  const when = Number(entry.cachedAt)
  if (when && Date.now() - when > 30 * 60 * 1000) return false
  if (exact) return true
  const from = numOnly(entry.sender)
  const qNum = numOnly(quotedSender)
  const meNum = numOnly(m.sender)
  if (qNum && from !== qNum && from !== meNum) return false
  return true
}

module.exports = {
  command: ['rvo', 'readviewonce', 'rvome', 'getviewonce'],
  tags: ['general'],
  category: 'tools',
  run: async (alaya, m, ctx) => {
    const { command, prefix, quoted, mime, replyalya } = ctx || {}

    const react = (text) => alaya.sendMessage(m.chat, { react: { text, key: m.key } }).catch(() => {})
    const sendReply = (text) => typeof replyalya === 'function'
      ? replyalya(text)
      : alaya.sendMessage(m.chat, { text: String(text) }, { quoted: m })
    const fail = async (text) => {
      await react('❌')
      return sendReply(text)
    }
    const cmd = (prefix || '.') + (command || 'rvo')
    const actionable = () =>
      'Ups, sepertinya saya tidak dapat mendeteksi pesan 1x lihat yang dikirim oleh orang tersebut!\n\n' +
      '❌ *Media sekali lihat tidak ditemukan / gagal diunduh.*\n\n' +
      '> ◦ Kirim ulang foto/video/audio sebagai pesan *sekali lihat*, lalu reply pesan itu dengan *' + cmd + '*.\n' +
      '> ◦ Bisa juga kirim media sekali lihat dengan caption *' + cmd + '*.\n' +
      '> ◦ Media biasanya hilang karena bot baru restart atau sudah dilihat sebelum di-cache.'

    
    if (!(global._rvoCache instanceof Map)) global._rvoCache = new Map()
    if (!(global._rvoCacheMeta instanceof Map)) global._rvoCacheMeta = new Map()
    const rvoCache = global._rvoCache
    const rvoCacheMeta = global._rvoCacheMeta

    const contextInfo = findContextInfo(m)
    const stanzaId =
      contextInfo?.stanzaId ||
      quoted?.id || quoted?.key?.id ||
      m.key?.id || null
    const quotedSender = contextInfo?.participant || quoted?.sender || quoted?.key?.participant || null
    
    
    const jids = candidateJids(
      contextInfo?.remoteJid,
      quoted?.chat,
      quoted?.key?.remoteJid,
      quotedSender,
      m.chat
    )

    dbg('stanzaId=' + (stanzaId || '-') +
      ' jids=' + jids.join(',') +
      ' quoted.keys=' + (quoted && typeof quoted === 'object' ? Object.keys(quoted).join(',') : '-') +
      ' contextInfo.keys=' + (contextInfo && typeof contextInfo === 'object' ? Object.keys(contextInfo).join(',') : '-'))

    await react('⏱️')

    
    
    
    
    
    const relaySource = contextInfo?.quotedMessage || quoted?.fakeObj?.message
    const relay = relayContentFromQuoted(relaySource)
    if (relay) {
      try {
        const dest = command === 'rvome' ? m.sender : m.chat
        await alaya.relayMessage(dest, relay.content, {})
        dbg('relay OK dest=' + dest + ' type=' + relay.mediaType + ' viewOnce=' + relay.hadViewOnce)
        await react('✅')
        return sendReply('✅ Media sekali lihat diteruskan dari descriptor aslinya.')
      } catch (e) {
        dbg('relay gagal: ' + (e?.message || e))
      }
    }

    try {
      let lastVo = null
      try { lastVo = await global._viewonceBuffer?.latest?.() } catch (_) {}

      const ids = [...new Set([
        stanzaId,
        quoted?.id,
        quoted?.key?.id,
        (extractMedia(m?.message) || extractMedia(m?.msg)) ? m.key?.id : null,
        quoted ? null : lastVo?.id
      ].filter(Boolean))]

      let senderJid = quotedSender || (quoted ? null : m.sender) || null
      const linkCaption = quoted?.caption || quoted?.text || quoted?.msg?.caption || m.msg?.caption || ''
      let found = null
      const fromExtract = (extract, buffer, extra = {}) => ({
        mediaType: extract?.mediaType || mediaTypeFromMime(extract?.mime || mime),
        mime: extract?.mime || mime || '',
        caption: extract?.caption || '',
        ptt: !!extract?.ptt,
        fileName: extract?.fileName || 'file.bin',
        buffer,
        ...extra
      })

      
      let cachedId = null
      let cachedEntry = null
      for (const id of ids) {
        const entry = rvoCache.get(id)
        if (cacheEntryMatches(entry, m, jids, quotedSender, true)) {
          cachedId = id
          cachedEntry = entry
          break
        }
      }
      if (!cachedEntry) {
        let best = null
        for (const [id, entry] of rvoCache) {
          if (!cacheEntryMatches(entry, m, jids, quotedSender, false)) continue
          const when = Number(entry.cachedAt) || 0
          if (!best || when > best.when) best = { id, when }
        }
        if (best) {
          cachedId = best.id
          cachedEntry = rvoCache.get(cachedId)
        }
      }

      if (cachedEntry) {
        let buffer = asBuffer(cachedEntry.buffer) || asBuffer(cachedEntry.vo?.buffer)
        if (!buffer && cachedId) buffer = asBuffer(global._viewonceBuffer?.get?.(cachedId))
        if (!buffer && cachedEntry.content?.mediaKey) {
          buffer = await downloadFromMediaObj(cachedEntry.content, cachedEntry.type).catch(() => null)
        }
        if (buffer) {
          const extract = extractMedia(cachedEntry.content)
          found = fromExtract(extract || {
            mediaType: cachedEntry.type,
            mime: cachedEntry.mimetype,
            caption: cachedEntry.caption,
            ptt: cachedEntry.ptt
          }, buffer)
          const fromCache = rvoCacheMeta.get(cachedId)?.sender || cachedEntry.sender || cachedEntry.vo?.sender
          if (fromCache) senderJid = fromCache
          dbg('cache OK id=' + (cachedId || '-') + ' bytes=' + buffer.length)
        }
      }

      
      
      
      
      if (!found) {
        for (const id of ids) {
          const buffered = asBuffer(global._viewonceBuffer?.get?.(id))
          if (!buffered?.length) continue
          const extr = extractMedia(quoted) || {
            mediaType: mediaTypeFromMime(quoted?.mimetype || quoted?.mime || mime),
            mime: quoted?.mimetype || quoted?.mime || mime || 'image/jpeg',
            caption: linkCaption,
          }
          found = fromExtract(extr, buffered, { source: 'buffer:' + id })
          dbg('buffer OK id=' + id + ' bytes=' + buffered.length)
          break
        }
      }

      
      
      
      
      if (!found && stanzaId) {
        const recovered = await recoverViewOnce({
          id: stanzaId,
          chat: m.chat,
          jids,
          quoted,
          rawBackup: global._rawBackup,
          store: ctx?.store,
          mediaCache: global._mediaCache,
          nativeDownload: (raw, mode, opts) => downloadMediaMessage(raw, mode, opts),
          contentDownload: (node, type) => downloadContentFromMessage(node, type),
        }).catch((e) => { dbg('recover: ' + (e?.message || e)); return null })
        if (recovered?.buffer?.length) {
          found = fromExtract(recovered, recovered.buffer, { source: recovered.source })
          dbg('recover OK source=' + recovered.source + ' bytes=' + recovered.buffer.length)
        }
      }

      
      if (!found && !quoted && !extractMedia(m.message) && !extractMedia(m.msg) && lastVo?.buffer?.length) {
        found = fromExtract({
          mediaType: mediaTypeFromMime(lastVo.mime),
          mime: lastVo.mime || '',
          caption: ''
        }, asBuffer(lastVo.buffer))
      }

      
      if (!found && global._mediaCache && typeof global._mediaCache === 'object') {
        for (const id of ids) {
          const cached = global._mediaCache[id]
          if (!cached?.message) continue
          for (const jid of candidateJids(cached.jid, ...jids)) {
            
            
            const source = { key: { id, remoteJid: jid }, message: cached.message }
            const buffer = asBuffer(await alaya.downloadMediaMessage(source).catch(() => null))
            if (buffer) {
              const extract = extractMedia(source)
              found = fromExtract(extract, buffer, { mime: extract?.mime || mime || '' })
              dbg('mediaCache OK id=' + id + ' jid=' + jid + ' bytes=' + buffer.length)
              break
            }
          }
          if (!found) {
            const extract = extractMedia(cached.message)
            if (extract) {
              const buffer = await downloadFromMediaObj(extract.mediaObj, extract.mediaType).catch(() => null)
              if (buffer) found = fromExtract(extract, buffer)
            }
          }
          if (found) break
        }
      }

      
      if (!found && stanzaId) {
        const sources = []
        try {
          if (typeof m.getQuotedObj === 'function') {
            const qObj = await m.getQuotedObj()
            if (qObj) sources.push(qObj)
          }
        } catch (e) { dbg('getQuotedObj: ' + (e?.message || e)) }

        
        
        if (typeof ctx?.store?.loadMessage === 'function') {
          for (const jid of jids) {
            try {
              const raw = await ctx.store.loadMessage(jid, stanzaId)
              if (raw) sources.push(raw)
            } catch (e) { dbg('store ' + jid + ': ' + (e?.message || e)) }
          }
        }

        for (const qObj of sources) {
          const extract = extractMedia(qObj)
          if (!extract) continue
          let buffer = await downloadFromMediaObj(extract.mediaObj, extract.mediaType).catch(() => null)
          if (!buffer && qObj?.message) {
            
            const raw = {
              key: qObj.key || { id: stanzaId, remoteJid: jids[0] || m.chat },
              message: qObj.message
            }
            buffer = asBuffer(await alaya.downloadMediaMessage(raw).catch(() => null))
          }
          if (buffer) {
            found = fromExtract(extract, buffer)
            dbg('getQuotedObj/store OK bytes=' + buffer.length)
            break
          }
        }
      }

      
      if (!found) {
        
        
        const candidates = await findMediaCandidates(m, { includeQuotedObj: false })
        const attempted = new Set()
        for (const cand of candidates) {
          const mediaObj = cand.extract.mediaObj
          if (attempted.has(mediaObj)) continue
          attempted.add(mediaObj)
          const buffer = await downloadFromMediaObj(mediaObj, cand.extract.mediaType).catch(() => null)
          if (buffer) {
            found = fromExtract(cand.extract, buffer)
            dbg('quoted extract OK source=' + cand.source + ' bytes=' + buffer.length)
            break
          }
        }
        
        
        
        
        
        
        
        if (!found && typeof alaya?.downloadMediaMessage === 'function') {
          const buffer = asBuffer(await alaya.downloadMediaMessage(quoted).catch(() => null))
          if (buffer?.length) {
            const extract = candidates.find(c => c.source === 'quoted')?.extract || extractMedia(quoted)
            found = fromExtract(extract, buffer, {
              mime: extract?.mime || quoted?.mime || quoted?.mimetype || mime || '',
              source: 'v20.downloadMediaMessage'
            })
            dbg('v20.downloadMediaMessage OK bytes=' + buffer.length)
          }
        }
        if (!found) {
          const buffer = await downloadV20Style(quoted).catch(() => null)
          if (buffer?.length) {
            const extract = extractMedia(quoted) || {}
            found = fromExtract(extract, buffer, {
              mime: extract.mime || quoted?.mime || quoted?.mimetype || mime || '',
              source: 'v20.downloadContentFromMessage'
            })
            dbg('v20.downloadContentFromMessage OK bytes=' + buffer.length)
          }
        }
        if (!found && typeof quoted?.download === 'function') {
          const buffer = asBuffer(await quoted.download().catch(() => null))
          if (buffer) {
            const extract = candidates.find(c => c.source === 'quoted')?.extract || extractMedia(quoted)
            found = fromExtract(extract, buffer, {
              mime: extract?.mime || quoted?.mime || quoted?.mimetype || mime || ''
            })
            dbg('quoted.download OK bytes=' + buffer.length)
          }
        }
      }

      if (!found || !found.buffer?.length) {
        const _rb = global._rawBackup
        const _rbHas = (id) => id && _rb && (typeof _rb.has === 'function' ? _rb.has(id) : !!_rb[id])
        dbg('gagal: stanzaId=' + (stanzaId || '-') +
          ' ids=' + ids.join(',') + ' cache=' + rvoCache.size +
          ' rawBackup=' + ids.map(_rbHas).join('/') +
          ' mediaCache=' + ids.map(id => id && !!global._mediaCache?.[id]).join('/') +
          ' quoted.material=' + !!(quoted?.mediaKey || quoted?.url || quoted?.directPath || quoted?.thumbnailDirectPath || quoted?.msg?.mediaKey) +
          ' mime=' + (quoted?.mimetype || quoted?.mime || mime || '-') +
          ' quoted.keys=' + (quoted && typeof quoted === 'object' ? Object.keys(quoted).join(',') : '-') +
          ' contextInfo.keys=' + (contextInfo ? Object.keys(contextInfo).join(',') : '-'))
        dbg('shape.quoted=' + keyShape(quoted))
        dbg('shape.quotedMessage=' + keyShape(contextInfo?.quotedMessage))

        
        
        
        const pending = stanzaId ? global._rvoPending?.get(stanzaId) : null
        if (pending && typeof alaya.requestPlaceholderResend === 'function') {
          const lastAsk = Number(pending.lastAsk) || 0
          if (Date.now() - lastAsk > 5000) {
            pending.lastAsk = Date.now()
            Promise.resolve()
              .then(() => alaya.requestPlaceholderResend(pending.key, pending.msgData))
              .then(requestId => {
                if (requestId && requestId !== 'RESOLVED') pending.requestId = requestId
                dbg('resend ulang id=' + stanzaId + ' requestId=' + (requestId || '-'))
              })
              .catch(e => dbg('resend ulang gagal: ' + (e?.message || e)))
          }
          await react('⏳')
          return sendReply(
            '⏳ *Media sekali lihat sedang diminta ulang dari HP.*\n\n' +
            '> Pastikan HP/WhatsApp online, lalu reply pesan 1× itu dengan *' + cmd + '* lagi beberapa detik.\n' +
            '> Kalau media sudah dilihat sebelum bot menyimpannya, WhatsApp tidak bisa mengirim ulang isinya.'
          )
        }

        return fail(actionable())
      }

      
      const mediaType = String(found.mediaType || mediaTypeFromMime(found.mime)).toLowerCase()
      const originalCaption = found.caption || linkCaption || ''
      const infoCaption =
        '`⌜ Read View Once ⌟`\n' +
        '> ◦ *Dari :* ' + (senderJid ? '@' + numOnly(senderJid) : 'Pengirim') +
        (originalCaption ? '\n> ◦ *Caption :* ' + originalCaption : '')
      const opts = { quoted: m, mentions: senderJid ? [senderJid] : [] }
      const outMime = found.mime || mime || ''

      if (mediaType.includes('video')) {
        await alaya.sendMessage(m.chat, {
          video: found.buffer,
          caption: infoCaption,
          mimetype: outMime || 'video/mp4'
        }, opts)
      } else if (mediaType.includes('audio')) {
        await alaya.sendMessage(m.chat, {
          audio: found.buffer,
          mimetype: outMime || 'audio/mp4',
          ptt: !!found.ptt || /ogg|opus/i.test(outMime)
        }, opts)
      } else if (mediaType.includes('document')) {
        await alaya.sendMessage(m.chat, {
          document: found.buffer,
          mimetype: outMime || 'application/octet-stream',
          fileName: found.fileName || 'file.bin',
          caption: infoCaption
        }, opts)
      } else {
        await alaya.sendMessage(m.chat, {
          image: found.buffer,
          caption: infoCaption,
          mimetype: outMime || 'image/jpeg'
        }, opts)
      }

      await react('✅')
    } catch (err) {
      dbg('ERROR: ' + (err?.message || String(err)))
      return fail(actionable())
    }
  }
}
