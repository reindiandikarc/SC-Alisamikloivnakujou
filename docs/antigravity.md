# Perintah `.agy` / `.antigravity`

Perintah ini memanggil **Google Antigravity CLI** (`agy`) secara headless:

```
agy -p "<pertanyaan>" --sandbox
```

Flag `-p` (`--print` / `--prompt`) adalah mode headless resmi, dan `--sandbox`
mengaktifkan sandbox terminal untuk sesi tersebut. Keduanya sesuai dokumentasi
Antigravity: https://antigravity.google/docs/cli/headless

## Kenapa dulu muncul `Error: spawn .../agy ENOENT`

Plugin mengasumsikan binary sudah ada di `~/.local/bin/agy`. Binary itu **tidak**
termasuk dependency npm, tidak dipasang oleh `install_tools.sh`, dan tidak ada di
`PATH` runtime. Sekarang plugin melakukan preflight dan memberi pesan yang jelas,
bukan `ENOENT` mentah.

## Pasang di mesin yang menjalankan bot

1. Pasang CLI resmi (sebagai user yang menjalankan bot):

   ```sh
   curl -fsSL https://antigravity.google/cli/install.sh | bash
   ```

2. Pastikan binary bisa ditemukan:

   ```sh
   export PATH="$HOME/.local/bin:$PATH"
   command -v agy
   agy --version
   ```

3. **Login interaktif sekali** dengan akun Google owner:

   ```sh
   agy
   ```

   Mode headless (`-p`) hanya memakai kredensial yang sudah tersimpan. Jika belum
   login, perintah akan meminta login. Jangan pernah menaruh token, API key, atau
   kredensial lain di repo / database / pesan bot.

## Penemuan binary (urutan)

Plugin mencari, saat perintah dipanggil (tidak perlu restart bot setelah install):

1. `AGY_BIN` dari environment bot (path absolut atau nama di `PATH`).
2. `~/.local/bin/agy` (lokasi installer resmi).
3. Lokasi umum lain: `~/.npm-global/bin`, `~/.bun/bin`, `~/go/bin`,
   `/usr/local/bin`, `/usr/bin`, `/opt/agy/bin`, `/snap/bin`.
4. `agy` pertama yang executable di `PATH` (setara `command -v agy`).

Jika binary tidak ada / tidak executable, bot membalas dengan petunjuk install
dan `AGY_BIN`. Jika CLI belum login, bot membalas dengan petunjuk login owner.

## Environment opsional

- `AGY_BIN=/path/ke/agy` — paksa binary tertentu.
- `AGY_SANDBOX=0` — jangan mengirim flag `--sandbox`.

Catatan: pada sebagian host Linux/container yang memblokir user namespace,
`--sandbox` bisa tidak berpengaruh (lihat dokumentasi terminal sandbox
Antigravity). Mode headless juga tidak bisa menjawab prompt permission; atur
izin lewat `~/.gemini/antigravity-cli/settings.json` bila diperlukan. Plugin ini
**tidak** memakai `--dangerously-skip-permissions`.
