// lib/ztowner.js — data fitur owner hasil porting vanXone: user premium & grup "bypass mode self"
'use strict'
const { createStore } = require('../store')
const { userOf } = require('../utils')

const store = createStore('ztowner', { prem: [], bypass: [] })
const id = (j) => userOf(String(j).includes('@') ? j : `${String(j).replace(/\D/g, '')}@s.whatsapp.net`)

const isPremium = (jid) => !!jid && store.data.prem.includes(id(jid))
function addPrem(jid) {
  const u = id(jid)
  if (store.data.prem.includes(u)) return false
  store.data.prem.push(u)
  store.save()
  return true
}
function delPrem(jid) {
  const i = store.data.prem.indexOf(id(jid))
  if (i === -1) return false
  store.data.prem.splice(i, 1)
  store.save()
  return true
}
const listPrem = () => [...store.data.prem]

const isBypass = (gid) => store.data.bypass.includes(gid)
function setBypass(gid, on) {
  const has = isBypass(gid)
  if (on === has) return false
  if (on) store.data.bypass.push(gid)
  else store.data.bypass.splice(store.data.bypass.indexOf(gid), 1)
  store.save()
  return true
}

const listBypass = () => [...store.data.bypass]

module.exports = { listBypass, isPremium, addPrem, delPrem, listPrem, isBypass, setBypass }
