# Plugin Ecosystem — Alisa Miklovna Kujou Bell

Folder ini (`./plugins/`) adalah tempat semua plugin command disimpan secara
terpisah dari core bawaan (`./helpers/Events/`). Tujuannya supaya nambah,
hapus, atau cek fitur baru **tidak perlu lagi edit file besar di
`helpers/Events/*.js`** dan **tidak perlu restart proses** — cukup lewat
command di WhatsApp.

## Command yang tersedia (owner only)

| Command | Fungsi |
|---|---|
| `.listplugin` | Menampilkan semua plugin yang terpasang beserta command-nya |
| `.getplugin <nama>` | Mengirim ulang source code + info plugin tertentu |
| `.addplugin <nama>` | Menambahkan plugin baru (lihat 3 cara di bawah) |
| `.delplugin <nama>` | Menghapus plugin & langsung reload event |

Setelah `.addplugin`/`.delplugin`, bot otomatis memanggil
`ev.reloadEventHandlers()` (command yang sama persis dengan `.reloadevents`),
jadi perubahan langsung aktif tanpa restart.

## 3 cara menambahkan plugin lewat `.addplugin`

1. **Reply file `.js`**
   Reply (quote) dokumen `.js`, lalu ketik:
   `.addplugin namaplugin`

2. **Dari URL**
   `.addplugin namaplugin https://raw.githubusercontent.com/.../plugin.js`

3. **Tempel kode langsung**
   ```
   .addplugin namaplugin
   export default async function on({ cht, ev }) {
     ev.on({ cmd: ['contoh'] }, async () => {
       cht.reply('Halo!');
     });
   }
   ```

Nama plugin otomatis dibersihkan (hanya huruf/angka/`-`/`_`) dan akan
disimpan sebagai `plugins/<nama>.js`. Sebelum disimpan, kode divalidasi
dulu (dicoba di-import) — kalau ada syntax error atau tidak punya
`export default`, `.addplugin` akan menolak dan menampilkan pesan error-nya.

## Format plugin

Plugin memakai API **yang sama persis** dengan file command bawaan di
`helpers/Events/` — tidak ada API baru yang perlu dipelajari:

```js
export const meta = {
  name: 'Nama Plugin',       // opsional, tapi disarankan
  desc: 'Deskripsi singkat', // opsional
  version: '1.0.0',          // opsional
  author: 'Nama kamu',       // opsional
  category: 'tools',         // opsional
};

export default async function on({ cht, ev, Exp, store, ai, is }) {
  ev.on(
    {
      cmd: ['contohcmd', 'alias1'],   // wajib: array nama command
      listmenu: ['contohcmd'],        // opsional: muncul di .help
      isOwner: true,                  // opsional: batasi ke owner
      tag: 'tools',                   // opsional: kategori untuk energy/game dll
    },
    async ({ args, cht, media, urls }) => {
      cht.reply('Halo dari plugin!');
    }
  );
}
```

`meta` dibaca lewat regex (tanpa menjalankan kode), jadi `.listplugin` dan
`.getplugin` aman dipakai meski ada banyak plugin sekaligus.

## Memindahkan fitur lama ke plugin (opsional)

File-file di `helpers/Events/*.js` (owner.js, game.js, ai.js, dst) **tidak
perlu diubah** — semuanya tetap jalan seperti biasa karena loader sekarang
membaca dua folder sekaligus (`helpers/Events/` untuk core, `plugins/`
untuk plugin) dengan cara yang 100% backward compatible.

Kalau suatu saat mau memecah salah satu fitur jadi plugin supaya lebih
gampang dikelola terpisah, caranya:

1. Copy isi satu blok `ev.on({...}, async (...) => {...})` dari file core.
2. Taruh di file baru `plugins/namafitur.js`, bungkus dengan
   `export default async function on({ cht, ev, Exp }) { ... }`.
3. Hapus blok yang sama dari file core (supaya tidak dobel command).
4. `.addplugin` / taruh file manual lalu `.reloadevents`.
