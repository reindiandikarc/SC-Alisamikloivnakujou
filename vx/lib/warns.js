// Peringatan (warn) per grup
const { createStore } = require('./store')
const { userOf } = require('./utils')

const store = createStore('warns', {})
const d = store.data

const list = (group, user) => d[group]?.[userOf(user)] || []

function add(group, user, reason) {
  d[group] = d[group] || {}
  const arr = (d[group][userOf(user)] = d[group][userOf(user)] || [])
  arr.push({ reason: reason || '-', time: Date.now() })
  store.save()
  return arr.length
}

function remove(group, user) {
  const arr = d[group]?.[userOf(user)]
  if (!arr?.length) return 0
  arr.pop()
  if (!arr.length) delete d[group][userOf(user)]
  store.save()
  return arr.length
}

function clear(group, user) {
  if (d[group]?.[userOf(user)]) {
    delete d[group][userOf(user)]
    store.save()
  }
}

module.exports = { list, add, remove, clear }
