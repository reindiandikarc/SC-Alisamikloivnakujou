const PAGE_SIZES = {
  a4: [595, 842],
  letter: [612, 792],
  legal: [612, 1008]
}

export const PAGE_SIZE_NAMES = Object.keys(PAGE_SIZES)

/**
 * Bungkus N JPEG jadi satu PDF, satu gambar per halaman.
 *
 * @param {Array<{data: Buffer, width: number, height: number}>} images
 *   JPEG mentah per halaman. Buffer harus JPEG sungguhan — writer ini tidak
 *   memvalidasi isinya, dan byte non-JPEG akan menghasilkan PDF rusak.
 * @param {{size?: string, width?: number, height?: number}} [opts]
 *   `size` = salah satu kunci PAGE_SIZES (case-insensitive), atau
 *   `width`/`height` dalam poin untuk ukuran sendiri.
 * @returns {Buffer} PDF lengkap dengan xref + trailer.
 */
export function buildPdf(images, opts = {}) {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error('Butuh minimal satu gambar')
  }

  const [pageW, pageH] = resolvePageSize(opts)

  const objs = []
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objs[2] =
    `<< /Type /Pages /Kids [${images.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] ` +
    `/Count ${images.length} >>`

  for (const [i, img] of images.entries()) {
    const pageObj = 3 + i * 3

    objs[pageObj] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
      `/Contents ${pageObj + 1} 0 R /Resources << /XObject << /Im0 ${pageObj + 2} 0 R >> >> >>`

    const stream = contentStream(img, pageW, pageH)
    objs[pageObj + 1] =
      `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`

    objs[pageObj + 2] = Buffer.concat([
      Buffer.from(
        `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode ` +
        `/Length ${img.data.length} >>\nstream\n`,
        'latin1'
      ),
      img.data,
      Buffer.from('\nendstream', 'latin1')
    ])
  }

  let out = '%PDF-1.4\n'
  const offsets = []
  for (let i = 1; i < objs.length; i++) {
    offsets[i] = out.length
    out += `${i} 0 obj\n${objs[i].toString('latin1')}\nendobj\n`
  }

  const xrefAt = Buffer.byteLength(out, 'latin1')
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n`
  for (let i = 1; i < objs.length; i++) {
    out += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'
  }
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`

  return Buffer.from(out, 'latin1')
}

function contentStream(img, pageW, pageH) {
  const imgW = img.width
  const imgH = img.height

  if (!(imgW > 0) || !(imgH > 0)) {
    throw new Error(`Dimensi gambar tidak valid: ${imgW}x${imgH}`)
  }

  const scale = Math.min(pageW / imgW, pageH / imgH)
  const drawW = round2(imgW * scale)
  const drawH = round2(imgH * scale)
  const x = round2((pageW - drawW) / 2)
  const y = round2((pageH - drawH) / 2)

  return [
    'q',
    // Halaman PDF tanpa isi transparan dan tiap viewer menanganinya beda-beda.
    // JPEG tidak punya kanal alpha, jadi marginnya akan putih di mana pun --
    // tapi lebih baik ditulis eksplisit daripada bergantung pada itu.
    //
    // Kotak putih WAJIB lewat `re` dulu. `cm` hanya mengubah transformasi dan
    // tidak membuat path, jadi `f` tanpa path itu error, dan pembaca PDF
    // membatalkan SELURUH content stream termasuk pemanggilan /Im0 Do.
    '1 g',
    `0 0 ${pageW} ${pageH} re`,
    'f',
    `${drawW} 0 0 ${drawH} ${x} ${y} cm`,
    '/Im0 Do',
    'Q'
  ].join('\n')
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function resolvePageSize({ size, width, height }) {
  const key = typeof size === 'string' ? size.trim().toLowerCase() : ''
  if (key && PAGE_SIZES[key]) return PAGE_SIZES[key]

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return [Math.round(width), Math.round(height)]
  }

  return PAGE_SIZES.a4
}