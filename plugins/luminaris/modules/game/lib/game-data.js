import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sessionManager } from '../../../_runtime/core-shim.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, '../data')

const gameCache = new Map()

const GAME_NS = 'game'

// ─── DATA LOADING ──────────────────────────────────────────────
export function loadData(filename) {
  if (gameCache.has(filename)) return gameCache.get(filename)
  const filePath = join(dataPath, filename)
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    gameCache.set(filename, data)
    return data
  } catch {
    return []
  }
}

export function getRandomItem(filename) {
  const data = loadData(filename)
  if (!data?.length) return null
  return data[Math.floor(Math.random() * data.length)]
}

// ─── ANSWER MATCHING ───────────────────────────────────────────
function normalizeAnswer(answer) {
  if (!answer) return ''
  return answer
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshteinDistance(str1, str2) {
  const m = str1.length
  const n = str2.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

function getSimilarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 1
  return (maxLen - levenshteinDistance(str1, str2)) / maxLen
}

export function checkAnswerAdvanced(correctAnswer, userAnswer) {
  const n1 = normalizeAnswer(correctAnswer)
  const n2 = normalizeAnswer(userAnswer)
  if (n1 === n2) return { status: 'correct', similarity: 1 }
  if (n1.includes(n2) || n2.includes(n1)) {
    if (n2.length >= n1.length * 0.8) return { status: 'correct', similarity: 0.95 }
  }
  const similarity = getSimilarity(n1, n2)
  if (similarity >= 0.85) return { status: 'correct', similarity }
  if (similarity >= 0.6) return { status: 'close', similarity }
  return { status: 'wrong', similarity }
}

// ─── HINTS ─────────────────────────────────────────────────────
export function getHint(answer, revealCount = 2) {
  if (!answer) return ''
  return answer
    .split('')
    .map((char, i) => (char === ' ' ? ' ' : i < revealCount ? char : '_'))
    .join('')
}

export function getProgressiveHint(answer, attempts) {
  if (!answer) return ''
  const chars = answer.split('')
  const totalChars = chars.filter((c) => c !== ' ').length
  const reveal = Math.min(totalChars, 2 + Math.floor(attempts / 2))
  let revealed = 0
  return chars
    .map((char) => {
      if (char === ' ') return ' '
      if (revealed < reveal) {
        revealed++
        return char
      }
      return '_'
    })
    .join('')
}

// ─── SESSIONS ──────────────────────────────────────────────────
// Delegasi ke generic SessionManager (namespace: 'game'). Key sesi sekarang
// per user per chat, jadi tiap anggota grup bisa main game sendiri-sendiri.
export function createSession(chatId, sender, gameType, question, messageKey, timeout = 60000) {
  return sessionManager.createSession(GAME_NS, chatId, sender, {
    gameType,
    question,
    messageKey,
    attempts: 0,
  }, timeout)
}

export function setSessionTimer(chatId, sender, callback) {
  sessionManager.setSessionTimer(GAME_NS, chatId, callback, sender)
}

export function getSession(chatId, sender) {
  return sessionManager.getSession(GAME_NS, chatId, sender)
}

export function endSession(chatId, sender) {
  return sessionManager.endSession(GAME_NS, chatId, sender)
}

export function hasActiveSession(chatId, sender) {
  return sessionManager.hasActiveSession(GAME_NS, chatId, sender)
}

export function getRemainingTime(chatId, sender) {
  const session = sessionManager.getSession(GAME_NS, chatId, sender)
  if (!session) return 0
  return Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))
}

export function formatRemainingTime(seconds) {
  if (seconds <= 0) return '0 detik'
  if (seconds < 60) return `${seconds} detik`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

// ─── MISC ──────────────────────────────────────────────────────
export function isSurrender(text) {
  if (!text) return false
  const words = [
    'nyerah', 'aku nyerah', 'gw nyerah', 'gue nyerah', 'menyerah',
    'skip', 'lewat', 'ga tau', 'gatau', 'gak tau', 'tidak tau',
    'nggak tau', 'give up',
  ]
  return words.includes(text.toLowerCase().trim())
}

export function isReplyToGame(msg, session) {
  if (!msg?.message?.extendedTextMessage?.contextInfo || !session?.messageKey) return false
  const quotedMsgId = msg.message.extendedTextMessage.contextInfo.stanzaId
  if (!quotedMsgId) return false
  if (quotedMsgId === session.messageKey.id) return true
  if (session.messageKey.id.includes(quotedMsgId) || quotedMsgId.includes(session.messageKey.id)) return true
  return false
}

export function getRandomReward() {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  return { koin: rand(500, 2000), exp: rand(1000, 3000) }
}

// ─── CLEANUP ───────────────────────────────────────────────────
// Cleanup otomatis ditangani oleh SessionManager (setiap 5 menit).
// Tidak perlu interval terpisah di sini.