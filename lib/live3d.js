// lib/live3d.js — helper live3d.io
// Kode lama (apikey, RSA/AES signing, endpoint hardcode) dihapus.
// Isi LIVE3D_ENDPOINT nanti, lalu implementasi ulang live3dEdit().
'use strict'

const LIVE3D_ENDPOINT = ''

async function live3dEdit() {
  throw new Error('Endpoint live3d.io belum dikonfigurasi')
}

module.exports = { live3dEdit, LIVE3D_ENDPOINT }
