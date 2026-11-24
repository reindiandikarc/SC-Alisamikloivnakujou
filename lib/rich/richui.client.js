/**
 * © Kureza MD — Hitoshi MD V1
 * Created by Kureza
 */

/* Kode yang berjalan DI DALAM kartu menu (browser WhatsApp). Dibaca & ditanam oleh lib/richui.js.
   Tanpa scroll: tinggi kartu otomatis, daftar dipecah per halaman (‹ ›). Jangan pakai backtick di file ini.
   v8: NOL EMOJI - semua ikon = Font Awesome (nama ikon dikirim server di data: it.i, c.icon). */

(function () {
  'use strict'
  var D = JSON.parse(new TextDecoder('utf-8').decode(Uint8Array.from(atob(window.__D), function (c) { return c.charCodeAt(0) })))
  var $ = function (i) { return document.getElementById(i) }
  function I(n) { return n ? '<svg class="fi" aria-hidden="true"><use href="#f-' + n + '"/></svg>' : '' }
  function E(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

  var P = D.prefix
  var view = D.start === 'cat' ? 'cat' : D.start === 'all' ? 'all' : 'home'
  var cat = D.cat || null
  var q = ''
  var pg = 0
  var lastN = 1
  var t0 = Date.now()
  var toastT
  var typed = false
  var rndItem = null
  var PER = 7 // perintah per halaman (daftar kategori / hasil cari)
  var PER_ALL = 24 // chip per halaman (semua menu)

  function fmtUp(s) {
    s = Math.floor(s)
    var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
    return (d ? d + 'd ' : '') + h + 'h ' + m + 'm ' + (s % 60) + 's'
  }
  function clock() {
    try { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()) } catch (e) { return new Date().toTimeString().slice(0, 8) }
  }
  function toast(m, ic) {
    var t = $('toast')
    t.innerHTML = (ic ? I(ic) + ' ' : '') + E(m)
    t.className = 'toast on'
    clearTimeout(toastT)
    toastT = setTimeout(function () { t.className = 'toast' }, 2600)
  }

  // tap perintah: sendPrompt (kalau ada) -> link wa.me (kalau diaktifkan) -> salin ke clipboard
  function act(c) {
    var sent = false
    try { if (typeof window.sendPrompt === 'function') { window.sendPrompt(c); sent = true } } catch (e) {}
    if (!sent && D.link) {
      try { var a = document.createElement('a'); a.href = D.link + encodeURIComponent(c); a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); sent = true } catch (e) {}
    }
    function old() {
      try { var x = document.createElement('textarea'); x.value = c; x.style.position = 'fixed'; x.style.opacity = '0'; document.body.appendChild(x); x.select(); var ok = document.execCommand('copy'); x.remove(); return ok } catch (e) { return false }
    }
    function done(ok) { sent ? toast('Dijalankan: ' + c, 'play') : ok ? toast('Disalin: ' + c + ' - tempel & kirim ke chat', 'copy') : toast('Ketik: ' + c, 'keyboard') }
    if (sent) return done(false)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(c).then(function () { done(true) }, function () { done(old()) })
      else done(old())
    } catch (e) { done(old()) }
  }
  window.act = act

  // ---------- helper tampilan
  function hl(text) {
    var k = q.trim()
    var s = E(text)
    if (!k) return s
    try {
      var re = new RegExp('(' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig')
      return s.replace(re, '<span class="hl">$1</span>')
    } catch (e) { return s }
  }
  function item(it) {
    return '<div class="ci tp" data-c="' + E(it.c) + '"><div class="e">' + I(it.i) + '</div><div class="tx"><div class="c">' + hl(P + it.c) + '</div>' + (it.d ? '<div class="d">' + hl(it.d) + '</div>' : '') + '</div><div class="go">' + I('chevron-right') + '</div></div>'
  }
  function clamp(n) { lastN = Math.max(1, n); if (pg > lastN - 1) pg = lastN - 1; if (pg < 0) pg = 0 }
  function pager() {
    if (lastN < 2) return ''
    var f = pg < 1 ? ' disabled' : '', l = pg >= lastN - 1 ? ' disabled' : ''
    return '<div class="pgn"><button class="pgb" data-pg="first"' + f + '>«</button><button class="pgb" data-pg="-1"' + f + '>‹</button><span class="pgi">' + (pg + 1) + ' / ' + lastN + '</span><button class="pgb" data-pg="1"' + l + '>›</button><button class="pgb" data-pg="last"' + l + '>»</button></div>'
  }
  function list(arr) {
    clamp(Math.ceil(arr.length / PER))
    return '<div class="panel"><div class="cl">' + arr.slice(pg * PER, pg * PER + PER).map(item).join('') + '</div></div>' + pager()
  }
  function find() {
    var k = q.trim().toLowerCase(), o = []
    D.cats.forEach(function (c) { c.items.forEach(function (i) { if (i.c.toLowerCase().indexOf(k) > -1 || (i.d || '').toLowerCase().indexOf(k) > -1) o.push(i) }) })
    return o.slice(0, 200)
  }
  function allItems() {
    var o = []
    D.cats.forEach(function (c) { c.items.forEach(function (i) { o.push(i) }) })
    return o
  }
  function pickRandom() {
    var all = allItems()
    if (!all.length) return null
    var n = all[Math.floor(Math.random() * all.length)]
    if (rndItem && all.length > 1 && n.c === rndItem.c) return pickRandom()
    return n
  }
  function avatar(u) {
    return u.avatar ? '<div class="avr"><img class="av" src="' + E(u.avatar) + '" alt=""></div>' : '<div class="avr"><div class="av">' + E(String(u.name || '?').charAt(0).toUpperCase()) + '</div></div>'
  }
  function levelBar(u) {
    return '<div class="pb"><div class="t"><span>Level ' + u.level + '</span><span><b>' + u.pct + '%</b> · ' + E(u.exp) + ' / ' + E(u.expNeed) + ' EXP</span></div><div class="tr"><div class="fl" style="width:' + u.pct + '%"></div></div></div>'
  }
  function status(u) { return I(u.statusFa) + E(u.status) }

  // ---------- halaman
  function home() {
    var u = D.user, h = ''
    h += '<div class="hb tp" data-view="profile"><div class="pf">' + avatar(u) + '<div style="min-width:0;flex:1"><div class="gr" id="gr">' + (typed ? E(u.greeting) : '') + '</div><div class="nm">' + E(u.name) + '<span class="lvp">LV ' + u.level + '</span></div><div class="sb">' + status(u) + (u.chat ? ' · ' + E(u.chat) : '') + '</div></div><div class="chev">' + I('chevron-right') + '</div></div>' + levelBar(u) + '</div>'
    h += '<div class="chips"><span class="chip"><i class="live"></i><span id="up"></span></span><span class="chip">' + I('clock') + '<span id="clk"></span>&nbsp;WIB</span><span class="chip">' + I('puzzle-piece') + D.info.total + ' fitur</span><span class="chip">' + I('layer-group') + 'CASE ' + (D.info.caseTotal || 0) + '</span><span class="chip">' + I('puzzle-piece') + 'PLUGIN ' + (D.info.pluginTotal || 0) + '</span><span class="chip">' + I('user-group') + D.info.users + ' user</span></div>'
    h += '<div class="tiles3">'
    D.cats.forEach(function (c) {
      h += '<div class="tile k3 tp" data-cat="' + E(c.id) + '" style="--a:' + c.col[0] + ';--b:' + c.col[1] + '">' + (c.hot ? '<span class="hot">' + I('fire') + '</span>' : '') + '<div class="ce">' + I(c.icon) + '</div><div class="tt">' + E(c.label) + '</div><div class="tc">' + c.items.length + ' fitur</div></div>'
    })
    h += '</div>'
    if (!rndItem) rndItem = pickRandom()
    if (rndItem) h += '<div class="rnd"><div class="e">' + I('lightbulb') + '</div><div class="tx tp" data-c="' + E(rndItem.c) + '"><div class="t1">Coba perintah ini</div><div class="t2">' + I(rndItem.i) + E(P + rndItem.c) + '</div>' + (rndItem.d ? '<div class="t3">' + E(rndItem.d) + '</div>' : '') + '</div><button class="dice" data-dice="1" aria-label="Acak">' + I('dice') + '</button></div>'
    h += '<div class="bigbtn tp" data-view="all">' + I('book') + 'Lihat semua menu</div>'
    h += shortcuts()
    return h
  }
  // Tombol/kirip pintasan: setiap kategori mengirim ".menu <kategori>", plus allmenu & vxmenu.
  function sendChip(cmd, ic) {
    return '<span class="chip m tp" data-send="' + E(cmd) + '">' + (ic ? I(ic) : '') + E(P + cmd) + '</span>'
  }
  function shortcuts() {
    var h = '<div class="sec" style="--a:#7c5cff;--b:#00d4ff"><div class="sech"><div class="e">' + I('bolt') + '</div><div class="n">Pintasan perintah</div></div><div class="chips">'
    h += sendChip('allmenu', 'book') + sendChip('vxmenu', 'puzzle-piece')
    D.cats.forEach(function (c) {
      if (c.id !== 'shortcut') h += sendChip('menu ' + c.id, c.icon)
    })
    return h + '</div></div>'
  }
  function cats() {
    var max = 1
    D.cats.forEach(function (c) { if (c.items.length > max) max = c.items.length })
    var h = '<div class="p"><b>' + D.cats.length + ' kategori</b> · ' + D.info.total + ' fitur. Pilih salah satu:</div>'
    D.cats.forEach(function (c) {
      h += '<div class="catrow tp" data-cat="' + E(c.id) + '" style="--a:' + c.col[0] + ';--b:' + c.col[1] + '"><div class="ce">' + I(c.icon) + '</div><div class="tx"><div class="n">' + E(c.label) + (c.hot ? I('fire') : '') + '</div><div class="d">' + E(c.desc || '') + '</div><div class="bar"><i style="width:' + Math.max(6, Math.round(c.items.length / max * 100)) + '%"></i></div></div><div class="cnt">' + c.items.length + '</div></div>'
    })
    return h + shortcuts()
  }
  function profile() {
    var u = D.user
    function tl(ic, t, v) { return '<div class="tile"><div class="tl">' + I(ic) + t + '</div><div class="tv">' + E(v) + '</div></div>' }
    function rw(ic, k, v) { return '<div class="row"><div class="k"><span class="ki">' + I(ic) + '</span>' + k + '</div><div class="v">' + E(v) + '</div></div>' }
    var h = '<div class="hb"><div class="pf">' + avatar(u) + '<div style="min-width:0"><div class="nm">' + E(u.name) + '<span class="lvp">LV ' + u.level + '</span></div><div class="sb">' + status(u) + (u.chat ? ' · ' + E(u.chat) : '') + '</div></div></div>' + levelBar(u) + '</div>'
    h += '<div class="tiles">' + tl('wallet', 'Money', u.money) + tl('building-columns', 'Bank', u.bank) + tl('ticket', 'Limit', u.limit) + tl('trophy', 'Peringkat', u.rank ? '#' + u.rank + ' / ' + u.rankTotal : '-') + '</div>'
    h += '<div class="panel">' + rw('sliders', 'Mode', D.info.mode) + rw('terminal', 'Prefix', P) + rw('user-group', 'Total user', D.info.users) + rw('puzzle-piece', 'Total fitur', D.info.total) + rw('layer-group', 'CASE', D.info.caseTotal || 0) + rw('puzzle-piece', 'PLUGIN', D.info.pluginTotal || 0) + (D.theme ? rw('palette', 'Tema', D.theme) : '') + '</div>'
    return h
  }
  function catView() {
    var c = D.cats.filter(function (x) { return x.id === cat })[0]
    if (!c) return '<div class="empty">' + I('face-frown') + 'Kategori tidak ada</div>'
    return '<div class="cathead" style="--a:' + c.col[0] + ';--b:' + c.col[1] + '"><div class="ce">' + I(c.icon) + '</div><div style="min-width:0;flex:1"><div class="n">' + E(c.label) + '</div><div class="d">' + E(c.desc || '') + '</div></div><span class="chip">' + c.items.length + ' fitur</span></div>' + '<div style="--a:' + c.col[0] + ';--b:' + c.col[1] + '">' + list(c.items) + '</div>'
  }
  var ALLP = []
  D.cats.forEach(function (c) {
    var n = Math.max(1, Math.ceil(c.items.length / PER_ALL))
    for (var k = 0; k < n; k++) ALLP.push({ c: c, items: c.items.slice(k * PER_ALL, (k + 1) * PER_ALL), k: k, n: n })
  })
  function allView() {
    clamp(ALLP.length)
    var p = ALLP[pg], c = p.c, h = '<div class="sec" style="--a:' + c.col[0] + ';--b:' + c.col[1] + '"><div class="sech tp" data-cat="' + E(c.id) + '"><div class="e">' + I(c.icon) + '</div><div class="n">' + E(c.label) + (p.n > 1 ? ' · ' + (p.k + 1) + '/' + p.n : '') + '</div><div class="c">' + c.items.length + '</div></div><div class="chips">'
    p.items.forEach(function (i) { h += '<span class="chip m tp" data-c="' + E(i.c) + '">' + I(i.i) + E(P + i.c) + '</span>' })
    return h + '</div></div>' + pager()
  }

  var TABS = [['home', 'house', 'Beranda'], ['cats', 'folder-open', 'Kategori'], ['all', 'book', 'Semua'], ['profile', 'id-card', 'Profil']]
  function tabs() {
    var cur = view === 'cat' ? 'cats' : view
    $('tabs').innerHTML = TABS.map(function (t) { return '<div class="tab tp' + (t[0] === cur && !q.trim() ? ' on' : '') + '" data-view="' + t[0] + '"><span class="ti">' + I(t[1]) + '</span>' + t[2] + '</div>' }).join('')
  }

  function legal() {
    var l = D.legal
    if (!l) return ''
    return '<div class="legal"><div class="lt">' + I('shield-halved') + E(l.title) + '</div><div class="lu">' + E(l.url) + '</div>' + (l.tag ? '<div class="lg">' + E(l.tag) + '</div>' : '') + '</div>'
  }

  function render() {
    var res = q.trim() ? find() : null, h
    if (res) h = res.length ? '<div class="p">' + I('magnifying-glass') + ' <b>' + res.length + '</b> hasil untuk “' + E(q) + '”</div>' + list(res) : '<div class="empty">' + I('face-frown') + 'Tidak ada fitur yang cocok</div>'
    else if (view === 'cat') h = catView()
    else if (view === 'cats') h = cats()
    else if (view === 'all') h = allView()
    else if (view === 'profile') h = profile()
    else h = home()
    var s = $('scr')
    s.style.animation = 'none'
    void s.offsetWidth
    s.style.animation = ''
    s.innerHTML = h + (res ? '' : legal())
    $('bk').style.display = view === 'home' && !res ? 'none' : ''
    tabs()
    tick()
    if (view === 'home' && !res && !typed) typeGreeting()
  }
  function typeGreeting() {
    typed = true
    var el = $('gr'), txt = D.user.greeting, i = 0
    if (!el) return
    var iv = setInterval(function () {
      i++
      el = $('gr')
      if (!el) return clearInterval(iv)
      el.textContent = txt.slice(0, i)
      if (i >= txt.length) clearInterval(iv)
    }, 38)
  }
  function tick() {
    var u = $('up'), c = $('clk')
    if (u) u.textContent = fmtUp(D.info.uptime + (Date.now() - t0) / 1000)
    if (c) c.textContent = clock()
  }

  function go(v, c) {
    view = v
    if (c) cat = c
    q = ''
    $('sr').value = ''
    pg = 0
    render()
  }

  $('scr').addEventListener('click', function (e) {
    var n = e.target.closest ? e.target.closest('[data-pg],[data-c],[data-cat],[data-view],[data-dice],[data-send]') : null
    if (!n) return
    if (n.hasAttribute('data-send')) return act(P + n.getAttribute('data-send'))
    if (n.hasAttribute('data-dice')) { rndItem = pickRandom(); return render() }
    if (n.hasAttribute('data-pg')) {
      if (n.disabled) return
      var v = n.getAttribute('data-pg')
      pg = v === 'first' ? 0 : v === 'last' ? lastN - 1 : pg + Number(v)
      return render()
    }
    if (n.hasAttribute('data-c')) return act(P + n.getAttribute('data-c'))
    if (n.hasAttribute('data-cat')) return go('cat', n.getAttribute('data-cat'))
    if (n.hasAttribute('data-view')) return go(n.getAttribute('data-view'))
  })
  $('tabs').addEventListener('click', function (e) {
    var n = e.target.closest ? e.target.closest('[data-view]') : null
    if (n) go(n.getAttribute('data-view'))
  })
  $('bk').addEventListener('click', function () {
    if (q) { q = ''; $('sr').value = '' } else view = view === 'cat' ? 'cats' : 'home'
    pg = 0
    render()
  })
  $('sr').addEventListener('input', function () { q = this.value; pg = 0; render() })
  setInterval(tick, 1000)
  render()
})()
