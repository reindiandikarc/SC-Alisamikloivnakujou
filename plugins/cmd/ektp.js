// Plugin: ektp
// Commands: ektp, fakektp
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['ektp', 'fakektp'],
  tags: ['info'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    alya.sendMessage(m.chat, { react: { text: '🪪', key: m.key } });

    try {
      const { uploadToCatbox, generateEKTP } = require('../../lib/ektp');

      let pasPhotoURL = "";

      if (m.quoted && /image/.test(m.quoted.mimetype)) {
        let media = await m.quoted.download();
        let up = await uploadToCatbox(media);

        if (!up.success) {
          return replyalya(`❌ Gagal upload foto!\n${up.error}`);
        }

        pasPhotoURL = up.url;
      }

      let parts = text ? text.split("|").map(v => v.trim()) : [];

      const [
        provinsi = "",
        kota = "",
        nik = "",
        nama = "",
        ttl = "",
        jenis_kelamin = "",
        golongan_darah = "",
        alamat = "",
        rt_rw = "",
        kel_desa = "",
        kecamatan = "",
        agama = "",
        status = "",
        pekerjaan = "",
        kewarganegaraan = "",
        masa_berlaku = "",
        terbuat = "",
        pasfoto_input = ""
      ] = parts;

      if (!pasPhotoURL) pasPhotoURL = pasfoto_input;

      if (!provinsi || !kota || !nik || !nama || !ttl || !pasPhotoURL) {
        return replyalya(
          `⚠️ *Format salah!*\n\nGunakan format:\n` +
          `${prefix + command} Provinsi|Kota|NIK|Nama|TTL|JK|GolDar|Alamat|RT/RW|Kel/Desa|Kecamatan|Agama|Status|Pekerjaan|Kewarganegaraan|Masa Berlaku|Terbuat|URLFoto\n\n` +
          `Atau *reply foto* dengan caption:\n${prefix + command} Lampung|Bandar Lampung|15615489465187|ALYA KUJOU|Lampung, 22-09-2009|Perempuan|A|Tokyo|12/21|Tokyo|Tokyo|Unknown|Single|Pelajar|Jepang|SEUMUR HIDUP|12-12-2025`
        );
      }

      const params = {
        provinsi,
        kota,
        nik,
        nama,
        ttl,
        jenis_kelamin,
        golongan_darah,
        alamat,
        rt_rw,
        kel_desa,
        kecamatan,
        agama,
        status,
        pekerjaan,
        kewarganegaraan,
        masa_berlaku,
        terbuat,
        pas_photo: pasPhotoURL
      };
      let result = await generateEKTP(params);

      if (!result.success) {
        return replyalya(`❌ API Error:\n${result.error}`);
      }

      await alya.sendMessage(
        m.chat,
        {
          image: result.buffer,
          caption: `🪪 *eKTP Berhasil Dibuat!*\n\n👤 Nama: *${nama}*\n🆔 NIK: *${nik}*`
        },
        { quoted: m }
      );

    } catch (e) {
      replyalya(`❌ Error:\n${e.message}`);
    }
  }
};
