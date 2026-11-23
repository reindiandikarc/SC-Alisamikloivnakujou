// ═══════════════════════════════════════════════════════
//  hsr_data.js — Honkai: Star Rail Static Data
//  Alya V13 Plugin System
//  Covers: Characters, Enemies, Light Cones, Warp Pools
// ═══════════════════════════════════════════════════════

'use strict';

// ── ELEMENT ICONS ──────────────────────────────────────
const ELEMENT = {
  Physical:  '⚪ Physical',
  Fire:      '🔥 Fire',
  Ice:       '❄️ Ice',
  Lightning: '⚡ Lightning',
  Wind:      '🌀 Wind',
  Quantum:   '🌌 Quantum',
  Imaginary:  '🟡 Imaginary',
};

// ── PATH ICONS ─────────────────────────────────────────
const PATH = {
  TheHunt:      '🏹 The Hunt',
  Destruction:  '💥 Destruction',
  Erudition:    '📚 Erudition',
  Harmony:      '🎵 Harmony',
  Nihility:     '🌑 Nihility',
  Abundance:    '🌿 Abundance',
  Preservation: '🛡️ Preservation',
  Remembrance:  '🔮 Remembrance',
};

// ── FULL CHARACTER ROSTER ──────────────────────────────
// Format: { name, path, element, rarity, baseHP, baseATK, baseDEF, baseSPD,
//           skills: { basic, skill, ult, talent }, description }
const CHARACTERS = {
  // ════ 5-STAR ════
  Seele: {
    name: 'Seele', rarity: 5, path: 'TheHunt', element: 'Quantum',
    baseHP: 931, baseATK: 640, baseDEF: 363, baseSPD: 115, baseEnergy: 120,
    weaknessBreak: { single: 30 },
    skills: {
      basic:   { name: 'Thwack', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Sheathed Blade', desc: 'Serang 1 musuh, DMG 110% ATK, +Spd buff', sp: -1, dmgMult: 1.10, type: 'single' },
      ult:     { name: 'Butterfly Flurry', desc: 'Serang 1 musuh, DMG 255% ATK', energy: 120, dmgMult: 2.55, type: 'single' },
      talent:  { name: 'Resurgence', desc: 'Setelah kill, dapat extra turn & +Spd', passive: true },
    },
    description: 'DPS Quantum bertarget tunggal. Talent-nya memberi extra turn setelah membunuh musuh.',
  },
  Kafka: {
    name: 'Kafka', rarity: 5, path: 'Nihility', element: 'Lightning',
    baseHP: 1047, baseATK: 600, baseDEF: 363, baseSPD: 100, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Midnight Tumult', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Caressing Moonlight', desc: 'Serang 1 musuh & adjacent, DMG 80% ATK, trigger DoT', sp: -1, dmgMult: 0.80, type: 'blast' },
      ult:     { name: 'Twilight Trill', desc: 'AoE, DMG 48% ATK, chance Shock', energy: 120, dmgMult: 0.48, type: 'aoe' },
      talent:  { name: 'Gentle but Cruel', desc: 'Saat sekutu menyerang musuh ber-DoT, Kafka ikut serangan DoT', passive: true },
    },
    description: 'Debuffer/DoT spesialis. Sangat kuat dengan team berbasis DoT.',
  },
  Acheron: {
    name: 'Acheron', rarity: 5, path: 'Nihility', element: 'Lightning',
    baseHP: 1125, baseATK: 601, baseDEF: 363, baseSPD: 101, baseEnergy: 0,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Trilateral Wiltcross', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Octobolt Flash', desc: 'Serang 1 musuh & 2 adjacent, memberi Crimson Knot', sp: -1, dmgMult: 1.60, type: 'blast' },
      ult:     { name: 'Slashed Dream Cries in Red', desc: 'Butuh 9 Slashed Dream. AoE dahsyat & Stagnate musuh', energy: 0, dmgMult: 3.60, type: 'aoe' },
      talent:  { name: 'Atop the Rubicon', desc: 'Gain Slashed Dream saat sekutu pakai Nihility skill/ult', passive: true },
    },
    description: 'DPS Lightning unik tanpa Energy bar. Ult-nya ditenagai oleh Slashed Dream stack.',
  },
  Jingliu: {
    name: 'Jingliu', rarity: 5, path: 'Destruction', element: 'Ice',
    baseHP: 1125, baseATK: 698, baseDEF: 396, baseSPD: 96, baseEnergy: 140,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Lucent Moonglow', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Transcendent Flash', desc: 'Serang 1 musuh, DMG 125% ATK', sp: -1, dmgMult: 1.25, type: 'single' },
      ult:     { name: 'Florephemeral Dreamflux', desc: 'Serang semua musuh, DMG 180% ATK, masuk Spectral Transmigration', energy: 140, dmgMult: 1.80, type: 'aoe' },
      talent:  { name: 'Crescent Transmigration', desc: 'Saat HP tim berkurang, Jingliu masuk mode Spectral Transmigration dengan ATK +bonus', passive: true },
    },
    description: 'DPS Ice Destruction. Kuat saat HP tim rendah, masuk mode Spectral Transmigration.',
  },
  BladeChr: {
    name: 'Blade', rarity: 5, path: 'Destruction', element: 'Wind',
    baseHP: 1358, baseATK: 524, baseDEF: 363, baseSPD: 97, baseEnergy: 130,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Shard Sword', desc: 'Serang 1 musuh, DMG 50% ATK, lose 10% HP', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Wing Slash', desc: 'Blade mengambil damage, tapi gain Charge stack', sp: 0, dmgMult: 0, type: 'self' },
      ult:     { name: 'Death Wish', desc: 'Serang semua musuh, DMG skala dari Max HP Blade', energy: 130, dmgMult: 0.40, type: 'aoe' },
      talent:  { name: 'Shuhu\'s Gift', desc: 'Saat HP Blade rendah, serangan jadi AoE & deal Hellscape DMG', passive: true },
    },
    description: 'HP-scalng DPS Wind. Unik karena menggunakan HP sendiri sebagai sumber damage.',
  },
  DanHeng_IL: {
    name: 'Dan Heng • Imbibitor Lunae', rarity: 5, path: 'Destruction', element: 'Imaginary',
    baseHP: 1047, baseATK: 698, baseDEF: 363, baseSPD: 103, baseEnergy: 140,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Beneficent Lotus', desc: 'Serang 1 musuh, dapat di-enhance hingga 3x dengan SP', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Dracore Libre', desc: 'Enhance serangan basic ke level lebih kuat', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Heavenly Crimson Beacon', desc: 'AoE Imaginary, DMG tinggi + debuff Dispel', energy: 140, dmgMult: 2.40, type: 'aoe' },
      talent:  { name: 'Venerable Vow', desc: 'SP dipakai untuk enhance basic attack Righteous Heart', passive: true },
    },
    description: 'DPS Imaginary kuat. Basic attack dapat di-enhance 3x dengan SP untuk damage masif.',
  },
  Argenti: {
    name: 'Argenti', rarity: 5, path: 'Erudition', element: 'Physical',
    baseHP: 1047, baseATK: 640, baseDEF: 363, baseSPD: 103, baseEnergy: 90,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'For in This Universe, Beauty Abounds', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Hence, Lovely Roses', desc: 'AoE, DMG 60% ATK', sp: -1, dmgMult: 0.60, type: 'aoe' },
      ult:     { name: 'For I Too Am At Fate\'s Behest', desc: 'Jika Apotheosis ≥90, semua musuh 198% AoE; jika tidak, 150% AoE single target', energy: 90, dmgMult: 1.98, type: 'aoe' },
      talent:  { name: 'Sublime Object', desc: 'Gain Apotheosis saat menyerang musuh', passive: true },
    },
    description: 'AoE DPS Physical dengan mechanic Apotheosis. Ult-nya bisa di-upgrade jika cukup stacks.',
  },
  DrRatio: {
    name: 'Dr. Ratio', rarity: 5, path: 'TheHunt', element: 'Imaginary',
    baseHP: 1047, baseATK: 640, baseDEF: 396, baseSPD: 103, baseEnergy: 130,
    weaknessBreak: { single: 30 },
    skills: {
      basic:   { name: 'Mind is Might', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Intellectual Midwifery', desc: 'Serang 1 musuh, DMG 150% ATK', sp: -1, dmgMult: 1.50, type: 'single' },
      ult:     { name: 'Syllogistic Paradox', desc: 'Panggil Inferotron untuk menyerang musuh berkali-kali', energy: 130, dmgMult: 2.40, type: 'single' },
      talent:  { name: 'Cogito, Ergo Sum', desc: 'Serangan skill memiliki chance memicu Wiseman\'s Folly (serangan susulan)', passive: true },
    },
    description: 'DPS Imaginary single target. Synergy kuat dengan debuffer karena bonus saat musuh punya banyak debuff.',
  },
  Feixiao: {
    name: 'Feixiao', rarity: 5, path: 'TheHunt', element: 'Wind',
    baseHP: 1047, baseATK: 679, baseDEF: 363, baseSPD: 112, baseEnergy: 120,
    weaknessBreak: { single: 30 },
    skills: {
      basic:   { name: 'Boltsunder', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Radiance Slash', desc: 'Serang 1 musuh, DMG 120% ATK + gain Flyby marker', sp: -1, dmgMult: 1.20, type: 'single' },
      ult:     { name: 'Stormborn', desc: 'Serang 1 musuh 7 kali lalu AoE final hit', energy: 120, dmgMult: 2.20, type: 'single' },
      talent:  { name: 'Thunderhunt', desc: 'Saat sekutu menyerang musuh yang Feixiao targetkan, Feixiao ikut serangan susulan', passive: true },
    },
    description: 'DPS Wind Hunt terkuat. Follow-up attack specialist dengan synergy team yang luar biasa.',
  },
  RuanMei: {
    name: 'Ruan Mei', rarity: 5, path: 'Harmony', element: 'Ice',
    baseHP: 1203, baseATK: 476, baseDEF: 485, baseSPD: 104, baseEnergy: 130,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Threading Fragrance', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Petals to Stream, Streams into Song', desc: 'Buff seluruh tim: +Weakness Break Efficiency & +Break Delay', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Petals to Stream, Streams into Song (Ult)', desc: 'Freeze enemy toughness, Res Pen tim +25%, slow musuh', energy: 130, dmgMult: 0, type: 'debuff' },
      talent:  { name: 'Somatotypical Helix', desc: 'Tim dapat +DMG bonus. Setelah Break, enemy delay', passive: true },
    },
    description: 'Buffer/Harmony terbaik. Sangat kuat untuk tim berbasis Break atau DoT.',
  },
  Sparkle: {
    name: 'Sparkle', rarity: 5, path: 'Harmony', element: 'Quantum',
    baseHP: 1319, baseATK: 484, baseDEF: 507, baseSPD: 101, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Monodrama', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Dreamdiver', desc: 'Advance 1 sekutu, +Crit DMG buff, gain SP', sp: 0, dmgMult: 0, type: 'buff' },
      ult:     { name: 'The Hero with a Thousand Faces', desc: 'Gain 4 SP, buff Crit DMG tim, tim +ATK', energy: 120, dmgMult: 0, type: 'buff' },
      talent:  { name: 'Sparkle\'s Mole', desc: 'Regen SP otomatis & buff anggota Quantum', passive: true },
    },
    description: 'Support/Harmony SP generator. Sangat kuat untuk tim Quantum dan mono-DPS.',
  },
  Robin: {
    name: 'Robin', rarity: 5, path: 'Harmony', element: 'Physical',
    baseHP: 1047, baseATK: 582, baseDEF: 485, baseSPD: 104, baseEnergy: 140,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Wingéd Melody', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Pinion\'s Aria', desc: 'Buff seluruh tim: +ATK & +Crit DMG, Concerto stacks', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Vox Harmonique, Opus Cosmique', desc: 'Masuk Concerto state. Tim menyerang → Robin serangan susulan tambahan', energy: 140, dmgMult: 1.20, type: 'buff' },
      talent:  { name: 'Tonal Resonance', desc: 'Saat Concerto aktif, semua serangan anggota tim trigger extra hit Physical oleh Robin', passive: true },
    },
    description: 'Harmony buffer terkuat untuk tim follow-up/fua. Concerto-nya masif.',
  },
  FuXuan: {
    name: 'Fu Xuan', rarity: 5, path: 'Preservation', element: 'Quantum',
    baseHP: 1474, baseATK: 476, baseDEF: 396, baseSPD: 96, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Novaburst', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Known by Stars, Shown by Hearts', desc: 'Matrix of Prescience: redirect damage ke Fu Xuan, tim +Crit Rate & HP', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Woven Weft of Fate', desc: 'Heal tim berdasar Max HP, beri Misfortune Avoidance', energy: 100, dmgMult: 0, type: 'heal' },
      talent:  { name: 'Bleak Breeds Bliss', desc: 'Saat HP Fu Xuan turun drastis, trigger serangan balik', passive: true },
    },
    description: 'Tank/Support Quantum terbaik. Matrix of Prescience-nya menyelamatkan seluruh tim.',
  },
  Luocha: {
    name: 'Luocha', rarity: 5, path: 'Abundance', element: 'Imaginary',
    baseHP: 1281, baseATK: 582, baseDEF: 396, baseSPD: 101, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Thorns of the Abyss', desc: 'Serang 1 musuh, DMG 100% ATK', sp: +1, dmgMult: 1.00, type: 'single' },
      skill:   { name: 'Prayer of Abyss Flower', desc: 'Heal satu anggota, pasang Abyss Flower untuk auto-heal', sp: -1, dmgMult: 0, type: 'heal' },
      ult:     { name: 'Death Wish', desc: 'AoE, DMG 120% ATK, clear buff musuh', energy: 100, dmgMult: 1.20, type: 'aoe' },
      talent:  { name: 'A→ B → A', desc: 'Saat HP anggota <50%, Abyss Flower otomatis heal', passive: true },
    },
    description: 'Healer Imaginary dengan auto-heal pasif. Bisa deal damage sembari healing.',
  },
  Huohuo: {
    name: 'Huohuo', rarity: 5, path: 'Abundance', element: 'Wind',
    baseHP: 1475, baseATK: 476, baseDEF: 363, baseSPD: 101, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Whiff of Emanations', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Possession: Tongtian Rite', desc: 'Pasang Fiend Seal di musuh, mulai Possession phase', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Tail: Spiritual Domination', desc: 'Regen Energy semua anggota, +ATK buff, heal semua anggota', energy: 100, dmgMult: 0, type: 'heal' },
      talent:  { name: 'Possession: Ethereal Proliferation', desc: 'Dalam Possession, heal anggota otomatis setiap turn', passive: true },
    },
    description: 'Healer Wind yang unik. Ult-nya memberi Energy dan ATK buff ke seluruh tim.',
  },
  Gepard: {
    name: 'Gepard', rarity: 5, path: 'Preservation', element: 'Ice',
    baseHP: 1474, baseATK: 436, baseDEF: 594, baseSPD: 92, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Frostbite', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Intimidating Strike', desc: 'Serang 1 musuh + blast, chance Freeze', sp: -1, dmgMult: 1.25, type: 'blast' },
      ult:     { name: 'Enduring Bulwark', desc: 'Pasang Shield ke semua anggota tim, skala DEF', energy: 100, dmgMult: 0, type: 'shield' },
      talent:  { name: 'Unyielding Will', desc: 'Saat Gepard mau mati, dia bertahan dengan 1 HP dan pasang shield diri', passive: true },
    },
    description: 'Tank/Shield Preservation Ice. Shield ult-nya salah satu terkuat di game.',
  },
  Bronya: {
    name: 'Bronya', rarity: 5, path: 'Harmony', element: 'Wind',
    baseHP: 1047, baseATK: 582, baseDEF: 440, baseSPD: 99, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Command: Starfall', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Command: Tactical Strike', desc: 'Advance 1 sekutu, buff DMG, remove debuff 1', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Command: Supreme Advantage', desc: 'Buff ATK & Crit DMG tim, Bronya +ATK tinggi', energy: 120, dmgMult: 0, type: 'buff' },
      talent:  { name: 'Leading the Way', desc: 'Basic attack Bronya advance 1 random sekutu', passive: true },
    },
    description: 'Buffer/Harmony klasik. SPD buff dan advance action untuk DPS sangat berguna.',
  },
  Clara: {
    name: 'Clara', rarity: 5, path: 'Destruction', element: 'Physical',
    baseHP: 1241, baseATK: 640, baseDEF: 330, baseSPD: 90, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'I Want to Help', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Svarog Watches Over You', desc: 'Tandai diri, Svarog konter serangan musuh', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Promise, Not Command', desc: 'Naikkan level konter Svarog, heal Clara', energy: 120, dmgMult: 0, type: 'buff' },
      talent:  { name: 'Because We\'re Family', desc: 'Svarog konter serangan & deal high Physical DMG', passive: true },
    },
    description: 'Counter-attack DPS Physical. Semakin banyak diserang musuh, semakin banyak konter Svarog.',
  },
  Welt: {
    name: 'Welt', rarity: 5, path: 'Nihility', element: 'Imaginary',
    baseHP: 1047, baseATK: 524, baseDEF: 440, baseSPD: 97, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Superior Dominance', desc: 'Serang 1-3 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Edge of the Void', desc: 'Serang 3 kali acak, DMG 52% ATK tiap hit, chance Imprisonment', sp: -1, dmgMult: 0.52, type: 'aoe' },
      ult:     { name: 'Synthetic Black Hole', desc: 'AoE, DMG 150% ATK, Slow musuh -33% SPD', energy: 120, dmgMult: 1.50, type: 'aoe' },
      talent:  { name: 'World Quencher', desc: 'Saat Welt serang musuh Imprisoned, deal extra Imaginary DMG', passive: true },
    },
    description: 'Debuffer/DPS Imaginary. Imprisonment dan SPD reduction sangat berguna di konten sulit.',
  },
  Bailu: {
    name: 'Bailu', rarity: 5, path: 'Abundance', element: 'Lightning',
    baseHP: 1319, baseATK: 476, baseDEF: 363, baseSPD: 98, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Aqua Surge', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Singing Among Clouds', desc: 'Heal 1 anggota, pasang Invigoration (bounce heal)', sp: -1, dmgMult: 0, type: 'heal' },
      ult:     { name: 'Canine Leap', desc: 'Heal semua anggota, pasang Invigoration ke semua', energy: 100, dmgMult: 0, type: 'heal' },
      talent:  { name: 'Aquatic Benediction', desc: 'Invigoration bounce heal antar anggota. 1 anggota punya revive', passive: true },
    },
    description: 'Healer Lightning dengan bounce heal. Satu anggota bisa revive jika mati.',
  },
  Himeko: {
    name: 'Himeko', rarity: 5, path: 'Erudition', element: 'Fire',
    baseHP: 1047, baseATK: 640, baseDEF: 363, baseSPD: 96, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Sawblade Tuning', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Molten Detonation', desc: 'Serang semua musuh, DMG 50% ATK × N', sp: -1, dmgMult: 0.50, type: 'aoe' },
      ult:     { name: 'Heavenly Flare', desc: 'AoE masif, DMG 230% ATK', energy: 120, dmgMult: 2.30, type: 'aoe' },
      talent:  { name: 'Victory Rush', desc: 'Saat 2 musuh di-Weakness Break, Himeko gain extra turn', passive: true },
    },
    description: 'AoE DPS Fire Erudition. Sangat kuat di konten multi-musuh dengan banyak break.',
  },
  Yanqing: {
    name: 'Yanqing', rarity: 5, path: 'TheHunt', element: 'Ice',
    baseHP: 1047, baseATK: 640, baseDEF: 363, baseSPD: 109, baseEnergy: 140,
    weaknessBreak: { single: 30 },
    skills: {
      basic:   { name: 'Darting Irontongue', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Darting Irontongue Enhanced', desc: 'Aktifkan Soulsteel Sync, +ATK +Crit Rate', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Amidst the Raining Bliss', desc: 'Serang 1 musuh, DMG 260% ATK, chance Freeze', energy: 140, dmgMult: 2.60, type: 'single' },
      talent:  { name: 'Icy Follow-up', desc: 'Dalam Soulsteel Sync, serangan punya chance tambahan Ice DMG follow-up', passive: true },
    },
    description: 'DPS Ice single target. Kuat di Soulsteel Sync mode, tapi rentan jika HP dia kena.',
  },
  JingYuan: {
    name: 'Jing Yuan', rarity: 5, path: 'Erudition', element: 'Lightning',
    baseHP: 1241, baseATK: 640, baseDEF: 363, baseSPD: 97, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Glistening Light', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Rifting Zenith', desc: 'AoE, DMG 50% ATK, +Hits Lightning-Lord', sp: -1, dmgMult: 0.50, type: 'aoe' },
      ult:     { name: 'Lightbringer', desc: 'AoE dahsyat, DMG 180% ATK, +Hits Lightning-Lord', energy: 120, dmgMult: 1.80, type: 'aoe' },
      talent:  { name: 'Prana Extirpated', desc: 'Lightning-Lord menyerang di akhir turn, skala hits', passive: true },
    },
    description: 'AoE DPS Lightning Erudition. Lightning-Lord-nya menjadi summon yang sangat kuat.',
  },
  Luofu: {
    name: 'Qingque', rarity: 4, path: 'Erudition', element: 'Quantum',
    baseHP: 1047, baseATK: 562, baseDEF: 363, baseSPD: 98, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Toss and Match', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'A Scoop of Moon', desc: 'Draw jade tiles, buff basic attack jika 4 tiles sama', sp: 0, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Winning Hand', desc: 'Enhanced basic attack selama 1 turn, DMG sangat tinggi', energy: 120, dmgMult: 2.28, type: 'single' },
      talent:  { name: 'Celestial Jade', desc: 'Kumpulkan tiles sama → enhanced basic', passive: true },
    },
    description: 'DPS Quantum Erudition dengan mekanik tiles unik. Damage masif jika setup benar.',
  },

  // ════ 4-STAR ════
  DanHeng: {
    name: 'Dan Heng', rarity: 4, path: 'TheHunt', element: 'Wind',
    baseHP: 888, baseATK: 546, baseDEF: 352, baseSPD: 110, baseEnergy: 110,
    weaknessBreak: { single: 30 },
    skills: {
      basic:   { name: 'Cloudlancer', desc: 'Serang 1 musuh, DMG 50% ATK, chance Slow', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Torrent of Souls', desc: 'Serang 1 musuh, jika musuh Slowed DMG +40%', sp: -1, dmgMult: 1.72, type: 'single' },
      ult:     { name: 'Ethereal Dream', desc: 'Serang 1 musuh, DMG 180% ATK, Slow musuh', energy: 110, dmgMult: 1.80, type: 'single' },
      talent:  { name: 'Windhunter', desc: 'Setelah skill, jika musuh HP < 50%, +1 skill charge tanpa SP', passive: true },
    },
    description: 'DPS Wind starter gratis. Simpel tapi efektif sebagai single-target DPS.',
  },
  March7th: {
    name: 'March 7th', rarity: 4, path: 'Preservation', element: 'Ice',
    baseHP: 1241, baseATK: 423, baseDEF: 528, baseSPD: 101, baseEnergy: 110,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Frigid Cold Arrow', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Glacial Cascade', desc: 'Pasang Shield ke 1 anggota tim', sp: -1, dmgMult: 0, type: 'shield' },
      ult:     { name: 'Glacial Dream', desc: 'Freeze 1 musuh, AoE blast, DMG 150% ATK', energy: 110, dmgMult: 1.50, type: 'blast' },
      talent:  { name: 'Girl\'s Spinning Top', desc: 'Saat sekutu yang punya shield diserang, March konter', passive: true },
    },
    description: 'Support/Shield Preservation Ice. Starter gratis dengan counter yang menarik.',
  },
  Asta: {
    name: 'Asta', rarity: 4, path: 'Harmony', element: 'Fire',
    baseHP: 1124, baseATK: 476, baseDEF: 396, baseSPD: 106, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Spectrum Dance', desc: 'Serang 1-5 musuh secara random, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'aoe' },
      skill:   { name: 'Ignite', desc: 'AoE, DMG 50% ATK, +Charge stack', sp: -1, dmgMult: 0.50, type: 'aoe' },
      ult:     { name: 'Meteor Storm', desc: 'Tim +SPD buff sesuai Charge stacks', energy: 120, dmgMult: 0, type: 'buff' },
      talent:  { name: 'Astrometry', desc: 'Saat Asta aksi, regen SP lebih', passive: true },
    },
    description: 'Buffer Fire Harmony. SPD buff dari ult-nya sangat bermanfaat untuk tim cepat.',
  },
  Natasha: {
    name: 'Natasha', rarity: 4, path: 'Abundance', element: 'Physical',
    baseHP: 1281, baseATK: 476, baseDEF: 363, baseSPD: 98, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Unconditional', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Love, Heal, and Choose', desc: 'Heal 1 anggota berdasar MaxHP, pasang HoT', sp: -1, dmgMult: 0, type: 'heal' },
      ult:     { name: 'Gift of Rebirth', desc: 'Heal semua anggota, cure debuff 1 musuh', energy: 100, dmgMult: 0, type: 'heal' },
      talent:  { name: 'Innervation', desc: 'HoT dari skill bertambah lagi saat HP rendah', passive: true },
    },
    description: 'Healer Physical free-to-play. Sangat cocok untuk pemula karena mudah digunakan.',
  },
  Pela: {
    name: 'Pela', rarity: 4, path: 'Nihility', element: 'Ice',
    baseHP: 1047, baseATK: 476, baseDEF: 352, baseSPD: 105, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Frost Shot', desc: 'Serang 1 musuh, DMG 50% ATK, chance strip buff', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Frostbite', desc: 'Serang 1 musuh, strip buff musuh, DMG 105% ATK', sp: -1, dmgMult: 1.05, type: 'single' },
      ult:     { name: 'Zone Suppression', desc: 'AoE, DEF -30% pada semua musuh selama 2 turn', energy: 100, dmgMult: 0.60, type: 'aoe' },
      talent:  { name: 'Data Collecting', desc: 'Saat musuh di-strip buff, regen 5 Energy', passive: true },
    },
    description: 'Debuffer Ice Nihility. DEF reduction ult-nya adalah salah satu debuff terbaik di game.',
  },
  Tingyun: {
    name: 'Tingyun', rarity: 4, path: 'Harmony', element: 'Lightning',
    baseHP: 931, baseATK: 476, baseDEF: 330, baseSPD: 112, baseEnergy: 110,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Dislodging Feathers', desc: 'Serang 1 musuh, DMG 50% ATK + Benediction proc', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Soothing Melody', desc: 'Pasang Benediction ke 1 sekutu: +ATK & proc Lightning DMG', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Amidst the Rejoicing Clouds', desc: 'Regen 50 Energy ke 1 sekutu + bonus DMG next turn', energy: 110, dmgMult: 0, type: 'buff' },
      talent:  { name: 'Tingle of Glee', desc: 'Saat sekutu ber-Benediction serang, Tingyun ikut proc Lightning extra', passive: true },
    },
    description: 'Buffer Lightning Harmony terbaik di 4-star. Energy regen ult-nya tak ternilai.',
  },
  Sampo: {
    name: 'Sampo', rarity: 4, path: 'Nihility', element: 'Wind',
    baseHP: 888, baseATK: 523, baseDEF: 330, baseSPD: 102, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Dazzling Blades', desc: 'Serang 1 musuh, DMG 50% ATK, chance Wind Shear', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Flamesweep', desc: 'Serang semua musuh, DMG 28% ATK, tumpuk Wind Shear', sp: -1, dmgMult: 0.28, type: 'aoe' },
      ult:     { name: 'Surprise Present', desc: 'AoE, semua musuh Wind Shear DMG +32%', energy: 120, dmgMult: 0.72, type: 'aoe' },
      talent:  { name: 'Windtreader', desc: 'Wind Shear maksimal 5 tumpuk per musuh', passive: true },
    },
    description: 'DoT/Nihility Wind yang murah. Wind Shear-nya berguna untuk tim DoT.',
  },
  Sushang: {
    name: 'Sushang', rarity: 4, path: 'TheHunt', element: 'Physical',
    baseHP: 888, baseATK: 582, baseDEF: 330, baseSPD: 107, baseEnergy: 120,
    weaknessBreak: { single: 30 },
    skills: {
      basic:   { name: 'Cloudfencer', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Cloudfencer Art: Starshine', desc: 'Serang 1 musuh, DMG 105% ATK. Jika Weakness Break: extra hit', sp: -1, dmgMult: 1.05, type: 'single' },
      ult:     { name: 'Shape of Taixu: Dawn Herald', desc: 'Serang 1 musuh, DMG 210% ATK, Suspend musuh', energy: 120, dmgMult: 2.10, type: 'single' },
      talent:  { name: 'Dancing Blade', desc: 'Saat skill digunakan, chance Extra Turn', passive: true },
    },
    description: 'DPS Physical Hunt. Bonus damage besar saat musuh dalam kondisi Weakness Break.',
  },
  Qingque: {
    name: 'Qingque', rarity: 4, path: 'Erudition', element: 'Quantum',
    baseHP: 1047, baseATK: 562, baseDEF: 363, baseSPD: 98, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Toss and Match', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'A Scoop of Moon', desc: 'Draw jade tiles, buff basic attack jika 4 tiles sama', sp: 0, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Winning Hand', desc: 'Enhanced basic attack selama 1 turn, DMG sangat tinggi', energy: 120, dmgMult: 2.28, type: 'single' },
      talent:  { name: 'Celestial Jade', desc: 'Kumpulkan tiles sama → enhanced basic', passive: true },
    },
    description: 'DPS Quantum Erudition dengan mekanik tiles unik.',
  },
  Yukong: {
    name: 'Yukong', rarity: 4, path: 'Harmony', element: 'Imaginary',
    baseHP: 888, baseATK: 562, baseDEF: 352, baseSPD: 107, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Arrowslinger', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Emboldening Salvo', desc: 'Buff tim: +ATK & +Crit dengan Roaring Bowstrings', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Diving Kestrel', desc: 'AoE, DMG 228% ATK + Roaring Bowstrings ke seluruh tim', energy: 120, dmgMult: 2.28, type: 'aoe' },
      talent:  { name: 'Seven Layers, One Arrow', desc: 'Saat Yukong aksi, tambah Roaring Bowstrings', passive: true },
    },
    description: 'Buffer/DPS Imaginary Harmony. Kuat di tim Imaginary dengan timing skill yang pas.',
  },
  Luka: {
    name: 'Luka', rarity: 4, path: 'Nihility', element: 'Physical',
    baseHP: 931, baseATK: 582, baseDEF: 330, baseSPD: 103, baseEnergy: 110,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Direct Punch', desc: 'Serang 1 musuh, DMG 50% ATK, +Rising Conduct stack', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Lacerating Fist', desc: 'Serang 1 musuh 3 kali, chance Bleed', sp: -1, dmgMult: 1.20, type: 'single' },
      ult:     { name: 'RIP Home Run', desc: '1 musuh, DMG 200% ATK, massive Bleed', energy: 110, dmgMult: 2.00, type: 'single' },
      talent:  { name: 'Fighting Spirit', desc: 'Saat Rising Conduct 4 stacks, basic attack ter-enhance', passive: true },
    },
    description: 'DoT/DPS Physical Nihility. Bleed specialist yang konsisten.',
  },
  Lynx: {
    name: 'Lynx', rarity: 4, path: 'Abundance', element: 'Quantum',
    baseHP: 1397, baseATK: 436, baseDEF: 363, baseSPD: 98, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Snowbreak', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Salted Candies', desc: 'Heal 1 anggota, buff MaxHP & cleanse', sp: -1, dmgMult: 0, type: 'heal' },
      ult:     { name: 'Snowfield First Aid', desc: 'Heal semua anggota berdasar MaxHP Lynx', energy: 100, dmgMult: 0, type: 'heal' },
      talent:  { name: 'Survival Response', desc: 'Priority heal pada Destruction/Preservation path', passive: true },
    },
    description: 'Healer Quantum Abundance. Fokus pada healing dan cleanse.',
  },
  Guinaifen: {
    name: 'Guinaifen', rarity: 4, path: 'Nihility', element: 'Fire',
    baseHP: 888, baseATK: 476, baseDEF: 352, baseSPD: 106, baseEnergy: 110,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Walking on Blaze', desc: 'Serang 1 musuh, DMG 50% ATK, chance Burn', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Fiery Wheel', desc: 'Serang semua musuh, chance Burn tiap musuh', sp: -1, dmgMult: 0.60, type: 'aoe' },
      ult:     { name: 'Watch This Showstopper', desc: 'AoE, +Firekiss stack tiap musuh Burn, DMG boost Burn', energy: 110, dmgMult: 1.20, type: 'aoe' },
      talent:  { name: 'PatisserieFlamingo', desc: 'Saat musuh ter-Burn setelah ult, regen Energy', passive: true },
    },
    description: 'DoT/Nihility Fire. Firekiss meningkatkan Burn damage dari semua sumber.',
  },
  Hanya: {
    name: 'Hanya', rarity: 4, path: 'Harmony', element: 'Physical',
    baseHP: 1047, baseATK: 476, baseDEF: 396, baseSPD: 98, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Slash', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Samsara, Samsara', desc: 'Serang 1 musuh, pasang Burden (regen SP saat kena serangan)', sp: -1, dmgMult: 1.20, type: 'single' },
      ult:     { name: 'Ten-Lords\' Verdict', desc: 'Buff 1 sekutu: +ATK & +SPD, mereka dapat giliran lebih cepat', energy: 100, dmgMult: 0, type: 'buff' },
      talent:  { name: 'Warden of Deceit', desc: 'Saat sekutu menyerang musuh ber-Burden, regen SP Hanya', passive: true },
    },
    description: 'Buffer Physical Harmony. Ult memberikan SPD dan ATK buff ke 1 sekutu.',
  },
  Xueyi: {
    name: 'Xueyi', rarity: 4, path: 'Destruction', element: 'Quantum',
    baseHP: 1047, baseATK: 582, baseDEF: 396, baseSPD: 103, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Mara-Struck', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Karmic Perpetuation', desc: 'Serang 1 musuh, DMG 120% ATK, kasih Karma stack ke musuh', sp: -1, dmgMult: 1.20, type: 'single' },
      ult:     { name: 'Sanction', desc: 'Serang 1 musuh, DMG skala dari total Toughness yang di-reduce tim', energy: 120, dmgMult: 2.40, type: 'single' },
      talent:  { name: 'Clairvoyant Loom', desc: 'Saat musuh Toughness habis, Xueyi deal extra Quantum DMG', passive: true },
    },
    description: 'DPS Quantum Destruction. Damage-nya skala dari total Toughness yang tim hancurkan.',
  },
  Misha: {
    name: 'Misha', rarity: 4, path: 'Destruction', element: 'Ice',
    baseHP: 1047, baseATK: 601, baseDEF: 352, baseSPD: 96, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Frostbite', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Frozen Lance', desc: 'Serang 1 musuh, DMG 150% ATK', sp: -1, dmgMult: 1.50, type: 'single' },
      ult:     { name: 'Glistening Wish', desc: 'Serang 1 musuh multiple hits. Jumlah hit bertambah tiap sekutu pakai ult di turn tersebut', energy: 100, dmgMult: 0.60, type: 'single' },
      talent:  { name: 'Yearning of Youth', desc: 'Saat sekutu pakai ult, Misha gain +1 hit di ult-nya', passive: true },
    },
    description: 'DPS Ice Destruction. Ult jadi lebih kuat semakin banyak sekutu yang pakai ult.',
  },
  Gallagher: {
    name: 'Gallagher', rarity: 4, path: 'Abundance', element: 'Fire',
    baseHP: 1281, baseATK: 504, baseDEF: 352, baseSPD: 101, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Good Liquor Tastes Strong', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Tipsy Spin', desc: 'Serang 1 musuh + adjacent, pasang Besotted (healing amplifier)', sp: -1, dmgMult: 0.75, type: 'blast' },
      ult:     { name: 'Gift of Bones', desc: 'Heal semua anggota, consume Besotted untuk healing tambahan', energy: 100, dmgMult: 0, type: 'heal' },
      talent:  { name: 'Antiquated Apotheca', desc: 'Saat Besotted aktif, healing lebih besar', passive: true },
    },
    description: 'Healer Fire Abundance yang serbaguna. Besotted amplifies semua sumber healing.',
  },
  Moze: {
    name: 'Moze', rarity: 4, path: 'TheHunt', element: 'Lightning',
    baseHP: 931, baseATK: 582, baseDEF: 330, baseSPD: 110, baseEnergy: 110,
    weaknessBreak: { single: 30 },
    skills: {
      basic:   { name: 'Trailing Lights', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Fleetly Chase', desc: 'Tandai 1 musuh sebagai prey, +Lightning DMG follow-up', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Elimination', desc: 'Serang 1 musuh (prey), DMG 240% ATK, consume Prey mark', energy: 110, dmgMult: 2.40, type: 'single' },
      talent:  { name: 'Insatiable Vogel', desc: 'Saat musuh ber-Prey mark diserang sekutu, Moze ikut follow-up', passive: true },
    },
    description: 'Follow-up DPS Lightning Hunt. Sub-DPS yang kuat untuk tim follow-up attack.',
  },
  Jiaoqiu: {
    name: 'Jiaoqiu', rarity: 5, path: 'Nihility', element: 'Fire',
    baseHP: 1047, baseATK: 601, baseDEF: 396, baseSPD: 101, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Scorch Onslaught', desc: 'Serang 1-2 musuh, DMG 50% ATK, chance Ashen Roast', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Searing Plume', desc: 'Serang 1 musuh, pasang Ashen Roast stack', sp: -1, dmgMult: 1.50, type: 'single' },
      ult:     { name: 'Pyrograph Arcanum', desc: 'Pasang Fiery Quagmire: semua musuh DMG received +% & Ashen Roast', energy: 100, dmgMult: 0, type: 'debuff' },
      talent:  { name: 'Quartet Finesse', desc: 'Ashen Roast tumpuk jadi lebih kuat, increase Fire vulnerability', passive: true },
    },
    description: 'Debuffer Fire Nihility terkuat. Synergy luar biasa dengan Acheron.',
  },
  Firefly: {
    name: 'Firefly', rarity: 5, path: 'Destruction', element: 'Fire',
    baseHP: 1164, baseATK: 601, baseDEF: 363, baseSPD: 104, baseEnergy: 240,
    weaknessBreak: { single: 45, blast: 25 },
    skills: {
      basic:   { name: 'Order: Shake It Off', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Order: Into the Breach', desc: 'Masuk SAM mode, +Weakness DMG, +Break Efficiency', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Firefly\'s Fully Loaded', desc: 'Masuk Complete Combustion. Toughness break masif', energy: 240, dmgMult: 0, type: 'buff' },
      talent:  { name: 'Chrysalid Pyronexus', desc: 'DMG skala dari Break Effect stat, sangat berguna bersama Ruan Mei', passive: true },
    },
    description: 'Break DPS Fire terkuat. Bergantung pada Break Effect dan Weakness Break untuk damage masif.',
  },
  Jade: {
    name: 'Jade', rarity: 5, path: 'Erudition', element: 'Quantum',
    baseHP: 1086, baseATK: 640, baseDEF: 352, baseSPD: 103, baseEnergy: 140,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Voidweaver', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Frostsurge', desc: 'Pinjam HP 1 sekutu, sekutu itu deal bonus DMG Quantum', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Entrepreneur', desc: 'AoE Quantum DMG masif, gain Charge', energy: 140, dmgMult: 2.40, type: 'aoe' },
      talent:  { name: 'Debt Collector', desc: 'Gain Charge dari serangan. Saat Charge penuh, extra attack', passive: true },
    },
    description: 'AoE DPS Quantum Erudition. Charge mechanic-nya menghadirkan sustained damage tinggi.',
  },
  Boothill: {
    name: 'Boothill', rarity: 5, path: 'TheHunt', element: 'Fire',
    baseHP: 1086, baseATK: 640, baseDEF: 352, baseSPD: 107, baseEnergy: 120,
    weaknessBreak: { single: 45 },
    skills: {
      basic:   { name: 'Skullcrush Spurs', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Five Paces', desc: 'Masuk duel state, basic attack ter-enhance menjadi Roaring Bowstrings', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Dust Devil\'s Sunset Rodeo', desc: 'Serang 1 musuh Fire weakness, DMG masif + Break', energy: 120, dmgMult: 4.00, type: 'single' },
      talent:  { name: 'Five Paces Fever', desc: 'Break Effect scale ke DMG, spesialisasi untuk single target Fire', passive: true },
    },
    description: 'Break DPS Fire Hunt. Sangat kuat melawan musuh yang punya kelemahan Fire.',
  },
  Lingsha: {
    name: 'Lingsha', rarity: 5, path: 'Abundance', element: 'Wind',
    baseHP: 1281, baseATK: 601, baseDEF: 396, baseSPD: 101, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Scented Trail', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Heliotrope', desc: 'Pasang Fuyuan yang heal anggota tiap turn', sp: -1, dmgMult: 0, type: 'heal' },
      ult:     { name: 'Bloom at Dawn', desc: 'Heal semua anggota + AoE Wind DMG', energy: 100, dmgMult: 1.50, type: 'heal' },
      talent:  { name: 'Heartstring\'s Healing', desc: 'Fuyuan auto-heal prioritaskan anggota HP terendah', passive: true },
    },
    description: 'Healer Wind Abundance yang juga bisa deal damage. Serbaguna.',
  },
  ReMC: {
    name: 'Trailblazer (Remembrance)', rarity: 5, path: 'Remembrance', element: 'Ice',
    baseHP: 1241, baseATK: 524, baseDEF: 396, baseSPD: 101, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Frigid Crunch', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Mem: Stall for Time!', desc: 'Summon Mem, heal 1 sekutu, memberi buff Remember', sp: -1, dmgMult: 0, type: 'heal' },
      ult:     { name: 'Mem: Well Done!', desc: 'Mem menyerang semua musuh, AoE Ice DMG masif', energy: 120, dmgMult: 2.00, type: 'aoe' },
      talent:  { name: 'Mem\'s Assistance', desc: 'Mem aktif dan membantu sekutu secara otomatis', passive: true },
    },
    description: 'Trailblazer path Remembrance. Support hybrid dengan Mem sebagai summon.',
  },
  Aglaea: {
    name: 'Aglaea', rarity: 5, path: 'Remembrance', element: 'Lightning',
    baseHP: 1047, baseATK: 640, baseDEF: 363, baseSPD: 110, baseEnergy: 120,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Thunderweave', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Garment of Memory', desc: 'Buff 1 sekutu dengan Thread of Memory: +SPD & +DMG', sp: -1, dmgMult: 0, type: 'buff' },
      ult:     { name: 'Boundless Memory', desc: 'Buff semua tim, summon Garmentmaker spirit', energy: 120, dmgMult: 2.00, type: 'buff' },
      talent:  { name: 'Woven Legacy', desc: 'Thread of Memory memperkuat anggota yang paling aktif', passive: true },
    },
    description: 'Remembrance buffer Lightning terbaik. SPD dan DMG buff yang masif untuk tim.',
  },
  Mydei: {
    name: 'Mydei', rarity: 5, path: 'Destruction', element: 'Imaginary',
    baseHP: 1474, baseATK: 640, baseDEF: 363, baseSPD: 96, baseEnergy: 100,
    weaknessBreak: { single: 30, blast: 15 },
    skills: {
      basic:   { name: 'Unbreaking Will', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
      skill:   { name: 'Colosseum Clash', desc: 'Serang 1 musuh, DMG 150% ATK berdasar MaxHP', sp: -1, dmgMult: 1.50, type: 'single' },
      ult:     { name: 'Wrath of God-King', desc: 'Consume HP sendiri → deal massive Imaginary DMG, lalu heal balik', energy: 100, dmgMult: 3.00, type: 'single' },
      talent:  { name: 'Divine Resilience', desc: 'Saat HP turun, dapatkan shield dan damage boost', passive: true },
    },
    description: 'HP-scaling DPS Imaginary Destruction. Makin rendah HP, makin tinggi damage-nya.',
  },
};

// ── ENEMIES ────────────────────────────────────────────
const ENEMIES = {
  // === BASIC ===
  AutomatonSpider: {
    name: 'Automaton Spider', type: 'basic',
    hp: 1800, toughness: 60, level: 20,
    weaknesses: ['Fire', 'Ice'],
    skills: [
      { name: 'Web Shot', desc: 'Serang 1 anggota tim', dmgMult: 0.60 },
      { name: 'Entangle', desc: 'Serang + slow 1 anggota', dmgMult: 0.40 },
    ],
    drops: { credits: [300, 500], exp: 80 },
  },
  IceFox: {
    name: 'Ice Fox', type: 'basic',
    hp: 1500, toughness: 40, level: 15,
    weaknesses: ['Fire', 'Physical'],
    skills: [
      { name: 'Frost Bite', desc: 'Serang 1 anggota, chance Freeze', dmgMult: 0.55 },
      { name: 'Ice Breath', desc: 'AoE, DMG kecil, Slow', dmgMult: 0.30 },
    ],
    drops: { credits: [200, 400], exp: 60 },
  },
  CopperShield: {
    name: 'Copper Shield Soldier', type: 'basic',
    hp: 2200, toughness: 80, level: 25,
    weaknesses: ['Lightning', 'Quantum'],
    skills: [
      { name: 'Shield Bash', desc: 'Serang 1 anggota, chance Stun', dmgMult: 0.70 },
      { name: 'Group Charge', desc: 'AoE, DMG sedang', dmgMult: 0.50 },
    ],
    drops: { credits: [400, 700], exp: 100 },
  },
  TwilightNymph: {
    name: 'Twilight Nymph', type: 'basic',
    hp: 1600, toughness: 50, level: 20,
    weaknesses: ['Wind', 'Physical'],
    skills: [
      { name: 'Shadow Lance', desc: 'Serang 1 anggota, DMG sedang', dmgMult: 0.65 },
      { name: 'Nightmare Veil', desc: 'Debuff 1 anggota, -ATK', dmgMult: 0.20 },
    ],
    drops: { credits: [250, 450], exp: 75 },
  },
  // === ELITE ===
  StagnantShadow: {
    name: 'Stagnant Shadow: Shape of Blaze', type: 'elite',
    hp: 8000, toughness: 120, level: 40,
    weaknesses: ['Ice', 'Quantum'],
    skills: [
      { name: 'Blazing Charge', desc: 'AoE Fire, DMG tinggi', dmgMult: 1.20 },
      { name: 'Scorch Singularity', desc: 'Target 1 anggota, Burn', dmgMult: 1.50 },
      { name: 'Magma Explosion', desc: 'AoE besar, seluruh tim', dmgMult: 0.80 },
    ],
    drops: { credits: [2000, 3000], exp: 500, material: 'Ashen Roast' },
  },
  EverwinterShade: {
    name: 'Everwinter Shadewalker', type: 'elite',
    hp: 9000, toughness: 150, level: 45,
    weaknesses: ['Fire', 'Lightning'],
    skills: [
      { name: 'Frost Nova', desc: 'AoE Ice, Freeze semua', dmgMult: 1.00 },
      { name: 'Icicle Spear', desc: 'Single target, DMG sangat tinggi', dmgMult: 1.80 },
      { name: 'Blizzard', desc: 'AoE, Slow semua anggota tim', dmgMult: 0.70 },
    ],
    drops: { credits: [2500, 3500], exp: 600, material: 'Shadewalker Core' },
  },
  // === BOSSES ===
  Cocolia: {
    name: 'Cocolia, Mother of Deception', type: 'boss',
    hp: 35000, toughness: 300, level: 60,
    weaknesses: ['Fire', 'Lightning'],
    phases: 2,
    skills: [
      { name: 'Glacial Barrage', desc: 'AoE Ice massive, Freeze chance', dmgMult: 1.50 },
      { name: 'Permafrost Dive', desc: 'Single target, DMG sangat tinggi', dmgMult: 2.20 },
      { name: 'Blizzard Aegis', desc: 'Cocolia dapat Shield, +DEF', dmgMult: 0 },
      { name: '[Phase 2] Wrath of the Frozen', desc: 'AoE extreme, -SPD semua anggota tim', dmgMult: 2.80 },
    ],
    drops: { credits: [8000, 12000], exp: 2000, material: 'Cocolia\'s Core' },
  },
  SymbolismOfTheCross: {
    name: 'The Antimatter Engine', type: 'boss',
    hp: 28000, toughness: 240, level: 55,
    weaknesses: ['Ice', 'Physical'],
    phases: 1,
    skills: [
      { name: 'Antimatter Burst', desc: 'AoE besar, true DMG', dmgMult: 1.80 },
      { name: 'Singularity Collapse', desc: 'Single target + adjacent, DMG tinggi', dmgMult: 2.00 },
      { name: 'Void Absorption', desc: 'Absorb HP dari 1 anggota tim', dmgMult: 0.50 },
    ],
    drops: { credits: [7000, 10000], exp: 1800, material: 'Antimatter Fragment' },
  },
  ImmemorialHound: {
    name: 'Imaginary Weaver', type: 'boss',
    hp: 30000, toughness: 260, level: 58,
    weaknesses: ['Quantum', 'Fire'],
    phases: 1,
    skills: [
      { name: 'Reality Distortion', desc: 'Serang tim, skip giliran 1 anggota', dmgMult: 1.20 },
      { name: 'Thread Unravel', desc: 'AoE Imaginary, -Energy anggota', dmgMult: 1.50 },
      { name: 'Weave Oblivion', desc: 'Single target, DMG extreme', dmgMult: 2.50 },
    ],
    drops: { credits: [7500, 11000], exp: 1900, material: 'Dream Weaver Core' },
  },
};

// ── GACHA / WARP POOL ─────────────────────────────────
const WARP_POOLS = {
  standard: {
    name: '🌟 Stellar Warp',
    cost_single: 160,   // Stellar Jade
    cost_ten: 1600,
    pity5: 90,
    pity4: 10,
    softPity: 74,       // pity mulai dari pull ke-74
    rate5: 0.006,
    rate4: 0.051,
    pool5: ['Himeko', 'Bronya', 'Welt', 'Gepard', 'Clara', 'Bailu', 'Yanqing', 'JingYuan'],
    pool4: ['DanHeng', 'March7th', 'Natasha', 'Asta', 'Pela', 'Tingyun', 'Sampo', 'Qingque',
            'Sushang', 'Yukong', 'Luka', 'Lynx', 'Guinaifen', 'Hanya', 'Xueyi', 'Misha', 'Gallagher'],
    pool3: ['lightcone_3star'],
    fiftyFifty: false,
  },
  character: {
    name: '✨ Character Event Warp',
    cost_single: 160,
    cost_ten: 1600,
    pity5: 90,
    pity4: 10,
    softPity: 74,
    rate5: 0.006,
    rate4: 0.051,
    // Limited character diset dinamis saat banner aktif
    featuredFive: null,  // diisi saat banner aktif
    featuredFour: [],
    fiftyFifty: true,    // 50/50 system
    guaranteed: false,   // akan berubah jika kalah 50/50
  },
};

// ── STARTER CHARACTERS ─────────────────────────────────
const STARTER_CHARACTERS = ['DanHeng', 'March7th', 'Natasha', 'Asta', 'Pela'];

// ── TRAILBLAZER DEFAULT ────────────────────────────────
const TRAILBLAZER = {
  name: 'Trailblazer (Physical)', rarity: 5, path: 'Destruction', element: 'Physical',
  baseHP: 1241, baseATK: 524, baseDEF: 396, baseSPD: 100, baseEnergy: 120,
  weaknessBreak: { single: 30, blast: 15 },
  skills: {
    basic:   { name: 'Roaring Beats', desc: 'Serang 1 musuh, DMG 50% ATK', sp: +1, dmgMult: 0.50, type: 'single' },
    skill:   { name: 'Ever-Burning Amber', desc: 'Serang 1 musuh + adjacent, DMG 80% ATK', sp: -1, dmgMult: 0.80, type: 'blast' },
    ult:     { name: 'Stardust Ace', desc: 'Serang semua musuh, DMG 180% ATK', energy: 120, dmgMult: 1.80, type: 'aoe' },
    talent:  { name: 'Trailblaze', desc: 'Saat berhasil Weakness Break, +15% Crit Rate 1 turn', passive: true },
  },
  description: 'Protagonist utama. Serbaguna sebagai Destruction DPS.',
};

// ── LIGHT CONE (contoh utama) ──────────────────────────
const LIGHT_CONES = {
  InTheNameOfTheWorld: {
    name: 'In the Name of the World', rarity: 5, path: 'Nihility',
    desc: 'ATK +24%. Skill hit meningkatkan Crit DMG target.',
    baseATK: 476, baseHP: 1058, baseDEF: 396,
  },
  SilenceTheFalseNoise: {
    name: 'Silence the False Noise', rarity: 5, path: 'Nihility',
    desc: 'Effect Hit Rate +28%. Skill tambah DoT damage +60%.',
    baseATK: 476, baseHP: 1058, baseDEF: 396,
  },
  SomethingIrreplaceable: {
    name: 'Something Irreplaceable', rarity: 5, path: 'Destruction',
    desc: 'ATK +24%. Saat kena damage atau kill, heal HP & +ATK 24%.',
    baseATK: 582, baseHP: 1058, baseDEF: 396,
  },
  IShallBeMyOwnSword: {
    name: 'I Shall Be My Own Sword', rarity: 5, path: 'Destruction',
    desc: 'Saat sekutu mati, Blade +ATK 24% & Crit DMG. Stack max 3.',
    baseATK: 582, baseHP: 1058, baseDEF: 396,
  },
  InTheHigh: {
    name: 'In the High', rarity: 4, path: 'Nihility',
    desc: 'Effect Hit Rate +20%. Skill chance Burn +20%.',
    baseATK: 423, baseHP: 952, baseDEF: 330,
  },
  // 3-star light cones (dari warp)
  Cornucopia: { name: 'Cornucopia', rarity: 3, path: 'Abundance', desc: 'Healing +12%.', baseATK: 317, baseHP: 846, baseDEF: 264 },
  ShatteredHome: { name: 'Shattered Home', rarity: 3, path: 'Destruction', desc: 'Enemy HP >50% → DMG +20%.', baseATK: 370, baseHP: 793, baseDEF: 264 },
  Loop: { name: 'Loop', rarity: 3, path: 'TheHunt', desc: 'Speed +6% saat awal pertarungan.', baseATK: 370, baseHP: 793, baseDEF: 264 },
  Void: { name: 'Void', rarity: 3, path: 'Nihility', desc: 'Effect Hit Rate +20% di awal.', baseATK: 317, baseHP: 793, baseDEF: 264 },
  HoldYourBreath: { name: 'Hold Your Breath', rarity: 3, path: 'TheHunt', desc: 'Crit Rate +8% awal. Reset saat skill.', baseATK: 370, baseHP: 793, baseDEF: 264 },
  DartingArrow: { name: 'Darting Arrow', rarity: 3, path: 'TheHunt', desc: 'ATK +16% setelah kill.', baseATK: 370, baseHP: 793, baseDEF: 264 },
  MutualDemise: { name: 'Mutual Demise', rarity: 3, path: 'Preservation', desc: 'HP <80% → Crit Rate +8%.', baseATK: 264, baseHP: 952, baseDEF: 330 },
};

// ── RELIC SETS ─────────────────────────────────────────
const RELIC_SETS = {
  GeniusOfBrilliantStars: {
    name: 'Genius of Brilliant Stars',
    bonus2: 'Quantum DMG +10%',
    bonus4: 'Ignore 10% DEF. Jika tidak ada weakness → ignore 10% lagi',
  },
  HunterOfGlacialForest: {
    name: 'Hunter of Glacial Forest',
    bonus2: 'Ice DMG +10%',
    bonus4: 'Setelah ult, Crit DMG +25% selama 2 turn',
  },
  MessengerTraversingHackerspace: {
    name: 'Messenger Traversing Hackerspace',
    bonus2: 'SPD +6%',
    bonus4: 'Setelah ult, tim +12% SPD selama 1 turn',
  },
  LongevousDisciple: {
    name: 'Longevous Disciple',
    bonus2: 'MaxHP +12%',
    bonus4: 'Saat kena damage atau heal, Crit Rate +8% max 2 stack',
  },
  ThiefOfShootingMeteor: {
    name: 'Thief of Shooting Meteor',
    bonus2: 'Break Effect +16%',
    bonus4: 'Break Effect +16% lagi. Saat Weakness Break, regen 3 Energy',
  },
};

// ── STATUS EFFECTS ─────────────────────────────────────
const STATUS_EFFECTS = {
  Burn:        { name: '🔥 Burn',       element: 'Fire',      type: 'dot',    desc: 'Damage tiap turn dari Fire' },
  Shock:       { name: '⚡ Shock',      element: 'Lightning', type: 'dot',    desc: 'Damage tiap turn dari Lightning' },
  WindShear:   { name: '🌀 Wind Shear', element: 'Wind',      type: 'dot',    desc: 'Damage tiap turn dari Wind, stack max 5' },
  Bleed:       { name: '🩸 Bleed',      element: 'Physical',  type: 'dot',    desc: 'Damage tiap turn dari Physical, skala MaxHP' },
  Freeze:      { name: '❄️ Freeze',     element: 'Ice',       type: 'cc',     desc: 'Target tidak bisa aksi 1 turn' },
  Imprisonment:{ name: '🟡 Imprisoned', element: 'Imaginary', type: 'cc',     desc: 'Target tidak bisa aksi, SPD -10%' },
  Entanglement:{ name: '🌌 Entangled',  element: 'Quantum',   type: 'cc',     desc: 'Target aksi mundur dalam queue' },
  Stun:        { name: '😵 Stun',       element: 'Physical',  type: 'cc',     desc: 'Target tidak bisa aksi 1 turn' },
  Slow:        { name: '🐢 Slow',       element: 'Imaginary', type: 'debuff', desc: 'SPD -30%' },
  DefDown:     { name: '🛡️↓ DEF Down',  element: null,        type: 'debuff', desc: 'DEF dikurangi %' },
  AtkDown:     { name: '⚔️↓ ATK Down',  element: null,        type: 'debuff', desc: 'ATK dikurangi %' },
};

// ── BREAK EFFECTS BY ELEMENT ───────────────────────────
const BREAK_EFFECTS = {
  Physical:  { name: 'Bleed',       desc: 'Damage = 32% MaxHP musuh per aksi, 2 turn' },
  Fire:      { name: 'Burn',        desc: 'DoT = 24% ATK × target DEF modifier per turn, 2 turn' },
  Ice:       { name: 'Freeze',      desc: 'Skip 1 aksi musuh, physical damage extra saat menyerang' },
  Lightning: { name: 'Shock',       desc: 'DoT = 24% ATK × modifier per turn, 2 turn' },
  Wind:      { name: 'Wind Shear',  desc: 'DoT = 16% ATK × modifier, stack max 5, 2 turn' },
  Quantum:   { name: 'Entanglement',desc: 'Target delay, tambahan Quantum DMG tiap aksi sekutu' },
  Imaginary: { name: 'Imprisonment',desc: 'Skip 1 aksi musuh + SPD -10% selama 1 turn' },
};

// ── EXPORTS ────────────────────────────────────────────
module.exports = {
  ELEMENT,
  PATH,
  CHARACTERS,
  ENEMIES,
  WARP_POOLS,
  STARTER_CHARACTERS,
  TRAILBLAZER,
  LIGHT_CONES,
  RELIC_SETS,
  STATUS_EFFECTS,
  BREAK_EFFECTS,
};
