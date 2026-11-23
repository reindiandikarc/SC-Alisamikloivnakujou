/*
 * ╔══════════════════════════════════════════╗
 * ║        vanXone — JKT48 NOTIFIER         ║
 * ║     SHOWROOM AUTO LIVE NOTIFICATION     ║
 * ╚══════════════════════════════════════════╝
 *
 * Commands:
 * .jkt48 on
 * .jkt48 off
 * .jkt48 status
 * .jkt48 cek
 *
 * Auto polling:
 * - Default 60 detik
 * - Anti duplicate
 * - JSON storage
 * - Tidak membutuhkan AWS WAF token
 */


const SHOWROOM_API = 'https://www.showroom-live.com/api/live/onlives'

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36',
  'Accept': 'application/json,text/plain,*/*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.showroom-live.com/'
}

function isJKT48Room(room) {
  const key = String(room?.room_url_key || '').toLowerCase()
  const name = String(
    room?.main_name ||
    room?.room_name ||
    ''
  ).toLowerCase()

  /*
   * Akun resmi JKT48 di SHOWROOM umumnya
   * menggunakan room key JKT48_....
   *
   * Name check digunakan sebagai fallback.
   */
  return (
    key.startsWith('jkt48_') ||
    key.includes('jkt48') ||
    name.includes('jkt48')
  )
}

function extractLives(payload) {
  const result = []

  if (!payload || typeof payload !== 'object') {
    return result
  }

  /*
   * Bentuk API SHOWROOM biasanya:
   *
   * [
   *   {
   *      lives: [...]
   *   }
   * ]
   *
   * Tetapi dibuat fleksibel untuk beberapa
   * variasi response.
   */

  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (Array.isArray(item?.lives)) {
        result.push(...item.lives)
      }

      if (item?.room_url_key || item?.room_id) {
        result.push(item)
      }
    }
  }

  if (Array.isArray(payload?.lives)) {
    result.push(...payload.lives)
  }

  if (Array.isArray(payload?.data)) {
    for (const item of payload.data) {
      if (Array.isArray(item?.lives)) {
        result.push(...item.lives)
      }

      if (item?.room_url_key || item?.room_id) {
        result.push(item)
      }
    }
  }

  if (Array.isArray(payload?.onlives)) {
    result.push(...payload.onlives)
  }

  return result
}

function normalizeLive(room) {
  if (!room) return null

  const roomKey = String(room.room_url_key || '').trim()

  if (!roomKey) return null

  const name = String(
    room.main_name ||
    room.room_name ||
    room.name ||
    room.user?.name ||
    'Member JKT48'
  ).trim()

  const title = String(
    room.telop ||
    room.genre_name ||
    room.live_title ||
    ''
  ).trim()

  const viewers = Number(
    room.view_num ||
    room.viewers ||
    room.online_user_num ||
    0
  )

  const roomId = room.room_id || room.roomId || null

  const startedAt = Number(
    room.started_at ||
    room.current_live_started_at ||
    room.current_live_start_at ||
    0
  )

  const image = String(
    room.image ||
    room.room_image ||
    room.avatar ||
    ''
  ).trim()

  return {
    roomKey,
    roomId,
    name,
    title,
    viewers,
    startedAt,
    image,
    url: `https://www.showroom-live.com/r/${roomKey}`
  }
}

export async function fetchShowroomLives() {
  const response = await fetch(SHOWROOM_API, {
    method: 'GET',
    headers: HEADERS,
    redirect: 'follow'
  })

  if (!response.ok) {
    throw new Error(
      `SHOWROOM HTTP ${response.status} ${response.statusText}`
    )
  }

  const text = await response.text()

  let json

  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(
      'SHOWROOM mengembalikan response bukan JSON'
    )
  }

  const rooms = extractLives(json)
  const lives = []

  const seen = new Set()

  for (const room of rooms) {
    if (!isJKT48Room(room)) continue

    const live = normalizeLive(room)

    if (!live) continue

    if (seen.has(live.roomKey)) continue

    seen.add(live.roomKey)
    lives.push(live)
  }

  return lives
}

export function formatDuration(startedAt) {
  if (!startedAt) return '-'

  const start = Number(startedAt)

  if (!Number.isFinite(start)) {
    return '-'
  }

  const startMs = start < 10000000000
    ? start * 1000
    : start

  const diff = Date.now() - startMs

  if (diff < 0) return 'baru mulai'

  const totalMinutes = Math.floor(diff / 60000)

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours} jam ${minutes} menit`
  }

  return `${minutes} menit`
}

export default {
  fetchShowroomLives,
  formatDuration
};
