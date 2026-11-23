export const MAX_BYTES = 100 * 1024 * 1024

export const IMAGE_TARGETS = Object.freeze({
  jpg: { ext: 'jpg', mimetype: 'image/jpeg', animated: false, label: 'JPEG' },
  jpeg: { ext: 'jpg', mimetype: 'image/jpeg', animated: false, label: 'JPEG' },
  png: { ext: 'png', mimetype: 'image/png', animated: false, label: 'PNG' },
  webp: { ext: 'webp', mimetype: 'image/webp', animated: true, label: 'WebP' },
  gif: { ext: 'gif', mimetype: 'image/gif', animated: true, label: 'GIF' },
  tiff: { ext: 'tiff', mimetype: 'image/tiff', animated: true, label: 'TIFF' },
  avif: { ext: 'avif', mimetype: 'image/avif', animated: false, label: 'AVIF' }
})

export const MEDIA_TARGETS = Object.freeze({
  mp3: {
    ext: 'mp3', mimetype: 'audio/mpeg', kind: 'audio', label: 'MP3',
    args: ['-c:a', 'libmp3lame', '-q:a', '2']
  },
  m4a: {
    ext: 'm4a', mimetype: 'audio/mp4', kind: 'audio', label: 'M4A',
    args: ['-c:a', 'aac', '-b:a', '192k']
  },
  ogg: {
    ext: 'ogg', mimetype: 'audio/ogg', kind: 'audio', label: 'OGG',
    args: ['-c:a', 'libopus', '-b:a', '128k']
  },
  opus: {
    ext: 'opus', mimetype: 'audio/ogg', kind: 'audio', label: 'Opus',
    args: ['-c:a', 'libopus', '-b:a', '128k']
  },
  wav: {
    ext: 'wav', mimetype: 'audio/wav', kind: 'audio', label: 'WAV',
    args: ['-c:a', 'pcm_s16le']
  },
  aac: {
    ext: 'aac', mimetype: 'audio/aac', kind: 'audio', label: 'AAC',
    args: ['-c:a', 'aac', '-b:a', '192k']
  },
  mp4: {
    ext: 'mp4', mimetype: 'video/mp4', kind: 'video', label: 'MP4',
    args: ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '24',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart']
  },
  webm: {
    ext: 'webm', mimetype: 'video/webm', kind: 'video', label: 'WebM',
    args: ['-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1',
      '-c:a', 'libopus', '-b:a', '128k']
  },
  mkv: {
    ext: 'mkv', mimetype: 'video/x-matroska', kind: 'video', label: 'MKV',
    args: ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '24',
      '-c:a', 'aac', '-b:a', '128k']
  },
  mov: {
    ext: 'mov', mimetype: 'video/quicktime', kind: 'video', label: 'MOV',
    args: ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '24',
      '-c:a', 'aac', '-b:a', '192k']
  },
  gifv: {
    ext: 'mp4', mimetype: 'video/mp4', kind: 'video', label: 'GIF (MP4)',
    args: ['-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15', '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '28', '-movflags', '+faststart']
  }
})

const ALIASES = Object.freeze({
  jpeg: 'jpg',
  jpe: 'jpg',
  tif: 'tiff',
  mp4a: 'm4a',
  mpga: 'mp3',
  '3gp': 'mp4',
  'm4v': 'mp4',
  gifvideo: 'gifv'
})

export function normalizeFormat(raw) {
  if (typeof raw !== 'string') return null
  const key = raw.trim().toLowerCase().replace(/^\./, '')
  if (!key) return null
  const resolved = ALIASES[key] ?? key
  return resolved in IMAGE_TARGETS || resolved in MEDIA_TARGETS ? resolved : null
}

export function imageTarget(name) {
  return IMAGE_TARGETS[name] ?? null
}

export function mediaTarget(name) {
  return MEDIA_TARGETS[name] ?? null
}

export function formatSummary() {
  const images = Object.keys(IMAGE_TARGETS)
    .filter((k) => k !== 'jpeg')
    .sort()
  const media = [...new Set(Object.values(MEDIA_TARGETS).map((t) => t.ext))].sort()
  return { images: images.join(', '), media: media.join(', ') }
}