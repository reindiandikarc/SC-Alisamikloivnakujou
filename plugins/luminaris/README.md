# Luminaris Modules → Alisa (port)

Port modul **LuminarisMD** ke ekosistem plugin Alisa. Kode modul disalin hampir
utuh; perbedaan infrastruktur dijembatani satu lapisan adapter, jadi tidak ada
modul yang ditulis ulang satu per satu.

## Struktur
```
plugins/
├─ luminaris.js                 ← satu-satunya file yang dibaca loader Alisa
└─ luminaris/
   ├─ _runtime/
   │  ├─ core-shim.js           ← pengganti `#core` (CHAT, logger, sessionManager, ...)
   │  ├─ store.js               ← moduleData (JSON di toolkit/db/luminaris.json)
   │  └─ adapter.js             ← ctx Luminaris ⇄ ev.on() Alisa + hook pesan
   └─ modules/                  ← converter, downloader, game, rpg, minecraft,
                                  leveling, utility, group (disalin dari Luminaris)
```

## Cara kerja
- `handle(ctx)` Luminaris dipanggil lewat `ev.on()`; `ctx` dibangun dari `cht`/`Exp` Alisa
  (`sock`, `msg`, `chat`, `sender`, `args`, `reply.*`, `moduleData`, `helpers.ui`).
- `role 0` → `isOwner`, `role 5` → `isAdmin`, `allow: group` → `isGroup`.
- **Command yang sudah ada di core Alisa tidak ditimpa.** Hanya command bebas yang
  didaftarkan (lihat `.lumods skipped`).
- `answerHandler` (jawaban kuis, sesi `topdf`) dan XP leveling jalan lewat satu hook
  kecil di `helpers/interactive.js` (`Data.luminarisHooks`), aman bila plugin dihapus.

## Yang SENGAJA tidak diport
| Bagian | Alasan |
|---|---|
| `main/*`, `bot/*` | Terikat core Luminaris (registry, sessionManager, quarantine); Alisa punya `.menu`, `.ping`, `.stats` sendiri |
| `utility/owner/*`, `utility/dev/*` | Memakai ORM/DB Luminaris; Alisa punya owner tools sendiri |
| `utility/info.js`, `utility/lib/banner.js` | Butuh `a2ui*` (fork Baileys Luminaris) / `canvas` |
| `group` antilink/antispam/antibot/antidelete/antitoxic/blacklist/welcome | Butuh event bus Luminaris; sudah ada native di `helpers/Events/group.js` |

## Pemasangan
1. `npm install` (dependensi baru: `sharp`, `google-tts-api`, `@pontalabs/ytdl`, `cakkatrok-instagram-downloader`).
2. Jalankan bot, atau kirim `.reloadevents`.
3. Cek dengan `.lumods` (status), `.lumods skipped`, `.lumods failed`.

Menonaktifkan modul tertentu: isi `luminaris_disabled: ['game','rpg']` di config Alisa (`cfg`).
