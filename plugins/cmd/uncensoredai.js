// ============================================================
//  Plugin: uncensoredai.js
//  Fungsi : Uncensored AI Chat via api-nanzz.my.id
//  Author : Alya Bot V20
//  CMD    : .uncensored / .unai / .darkai / .uc / .liar
//
//  FIX    : GET request diganti POST urlencoded
//           → API PHP baca $_POST['text'], bukan $_GET['text']
//           → axios.get({ params }) kirim ke $_GET → selalu gagal
// ============================================================

'use strict';

const axios = require('axios');

const API_URL = 'https://api-nanzz.my.id/docs/api/ai/uncensored-ai.php';

const HEADERS_BASE = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function getUncensoredAI(text) {
    const errors = [];

    // ── Attempt 1: POST application/x-www-form-urlencoded (paling reliabel untuk PHP)
    try {
        const params = new URLSearchParams();
        params.append('text', text);
        const res = await axios.post(API_URL, params.toString(), {
            headers: { ...HEADERS_BASE, 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 60000
        });
        const answer = res.data?.result?.text || res.data?.result || res.data?.response || res.data?.answer;
        if (res.data?.status === true && answer) return typeof answer === 'string' ? answer : JSON.stringify(answer);
        errors.push(`URLEncoded: ${res.data?.message || 'no result'}`);
    } catch (e) { errors.push(`URLEncoded: ${e.message}`); }

    // ── Attempt 2: POST application/json
    try {
        const res = await axios.post(API_URL, { text }, {
            headers: { ...HEADERS_BASE, 'Content-Type': 'application/json' },
            timeout: 60000
        });
        const answer = res.data?.result?.text || res.data?.result || res.data?.response || res.data?.answer;
        if (res.data?.status === true && answer) return typeof answer === 'string' ? answer : JSON.stringify(answer);
        errors.push(`JSON: ${res.data?.message || 'no result'}`);
    } catch (e) { errors.push(`JSON: ${e.message}`); }

    // ── Attempt 3: GET query string (fallback terakhir, kemungkinan kecil berhasil)
    try {
        const res = await axios.get(API_URL, {
            params: { text },
            headers: HEADERS_BASE,
            timeout: 60000
        });
        const answer = res.data?.result?.text || res.data?.result || res.data?.response || res.data?.answer;
        if (res.data?.status === true && answer) return typeof answer === 'string' ? answer : JSON.stringify(answer);
        errors.push(`GET: ${res.data?.message || 'no result'}`);
    } catch (e) { errors.push(`GET: ${e.message}`); }

    throw new Error(errors.join(' | '));
}

function getRandomBorder() {
    const borders = ['═', '─', '━', '░', '▒', '▓', '◆', '◇', '●', '○'];
    return borders[Math.floor(Math.random() * borders.length)];
}

function formatAnswer(text, question) {
    const randomEmoji = ['🔥', '⚡', '💀', '👽', '🤖', '💢', '🎯', '🧠', '💎', '🌀'][Math.floor(Math.random() * 10)];
    const randomTitle = ['DARK AI', 'UNFILTERED', 'NO SENSOR', 'FREEDOM AI', 'UNCENSORED', 'DARK THOUGHTS', 'AI EDGE', 'NEURAL FIRE'][Math.floor(Math.random() * 8)];

    const header = `╭━━━[ ${randomEmoji} ${randomTitle} ]━━━╮`;
    const footer = `╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let formattedText = '';
    if (sentences.length > 1) {
        formattedText = sentences.map((s, i) => {
            const prefix = ['▪', '▫', '•', '◦', '➤', '✧', '✦', '◈'][i % 8];
            return `┃   ${prefix} ${s.trim()}`;
        }).join('\n');
    } else {
        formattedText = `┃   💬 ${text}`;
    }

    return (
        `${header}\n` +
        `┃\n` +
        `┃  📌 *Pertanyaan:*\n` +
        `┃  ${question}\n` +
        `┃\n` +
        `┃  📝 *Jawaban:*\n` +
        `${formattedText}\n` +
        `┃\n` +
        `┃  ⏱️ ${new Date().toLocaleString('id-ID')}\n` +
        `┃  🧬 Model: anubis-70b\n` +
        `┃  ⚡ Power: ${['High', 'Extreme', 'Ultimate', 'Maximum'][Math.floor(Math.random() * 4)]}\n` +
        `┃\n` +
        `${footer}\n` +
        `_Powered by api-nanzz.my.id_`
    );
}

module.exports = {
    command: ['uncensored', 'unai', 'darkai', 'uc', 'gabutai', 'liar'],
    tags: ['ai'],
    help: ['uncensored <teks> - AI tanpa sensor & filter'],
    owner: false,
    admin: false,
    group: false,
    private: false,
    premium: false,
    limit: true,
    register: false,

    run: async (alya, m, ctx) => {
        const { args, reply, prefix, command } = ctx;
        const text = args.join(' ').trim();

        if (!text) {
            return reply(
                `╭━━━[ 🔓 UNCENSORED AI PRO ]━━━╮\n` +
                `┃\n` +
                `┃  🌟 AI Tanpa Batas & Sensor!\n` +
                `┃  Bisa jawab APAPUN dengan bebas\n` +
                `┃\n` +
                `┃  📌 *Format:*\n` +
                `┃  ${prefix}${command} <pertanyaan>\n` +
                `┃\n` +
                `┃  📌 *Contoh:*\n` +
                `┃  ${prefix}${command} apa itu dark web?\n` +
                `┃  ${prefix}${command} jelaskan sejarah hacking\n` +
                `┃  ${prefix}${command} rahasia illuminati\n` +
                `┃\n` +
                `┃  ⚠️ *Peringatan:*\n` +
                `┃  Gunakan dengan bijak!\n` +
                `┃\n` +
                `┃  🔥 *Alias:* .unai .darkai .uc .liar\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const loadingMsgs = [
            `⏳ Mengaktifkan AI tanpa sensor...`,
            `🔥 Memproses pertanyaan...`,
            `⚡ Membangunkan kekuatan AI...`,
            `💀 Menghubungkan ke server rahasia...`
        ];
        await reply(`${loadingMsgs[Math.floor(Math.random() * loadingMsgs.length)]}\n┃ 📌 *${text}*`);

        try {
            const answer = await getUncensoredAI(text);
            const formatted = formatAnswer(answer, text);

            if (formatted.length > 4000) {
                const chunks = formatted.match(/.{1,4000}/gs) || [];
                for (let i = 0; i < chunks.length; i++) {
                    await reply(i === 0 ? chunks[i] : `📄 *Lanjutan (${i + 1}/${chunks.length})*\n${chunks[i]}`);
                }
            } else {
                await reply(formatted);
            }

            await alya.sendMessage(ctx.from, { react: { text: '✅', key: m.key } }).catch(() => {});
        } catch (err) {
            await reply(
                `╭━━━[ ❌ ERROR ]━━━╮\n` +
                `┃\n` +
                `┃  Gagal menghubungi AI!\n` +
                `┃\n` +
                `┃  🔍 *Detail:*\n` +
                `┃  ${err.message.split(' | ')[0]}\n` +
                `┃\n` +
                `┃  💡 *Solusi:*\n` +
                `┃  • API mungkin sedang down\n` +
                `┃  • Coba lagi nanti\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }
    }
};
