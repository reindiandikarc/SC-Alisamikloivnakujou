#!/usr/bin/env python3
"""
Port perilaku Alya v13 (ryuuxalya) ke Baileys fork yang dipakai bot:

1. PM LID -> PN memakai stanza.attrs.sender_pn  (v13 decode-wa-message.js).
2. <unavailable type="view_once"> tetap memasang stub CIPHERTEXT, supaya
   auto-resend Baileys jalan (v13: `if (!decryptables)` tanpa pengecualian).
3. Tandai key.isViewOnce juga untuk stanza-1 (wrapper viewOnceMessage*),
   sesuai Baileys upstream PR #2435.

Patch diterapkan ke src ESM DAN index.bundle.cjs (yang dipakai runtime lewat
src/index.cjs). Idempoten: aman dijalankan ulang.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1] / 'node_modules' / '@whiskeysockets' / 'baileys' / 'src'
FILES = [ROOT / 'Utils' / 'decode-wa-message.js', ROOT / 'index.bundle.cjs']

MARK = '/* ALYA_V13_RVO_PATCH */'


def patch(path: Path) -> bool:
    s = path.read_text()
    if MARK in s:
        print(f'SKIP already patched: {path}')
        return False
    orig = s

    # --- 1. import isJidUser (ESM source only) -------------------------------
    if path.name == 'decode-wa-message.js':
        old = "import { areJidsSameUser, isHostedLidUser, isHostedPnUser, isJidBot, isJidBroadcast, isJidGroup, isJidMetaAI, isJidNewsletter, isJidStatusBroadcast, isLidUser, isPnUser } from '../WABinary/index.js';"
        new = "import { areJidsSameUser, isHostedLidUser, isHostedPnUser, isJidBot, isJidBroadcast, isJidGroup, isJidMetaAI, isJidNewsletter, isJidStatusBroadcast, isLidUser, isPnUser } from '../WABinary/index.js';"
        if old not in s:
            raise SystemExit(f'import anchor missing in {path}')
        s = s.replace(old, new, 1)

    # --- 2. normalizePrivateChatJid + pakai PN untuk PM ----------------------
    if path.name == 'decode-wa-message.js':
        old = """    const addressingContext = extractAddressingContext(stanza);
    const isMe = (jid) => areJidsSameUser(jid, meId);
    const isMeLid = (jid) => areJidsSameUser(jid, meLid);
"""
        new = """    const addressingContext = extractAddressingContext(stanza);
    const isMe = (jid) => areJidsSameUser(jid, meId);
    const isMeLid = (jid) => areJidsSameUser(jid, meLid);
    /* ALYA_V13_RVO_PATCH */
    const senderPn = stanza?.attrs?.sender_pn;
    const senderLid = stanza?.attrs?.sender_lid;
    const participantLid = stanza?.attrs?.participant_lid;
    const normalizePrivateChatJid = (jid) => {
        if (!isLidUser(jid)) return jid;
        if (senderPn && (isPnUser(senderPn) || isHostedPnUser(senderPn))) return senderPn;
        return jid;
    };
"""
    else:
        old = """  const addressingContext = extractAddressingContext(stanza);
  const isMe = (jid) => areJidsSameUser(jid, meId);
  const isMeLid = (jid) => areJidsSameUser(jid, meLid);
"""
        new = """  const addressingContext = extractAddressingContext(stanza);
  const isMe = (jid) => areJidsSameUser(jid, meId);
  const isMeLid = (jid) => areJidsSameUser(jid, meLid);
  /* ALYA_V13_RVO_PATCH */
  const senderPn = stanza?.attrs?.sender_pn;
  const senderLid = stanza?.attrs?.sender_lid;
  const participantLid = stanza?.attrs?.participant_lid;
  const normalizePrivateChatJid = (jid) => {
    if (!isLidUser(jid)) return jid;
    if (senderPn && (isPnUser(senderPn) || isHostedPnUser(senderPn))) return senderPn;
    return jid;
  };
"""
    if old not in s:
        raise SystemExit(f'addressing anchor missing in {path}')
    s = s.replace(old, new, 1)

    # chatId/author PM: pakai hasil normalisasi
    old_pm = """            chatId = from;
        }
        msgType = 'chat';
        author = from;
""" if path.name == 'decode-wa-message.js' else """      chatId = from;
    }
    msgType = "chat";
    author = from;
"""
    new_pm = """            chatId = normalizePrivateChatJid(from);
        }
        msgType = 'chat';
        /* ALYA_V13_RVO_PATCH */ author = normalizePrivateChatJid(from);
""" if path.name == 'decode-wa-message.js' else """      chatId = normalizePrivateChatJid(from);
    }
    msgType = "chat";
    /* ALYA_V13_RVO_PATCH */ author = normalizePrivateChatJid(from);
"""
    if old_pm not in s:
        raise SystemExit(f'PM anchor missing in {path}')
    s = s.replace(old_pm, new_pm, 1)

    # --- 3. key: sertakan identitas LID/PN untuk PDO ------------------------
    if path.name == 'decode-wa-message.js':
        old_key = """        fromMe,
        id: msgId,
        participant,
        participantAlt: isJidGroup(chatId) ? addressingContext.senderAlt : undefined,
"""
        new_key = """        fromMe,
        id: msgId,
        /* ALYA_V13_RVO_PATCH */
        senderPn,
        senderLid,
        participant,
        participantLid,
        participantAlt: isJidGroup(chatId) ? addressingContext.senderAlt : undefined,
"""
    else:
        old_key = """    fromMe,
    id: msgId,
    participant,
    participantAlt: isJidGroup(chatId) ? addressingContext.senderAlt : void 0,
"""
        new_key = """    fromMe,
    id: msgId,
    /* ALYA_V13_RVO_PATCH */
    senderPn,
    senderLid,
    participant,
    participantLid,
    participantAlt: isJidGroup(chatId) ? addressingContext.senderAlt : void 0,
"""
    if old_key not in s:
        raise SystemExit(f'key anchor missing in {path}')
    s = s.replace(old_key, new_key, 1)

    # --- 4. auto-resend: jangan kecualikan view_once ------------------------
    old_sup = "if (!decryptables && !fullMessage.key?.isViewOnce) {" if path.name == 'decode-wa-message.js' else "if (!decryptables && !fullMessage.key?.isViewOnce) {"
    new_sup = "if (!decryptables) { /* ALYA_V13_RVO_PATCH: view_once ikut stub */"
    if old_sup not in s:
        raise SystemExit(f'stub anchor missing in {path}')
    s = s.replace(old_sup, new_sup, 1)

    # --- 5. stanza-1 view-once flag (PR #2435) ------------------------------
    if path.name == 'decode-wa-message.js':
        old_assign = """                        if (fullMessage.message) {
                            Object.assign(fullMessage.message, msg);
                        }
                        else {
                            fullMessage.message = msg;
                        }
"""
        new_assign = """                        if (fullMessage.message) {
                            Object.assign(fullMessage.message, msg);
                        }
                        else {
                            fullMessage.message = msg;
                        }
                        /* ALYA_V13_RVO_PATCH — upstream PR #2435 */
                        const _voInner = msg.viewOnceMessage?.message || msg.viewOnceMessageV2?.message || msg.viewOnceMessageV2Extension?.message;
                        if (_voInner?.imageMessage?.viewOnce || _voInner?.videoMessage?.viewOnce || _voInner?.audioMessage?.viewOnce) {
                            fullMessage.key.isViewOnce = true;
                        }
"""
    else:
        old_assign = """            if (fullMessage.message) {
              Object.assign(fullMessage.message, msg);
            } else {
              fullMessage.message = msg;
            }
"""
        new_assign = """            if (fullMessage.message) {
              Object.assign(fullMessage.message, msg);
            } else {
              fullMessage.message = msg;
            }
            /* ALYA_V13_RVO_PATCH — upstream PR #2435 */
            const _voInner = msg.viewOnceMessage?.message || msg.viewOnceMessageV2?.message || msg.viewOnceMessageV2Extension?.message;
            if (_voInner?.imageMessage?.viewOnce || _voInner?.videoMessage?.viewOnce || _voInner?.audioMessage?.viewOnce) {
              fullMessage.key.isViewOnce = true;
            }
"""
    if old_assign not in s:
        raise SystemExit(f'assign anchor missing in {path}')
    s = s.replace(old_assign, new_assign, 1)

    if s == orig:
        raise SystemExit(f'no change in {path}')
    path.write_text(s)
    print(f'PATCHED {path}')
    return True


changed = 0
for f in FILES:
    changed += patch(f)
print(f'PATCHED_FILES={changed}')
sys.exit(0)
