// Shim 'file-type' untuk kode vanXone: Alya memakai file-type@16 (CJS, API fromBuffer),
// vanXone memakai API modern fileTypeFromBuffer. Paket modern dipasang sebagai
// vx-file-type (file-type@19, ESM-only, tanpa kondisi "require" di exports map),
// jadi di-bridge lewat file ini: ESM named import DAN require(esm) sama-sama jalan.
// Kode Alya sendiri tetap memakai file-type@16 asli (alias hanya berlaku di pohon vx/).
import * as ft from 'vx-file-type'
export * from 'vx-file-type'
export default ft
