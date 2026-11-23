// lib/vx/loader.js — memuat plugin vanXone apa pun formatnya, menormalkan jadi
// { commands, tags, config, handler, help, limit }.
//
// Format yang didukung (semua ditemukan di vanXone V4):
//   1. export { pluginConfig as config, handler }        (nimbus, orbit, zenith — ESM)
//   2. export default handler + handler.command/help/tags (lumen, pulse — ESM)
//   3. module.exports = { config: pluginConfig, handler } (aurora — CJS)
//   4. module.exports = async function (__naren_imp, __naren_meta) { ... return { default: handler } }
//      (vortex — CJS wrapper; harus dipanggil dulu)
//   5. module.exports = handler / [{ command, run }]      (format lama Alya, tetap jalan)
'use strict'

require('./bootstrap')
const path = require('path')
const { createRequire } = require('node:module')
const { pathToFileURL } = require('node:url')
const { ALIASES, VX_SHIMS } = require('./bootstrap')

const VX_ROOT = path.join(__dirname, '..', '..', 'vx')

// ── Ekstraksi nama command ────────────────────────────────────────────────────
function fromRegex(re) {
  const body = String(re).replace(/^\/|\/[a-z]*$/g, '')
  return body.split('|')
    .map(s => s.replace(/[^\w.-]/g, ''))
    .filter(s => s.length >= 2)
}

function normCmd(v) {
  if (!v) return []
  if (v instanceof RegExp) return fromRegex(v.source)
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(normCmd)
  return []
}

function clean(list) {
  return [...new Set(list.map(c => String(c).toLowerCase().trim())
    .filter(c => /^[a-z0-9_.-]{2,40}$/.test(c)))]
}

function extractCommands(mod, handler, config) {
  const out = []
  if (config) {
    out.push(...normCmd(config.name))
    out.push(...normCmd(config.alias))
    out.push(...normCmd(config.command))
    out.push(...normCmd(config.commands))
  }
  if (handler) {
    out.push(...normCmd(handler.command))
    out.push(...normCmd(handler.commands))
    if (!out.length && Array.isArray(handler.help) && handler.help.length) {
      const first = String(handler.help[0]).split(/[\s<(]/)[0]
      out.push(...normCmd(first))
    }
  }
  if (!out.length && mod) {
    out.push(...normCmd(mod.command))
    if (Array.isArray(mod)) for (const p of mod) out.push(...normCmd(p?.command))
  }
  return clean(out)
}

function extractTags(handler, config) {
  const t = config?.category ? [config.category] : []
  if (Array.isArray(config?.tags)) t.push(...config.tags)
  if (Array.isArray(handler?.tags)) t.push(...handler.tags)
  return [...new Set(t.map(x => String(x).toLowerCase()).filter(Boolean))]
}

// ── Pembuka bungkus ───────────────────────────────────────────────────────────
// vortex memanggil __naren_imp(spec) sebagai fungsi import async. Sediakan fungsi
// nyata yang resolve DARI lokasi file plugin (createRequire(absPath)), supaya
// alias/shim berscope vx ikut berlaku. Hasil dibungkus gaya interop ESM: selalu
// ada .default (vortex memakai pola `const x = (await __naren_imp('x')).default`).
function makeImp(absPath) {
  const req = createRequire(absPath)
  return async (spec) => {
    let m
    try {
      m = req(spec)
    } catch (e) {
      if (e?.code === 'ERR_REQUIRE_ASYNC_MODULE' || e?.code === 'ERR_REQUIRE_ESM') {
        const mapped = VX_SHIMS[spec] ? pathToFileURL(VX_SHIMS[spec]).href : (ALIASES[spec] || spec)
        m = await import(mapped)
      } else throw e
    }
    if (m && typeof m === 'object' && 'default' in m) return m
    if (m && typeof m === 'object') return { ...m, default: m }
    return { default: m }
  }
}

async function unwrap(mod, absPath) {
  // vortex: module.exports = async function (__naren_imp, __naren_meta) { ... }
  if (typeof mod === 'function' && !mod.command && !mod.run &&
      /__naren_imp|__naren_meta/.test(Function.prototype.toString.call(mod).slice(0, 200))) {
    const inner = await mod(makeImp(absPath), { exports: {} })
    if (inner && typeof inner === 'object') return unwrap(inner, absPath)
    if (typeof inner === 'function') return { handler: inner }
    return {}
  }
  // ESM namespace / { default: handler }
  if (mod && typeof mod === 'object' && !mod.handler && !mod.run && typeof mod.default !== 'undefined') {
    const d = mod.default
    if (typeof d === 'function') {
      // lumen mengekspor `export async function before(...)` terpisah dari default.
      // Hook itu hilang bila hanya .default diambil → tempel ke handler.
      if (typeof mod.before === 'function' && !d.before) d.before = mod.before
      if (typeof mod.all === 'function' && !d.all) d.all = mod.all
      return { handler: d, config: mod.config || null }
    }
    if (d && typeof d === 'object') return unwrap(d, absPath)
  }
  if (mod && typeof mod === 'object' && (mod.handler || mod.run || mod.config)) return mod
  if (typeof mod === 'function') return { handler: mod }
  if (Array.isArray(mod)) return { list: mod }
  return mod && typeof mod === 'object' ? mod : {}
}

// ── Load satu file ────────────────────────────────────────────────────────────
async function loadRaw(absPath) {
  try {
    return require(absPath)
  } catch (e) {
    // ESM dengan top-level await tidak bisa di-require → pakai import()
    if (e?.code === 'ERR_REQUIRE_ASYNC_MODULE' || e?.code === 'ERR_REQUIRE_ESM') {
      return await import(pathToFileURL(absPath).href)
    }
    throw e
  }
}

async function loadPlugin(relPath) {
  const abs = path.isAbsolute(relPath) ? relPath : path.join(VX_ROOT, relPath)
  const raw = await loadRaw(abs)
  const mod = await unwrap(raw, abs)
  const handler = typeof mod.handler === 'function' ? mod.handler
    : (typeof mod.run === 'function' ? mod.run : null)
  const config = mod.config || null
  const commands = extractCommands(raw, handler, config)
  return {
    file: abs,
    rel: path.relative(VX_ROOT, abs),
    commands,
    tags: extractTags(handler, config),
    config,
    handler,
    help: handler?.help || config?.usage || null,
    limit: handler?.limit ?? config?.energi ?? null,
    list: mod.list || null,
    raw: mod,
  }
}

module.exports = { loadPlugin, loadRaw, unwrap, extractCommands, extractTags, normCmd, clean, VX_ROOT }
