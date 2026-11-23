'use strict';

const PROVINSI_LIST = {
  '1':  { label: 'ACEH',                    kota_default: 'BANDA ACEH' },
  '2':  { label: 'SUMATERA UTARA',          kota_default: 'MEDAN' },
  '3':  { label: 'SUMATERA BARAT',          kota_default: 'PADANG' },
  '4':  { label: 'RIAU',                    kota_default: 'PEKANBARU' },
  '5':  { label: 'JAMBI',                   kota_default: 'JAMBI' },
  '6':  { label: 'SUMATERA SELATAN',        kota_default: 'PALEMBANG' },
  '7':  { label: 'BENGKULU',                kota_default: 'BENGKULU' },
  '8':  { label: 'LAMPUNG',                 kota_default: 'BANDAR LAMPUNG' },
  '9':  { label: 'KEPULAUAN BANGKA BELITUNG', kota_default: 'PANGKAL PINANG' },
  '10': { label: 'KEPULAUAN RIAU',          kota_default: 'TANJUNG PINANG' },
  '11': { label: 'DKI JAKARTA',             kota_default: 'JAKARTA SELATAN' },
  '12': { label: 'JAWA BARAT',              kota_default: 'BANDUNG' },
  '13': { label: 'JAWA TENGAH',             kota_default: 'SEMARANG' },
  '14': { label: 'DI YOGYAKARTA',           kota_default: 'YOGYAKARTA' },
  '15': { label: 'JAWA TIMUR',              kota_default: 'SURABAYA' },
  '16': { label: 'BANTEN',                  kota_default: 'SERANG' },
  '17': { label: 'BALI',                    kota_default: 'DENPASAR' },
  '18': { label: 'NUSA TENGGARA BARAT',     kota_default: 'MATARAM' },
  '19': { label: 'NUSA TENGGARA TIMUR',     kota_default: 'KUPANG' },
  '20': { label: 'KALIMANTAN BARAT',        kota_default: 'PONTIANAK' },
  '21': { label: 'KALIMANTAN TENGAH',       kota_default: 'PALANGKA RAYA' },
  '22': { label: 'KALIMANTAN SELATAN',      kota_default: 'BANJARMASIN' },
  '23': { label: 'KALIMANTAN TIMUR',        kota_default: 'SAMARINDA' },
  '24': { label: 'KALIMANTAN UTARA',        kota_default: 'TANJUNG SELOR' },
  '25': { label: 'SULAWESI UTARA',          kota_default: 'MANADO' },
  '26': { label: 'SULAWESI TENGAH',         kota_default: 'PALU' },
  '27': { label: 'SULAWESI SELATAN',        kota_default: 'MAKASSAR' },
  '28': { label: 'SULAWESI TENGGARA',       kota_default: 'KENDARI' },
  '29': { label: 'GORONTALO',               kota_default: 'GORONTALO' },
  '30': { label: 'SULAWESI BARAT',          kota_default: 'MAMUJU' },
  '31': { label: 'MALUKU',                  kota_default: 'AMBON' },
  '32': { label: 'MALUKU UTARA',            kota_default: 'SOFIFI' },
  '33': { label: 'PAPUA BARAT',             kota_default: 'MANOKWARI' },
  '34': { label: 'PAPUA',                   kota_default: 'JAYAPURA' },
  '35': { label: 'PAPUA SELATAN',           kota_default: 'MERAUKE' },
  '36': { label: 'PAPUA TENGAH',            kota_default: 'NABIRE' },
  '37': { label: 'PAPUA PEGUNUNGAN',        kota_default: 'WAMENA' },
  '38': { label: 'PAPUA BARAT DAYA',        kota_default: 'SORONG' },
};

const PROV_MENU = Object.entries(PROVINSI_LIST)
  .map(([no, p]) => `*${no.padStart(2,' ')}*. ${p.label}`)
  .join('\n');

module.exports = {
  command: ['fakeektp'],
  tags: ['fake'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      sender, from, pushname,
      reply, replyalya, replytolak,
      Ryuu, isPrem, isAly, isAlya
    } = ctx;

    const { createCanvas, loadImage, registerFont } = require('canvas');
    const fs   = require('fs');
    const path = require('path');
    const axios = require('axios');

    const FONT_BOLD   = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf';
    const FONT_REG    = '/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf';
    const FONT_MED    = '/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf';
    const FONT_MONO   = '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf';
    const FONT_TITLE  = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf';

    try { registerFont(FONT_BOLD,  { family: 'KTPBold' });   } catch {}
    try { registerFont(FONT_REG,   { family: 'KTPReg' });    } catch {}
    try { registerFont(FONT_MED,   { family: 'KTPMed' });    } catch {}
    try { registerFont(FONT_MONO,  { family: 'KTPMono' });   } catch {}
    try { registerFont(FONT_TITLE, { family: 'KTPTitle' });  } catch {}

    const USAGE = (
      `✨━━━〔 🪪 *Fake eKTP Indonesia* 〕━━━✨\n\n` +
      `📌 *Cara Pakai:*\n` +
      `1. Reply/kirim foto pas untuk dijadikan foto KTP\n` +
      `2. Ketik:\n` +
      `\`${prefix + command} <no_provinsi>|Nama|NIK|Tempat,TanggalLahir|JenisKelamin|GolDar|Alamat|RT/RW|Kel/Desa|Kecamatan|Agama|StatusPerkawinan|Pekerjaan|Kewarganegaraan|MasaBerlaku|TanggalDibuat\`\n\n` +
      `💡 *Contoh:*\n` +
      `\`${prefix + command} 14|ALYA MIKHAILOVNA|3404056009090001|Yogyakarta, 22-09-2009|PEREMPUAN|A|JL. MALIOBORO NO.1|001/002|GEDONGKIWO|MANTRIJERON|ISLAM|BELUM KAWIN|PELAJAR|WNI|SEUMUR HIDUP|Yogyakarta, 01-06-2024\`\n\n` +
      `📋 *Daftar Provinsi:*\n${PROV_MENU}\n\n` +
      `⚡ Dibuat oleh Alya Bot`
    );

    if (!text) return replyalya(USAGE);

    const parts = text.split('|').map(s => s.trim());

    if (parts.length < 2) return replyalya(USAGE);

    const provNo  = parts[0];
    const prov    = PROVINSI_LIST[provNo];

    if (!prov) {
      return replyalya(
        `❌ Nomor provinsi *${provNo}* tidak valid!\n\n` +
        `📋 *Pilih dari daftar berikut:*\n${PROV_MENU}`
      );
    }

    const up = s => (s || '').toString().toUpperCase();

    const data = {
      provinsi  : prov.label,
      kota      : up(parts[1]  || prov.kota_default),
      nama      : up(parts[2]  || 'NAMA LENGKAP'),
      nik       : parts[3]      || '3171010101010001',
      ttl       : up(parts[4]  || 'JAKARTA, 01-01-2000'),
      jk        : up(parts[5]  || 'LAKI-LAKI'),
      goldar    : up(parts[6]  || 'O'),
      alamat    : up(parts[7]  || 'JL. CONTOH NO. 1'),
      rtrw      : up(parts[8]  || '001/002'),
      keldesa   : up(parts[9]  || 'KELURAHAN'),
      kec       : up(parts[10] || 'KECAMATAN'),
      agama     : up(parts[11] || 'ISLAM'),
      status    : up(parts[12] || 'BELUM KAWIN'),
      kerja     : up(parts[13] || 'KARYAWAN SWASTA'),
      wn        : up(parts[14] || 'WNI'),
      masa      : up(parts[15] || 'SEUMUR HIDUP'),
      terbuat   :    parts[16]  || (prov.kota_default + ', 01-01-2024'),
    };

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    replyalya('⏳ Sedang membuat eKTP...');

    try {
      const W = 1012, H = 638;
      const canvas = createCanvas(W, H);
      const ctx2   = canvas.getContext('2d');

      const drawRoundRect = (cx, x, y, w, h, r, fill, stroke, sw) => {
        cx.beginPath();
        cx.moveTo(x + r, y);
        cx.lineTo(x + w - r, y);
        cx.quadraticCurveTo(x + w, y, x + w, y + r);
        cx.lineTo(x + w, y + h - r);
        cx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        cx.lineTo(x + r, y + h);
        cx.quadraticCurveTo(x, y + h, x, y + h - r);
        cx.lineTo(x, y + r);
        cx.quadraticCurveTo(x, y, x + r, y);
        cx.closePath();
        if (fill)  { cx.fillStyle = fill; cx.fill(); }
        if (stroke){ cx.strokeStyle = stroke; cx.lineWidth = sw || 1; cx.stroke(); }
      };

      const cardGrad = ctx2.createLinearGradient(0, 0, W, H);
      cardGrad.addColorStop(0,   '#f5f0e8');
      cardGrad.addColorStop(0.5, '#f0ead8');
      cardGrad.addColorStop(1,   '#e8e0cc');
      drawRoundRect(ctx2, 0, 0, W, H, 22, null, null, 0);
      ctx2.fillStyle = cardGrad;
      ctx2.fill();

      ctx2.save();
      ctx2.globalAlpha = 0.07;
      for (let i = 0; i < 8; i++) {
        ctx2.beginPath();
        ctx2.arc(W * 0.72, H * 0.5, 60 + i * 28, 0, Math.PI * 2);
        ctx2.strokeStyle = '#8B0000';
        ctx2.lineWidth = 1;
        ctx2.stroke();
      }
      ctx2.globalAlpha = 1;
      ctx2.restore();

      ctx2.fillStyle = '#8B0000';
      ctx2.fillRect(0, 0, W, 8);
      ctx2.fillRect(0, H - 8, W, 8);

      const stripeH = 5;
      ctx2.fillStyle = '#CC0000';
      ctx2.fillRect(0, 8, W, stripeH);
      ctx2.fillStyle = '#FF6600';
      ctx2.fillRect(0, 13, W, stripeH - 1);
      ctx2.fillStyle = '#CC0000';
      ctx2.fillRect(0, H - 13, W, stripeH);
      ctx2.fillStyle = '#FF6600';
      ctx2.fillRect(0, H - 18, W, stripeH - 1);

      const headerH = 95;
      const headerGrad = ctx2.createLinearGradient(0, 18, 0, 18 + headerH);
      headerGrad.addColorStop(0, '#CC0000');
      headerGrad.addColorStop(1, '#990000');
      ctx2.fillStyle = headerGrad;
      ctx2.fillRect(0, 18, W, headerH);

      ctx2.save();
      ctx2.globalAlpha = 0.12;
      const diag = ctx2.createLinearGradient(0, 18, W, 18 + headerH);
      diag.addColorStop(0, 'transparent');
      diag.addColorStop(0.5, '#ffffff');
      diag.addColorStop(1, 'transparent');
      ctx2.fillStyle = diag;
      ctx2.fillRect(0, 18, W, headerH);
      ctx2.globalAlpha = 1;
      ctx2.restore();

      const logoX = 18, logoY = 26, logoS = 75;
      try {
        const garuda = await loadImage(
          'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Garuda_Pancasila%2C_Coat_Arms_of_Indonesia.svg/200px-Garuda_Pancasila%2C_Coat_Arms_of_Indonesia.svg.png'
        ).catch(() => null);
        if (garuda) ctx2.drawImage(garuda, logoX, logoY, logoS, logoS);
      } catch {}

      ctx2.fillStyle = '#ffffff';
      ctx2.textAlign  = 'center';
      ctx2.textBaseline = 'top';
      ctx2.font = 'bold 17px KTPTitle, "Liberation Sans", sans-serif';
      ctx2.fillText('REPUBLIK INDONESIA', W / 2, 24);
      ctx2.font = 'bold 13px KTPReg, Poppins, sans-serif';
      ctx2.fillText('PROVINSI ' + data.provinsi, W / 2, 46);
      ctx2.font = 'bold 13px KTPReg, Poppins, sans-serif';
      ctx2.fillText('KOTA ' + data.kota, W / 2, 64);
      ctx2.font = 'bold 22px KTPTitle, "Liberation Sans", sans-serif';
      ctx2.letterSpacing = '4px';
      ctx2.fillText('KARTU TANDA PENDUDUK', W / 2, 85);
      ctx2.letterSpacing = '0px';

      ctx2.font = 'bold 12px KTPMono, "Liberation Mono", monospace';
      ctx2.fillStyle = '#ffdddd';
      ctx2.textAlign = 'right';
      ctx2.fillText('NIK', W - 18, 26);

      ctx2.font = 'bold 20px KTPMono, "Liberation Mono", monospace';
      ctx2.fillStyle = '#ffffff';
      ctx2.textAlign = 'right';
      const nikFormatted = data.nik.replace(/(\d{6})(\d{6})(\d{4})/, '$1  $2  $3');
      ctx2.fillText(nikFormatted, W - 18, 44);

      const contentY  = 130;
      const colLeft   = 22;
      const colSep    = 210;
      const colVal    = 220;
      const lineH     = 28;
      const labelColor = '#4a3000';
      const valueColor = '#000000';
      const colonX    = colSep - 5;

      const fields = [
        ['Nama',              data.nama],
        ['Tempat/Tgl Lahir',  data.ttl],
        ['Jenis Kelamin',     data.jk + (data.goldar ? `      Gol. Darah: ${data.goldar}` : '')],
        ['Alamat',            data.alamat],
        ['RT/RW',             data.rtrw],
        ['Kel/Desa',          data.keldesa],
        ['Kecamatan',         data.kec],
        ['Agama',             data.agama],
        ['Status Perkawinan', data.status],
        ['Pekerjaan',         data.kerja],
        ['Kewarganegaraan',   data.wn],
        ['Berlaku Hingga',    data.masa],
      ];

      ctx2.textBaseline = 'top';
      fields.forEach(([label, value], i) => {
        const y = contentY + i * lineH;

        ctx2.font = `12px KTPMed, Poppins, sans-serif`;
        ctx2.fillStyle = labelColor;
        ctx2.textAlign = 'left';
        ctx2.fillText(label, colLeft, y);

        ctx2.font = `12px KTPReg, Poppins, sans-serif`;
        ctx2.fillStyle = labelColor;
        ctx2.fillText(':', colonX, y);

        ctx2.font = `bold 12px KTPBold, Poppins, sans-serif`;
        ctx2.fillStyle = valueColor;

        const maxValW = colSep - colVal + 380;
        let valText = value;
        while (ctx2.measureText(valText).width > maxValW && valText.length > 3) {
          valText = valText.slice(0, -4) + '...';
        }
        ctx2.fillText(valText, colVal, y);
      });

      ctx2.strokeStyle = 'rgba(139,0,0,0.15)';
      ctx2.lineWidth = 1;
      fields.forEach((_, i) => {
        const y = contentY + i * lineH + lineH - 4;
        ctx2.beginPath();
        ctx2.moveTo(colLeft, y);
        ctx2.lineTo(colSep + 300, y);
        ctx2.stroke();
      });

      const photoX = W - 200, photoY = 120, photoW = 170, photoH = 210;
      drawRoundRect(ctx2, photoX - 6, photoY - 6, photoW + 12, photoH + 12, 6, '#8B0000', null, 0);
      drawRoundRect(ctx2, photoX - 3, photoY - 3, photoW + 6, photoH + 6, 4, '#ffffff', null, 0);

      let userImg = null;
      const qAlt = m.quoted ? m.quoted : null;
      const mimeAlt = qAlt ? ((qAlt.msg || qAlt).mimetype || '') : '';

      if (qAlt && /image/.test(mimeAlt)) {
        try {
          const buf = await qAlt.download();
          userImg = await loadImage(buf);
        } catch {}
      }

      if (!userImg) {
        try {
          const ppUrl = await alya.profilePictureUrl(sender, 'image');
          const res   = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 8000 });
          userImg = await loadImage(Buffer.from(res.data));
        } catch {}
      }

      if (userImg) {
        ctx2.save();
        ctx2.beginPath();
        ctx2.rect(photoX, photoY, photoW, photoH);
        ctx2.clip();

        const { width: iW, height: iH } = userImg;
        const scaleF = Math.max(photoW / iW, photoH / iH);
        const dW = iW * scaleF, dH = iH * scaleF;
        ctx2.drawImage(userImg,
          photoX + (photoW - dW) / 2,
          photoY + (photoH - dH) / 2,
          dW, dH
        );
        ctx2.restore();
      } else {
        ctx2.fillStyle = '#ddd';
        ctx2.fillRect(photoX, photoY, photoW, photoH);
        ctx2.font = 'bold 13px KTPReg, Poppins, sans-serif';
        ctx2.fillStyle = '#999';
        ctx2.textAlign = 'center';
        ctx2.fillText('FOTO', photoX + photoW / 2, photoY + photoH / 2 - 8);
        ctx2.fillText('3x4', photoX + photoW / 2, photoY + photoH / 2 + 12);
      }

      const signY = photoY + photoH + 20;
      ctx2.fillStyle = '#333';
      ctx2.font = '10px KTPReg, Poppins, sans-serif';
      ctx2.textAlign = 'center';
      ctx2.fillText(data.terbuat, photoX + photoW / 2, signY);

      ctx2.strokeStyle = '#555';
      ctx2.lineWidth = 1;
      const signLineY = signY + 32;
      ctx2.beginPath();
      ctx2.moveTo(photoX + 10, signLineY);
      ctx2.lineTo(photoX + photoW - 10, signLineY);
      ctx2.stroke();

      ctx2.font = 'bold 12px KTPBold, Poppins, sans-serif';
      ctx2.fillStyle = '#000';
      ctx2.textAlign = 'center';
      const namaSign = data.nama.split(' ').slice(0, 2).join(' ');
      ctx2.fillText(namaSign, photoX + photoW / 2, signLineY + 6);

      const chipW = 56, chipH = 40;
      const chipX = colLeft, chipY = H - 88;
      drawRoundRect(ctx2, chipX, chipY, chipW, chipH, 6, null, null, 0);
      const chipGrad = ctx2.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
      chipGrad.addColorStop(0, '#d4af37');
      chipGrad.addColorStop(0.3, '#f5e077');
      chipGrad.addColorStop(0.7, '#c8971f');
      chipGrad.addColorStop(1, '#a07818');
      ctx2.fillStyle = chipGrad;
      ctx2.fill();
      ctx2.strokeStyle = '#8B6914';
      ctx2.lineWidth = 1.5;
      ctx2.stroke();

      ctx2.strokeStyle = '#8B6914';
      ctx2.lineWidth = 0.8;
      const cxC = chipX, cyC = chipY;
      [0.3, 0.55, 0.75].forEach(t => {
        ctx2.beginPath(); ctx2.moveTo(cxC + chipW * t, cyC + 4);
        ctx2.lineTo(cxC + chipW * t, cyC + chipH - 4); ctx2.stroke();
      });
      ctx2.beginPath(); ctx2.moveTo(cxC + 4, cyC + chipH * 0.35);
      ctx2.lineTo(cxC + chipW - 4, cyC + chipH * 0.35); ctx2.stroke();
      ctx2.beginPath(); ctx2.moveTo(cxC + 4, cyC + chipH * 0.65);
      ctx2.lineTo(cxC + chipW - 4, cyC + chipH * 0.65); ctx2.stroke();

      const waveX = chipX + chipW + 18, waveY = chipY + chipH / 2;
      ctx2.strokeStyle = 'rgba(139,0,0,0.35)';
      ctx2.lineWidth = 1.5;
      for (let w = 0; w < 4; w++) {
        ctx2.beginPath();
        ctx2.arc(waveX + w * 8, waveY, 6 + w * 4, -Math.PI * 0.6, Math.PI * 0.6);
        ctx2.stroke();
      }

      const barcodeX = colLeft, barcodeY = H - 38;
      const barW = 1.2, barH = 22;
      const barPattern = '1011010110101101011010110101101011010110101101';
      ctx2.fillStyle = '#000';
      barPattern.split('').forEach((bit, i) => {
        if (bit === '1') ctx2.fillRect(barcodeX + i * barW, barcodeY, barW, barH);
      });

      ctx2.font = '8px KTPMono, "Liberation Mono", monospace';
      ctx2.fillStyle = '#555';
      ctx2.textAlign = 'left';
      ctx2.fillText(data.nik, barcodeX, barcodeY + barH + 4);

      ctx2.font = '9px KTPReg, Poppins, sans-serif';
      ctx2.fillStyle = 'rgba(139,0,0,0.5)';
      ctx2.textAlign = 'right';
      ctx2.fillText('DIREKTORAT JENDERAL KEPENDUDUKAN DAN PENCATATAN SIPIL', W - 18, H - 20);

      const buffer = canvas.toBuffer('image/png');

      await alya.sendMessage(m.chat, {
        image: buffer,
        caption:
          `✅━━━〔 🪪 *Fake eKTP Berhasil* 〕━━━✅\n\n` +
          `👤 *Nama*: ${data.nama}\n` +
          `🆔 *NIK*: ${data.nik}\n` +
          `🏙️ *Provinsi*: ${data.provinsi}\n` +
          `📍 *Kota*: ${data.kota}\n\n` +
          `⚡ Dibuat oleh Alya Bot`
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('[fakeektp]', e);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('❌ Gagal membuat eKTP: ' + e.message);
    }
  }
};
