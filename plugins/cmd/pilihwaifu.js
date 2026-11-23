// Plugin: pilihwaifu
// Auto-generated from Alya V12
// Commands: pilihwaifu
// Updated V20: List 300 Waifu, Tier Rework (COMMON/EPIC/LEGENDARY/MITOS)

const path = require('path')

// ─────────────────────────────────────────────
// Master list 300 waifu — nomor & urutan tetap
// Tier sesuai "300 Edisi - Tier Rework"
// ─────────────────────────────────────────────
const WAIFU_LIST_300 = [
  // ⚪ COMMON [1-80] — nomor 1-17, 19 (sesuai list; 18 ada di EPIC)
  { no: 1,   name: 'Aira Shiratori',              anime: 'Dandadan',                                    rarity: 'COMMON' },
  { no: 2,   name: 'Utena Hiiragi',               anime: 'Mahou Shoujo ni Akogarete',                   rarity: 'COMMON' },
  { no: 3,   name: 'Kana Ichinose',               anime: 'Makeine: Too Many Losing Heroines!',          rarity: 'COMMON' },
  { no: 4,   name: 'Lemon Yakishio',              anime: 'Makeine: Too Many Losing Heroines!',          rarity: 'COMMON' },
  { no: 5,   name: 'Chika Komari',                anime: 'Makeine: Too Many Losing Heroines!',          rarity: 'COMMON' },
  { no: 6,   name: 'Elianna Bernstein',           anime: 'Mushikaburi-hime',                            rarity: 'COMMON' },
  { no: 7,   name: 'Saya Kisaragi',               anime: 'Tasogare Otome x Amnesia',                   rarity: 'COMMON' },
  { no: 8,   name: 'Nanami Mami',                 anime: 'Kanojo, Okarishimasu',                        rarity: 'COMMON' },
  { no: 9,   name: 'Ruka Sarashina',              anime: 'Kanojo, Okarishimasu',                        rarity: 'COMMON' },
  { no: 10,  name: 'Sumi Sakurasawa',             anime: 'Kanojo, Okarishimasu',                        rarity: 'COMMON' },
  { no: 11,  name: 'Nadeshiko Kagamihara',        anime: 'Yuru Camp△ S3',                               rarity: 'COMMON' },
  { no: 12,  name: 'Rin Shima',                   anime: 'Yuru Camp△ S3',                               rarity: 'COMMON' },
  { no: 13,  name: 'Hitori Gotou "Bocchi"',       anime: 'Bocchi the Rock!',                            rarity: 'COMMON' },
  { no: 14,  name: 'Ikuyo Kita',                  anime: 'Bocchi the Rock!',                            rarity: 'COMMON' },
  { no: 15,  name: 'Ryo Yamada',                  anime: 'Bocchi the Rock!',                            rarity: 'COMMON' },
  { no: 16,  name: 'Nijika Ijichi',               anime: 'Bocchi the Rock!',                            rarity: 'COMMON' },
  { no: 17,  name: 'Najimi Osana',                anime: 'Komi-san wa, Komyushou desu',                 rarity: 'COMMON' },
  // no: 18 → Fiona Frost masuk EPIC (lihat bawah)
  { no: 19,  name: 'Lycoris',                     anime: 'Lycoris Recoil',                              rarity: 'COMMON' },
  // 💎 EPIC — no 18, 20-40 (dari list asli) + 116-150
  { no: 18,  name: 'Fiona Frost',                 anime: 'Spy x Family Season 2',                       rarity: 'EPIC' },
  { no: 20,  name: 'Vermeil',                     anime: 'Kinsou no Vermeil',                           rarity: 'EPIC' },
  { no: 21,  name: 'Anna Yamada',                 anime: 'Boku no Kokoro no Yabai Yatsu S2',            rarity: 'EPIC' },
  { no: 22,  name: 'Marcille Donato',             anime: 'Dungeon Meshi',                               rarity: 'EPIC' },
  { no: 23,  name: 'Falin Touden',                anime: 'Dungeon Meshi',                               rarity: 'EPIC' },
  { no: 24,  name: 'Senshi',                      anime: 'Dungeon Meshi',                               rarity: 'EPIC' },
  { no: 25,  name: 'Jinshi',                      anime: 'Kusuriya no Hitorigoto S2',                   rarity: 'EPIC' },
  { no: 26,  name: 'Kiyoka Kudou',                anime: 'Watashi no Shiawase na Kekkon S2',            rarity: 'EPIC' },
  { no: 27,  name: 'Shoko Komi',                  anime: 'Komi-san wa, Komyushou desu',                 rarity: 'EPIC' },
  { no: 28,  name: 'Chisato Nishikigi',           anime: 'Lycoris Recoil',                              rarity: 'EPIC' },
  { no: 29,  name: 'Takina Inoue',                anime: 'Lycoris Recoil',                              rarity: 'EPIC' },
  { no: 30,  name: 'Suzume Iwato',                anime: 'Suzume no Tojimari',                          rarity: 'EPIC' },
  { no: 31,  name: 'Marin Kitagawa',              anime: 'Sono Bisque Doll wa Koi wo Suru S2',          rarity: 'EPIC' },
  { no: 32,  name: 'Sajuna Inui',                 anime: 'Sono Bisque Doll wa Koi wo Suru S2',          rarity: 'EPIC' },
  { no: 33,  name: 'Lilia Kudelfeyt',             anime: 'Vermeil in Gold',                             rarity: 'EPIC' },
  { no: 34,  name: 'Akane Kurokawa',              anime: 'Oshi no Ko S2',                               rarity: 'EPIC' },
  { no: 35,  name: 'Mem-cho',                     anime: 'Oshi no Ko S2',                               rarity: 'EPIC' },
  { no: 36,  name: 'Mitsuri Kanroji',             anime: 'Kimetsu no Yaiba: Hashira Geiko-hen',         rarity: 'EPIC' },
  { no: 37,  name: 'Miyo Saimori',                anime: 'Watashi no Shiawase na Kekkon S2',            rarity: 'EPIC' },
  { no: 38,  name: 'Momo Ayase',                  anime: 'Dandadan',                                    rarity: 'EPIC' },
  { no: 39,  name: 'Arima Kana',                  anime: 'Oshi no Ko S2',                               rarity: 'EPIC' },
  { no: 40,  name: 'Ruby Hoshino',                anime: 'Oshi no Ko S2',                               rarity: 'EPIC' },
  // 🌟 LEGENDARY — no 41-65
  { no: 41,  name: 'Nobara Kugisaki',             anime: 'Jujutsu Kaisen S2',                           rarity: 'LEGENDARY' },
  { no: 42,  name: 'Maki Zenin',                  anime: 'Jujutsu Kaisen S2',                           rarity: 'LEGENDARY' },
  { no: 43,  name: 'Shoko Ieiri',                 anime: 'Jujutsu Kaisen S2',                           rarity: 'LEGENDARY' },
  { no: 44,  name: 'Mei Mei',                     anime: 'Jujutsu Kaisen S2',                           rarity: 'LEGENDARY' },
  { no: 45,  name: 'Utahime Iori',                anime: 'Jujutsu Kaisen S2',                           rarity: 'LEGENDARY' },
  { no: 46,  name: 'Rika Orimoto',                anime: 'Jujutsu Kaisen 0',                            rarity: 'LEGENDARY' },
  { no: 47,  name: 'Nezuko Kamado',               anime: 'Kimetsu no Yaiba: Swordsmith Village',        rarity: 'LEGENDARY' },
  { no: 48,  name: 'Shinobu Kocho',               anime: 'Kimetsu no Yaiba',                            rarity: 'LEGENDARY' },
  { no: 49,  name: 'Kanao Tsuyuri',               anime: 'Kimetsu no Yaiba',                            rarity: 'LEGENDARY' },
  { no: 50,  name: 'Daki',                        anime: 'Kimetsu no Yaiba: Yuukaku-hen',               rarity: 'LEGENDARY' },
  { no: 51,  name: 'Himeno',                      anime: 'Chainsaw Man',                                rarity: 'LEGENDARY' },
  { no: 52,  name: 'Kobeni Higashiyama',          anime: 'Chainsaw Man',                                rarity: 'LEGENDARY' },
  { no: 53,  name: 'Reze',                        anime: 'Chainsaw Man Movie',                          rarity: 'LEGENDARY' },
  { no: 54,  name: 'Nico Robin',                  anime: 'One Piece: Egghead',                          rarity: 'LEGENDARY' },
  { no: 55,  name: 'Boa Hancock',                 anime: 'One Piece',                                   rarity: 'LEGENDARY' },
  { no: 56,  name: 'Yamato',                      anime: 'One Piece: Wano',                             rarity: 'LEGENDARY' },
  { no: 57,  name: 'Uta',                         anime: 'One Piece Film Red',                          rarity: 'LEGENDARY' },
  { no: 58,  name: 'Kaguya Shinomiya',            anime: 'Kaguya-sama: Love is War S3 + Movie',         rarity: 'LEGENDARY' },
  { no: 59,  name: 'Hayasaka Ai',                 anime: 'Kaguya-sama: Love is War',                    rarity: 'LEGENDARY' },
  { no: 60,  name: 'Chika Fujiwara',              anime: 'Kaguya-sama: Love is War',                    rarity: 'LEGENDARY' },
  { no: 61,  name: 'Rem',                         anime: 'Re:Zero S3',                                  rarity: 'LEGENDARY' },
  { no: 62,  name: 'Emilia',                      anime: 'Re:Zero S3',                                  rarity: 'LEGENDARY' },
  { no: 63,  name: 'Echidna',                     anime: 'Re:Zero',                                     rarity: 'LEGENDARY' },
  { no: 64,  name: 'Beatrice',                    anime: 'Re:Zero',                                     rarity: 'LEGENDARY' },
  { no: 65,  name: 'Violet Evergarden',           anime: 'Violet Evergarden Movie',                     rarity: 'LEGENDARY' },
  // 💀 MITOS — no 66-89
  { no: 66,  name: 'Mahiru Shiina',               anime: 'Otonari no Tenshi-sama',                      rarity: 'MITOS' },
  { no: 67,  name: 'Yuki Suou',                   anime: 'Roshidere',                                   rarity: 'MITOS' },
  { no: 68,  name: 'Alisa Mikhailovna Kujou',     anime: 'Roshidere',                                   rarity: 'MITOS' },
  { no: 69,  name: 'Frieren',                     anime: 'Sousou no Frieren',                           rarity: 'MITOS' },
  { no: 70,  name: 'Fern',                        anime: 'Sousou no Frieren',                           rarity: 'MITOS' },
  { no: 71,  name: 'Ubel',                        anime: 'Sousou no Frieren',                           rarity: 'MITOS' },
  { no: 72,  name: 'Aura',                        anime: 'Sousou no Frieren',                           rarity: 'MITOS' },
  { no: 73,  name: 'Sense',                       anime: 'Sousou no Frieren',                           rarity: 'MITOS' },
  { no: 74,  name: 'Ai Hoshino',                  anime: 'Oshi no Ko',                                  rarity: 'MITOS' },
  { no: 75,  name: 'Makima',                      anime: 'Chainsaw Man',                                rarity: 'MITOS' },
  { no: 76,  name: 'Power',                       anime: 'Chainsaw Man',                                rarity: 'MITOS' },
  { no: 77,  name: 'Asa Mitaka',                  anime: 'Chainsaw Man Part 2',                         rarity: 'MITOS' },
  { no: 78,  name: 'Maomao',                      anime: 'Kusuriya no Hitorigoto S1+S2',                rarity: 'MITOS' },
  { no: 79,  name: 'Acrobatic Silky',             anime: 'Dandadan',                                    rarity: 'MITOS' },
  { no: 80,  name: 'Anya Forger',                 anime: 'Spy x Family Movie: Code White',              rarity: 'MITOS' },
  { no: 81,  name: 'Yor Forger',                  anime: 'Spy x Family',                                rarity: 'MITOS' },
  { no: 82,  name: 'Suletta Mercury',             anime: 'Gundam: Witch from Mercury S2',               rarity: 'MITOS' },
  { no: 83,  name: 'Miorine Rembran',             anime: 'Gundam: Witch from Mercury S2',               rarity: 'MITOS' },
  { no: 84,  name: 'Nika Nanaura',                anime: 'Gundam: Witch from Mercury',                  rarity: 'MITOS' },
  { no: 85,  name: 'Zero Two',                    anime: 'Darling in the Franxx',                       rarity: 'MITOS' },
  { no: 86,  name: 'Asuka Langley Soryu',         anime: 'Evangelion',                                  rarity: 'MITOS' },
  { no: 87,  name: 'Rei Ayanami',                 anime: 'Evangelion',                                  rarity: 'MITOS' },
  { no: 88,  name: 'Mikasa Ackerman',             anime: 'Shingeki no Kyojin Final Season',             rarity: 'MITOS' },
  { no: 89,  name: 'Historia Reiss',              anime: 'Shingeki no Kyojin Final Season',             rarity: 'MITOS' },
  // ⚪ COMMON — no 90-115 (Genshin Common, HSR Common, Umamusume Common)
  { no: 90,  name: 'Klee',                        anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 91,  name: 'Noelle',                      anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 92,  name: 'Barbara',                     anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 93,  name: 'Diona',                       anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 94,  name: 'Sayu',                        anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 95,  name: 'Lumine',                      anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 96,  name: 'Paimon',                      anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 97,  name: 'Yaoyao',                      anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 98,  name: 'Kirara',                      anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 99,  name: 'Kachina',                     anime: 'Genshin Impact',                              rarity: 'COMMON' },
  { no: 100, name: 'March 7th',                   anime: 'Honkai Star Rail',                            rarity: 'COMMON' },
  { no: 101, name: 'Pela',                        anime: 'Honkai Star Rail',                            rarity: 'COMMON' },
  { no: 102, name: 'Asta',                        anime: 'Honkai Star Rail',                            rarity: 'COMMON' },
  { no: 103, name: 'Serval',                      anime: 'Honkai Star Rail',                            rarity: 'COMMON' },
  { no: 104, name: 'Hook',                        anime: 'Honkai Star Rail',                            rarity: 'COMMON' },
  { no: 105, name: 'Haru Urara',                  anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 106, name: 'Taiki Shuttle',               anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 107, name: 'Nice Nature',                 anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 108, name: 'Curren Chan',                 anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 109, name: 'Air Groove',                  anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 110, name: 'Satono Diamond',              anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 111, name: 'Sakura Airy',                 anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 112, name: 'Cesario',                     anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 113, name: 'Manhattan Cafe',              anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 114, name: 'Hishi Amazon',                anime: 'Umamusume',                                   rarity: 'COMMON' },
  { no: 115, name: 'Bikki',                       anime: 'Umamusume',                                   rarity: 'COMMON' },
  // 💎 EPIC — no 116-150 (Genshin Epic, HSR Epic, Umamusume Epic, Mato Seihei)
  { no: 116, name: 'Raiden Shogun',               anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 117, name: 'Yae Miko',                    anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 118, name: 'Shenhe',                      anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 119, name: 'Sangonomiya Kokomi',          anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 120, name: 'Mualani',                     anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 121, name: 'Xilonen',                     anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 122, name: 'Citlali',                     anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 123, name: 'Clorinde',                    anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 124, name: 'Navia',                       anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 125, name: 'Chiori',                      anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 126, name: 'Sigewinne',                   anime: 'Genshin Impact',                              rarity: 'EPIC' },
  { no: 127, name: 'Kafka',                       anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 128, name: 'Silver Wolf',                 anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 129, name: 'Fu Xuan',                     anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 130, name: 'Ruan Mei',                    anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 131, name: 'Topaz',                       anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 132, name: 'Sparkle',                     anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 133, name: 'Herta',                       anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 134, name: 'Tingyun',                     anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 135, name: 'Yunli',                       anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 136, name: 'Feixiao',                     anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 137, name: 'Lingsha',                     anime: 'Honkai Star Rail',                            rarity: 'EPIC' },
  { no: 138, name: 'Narita Brian',                anime: 'Umamusume',                                   rarity: 'EPIC' },
  { no: 139, name: 'Rice Shower',                 anime: 'Umamusume',                                   rarity: 'EPIC' },
  { no: 140, name: 'Oguri Cap',                   anime: 'Umamusume',                                   rarity: 'EPIC' },
  { no: 141, name: 'Tamagawa',                    anime: 'Umamusume',                                   rarity: 'EPIC' },
  { no: 142, name: 'Matikanefukitaru',            anime: 'Umamusume',                                   rarity: 'EPIC' },
  { no: 143, name: 'Seiun Sky',                   anime: 'Umamusume',                                   rarity: 'EPIC' },
  { no: 144, name: 'Grass Wonder',                anime: 'Umamusume',                                   rarity: 'EPIC' },
  { no: 145, name: 'Mayano Top Gun',              anime: 'Umamusume',                                   rarity: 'EPIC' },
  { no: 146, name: 'Natsumi Kiyoura',             anime: 'Dandadan',                                    rarity: 'COMMON' },
  { no: 147, name: 'Hana',                        anime: 'Dandadan',                                    rarity: 'COMMON' },
  { no: 148, name: 'Kyouka Uzen',                 anime: 'Mato Seihei no Slave',                        rarity: 'EPIC' },
  { no: 149, name: 'Tenka Izumo',                 anime: 'Mato Seihei no Slave',                        rarity: 'EPIC' },
  { no: 150, name: 'Shikoku Shushu',              anime: 'Mato Seihei no Slave',                        rarity: 'EPIC' },
  // 🌟 LEGENDARY — no 151-175 (Genshin Legendary, HSR Legendary, Honkai Impact 3rd, Umamusume Legendary, Kimetsu Legendary)
  { no: 151, name: 'Hu Tao',                      anime: 'Genshin Impact',                              rarity: 'LEGENDARY' },
  { no: 152, name: 'Ganyu',                       anime: 'Genshin Impact',                              rarity: 'LEGENDARY' },
  { no: 153, name: 'Eula',                        anime: 'Genshin Impact',                              rarity: 'LEGENDARY' },
  { no: 154, name: 'Arlecchino',                  anime: 'Genshin Impact',                              rarity: 'LEGENDARY' },
  { no: 155, name: 'Furina',                      anime: 'Genshin Impact',                              rarity: 'LEGENDARY' },
  { no: 156, name: 'Mavuika',                     anime: 'Genshin Impact',                              rarity: 'LEGENDARY' },
  { no: 157, name: 'Seele',                       anime: 'Honkai Star Rail',                            rarity: 'LEGENDARY' },
  { no: 158, name: 'Himeko',                      anime: 'Honkai Star Rail',                            rarity: 'LEGENDARY' },
  { no: 159, name: 'Black Swan',                  anime: 'Honkai Star Rail',                            rarity: 'LEGENDARY' },
  { no: 160, name: 'Rappa',                       anime: 'Honkai Star Rail',                            rarity: 'LEGENDARY' },
  { no: 161, name: 'Special Week',                anime: 'Umamusume',                                   rarity: 'LEGENDARY' },
  { no: 162, name: 'Toukai Teio',                 anime: 'Umamusume',                                   rarity: 'LEGENDARY' },
  { no: 163, name: 'Symboli Rudolf',              anime: 'Umamusume',                                   rarity: 'LEGENDARY' },
  { no: 164, name: 'Maruzensky',                  anime: 'Umamusume',                                   rarity: 'LEGENDARY' },
  { no: 165, name: 'Air Shakur',                  anime: 'Umamusume',                                   rarity: 'LEGENDARY' },
  { no: 166, name: 'Nakayama Festa',              anime: 'Umamusume',                                   rarity: 'LEGENDARY' },
  { no: 167, name: 'Sakura Bakushin O',           anime: 'Umamusume',                                   rarity: 'LEGENDARY' },
  { no: 168, name: 'Kita-san',                    anime: 'Umamusume',                                   rarity: 'LEGENDARY' },
  { no: 169, name: 'Kanae Kocho',                 anime: 'Kimetsu no Yaiba',                            rarity: 'LEGENDARY' },
  { no: 170, name: 'Aoi Kanzaki',                 anime: 'Kimetsu no Yaiba',                            rarity: 'LEGENDARY' },
  { no: 171, name: 'Makomo',                      anime: 'Kimetsu no Yaiba',                            rarity: 'LEGENDARY' },
  { no: 172, name: 'Hinatsuru',                   anime: 'Kimetsu no Yaiba',                            rarity: 'LEGENDARY' },
  { no: 173, name: 'Suma',                        anime: 'Kimetsu no Yaiba',                            rarity: 'LEGENDARY' },
  { no: 174, name: 'Makio',                       anime: 'Kimetsu no Yaiba',                            rarity: 'LEGENDARY' },
  { no: 175, name: 'Lady Tamayo',                 anime: 'Kimetsu no Yaiba',                            rarity: 'LEGENDARY' },
  // 💀 MITOS — no 176-200 (Honkai Impact 3rd MITOS, HSR MITOS, Umamusume MITOS)
  { no: 176, name: 'Raiden Mei',                  anime: 'Honkai Impact 3rd',                           rarity: 'MITOS' },
  { no: 177, name: 'Kiana Kaslana',               anime: 'Honkai Impact 3rd',                           rarity: 'MITOS' },
  { no: 178, name: 'Bronya Zaychik',              anime: 'Honkai Impact 3rd',                           rarity: 'MITOS' },
  { no: 179, name: 'Elysia',                      anime: 'Honkai Impact 3rd',                           rarity: 'MITOS' },
  { no: 180, name: 'Theresa Apocalypse',          anime: 'Honkai Impact 3rd',                           rarity: 'MITOS' },
  { no: 181, name: 'Durandal',                    anime: 'Honkai Impact 3rd',                           rarity: 'MITOS' },
  { no: 182, name: 'Fu Hua',                      anime: 'Honkai Impact 3rd',                           rarity: 'MITOS' },
  { no: 183, name: 'Acheron',                     anime: 'Honkai Star Rail',                            rarity: 'MITOS' },
  { no: 184, name: 'Firefly / SAM',               anime: 'Honkai Star Rail',                            rarity: 'MITOS' },
  { no: 185, name: 'Jingliu',                     anime: 'Honkai Star Rail',                            rarity: 'MITOS' },
  { no: 186, name: 'Nahida / Lesser Lord Kusanali', anime: 'Genshin Impact',                            rarity: 'MITOS' },
  { no: 187, name: 'Mejiro McQueen',              anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 188, name: 'Tosen Jordan',                anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 189, name: 'Hishi Akebono',               anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 190, name: 'Biwa Hayahide',               anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 191, name: 'Inari One',                   anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 192, name: 'Yukino Bijin',                anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 193, name: 'Suguri',                      anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 194, name: 'Sweep Tosho',                 anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 195, name: 'Hosho',                       anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 196, name: 'Super Creek',                 anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 197, name: 'El Condor Pasa',              anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 198, name: 'TM Opera O',                  anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 199, name: 'Admire Vega',                 anime: 'Umamusume',                                   rarity: 'MITOS' },
  { no: 200, name: 'Vibros',                      anime: 'Umamusume',                                   rarity: 'MITOS' },
  // 🌟 LEGENDARY — no 201-205 (Fate)
  { no: 201, name: 'Rin Tohsaka',                 anime: 'Fate/stay night',                             rarity: 'LEGENDARY' },
  { no: 202, name: 'Saber/Artoria Pendragon',     anime: 'Fate/Zero',                                   rarity: 'LEGENDARY' },
  { no: 203, name: 'Mash Kyrielight',             anime: 'Fate/Grand Order',                            rarity: 'LEGENDARY' },
  { no: 204, name: 'Jeanne d\'Arc',               anime: 'Fate/Apocrypha',                              rarity: 'LEGENDARY' },
  { no: 205, name: 'Scáthach',                    anime: 'Fate/Grand Order',                            rarity: 'LEGENDARY' },
  // ⚪ COMMON — no 206-215
  { no: 206, name: 'Rikka Takanashi',             anime: 'Chuunibyou demo Koi ga Shitai!',              rarity: 'COMMON' },
  { no: 207, name: 'Shinka Nibutani',             anime: 'Chuunibyou demo Koi ga Shitai!',              rarity: 'COMMON' },
  { no: 208, name: 'Satania',                     anime: 'Gabriel DropOut',                             rarity: 'COMMON' },
  { no: 209, name: 'Raphiel Ainsworth Shiraha',   anime: 'Gabriel DropOut',                             rarity: 'COMMON' },
  { no: 210, name: 'Vignette April Tsukinose',    anime: 'Gabriel DropOut',                             rarity: 'COMMON' },
  { no: 211, name: 'Raphtalia',                   anime: 'Tate no Yuusha no Nariagari',                 rarity: 'COMMON' },
  { no: 212, name: 'Melty Q Melromarc',           anime: 'Tate no Yuusha no Nariagari',                 rarity: 'COMMON' },
  { no: 213, name: 'Filo',                        anime: 'Tate no Yuusha no Nariagari',                 rarity: 'COMMON' },
  { no: 214, name: 'Malty S Melromarc',           anime: 'Tate no Yuusha no Nariagari',                 rarity: 'COMMON' },
  { no: 215, name: 'Myne',                        anime: 'Tate no Yuusha no Nariagari',                 rarity: 'COMMON' },
  // 💎 EPIC — no 216-230 (Seishun Buta, Saekano, Oregairu, KonoSuba)
  { no: 216, name: 'Mai Sakurajima',              anime: 'Seishun Buta Yarou',                          rarity: 'EPIC' },
  { no: 217, name: 'Tomoe Koga',                  anime: 'Seishun Buta Yarou',                          rarity: 'EPIC' },
  { no: 218, name: 'Nodoka Toyohama',             anime: 'Seishun Buta Yarou',                          rarity: 'EPIC' },
  { no: 219, name: 'Kaede Azusagawa',             anime: 'Seishun Buta Yarou',                          rarity: 'EPIC' },
  { no: 220, name: 'Shouko Makinohara',           anime: 'Seishun Buta Yarou',                          rarity: 'EPIC' },
  { no: 221, name: 'Megumi Kato',                 anime: 'Saekano',                                     rarity: 'EPIC' },
  { no: 222, name: 'Eriri Spencer Sawamura',      anime: 'Saekano',                                     rarity: 'EPIC' },
  { no: 223, name: 'Utaha Kasumigaoka',           anime: 'Saekano',                                     rarity: 'EPIC' },
  { no: 224, name: 'Yui Yuigahama',               anime: 'Oregairu',                                    rarity: 'EPIC' },
  { no: 225, name: 'Yukino Yukinoshita',          anime: 'Oregairu',                                    rarity: 'EPIC' },
  { no: 226, name: 'Iroha Isshiki',               anime: 'Oregairu',                                    rarity: 'EPIC' },
  { no: 227, name: 'Aqua',                        anime: 'KonoSuba',                                    rarity: 'EPIC' },
  { no: 228, name: 'Megumin',                     anime: 'KonoSuba',                                    rarity: 'EPIC' },
  { no: 229, name: 'Darkness/Lalatina',           anime: 'KonoSuba',                                    rarity: 'EPIC' },
  { no: 230, name: 'Chris',                       anime: 'KonoSuba',                                    rarity: 'EPIC' },
  // 💀 MITOS — no 231-240 (NieR, Bayonetta, Arcane, Cyberpunk, Vivy, GITS)
  { no: 231, name: '2B',                          anime: 'NieR: Automata',                              rarity: 'MITOS' },
  { no: 232, name: 'A2',                          anime: 'NieR: Automata',                              rarity: 'MITOS' },
  { no: 233, name: 'Devola & Popola',             anime: 'NieR: Automata',                              rarity: 'MITOS' },
  { no: 234, name: 'Bayonetta',                   anime: 'Bayonetta',                                   rarity: 'MITOS' },
  { no: 235, name: 'Vi',                          anime: 'Arcane',                                      rarity: 'MITOS' },
  { no: 236, name: 'Jinx',                        anime: 'Arcane',                                      rarity: 'MITOS' },
  { no: 237, name: 'Lucy',                        anime: 'Cyberpunk: Edgerunners',                      rarity: 'MITOS' },
  { no: 238, name: 'Rebecca',                     anime: 'Cyberpunk: Edgerunners',                      rarity: 'MITOS' },
  { no: 239, name: 'Vivy',                        anime: 'Vivy: Fluorite Eye\'s Song',                  rarity: 'MITOS' },
  { no: 240, name: 'Motoko Kusanagi',             anime: 'Ghost in the Shell',                          rarity: 'MITOS' },
  // 💀 MITOS — no 241-244 (Vocaloid)
  { no: 241, name: 'Hatsune Miku',                anime: 'Vocaloid',                                    rarity: 'MITOS' },
  { no: 242, name: 'Kagamine Rin',                anime: 'Vocaloid',                                    rarity: 'MITOS' },
  { no: 243, name: 'Megurine Luka',               anime: 'Vocaloid',                                    rarity: 'MITOS' },
  { no: 244, name: 'IA',                          anime: 'Vocaloid',                                    rarity: 'MITOS' },
  // 💀 MITOS — no 245-247 (Code Geass)
  { no: 245, name: 'C.C.',                        anime: 'Code Geass',                                  rarity: 'MITOS' },
  { no: 246, name: 'Kallen Stadtfeld',            anime: 'Code Geass',                                  rarity: 'MITOS' },
  { no: 247, name: 'Euphemia li Britannia',       anime: 'Code Geass',                                  rarity: 'MITOS' },
  // 💀 MITOS — no 248-255 (FF7, FF13, Cowboy Bebop, Black Lagoon, Gurren Lagann)
  { no: 248, name: 'Tifa Lockhart',               anime: 'Final Fantasy VII',                           rarity: 'MITOS' },
  { no: 249, name: 'Aerith Gainsborough',         anime: 'Final Fantasy VII',                           rarity: 'MITOS' },
  { no: 250, name: 'Lightning',                   anime: 'Final Fantasy XIII',                          rarity: 'MITOS' },
  { no: 251, name: 'Faye Valentine',              anime: 'Cowboy Bebop',                                rarity: 'MITOS' },
  { no: 252, name: 'Revy',                        anime: 'Black Lagoon',                                rarity: 'MITOS' },
  { no: 253, name: 'Balalaika',                   anime: 'Black Lagoon',                                rarity: 'MITOS' },
  { no: 254, name: 'Yoko Littner',                anime: 'Gurren Lagann',                               rarity: 'MITOS' },
  { no: 255, name: 'Nia Teppelin',                anime: 'Gurren Lagann',                               rarity: 'MITOS' },
  // 💀 MITOS — no 256-261 (OPM, Bleach)
  { no: 256, name: 'Tatsumaki',                   anime: 'One Punch Man',                               rarity: 'MITOS' },
  { no: 257, name: 'Fubuki',                      anime: 'One Punch Man',                               rarity: 'MITOS' },
  { no: 258, name: 'Yoruichi Shihouin',           anime: 'Bleach',                                      rarity: 'MITOS' },
  { no: 259, name: 'Rangiku Matsumoto',           anime: 'Bleach',                                      rarity: 'MITOS' },
  { no: 260, name: 'Neliel Tu Odelschwanck',      anime: 'Bleach',                                      rarity: 'MITOS' },
  { no: 261, name: 'Orihime Inoue',               anime: 'Bleach',                                      rarity: 'MITOS' },
  // ⚪ COMMON — no 262-265 (Shokugeki)
  { no: 262, name: 'Erina Nakiri',                anime: 'Shokugeki no Souma',                          rarity: 'COMMON' },
  { no: 263, name: 'Megumi Tadokoro',             anime: 'Shokugeki no Souma',                          rarity: 'COMMON' },
  { no: 264, name: 'Alice Nakiri',                anime: 'Shokugeki no Souma',                          rarity: 'COMMON' },
  { no: 265, name: 'Rindo Kobayashi',             anime: 'Shokugeki no Souma',                          rarity: 'COMMON' },
  // 💀 MITOS — no 266-270 (Spice and Wolf, Nanatsu)
  { no: 266, name: 'Holo',                        anime: 'Spice and Wolf',                              rarity: 'MITOS' },
  { no: 267, name: 'Diane',                       anime: 'Nanatsu no Taizai',                           rarity: 'MITOS' },
  { no: 268, name: 'Merlin',                      anime: 'Nanatsu no Taizai',                           rarity: 'MITOS' },
  { no: 269, name: 'Elizabeth Liones',            anime: 'Nanatsu no Taizai',                           rarity: 'MITOS' },
  { no: 270, name: 'Melascula',                   anime: 'Nanatsu no Taizai',                           rarity: 'MITOS' },
  // 💀 MITOS — no 271-277 (Akame ga Kill)
  { no: 271, name: 'Esdeath',                     anime: 'Akame ga Kill!',                              rarity: 'MITOS' },
  { no: 272, name: 'Akame',                       anime: 'Akame ga Kill!',                              rarity: 'MITOS' },
  { no: 273, name: 'Mine',                        anime: 'Akame ga Kill!',                              rarity: 'MITOS' },
  { no: 274, name: 'Chelsea',                     anime: 'Akame ga Kill!',                              rarity: 'MITOS' },
  { no: 275, name: 'Sheele',                      anime: 'Akame ga Kill!',                              rarity: 'MITOS' },
  { no: 276, name: 'Leone',                       anime: 'Akame ga Kill!',                              rarity: 'MITOS' },
  { no: 277, name: 'Najenda',                     anime: 'Akame ga Kill!',                              rarity: 'MITOS' },
  // ⚪ COMMON — no 278-280 (Gintama)
  { no: 278, name: 'Kagura',                      anime: 'Gintama',                                     rarity: 'COMMON' },
  { no: 279, name: 'Tsukuyo',                     anime: 'Gintama',                                     rarity: 'COMMON' },
  { no: 280, name: 'Sarutobi Ayame',              anime: 'Gintama',                                     rarity: 'COMMON' },
  // 💀 MITOS — no 281-300 (Railgun, Blue Archive, Ah My Goddess, Danmachi, Sailor Moon)
  { no: 281, name: 'Mikoto Misaka',               anime: 'Toaru Majutsu no Index',                      rarity: 'MITOS' },
  { no: 282, name: 'Shokuhou Misaki',             anime: 'Toaru Kagaku no Railgun',                     rarity: 'MITOS' },
  { no: 283, name: 'Index Librorum Prohibitorum', anime: 'Toaru Majutsu no Index',                      rarity: 'MITOS' },
  { no: 284, name: 'Othinus',                     anime: 'Toaru Majutsu no Index',                      rarity: 'MITOS' },
  { no: 285, name: 'Kanzaki Kaori',               anime: 'Toaru Majutsu no Index',                      rarity: 'MITOS' },
  { no: 286, name: 'Arona',                       anime: 'Blue Archive',                                rarity: 'MITOS' },
  { no: 287, name: 'Hoshino',                     anime: 'Blue Archive',                                rarity: 'MITOS' },
  { no: 288, name: 'Yuuka',                       anime: 'Blue Archive',                                rarity: 'MITOS' },
  { no: 289, name: 'Shiroko',                     anime: 'Blue Archive',                                rarity: 'MITOS' },
  { no: 290, name: 'Hasumi',                      anime: 'Blue Archive',                                rarity: 'MITOS' },
  { no: 291, name: 'Belldandy',                   anime: 'Oh My Goddess!',                              rarity: 'MITOS' },
  { no: 292, name: 'Urd',                         anime: 'Oh My Goddess!',                              rarity: 'MITOS' },
  { no: 293, name: 'Skuld',                       anime: 'Oh My Goddess!',                              rarity: 'MITOS' },
  { no: 294, name: 'Peorth',                      anime: 'Oh My Goddess!',                              rarity: 'MITOS' },
  { no: 295, name: 'Hestia',                      anime: 'Danmachi',                                    rarity: 'MITOS' },
  { no: 296, name: 'Aiz Wallenstein',             anime: 'Danmachi',                                    rarity: 'MITOS' },
  { no: 297, name: 'Freya',                       anime: 'Danmachi',                                    rarity: 'MITOS' },
  { no: 298, name: 'Riveria Ljos Alf',            anime: 'Danmachi',                                    rarity: 'MITOS' },
  { no: 299, name: 'Usagi Tsukino/Sailor Moon',   anime: 'Sailor Moon',                                 rarity: 'MITOS' },
  { no: 300, name: 'Rei Hino/Sailor Mars',        anime: 'Sailor Moon',                                 rarity: 'MITOS' },
]

// ── Bangun daftar teks per rarity ─────────────────────────────────────────────
function buildDaftarText() {
  const sections = {
    COMMON:    { emoji: '⚪', label: 'COMMON',    chars: [] },
    EPIC:      { emoji: '💎', label: 'EPIC',      chars: [] },
    LEGENDARY: { emoji: '🌟', label: 'LEGENDARY', chars: [] },
    MITOS:     { emoji: '💀', label: 'MITOS',     chars: [] },
  }
  for (const w of WAIFU_LIST_300) {
    sections[w.rarity].chars.push(`${w.no}. ${w.name} - ${w.anime}`)
  }

  let out = `💌 *DAFTAR WAIFU 300 EDISI* 💌\n`
  out += `Harga: Rp 25,000,000 per pilihan\n`
  out += `Gunakan: *.pilihwaifu <nomor>*\n\n`

  for (const s of Object.values(sections)) {
    out += `*${s.emoji} ${s.label}*\n`
    out += s.chars.join('\n') + '\n\n'
  }
  return out.trim()
}

module.exports = {
  command: ["pilihwaifu"],
  tags: ['romance'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

    // ✅ FIX: typo 'global.global.db' di original → pakai global.db
    let users = global.db.users[m.sender]
    const PILIH_PRICE = 25000000
    const MAX_NO = 300

    if (!args[0]) {
      return replyalya(buildDaftarText())
    }

    let nomor = parseInt(args[0])
    if (isNaN(nomor) || nomor < 1 || nomor > MAX_NO) {
      return replyalya(`❌ Nomor salah! Pilih antara 1 - ${MAX_NO}. Ketik *.pilihwaifu* tanpa angka buat lihat daftarnya.`)
    }
    if (users.money < PILIH_PRICE) {
      return replyalya(`💸 Duit lu kurang! Butuh Rp ${PILIH_PRICE.toLocaleString()} buat milih waifu sendiri.`)
    }

    // Cari entry berdasarkan nomor
    let chosen = WAIFU_LIST_300.find(w => w.no === nomor)
    if (!chosen) return replyalya(`❌ Nomor ${nomor} tidak ditemukan dalam daftar.`)

    users.money -= PILIH_PRICE
    users.lastGacha = { ...chosen, _source: 'pilihwaifu' }

    let rarityDisplay =
      chosen.rarity === 'MITOS'     ? '💀 MITOS'     :
      chosen.rarity === 'LEGENDARY' ? '🌟 LEGENDARY' :
      chosen.rarity === 'EPIC'      ? '💎 EPIC'      : '⚪ COMMON'

    let caption = `✨ *PILIH WAIFU RESULT* ✨\n\n`
    caption += `Berhasil memilih Waifu No. ${nomor}\n`
    caption += `🌸 *Nama:* ${chosen.name}\n`
    caption += `📺 *Anime/Seri:* ${chosen.anime}\n`
    caption += `🏆 *Rarity:* ${rarityDisplay}\n\n`
    caption += `Ketik *.marry* jika ingin menjadikan dia istrimu.\n_(Butuh 1x Cincin Nikah)_`

    replyalya(caption)
  }
}
