#!/usr/bin/env python3
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, 'node_modules', '@whiskeysockets', 'baileys')
BUNDLE = os.path.join(BASE, 'src', 'index.bundle.cjs')
ESM = os.path.join(BASE, 'src', 'Utils', 'messages.js')
MARK = 'ALYA_SOUND_STICKER_PATCH'


def read(path):
    with open(path, 'r', encoding='utf-8') as handle:
        return handle.read()


def write(path, text):
    temp = path + '.stcaudio.tmp'
    with open(temp, 'w', encoding='utf-8') as handle:
        handle.write(text)
    os.replace(temp, path)


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit('ANCHOR %s count=%d' % (label, count))
    return text.replace(old, new, 1)


def marker_counts():
    targets = {
        os.path.join(BASE, 'src', 'index.bundle.cjs'): [
            'ALYA_V13_RVO_PATCH',
            'ALYA_V13_EARLY_RVO_PATCH',
        ],
        os.path.join(BASE, 'src', 'Utils', 'decode-wa-message.js'): [
            'ALYA_V13_RVO_PATCH',
        ],
        os.path.join(BASE, 'src', 'Socket', 'messages-recv.js'): [
            'ALYA_V13_EARLY_RVO_PATCH',
        ],
    }
    counts = {}
    for path, markers in targets.items():
        text = read(path)
        for marker in markers:
            counts[(path, marker)] = text.count(marker)
    return counts


def check_markers_unchanged(before):
    after = marker_counts()
    if before != after:
        raise SystemExit('RVO MARKERS CHANGED: %s -> %s' % (before, after))
    return after


def patch_bundle(text):
    text = replace_once(
        text,
        '      StickerMessage.prototype.mediaKeyDomain = null;\n      let $oneOfFields2;',
        '      StickerMessage.prototype.mediaKeyDomain = null;\n      StickerMessage.prototype.audioMessage = null;\n      let $oneOfFields2;',
        'bundle proto property'
    )
    text = replace_once(
        text,
        '      Object.defineProperty(StickerMessage.prototype, "_mediaKeyDomain", {\n'
        '        get: $util.oneOfGetter($oneOfFields2 = ["mediaKeyDomain"]),\n'
        '        set: $util.oneOfSetter($oneOfFields2)\n'
        '      });\n'
        '      StickerMessage.create = function create(properties) {',
        '      Object.defineProperty(StickerMessage.prototype, "_mediaKeyDomain", {\n'
        '        get: $util.oneOfGetter($oneOfFields2 = ["mediaKeyDomain"]),\n'
        '        set: $util.oneOfSetter($oneOfFields2)\n'
        '      });\n'
        '      Object.defineProperty(StickerMessage.prototype, "_audioMessage", {\n'
        '        get: $util.oneOfGetter($oneOfFields2 = ["audioMessage"]),\n'
        '        set: $util.oneOfSetter($oneOfFields2)\n'
        '      });\n'
        '      StickerMessage.create = function create(properties) {',
        'bundle proto oneof'
    )
    text = replace_once(
        text,
        '        if (m.mediaKeyDomain != null && Object.hasOwnProperty.call(m, "mediaKeyDomain"))\n'
        '          w.uint32(184).int32(m.mediaKeyDomain);\n'
        '        return w;\n'
        '      };\n'
        '      StickerMessage.decode = function decode(r, l, e) {',
        '        if (m.mediaKeyDomain != null && Object.hasOwnProperty.call(m, "mediaKeyDomain"))\n'
        '          w.uint32(184).int32(m.mediaKeyDomain);\n'
        '        if (m.audioMessage != null && Object.hasOwnProperty.call(m, "audioMessage"))\n'
        '          $root.proto.Message.AudioMessage.encode(m.audioMessage, w.uint32(210).fork()).ldelim();\n'
        '        return w;\n'
        '      };\n'
        '      StickerMessage.decode = function decode(r, l, e) {',
        'bundle proto encode'
    )
    text = replace_once(
        text,
        '            case 21: {\n'
        '              m.isLottie = r.bool();\n'
        '              break;\n'
        '            }\n'
        '            case 22: {\n'
        '              m.accessibilityLabel = r.string();\n'
        '              break;\n'
        '            }\n'
        '            case 23: {\n'
        '              m.mediaKeyDomain = r.int32();\n'
        '              break;\n'
        '            }\n'
        '            default:\n'
        '              r.skipType(t & 7);',
        '            case 21: {\n'
        '              m.isLottie = r.bool();\n'
        '              break;\n'
        '            }\n'
        '            case 22: {\n'
        '              m.accessibilityLabel = r.string();\n'
        '              break;\n'
        '            }\n'
        '            case 23: {\n'
        '              m.mediaKeyDomain = r.int32();\n'
        '              break;\n'
        '            }\n'
        '            case 26: {\n'
        '              m.audioMessage = $root.proto.Message.AudioMessage.decode(r, r.uint32());\n'
        '              break;\n'
        '            }\n'
        '            default:\n'
        '              r.skipType(t & 7);',
        'bundle proto decode'
    )
    text = replace_once(
        text,
        '          case "BOT":\n'
        '          case 4:\n'
        '            m.mediaKeyDomain = 4;\n'
        '            break;\n'
        '        }\n'
        '        return m;\n'
        '      };\n'
        '      StickerMessage.toObject = function toObject(m, o) {',
        '          case "BOT":\n'
        '          case 4:\n'
        '            m.mediaKeyDomain = 4;\n'
        '            break;\n'
        '        }\n'
        '        if (d.audioMessage != null) {\n'
        '          if (typeof d.audioMessage !== "object")\n'
        '            throw TypeError(".proto.audioMessage: object expected");\n'
        '          m.audioMessage = $root.proto.Message.AudioMessage.fromObject(d.audioMessage);\n'
        '        }\n'
        '        return m;\n'
        '      };\n'
        '      StickerMessage.toObject = function toObject(m, o) {',
        'bundle proto fromObject'
    )
    text = replace_once(
        text,
        '        if (m.mediaKeyDomain != null && m.hasOwnProperty("mediaKeyDomain")) {\n'
        '          d.mediaKeyDomain = o.enums === String ? $root.proto.Message.MediaKeyDomain[m.mediaKeyDomain] === void 0 ? m.mediaKeyDomain : $root.proto.Message.MediaKeyDomain[m.mediaKeyDomain] : m.mediaKeyDomain;\n'
        '          if (o.oneofs)\n'
        '            d._mediaKeyDomain = "mediaKeyDomain";\n'
        '        }\n'
        '        return d;\n'
        '      };\n'
        '      StickerMessage.prototype.toJSON = function toJSON() {',
        '        if (m.mediaKeyDomain != null && m.hasOwnProperty("mediaKeyDomain")) {\n'
        '          d.mediaKeyDomain = o.enums === String ? $root.proto.Message.MediaKeyDomain[m.mediaKeyDomain] === void 0 ? m.mediaKeyDomain : $root.proto.Message.MediaKeyDomain[m.mediaKeyDomain] : m.mediaKeyDomain;\n'
        '          if (o.oneofs)\n'
        '            d._mediaKeyDomain = "mediaKeyDomain";\n'
        '        }\n'
        '        if (m.audioMessage != null && m.hasOwnProperty("audioMessage")) {\n'
        '          d.audioMessage = $root.proto.Message.AudioMessage.toObject(m.audioMessage, o);\n'
        '          if (o.oneofs)\n'
        '            d._audioMessage = "audioMessage";\n'
        '        }\n'
        '        return d;\n'
        '      };\n'
        '      StickerMessage.prototype.toJSON = function toJSON() {',
        'bundle proto toObject'
    )
    text = replace_once(
        text,
        'var prepareWAMessageMedia = async (message, options) => {\n  const logger = options.logger;',
        'var prepareWAMessageMediaBase = async (message, options) => {\n  const logger = options.logger;',
        'bundle prep rename'
    )
    wrapper = (
        'var prepareWAMessageMedia = async (message, options) => {\n'
        '  const ' + MARK + ' = true;\n'
        '  const stickerAudio = message.stickerAudio;\n'
        '  const baseMessage = { ...message };\n'
        '  delete baseMessage.stickerAudio;\n'
        '  const obj = await prepareWAMessageMediaBase(baseMessage, options);\n'
        '  if (stickerAudio && obj.stickerMessage) {\n'
        '    const audioOptions = { ...options };\n'
        '    delete audioOptions.mediaTypeOverride;\n'
        '    const prepared = stickerAudio && typeof stickerAudio === "object" && Object.prototype.hasOwnProperty.call(stickerAudio, "mediaKey")\n'
        '      ? stickerAudio\n'
        '      : (await prepareWAMessageMediaBase({ audio: stickerAudio, ptt: true }, audioOptions)).audioMessage;\n'
        '    if (prepared) {\n'
        '      obj.stickerMessage.audioMessage = prepared;\n'
        '    }\n'
        '  }\n'
        '  return obj;\n'
        '};\n'
    )
    text = replace_once(
        text,
        '  if (cacheableKey) {\n'
        '    logger?.debug({ cacheableKey }, "set cache");\n'
        '    await options.mediaCache.set(cacheableKey, proto.Message.encode(obj).finish());\n'
        '  }\n'
        '  return obj;\n'
        '};\n'
        'var prepareDisappearingMessageSettingContent = (ephemeralExpiration) => {',
        '  if (cacheableKey) {\n'
        '    logger?.debug({ cacheableKey }, "set cache");\n'
        '    await options.mediaCache.set(cacheableKey, proto.Message.encode(obj).finish());\n'
        '  }\n'
        '  return obj;\n'
        '};\n' + wrapper +
        'var prepareDisappearingMessageSettingContent = (ephemeralExpiration) => {',
        'bundle prep wrapper'
    )
    return text


def patch_esm(text):
    text = replace_once(
        text,
        "export const prepareWAMessageMedia = async (message, options) => {\n    const logger = options.logger;",
        "const prepareWAMessageMediaBase = async (message, options) => {\n    const logger = options.logger;",
        'esm prep rename'
    )
    wrapper = (
        'export const prepareWAMessageMedia = async (message, options) => {\n'
        '    const ' + MARK + ' = true;\n'
        '    const stickerAudio = message.stickerAudio;\n'
        '    const baseMessage = { ...message };\n'
        '    delete baseMessage.stickerAudio;\n'
        '    const obj = await prepareWAMessageMediaBase(baseMessage, options);\n'
        '    if (stickerAudio && obj.stickerMessage) {\n'
        '        const audioOptions = { ...options };\n'
        '        delete audioOptions.mediaTypeOverride;\n'
        '        const prepared = stickerAudio && typeof stickerAudio === "object" && Object.prototype.hasOwnProperty.call(stickerAudio, "mediaKey")\n'
        '            ? stickerAudio\n'
        '            : (await prepareWAMessageMediaBase({ audio: stickerAudio, ptt: true }, audioOptions)).audioMessage;\n'
        '        if (prepared) {\n'
        '            obj.stickerMessage.audioMessage = prepared;\n'
        '        }\n'
        '    }\n'
        '    return obj;\n'
        '};\n'
    )
    text = replace_once(
        text,
        '    if (cacheableKey) {\n'
        "        logger?.debug({ cacheableKey }, 'set cache');\n"
        '        await options.mediaCache.set(cacheableKey, WAProto.Message.encode(obj).finish());\n'
        '    }\n'
        '    return obj;\n'
        '};\n'
        'export const prepareDisappearingMessageSettingContent = (ephemeralExpiration) => {',
        '    if (cacheableKey) {\n'
        "        logger?.debug({ cacheableKey }, 'set cache');\n"
        '        await options.mediaCache.set(cacheableKey, WAProto.Message.encode(obj).finish());\n'
        '    }\n'
        '    return obj;\n'
        '};\n' + wrapper +
        'export const prepareDisappearingMessageSettingContent = (ephemeralExpiration) => {',
        'esm prep wrapper'
    )
    return text


def main():
    for path in (BUNDLE, ESM):
        if not os.path.isfile(path):
            raise SystemExit('MISSING ' + path)

    if MARK in read(BUNDLE) and MARK in read(ESM):
        print('SKIP ' + MARK)
        print('MARKERS=' + str(marker_counts()))
        print('PATCHED_FILES=0')
        return

    before = marker_counts()
    write(BUNDLE, patch_bundle(read(BUNDLE)))
    write(ESM, patch_esm(read(ESM)))
    after = check_markers_unchanged(before)
    print('PATCHED ' + MARK)
    print('MARKERS=' + str(after))
    print('PATCHED_FILES=2')


if __name__ == '__main__':
    main()
