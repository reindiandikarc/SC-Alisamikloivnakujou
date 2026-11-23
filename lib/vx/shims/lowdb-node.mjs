// Shim untuk `lowdb/node` yang dipakai engine zenith/orbit (rimuru/vemzo database).
// vanXone memakai lowdb@7 (subpath `lowdb/node`), Alya memakai lowdb@2.1.0 yang
// mengekspor JSONFileSync/LowSync dari entry utama. Shim ini menjembatani subpath.
// Berada di lib/vx/shims (di luar vx/) supaya import 'lowdb' di sini tidak kena shim lagi.
export { JSONFileSync, TextFileSync, JSONFile, TextFile, Memory, MemorySync } from 'lowdb'
