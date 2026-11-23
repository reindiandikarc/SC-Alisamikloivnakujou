import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json';
const emojiMapState = { map: null, promise: null };
const emojiCache = new Map();
const textCache = new Map();

const graphemes = (text) => {
  const value = String(text ?? '');
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter('id', { granularity: 'grapheme' }).segment(value)].map(x => x.segment);
  }
  return [...value];
};

const emojiLike = (g) => /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u.test(g);
const emojiKey = (emoji) => graphemes(emoji).map(c => c.codePointAt(0).toString(16)).join('-');
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');

async function loadEmojiMap() {
  if (emojiMapState.map) return emojiMapState.map;
  if (emojiMapState.promise) return emojiMapState.promise;
  emojiMapState.promise = (async () => {
    try {
      const axios = (await import('axios')).default;
      const r = await axios.get(EMOJI_JSON_URL, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      emojiMapState.map = JSON.parse(Buffer.from(r.data).toString('utf8'));
    } catch {
      emojiMapState.map = null;
    }
    return emojiMapState.map;
  })();
  return emojiMapState.promise;
}

async function emojiBuffer(emoji) {
  if (emojiCache.has(emoji)) return emojiCache.get(emoji);
  const promise = (async () => {
    const map = await loadEmojiMap();
    const key = emojiKey(emoji);
    const variants = [key, key.replace(/-fe0f/g,''), key.toUpperCase(), key.replace(/-fe0f/g,'').toUpperCase()];
    let value = null;
    for (const k of variants) {
      if (map?.[k]) { value = map[k]; break; }
    }
    try {
      if (typeof value === 'string' && value.startsWith('data:')) {
        return Buffer.from(value.split(',')[1], 'base64');
      }
      const axios = (await import('axios')).default;
      if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
        const r = await axios.get(value, { responseType: 'arraybuffer', timeout: 7000 });
        return Buffer.from(r.data);
      }
      if (typeof value === 'string' && value.length > 8) {
        return Buffer.from(value, 'base64');
      }

      // Deterministic Twemoji fallback. If the server has no internet, the caller
      // will fall back to the local emoji font instead of breaking the sticker.
      const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${key.replace(/-fe0f/g,'')}.png`;
      const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 7000 });
      return Buffer.from(r.data);
    } catch {
      return null;
    }
  })();
  emojiCache.set(emoji, promise);
  return promise;
}

async function renderTextRun(text, fontSize) {
  const key = `${fontSize}::${text}`;
  if (textCache.has(key)) return textCache.get(key);
  const promise = (async () => {
    const width = Math.max(240, Math.ceil(fontSize * Math.max(4, text.length) * 0.75));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.ceil(fontSize * 1.6)}">`+
      `<text x="0" y="${Math.ceil(fontSize * 1.12)}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${fontSize}" font-weight="900" fill="#000000">${esc(text)}</text></svg>`;
    return sharp(Buffer.from(svg)).trim().png().toBuffer({ resolveWithObject: true });
  })();
  textCache.set(key, promise);
  return promise;
}

async function renderEmoji(emoji, size) {
  const img = await emojiBuffer(emoji);
  if (img) return sharp(img).resize(Math.round(size), Math.round(size), { fit: 'contain' }).png().toBuffer({ resolveWithObject: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(size*1.2)}" height="${Math.round(size*1.2)}"><text x="50%" y="82%" text-anchor="middle" font-family="Noto Color Emoji,DejaVu Sans" font-size="${Math.round(size)}">${esc(emoji)}</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer({ resolveWithObject: true });
}

function splitTokens(line) {
  const out=[]; let text='';
  for (const g of graphemes(line)) {
    if (emojiLike(g)) {
      if (text) { out.push({type:'text', value:text}); text=''; }
      out.push({type:'emoji', value:g});
    } else text += g;
  }
  if (text) out.push({type:'text', value:text});
  return out.length ? out : [{type:'text', value:''}];
}

async function composeLine(line, fontSize, maxWidth) {
  const tokens = splitTokens(line);
  const parts=[];
  let totalW=0, maxH=0;
  for (const token of tokens) {
    const result = token.type === 'emoji'
      ? await renderEmoji(token.value, Math.round(fontSize * 1.02))
      : await renderTextRun(token.value, fontSize);
    parts.push(result);
    totalW += result.info.width;
    maxH = Math.max(maxH, result.info.height);
  }
  const gap = tokens.length > 1 ? Math.max(2, Math.round(fontSize * 0.08)) : 0;
  totalW += gap * Math.max(0, tokens.length - 1);
  const canvasW = Math.max(1, totalW);
  const canvasH = Math.max(1, maxH);
  let x=0;
  const composite=[];
  for (const part of parts) {
    composite.push({ input: part.data, left: x, top: Math.floor((canvasH-part.info.height)/2) });
    x += part.info.width + gap;
  }
  let buffer = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r:0,g:0,b:0,alpha:0 } }
  }).composite(composite).png().toBuffer();
  let width = canvasW;
  if (width > maxWidth) {
    const scale = maxWidth / width;
    buffer = await sharp(buffer).resize(Math.max(1, Math.floor(width*scale)), Math.max(1, Math.floor(canvasH*scale)), { fit:'fill' }).png().toBuffer();
    width = Math.max(1, Math.floor(width*scale));
  }
  return { data: buffer, width, height: Math.max(1, Math.floor(canvasH * (width/canvasW))) };
}

function normalizeText(text) {
  return String(text ?? '').replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
}

function wordWrapByEstimate(text, fontSize, maxWidth) {
  const lines=[];
  for (const para of normalizeText(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) { lines.push(''); continue; }
    let line='';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      const estimate = [...candidate].reduce((w, c) => w + (c === ' ' ? fontSize*0.30 : emojiLike(c) ? fontSize*1.0 : fontSize*0.56), 0);
      if (estimate <= maxWidth || !line) line=candidate;
      else { lines.push(line); line=word; }
    }
    if (line) lines.push(line);
  }
  return lines.length ? lines : [''];
}

export async function renderBoardText({
  source,
  sourceWidth,
  sourceHeight,
  outSize=512,
  board,
  text,
  fontStart,
  fontMin=38,
  lineGap=0.12,
}) {
  if (!fs.existsSync(source)) throw new Error(`Template tidak ditemukan: ${path.basename(source)}`);
  const clean = normalizeText(text);
  const maxWidth = board.width - board.padX*2;
  const maxHeight = board.height - board.padY*2;

  let chosen = null;
  for (let fsx=fontStart; fsx>=fontMin; fsx-=4) {
    const lines = wordWrapByEstimate(clean, fsx, maxWidth);
    if (lines.length > 8) continue;
    const rendered=[];
    let totalH=0;
    for (const line of lines) {
      const r=await composeLine(line, fsx, maxWidth);
      rendered.push(r);
      totalH += r.height;
    }
    totalH += Math.max(0, lines.length-1)*Math.round(fsx*lineGap);
    if (totalH <= maxHeight && rendered.every(r => r.width <= maxWidth)) {
      chosen={fontSize:fsx, rendered, totalH};
      break;
    }
  }
  if (!chosen) {
    const fsx=fontMin;
    const lines=wordWrapByEstimate(clean, fsx, maxWidth).slice(0,8);
    const rendered=[]; let totalH=0;
    for (const line of lines) { const r=await composeLine(line,fsx,maxWidth); rendered.push(r); totalH += r.height; }
    chosen={fontSize:fsx,rendered,totalH};
  }

  let y = board.centerY - chosen.totalH/2;
  const imageTags=[];
  const gapPx = Math.max(0, Math.round(chosen.fontSize*lineGap));
  for (const line of chosen.rendered) {
    let rotated = await sharp(line.data).rotate(board.angle, { background: { r:0,g:0,b:0,alpha:0 } }).png().toBuffer({resolveWithObject:true});
    const maxOverlayW = Math.max(1, sourceWidth - 4);
    const maxOverlayH = Math.max(1, sourceHeight - 4);
    if (rotated.info.width > maxOverlayW || rotated.info.height > maxOverlayH) {
      const scale = Math.min(maxOverlayW / rotated.info.width, maxOverlayH / rotated.info.height);
      rotated = await sharp(rotated.data).resize(Math.max(1, Math.floor(rotated.info.width * scale)), Math.max(1, Math.floor(rotated.info.height * scale)), { fit:'fill' }).png().toBuffer({resolveWithObject:true});
    }
    let left = Math.round(board.centerX - rotated.info.width/2);
    let top = Math.round(y + (line.height - rotated.info.height)/2);
    left = Math.max(0, Math.min(left, sourceWidth - rotated.info.width));
    top = Math.max(0, Math.min(top, sourceHeight - rotated.info.height));
    const b64 = rotated.data.toString('base64');
    imageTags.push(`<image href=\"data:image/png;base64,${b64}\" x=\"${left}\" y=\"${top}\" width=\"${rotated.info.width}\" height=\"${rotated.info.height}\" preserveAspectRatio=\"none\"/>`);
    y += line.height + gapPx;
  }

  const baseB64 = fs.readFileSync(source).toString('base64');
  const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${sourceWidth}\" height=\"${sourceHeight}\"><image href=\"data:image/png;base64,${baseB64}\" x=\"0\" y=\"0\" width=\"${sourceWidth}\" height=\"${sourceHeight}\" preserveAspectRatio=\"none\"/>${imageTags.join('')}</svg>`;
  return sharp(Buffer.from(svg)).resize(outSize,outSize,{fit:'fill'}).png().toBuffer();
}
