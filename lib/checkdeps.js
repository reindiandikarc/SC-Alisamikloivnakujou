/**
 * lib/checkdeps.js
 * ─────────────────────────────────────────────────────────────
 * Auto-install dependency saat bot start:
 *   - ffmpeg (binary)
 *   - yt-dlp (binary)
 *   - socketon (npm)
 *   - fluent-ffmpeg (npm)   ← baru
 *   - sharp (npm)           ← baru
 *   - brat-canvas (npm)     ← baru
 *
 * Dipanggil dari index.js SEBELUM pairing dimulai.
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

const { execSync, exec, spawn } = require('child_process');
const { promisify }             = require('util');
const fs                        = require('fs');
const os                        = require('os');
const path                      = require('path');
const https                     = require('https');

const execAsync = promisify(exec);
const ROOT_DIR  = path.join(__dirname, '..');

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

function commandExists(cmd) {
    try { execSync(`${cmd} --version`, { stdio: 'pipe', timeout: 8000 }); return true; }
    catch { return false; }
}

function canWrite(dir) {
    try { fs.accessSync(dir, fs.constants.W_OK); return true; }
    catch { return false; }
}

function moduleExists(mod) {
    try { require.resolve(mod, { paths: [ROOT_DIR] }); return true; }
    catch { return false; }
}

const IS_TERMUX = fs.existsSync('/data/data/com.termux') ||
                  Boolean(process.env.TERMUX_VERSION);
const IS_ARM    = os.arch().startsWith('arm') || os.arch() === 'aarch64';

// ════════════════════════════════════════════════════════════════
// ── NPM PACKAGE INSTALLER ────────────────────────────────────────
// Install npm package jika belum ada di node_modules
// ════════════════════════════════════════════════════════════════

async function ensureNpmPackage(packageName, installName, label) {
    const name = label || packageName;

    if (moduleExists(packageName)) {
        console.log(`[checkdeps] ✅ ${name} sudah tersedia`);
        return true;
    }

    const pkg = installName || packageName;
    console.log(`[checkdeps] ⚠️  ${name} tidak ditemukan — install otomatis...`);

    try {
        await execAsync(`npm install ${pkg} --no-audit --no-fund --prefer-offline`, {
            timeout: 180_000,
            cwd: ROOT_DIR
        });

        if (moduleExists(packageName)) {
            console.log(`[checkdeps] ✅ ${name} berhasil diinstall`);
            return true;
        }
    } catch (e) {
        console.warn(`[checkdeps] ⚠️  Gagal install ${name}:`, e.message?.split('\n')[0]);
    }

    // Fallback: install tanpa prefer-offline (butuh network)
    try {
        console.log(`[checkdeps] 🔄 Retry ${name} tanpa cache...`);
        await execAsync(`npm install ${pkg} --no-audit --no-fund`, {
            timeout: 300_000,
            cwd: ROOT_DIR
        });
        if (moduleExists(packageName)) {
            console.log(`[checkdeps] ✅ ${name} berhasil diinstall (retry)`);
            return true;
        }
    } catch (e2) {
        console.warn(`[checkdeps] ❌ ${name} GAGAL:`, e2.message?.split('\n')[0]);
    }

    return false;
}

// ════════════════════════════════════════════════════════════════
// ── FLUENT-FFMPEG ────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════

async function ensureFluentFfmpeg() {
    return ensureNpmPackage('fluent-ffmpeg', 'fluent-ffmpeg@^2.1.3', 'fluent-ffmpeg');
}

// ════════════════════════════════════════════════════════════════
// ── SHARP ────────────────────────────────────────────────────────
// Sharp butuh native binary — perlu platform-specific build
// ════════════════════════════════════════════════════════════════

async function ensureSharp() {
    if (moduleExists('sharp')) {
        // Cek sharp bisa di-require (native addon bisa gagal meski ada di node_modules)
        try {
            require('sharp');
            console.log('[checkdeps] ✅ sharp sudah tersedia');
            return true;
        } catch (e) {
            console.warn('[checkdeps] ⚠️  sharp ada tapi error:', e.message?.split('\n')[0]);
            console.log('[checkdeps] 🔄 Rebuild sharp...');
        }
    } else {
        console.log('[checkdeps] ⚠️  sharp tidak ditemukan — install otomatis...');
    }

    try {
        // Install dengan npm_config_sharp_libvips_force_global untuk Termux
        const env = IS_TERMUX ? 'npm_config_sharp_libvips_force_global=true ' : '';
        await execAsync(
            `${env}npm install sharp@^0.33.5 --no-audit --no-fund`,
            { timeout: 300_000, cwd: ROOT_DIR }
        );
        require('sharp'); // test load
        console.log('[checkdeps] ✅ sharp berhasil diinstall');
        return true;
    } catch (e) {
        // Coba versi lebih lama yang lebih kompatibel
        try {
            console.log('[checkdeps] 🔄 Coba sharp@0.32.x (lebih kompatibel)...');
            await execAsync(
                'npm install sharp@^0.32.6 --no-audit --no-fund',
                { timeout: 300_000, cwd: ROOT_DIR }
            );
            require('sharp');
            console.log('[checkdeps] ✅ sharp@0.32.x berhasil diinstall');
            return true;
        } catch (e2) {
            console.warn(
                '[checkdeps] ⚠️  sharp GAGAL install.\n' +
                '[checkdeps]    .tomp4 akan pakai fallback ffmpeg langsung (tetap berfungsi).\n' +
                '[checkdeps]    Install manual: npm install sharp'
            );
            return false;
        }
    }
}

// ════════════════════════════════════════════════════════════════
// ── BRAT-CANVAS ──────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════

async function ensureBratCanvas() {
    return ensureNpmPackage('brat-canvas', 'brat-canvas@^1.0.26', 'brat-canvas');
}

// ════════════════════════════════════════════════════════════════
// ── FFMPEG (BINARY) ──────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════

function getFFmpegNpm() {
    const tries = [
        () => require('ffmpeg-static'),
        () => require('@ffmpeg-installer/ffmpeg').path,
        () => {
            const p = path.join(ROOT_DIR, 'node_modules/ffmpeg-static/ffmpeg');
            return fs.existsSync(p) ? p : null;
        },
    ];
    for (const fn of tries) {
        try { const p = fn(); if (p && fs.existsSync(p)) return p; } catch {}
    }
    return null;
}

function getFFmpegSystem() {
    if (commandExists('ffmpeg')) return 'ffmpeg';
    return null;
}

async function installFFmpegSystem() {
    if (IS_TERMUX) {
        try {
            console.log('[checkdeps] 📦 Termux: install ffmpeg via pkg...');
            await execAsync('pkg install -y ffmpeg', { timeout: 180_000 });
            if (commandExists('ffmpeg')) { console.log('[checkdeps] ✅ FFmpeg (Termux pkg) OK'); return true; }
        } catch (e) { console.warn('[checkdeps] pkg ffmpeg gagal:', e.message?.split('\n')[0]); }
        return false;
    }

    for (const pm of ['apt-get', 'apt']) {
        if (!commandExists(pm)) continue;
        try {
            console.log(`[checkdeps] 📦 ${pm}: install ffmpeg...`);
            await execAsync(
                `DEBIAN_FRONTEND=noninteractive ${pm} install -y -qq ffmpeg`,
                { timeout: 300_000 }
            );
            if (commandExists('ffmpeg')) { console.log(`[checkdeps] ✅ FFmpeg (${pm}) OK`); return true; }
        } catch (e) { console.warn(`[checkdeps] ${pm} ffmpeg gagal:`, e.message?.split('\n')[0]); }
    }

    return false;
}

async function ensureFFmpeg() {
    const npmPath = getFFmpegNpm();
    if (npmPath) {
        global.FFMPEG_PATH = npmPath;
        console.log(`[checkdeps] ✅ ffmpeg: ${npmPath} (npm package)`);
        return;
    }

    const sysPath = getFFmpegSystem();
    if (sysPath) {
        global.FFMPEG_PATH = sysPath;
        console.log(`[checkdeps] ✅ ffmpeg: ${sysPath} (system)`);
        return;
    }

    console.log('[checkdeps] ⚠️  FFmpeg tidak ditemukan — mencoba install otomatis...');
    const ok = await installFFmpegSystem();
    if (ok) {
        global.FFMPEG_PATH = 'ffmpeg';
    } else {
        global.FFMPEG_PATH = null;
        console.warn(
            '[checkdeps] ⚠️  FFmpeg TIDAK tersedia.\n' +
            '[checkdeps]    .tomp3 / .tomp4 tidak akan berfungsi.\n' +
            '[checkdeps]    Install manual: apt-get install ffmpeg'
        );
    }
}

// ════════════════════════════════════════════════════════════════
// ── YT-DLP ──────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════

function ytdlpExists() {
    const candidates = [
        '/usr/local/bin/yt-dlp',
        '/usr/bin/yt-dlp',
        path.join(os.homedir(), '.local', 'bin', 'yt-dlp'),
        '/data/data/com.termux/files/usr/bin/yt-dlp',
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    try {
        const out = execSync('which yt-dlp', { stdio: 'pipe', timeout: 5000 }).toString().trim();
        if (out && fs.existsSync(out)) return out;
    } catch {}
    return null;
}

async function installYtdlpViaPip() {
    for (const pip of ['pip3', 'pip']) {
        if (!commandExists(pip)) continue;
        try {
            console.log(`[checkdeps] 📦 ${pip}: install yt-dlp...`);
            await execAsync(`${pip} install -q --upgrade yt-dlp`, { timeout: 180_000 });
            if (ytdlpExists()) {
                console.log(`[checkdeps] ✅ yt-dlp (${pip}) OK`);
                return true;
            }
        } catch (e) { console.warn(`[checkdeps] ${pip} gagal:`, e.message?.split('\n')[0]); }
    }
    return false;
}

async function installYtdlpViaBinary() {
    return new Promise((resolve) => {
        const binaryName = IS_ARM ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux';
        const url        = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${binaryName}`;

        let targetDir = '/usr/local/bin';
        if (!canWrite(targetDir)) {
            targetDir = path.join(os.homedir(), '.local', 'bin');
            fs.mkdirSync(targetDir, { recursive: true });
        }
        const targetPath = path.join(targetDir, 'yt-dlp');

        console.log(`[checkdeps] 📥 Download yt-dlp binary dari GitHub...`);
        const file = fs.createWriteStream(targetPath);

        function doRequest(reqUrl, depth = 0) {
            if (depth > 8) { file.close(); resolve(false); return; }
            https.get(reqUrl, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    doRequest(res.headers.location, depth + 1);
                    return;
                }
                if (res.statusCode !== 200) {
                    console.warn(`[checkdeps] HTTP ${res.statusCode} — download binary gagal`);
                    file.close();
                    resolve(false);
                    return;
                }
                res.pipe(file);
                file.on('finish', () => {
                    file.close(async () => {
                        try {
                            fs.chmodSync(targetPath, 0o755);
                            if (!process.env.PATH?.includes(targetDir)) {
                                process.env.PATH = `${targetDir}:${process.env.PATH}`;
                            }
                            const { stdout } = await execAsync(
                                `"${targetPath}" --version`, { timeout: 8000 }
                            );
                            console.log(`[checkdeps] ✅ yt-dlp binary OK: v${stdout.trim()}`);
                            resolve(true);
                        } catch (e) {
                            console.warn('[checkdeps] Binary tidak bisa dijalankan:', e.message);
                            try { fs.unlinkSync(targetPath); } catch {}
                            resolve(false);
                        }
                    });
                });
                file.on('error', (e) => {
                    console.warn('[checkdeps] Write error:', e.message);
                    try { fs.unlinkSync(targetPath); } catch {}
                    resolve(false);
                });
            }).on('error', (e) => {
                console.warn('[checkdeps] Network error:', e.message);
                file.close();
                resolve(false);
            });
        }

        doRequest(url);
    });
}

async function ensureYtdlp() {
    const existing = ytdlpExists();
    if (existing) {
        global.YTDLP_PATH = existing;
        try {
            const { stdout } = await execAsync(`"${existing}" --version`, { timeout: 5000 });
            console.log(`[checkdeps] ✅ yt-dlp: ${existing} (v${stdout.trim()})`);
        } catch {
            console.log(`[checkdeps] ✅ yt-dlp: ${existing}`);
        }
        return;
    }

    console.log('[checkdeps] ⚠️  yt-dlp tidak ditemukan — mencoba install otomatis...');

    let ok = await installYtdlpViaPip();
    if (!ok) {
        console.log('[checkdeps] pip tidak berhasil — coba download binary...');
        ok = await installYtdlpViaBinary();
    }

    if (ok) {
        const newPath = ytdlpExists();
        global.YTDLP_PATH = newPath || 'yt-dlp';
        console.log(`[checkdeps] 🎉 yt-dlp siap: ${global.YTDLP_PATH}`);
    } else {
        global.YTDLP_PATH = null;
        console.warn(
            '[checkdeps] ❌ yt-dlp GAGAL install otomatis.\n' +
            '[checkdeps]    Install manual: pip3 install yt-dlp'
        );
    }
}

// ════════════════════════════════════════════════════════════════
// ── SOCKETON ─────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════

async function ensureBaileys() {
    try {
        require.resolve('@whiskeysockets/baileys');
        console.log('[checkdeps] ✅ baileys sudah tersedia');
        return;
    } catch {}

    console.log('[checkdeps] ⚠️  baileys tidak ditemukan — install otomatis...');
    try {
        await execAsync('npm install @whiskeysockets/baileys@github:reindiandikarc/reinkabaileys --no-save', {
            timeout: 120_000,
            cwd: ROOT_DIR
        });
        require.resolve('@whiskeysockets/baileys');
        console.log('[checkdeps] ✅ baileys berhasil diinstall');
    } catch (e) {
        console.warn('[checkdeps] ⚠️  Gagal install baileys:', e.message?.split('\n')[0]);
        console.warn('[checkdeps]    Install manual: npm install @whiskeysockets/baileys@github:reindiandikarc/reinkabaileys');
    }
}

// ════════════════════════════════════════════════════════════════
// ── MAIN ENTRY ──────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════

async function checkAndInstall() {
    console.log('\n[checkdeps] 🔍 Memeriksa semua dependency...');

    // Grup 1: binary tools (bisa paralel)
    await Promise.all([
        ensureFFmpeg(),
        ensureYtdlp(),
        ensureBaileys(),
    ]);

    // Grup 2: npm packages media (sequential supaya npm tidak konflik)
    await ensureFluentFfmpeg();
    await ensureSharp();
    await ensureBratCanvas();

    // Set fluent-ffmpeg path setelah terinstall
    if (global.FFMPEG_PATH) {
        try {
            const fluentFfmpeg = require('fluent-ffmpeg');
            fluentFfmpeg.setFfmpegPath(global.FFMPEG_PATH);
            console.log(`[checkdeps] ✅ fluent-ffmpeg path set → ${global.FFMPEG_PATH}`);
        } catch {}
    }

    const ffOk     = Boolean(global.FFMPEG_PATH);
    const ytOk     = Boolean(global.YTDLP_PATH);
    const fluentOk = moduleExists('fluent-ffmpeg');
    const sharpOk  = moduleExists('sharp');
    const bratOk   = moduleExists('brat-canvas');

    console.log('\n[checkdeps] ════════════════════════════════════');
    console.log(`[checkdeps]  ffmpeg        : ${ffOk     ? '✅ ' + global.FFMPEG_PATH : '❌ tidak tersedia'}`);
    console.log(`[checkdeps]  yt-dlp        : ${ytOk     ? '✅ ' + global.YTDLP_PATH  : '❌ tidak tersedia'}`);
    console.log(`[checkdeps]  fluent-ffmpeg : ${fluentOk ? '✅' : '❌ tidak tersedia'}`);
    console.log(`[checkdeps]  sharp         : ${sharpOk  ? '✅' : '⚠️  tidak tersedia (fallback aktif)'}`);
    console.log(`[checkdeps]  brat-canvas   : ${bratOk   ? '✅' : '❌ tidak tersedia'}`);
    console.log('[checkdeps] ════════════════════════════════════\n');
}

module.exports = { checkAndInstall, getFFmpegNpm, ytdlpExists };
