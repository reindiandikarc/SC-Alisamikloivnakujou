#!/usr/bin/env python3
"""
Port jalur `<unavailable>` Alya v13 / ryuuxalya ke Baileys fork kita.

ryuuxalya meminta resend di socket layer, SEBELUM decryptMessageNode/filter
kategori 'peer', dan memakai messageKey LENGKAP hasil decodeMessageNode
(senderPn/senderLid/participantLid). Fork kita hanya punya auto-resend di
dalam `category !== 'peer'`, sehingga PM 1x tidak pernah di-resend otomatis.

Patch ke ESM source DAN index.bundle.cjs (yang dipakai runtime). Idempoten.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1] / 'node_modules' / '@whiskeysockets' / 'baileys' / 'src'
FILES = [ROOT / 'Socket' / 'messages-recv.js', ROOT / 'index.bundle.cjs']
MARK = 'ALYA_V13_EARLY_RVO_PATCH'


def patch(path: Path) -> bool:
    s = path.read_text()
    if MARK in s:
        print(f'SKIP already patched: {path}')
        return False
    orig = s
    esm = path.name == 'messages-recv.js'
    q = "'" if esm else '"'
    ind = '        ' if esm else '    '

    # 1) deklarasi response + early unavailable branch, persis
    #    ryuuxalya messages-recv.js:795-803. Deklarasi HARUS sebelum
    #    pemakaian di branch early, kalau tidak kena TDZ ReferenceError.
    old = f'{ind}const encNode = getBinaryNodeChild(node, {q}enc{q});\n'
    early = f'''{ind}/* {MARK} */ let earlyRvoResponse = null;
{ind}/* {MARK} — ryuuxalya: <unavailable> ditangani lebih awal */
{ind}if (getBinaryNodeChild(node, {q}unavailable{q}) && !encNode) {{
{ind}    await sendMessageAck(node);
{ind}    const {{ key: earlyKey }} = decodeMessageNode(node, authState.creds.me.id, authState.creds.me.lid || {q}{q}).fullMessage;
{ind}    earlyRvoResponse = await requestPlaceholderResend(earlyKey, earlyKey ? {{ key: earlyKey, messageTimestamp: +node.attrs.t }} : undefined);
{ind}    if (earlyRvoResponse === {q}RESOLVED{q}) return;
{ind}    logger.debug({{ msgId: earlyKey?.id, requestId: earlyRvoResponse }}, {q}ALYA_V13 early placeholder resend requested{q});
{ind}}}
'''
    if old not in s:
        raise SystemExit(f'encNode anchor missing in {path}')
    s = s.replace(old, old + early, 1)

    # 2) sertakan requestId ke stub supaya [RVO diag] & recordRequestId melihatnya
    dec = 'await decrypt();' if esm else 'await decrypt2();'
    old = f'''{ind}{ind}{dec}
{ind}{ind}if (msg.key?.remoteJid && msg.key?.id && msg.message && messageRetryManager) {{'''
    new = f'''{ind}{ind}{dec}
{ind}{ind}/* {MARK} — requestId ikut stub, seperti ryuuxalya */
{ind}{ind}if (earlyRvoResponse && msg?.messageStubParameters?.[0] === NO_MESSAGE_FOUND_ERROR_TEXT) {{
{ind}{ind}    msg.messageStubParameters = [NO_MESSAGE_FOUND_ERROR_TEXT, earlyRvoResponse];
{ind}{ind}}}
{ind}{ind}if (msg.key?.remoteJid && msg.key?.id && msg.message && messageRetryManager) {{'''
    if old not in s:
        raise SystemExit(f'decrypt anchor missing in {path}')
    s = s.replace(old, new, 1)

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
