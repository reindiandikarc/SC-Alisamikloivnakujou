'use strict'

const DIRECT_MEDIA = {
  imageMessage: 'isImage',
  videoMessage: 'isVideo',
  audioMessage: 'isAudio',
  stickerMessage: 'isSticker',
}

const QUOTED_MEDIA = {
  imageMessage: 'isQuotedImage',
  videoMessage: 'isQuotedVideo',
  stickerMessage: 'isQuotedSticker',
  audioMessage: 'isQuotedAudio',
  locationMessage: 'isQuotedLocation',
  contactMessage: 'isQuotedContact',
  documentMessage: 'isQuotedDocument',
}

const canonical = (value) => value === 'ptvMessage' ? 'videoMessage' : String(value || '')

const stringify = (value) => {
  try { return JSON.stringify(value || {}) || '' } catch { return '' }
}

function resolve(m) {
  const type = canonical(m?.type || m?.mtype)
  const quoted = m?.quoted || null
  const content = stringify(m?.message)
  const quotedType = canonical(quoted?.mtype || quoted?.type || '')
  const flags = {
    type,
    isImage: false,
    isVideo: false,
    isAudio: false,
    isSticker: false,
    isQuotedImage: false,
    isQuotedVideo: false,
    isQuotedSticker: false,
    isQuotedAudio: false,
    isQuotedLocation: false,
    isQuotedContact: false,
    isQuotedDocument: false,
    isQuotedViewOnce: false,
  }
  const direct = DIRECT_MEDIA[type]
  if (direct) flags[direct] = true
  if (type === 'extendedTextMessage') {
    for (const [mtype, key] of Object.entries(QUOTED_MEDIA)) {
      if (quotedType === mtype || content.includes(mtype)) flags[key] = true
    }
    if (quoted?.isViewOnce === true || /viewonce/i.test(content)) flags.isQuotedViewOnce = true
  }
  return flags
}

module.exports = { resolve, canonical }
