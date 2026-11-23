// Plugin: funfacthidup
// Auto-generated from Alya V12
// Commands: lifefact, funfacthidup

const path = require('path')

module.exports = {
  command: ["lifefact", "funfacthidup"],
  tags: ['general'],
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

        if (!text)
            return replyalya(
                '📅 Contoh penggunaan:\n.livefunfact 2002-01-11\n\nFormat: YYYY-MM-DD'
            )

        await alya.sendMessage(m.chat, {
            react: { text: '🧬', key: m.key }
        })

        try {
            const axios = require('axios')
            const { data } = await axios.get(
                `https://api.nexray.web.id/fun/livefunfact?birthdate=${text}`
            )

            if (!data.status) return replyalya('❌ Data tidak ditemukan.')

            const r = data.result

            let caption = `🧠 *FAKTA KEHIDUPAN BERDASARKAN TANGGAL LAHIR*\n\n`


            caption += `📅 *Informasi Dasar*\n`
            caption += `• Umur: ${r.basic_info.age_in_years} tahun\n`
            caption += `• Hari hidup: ${r.basic_info.age_in_days.toLocaleString()} hari\n`
            caption += `• Jam hidup: ${r.basic_info.age_in_hours.toLocaleString()} jam\n`
            caption += `• Menit hidup: ${r.basic_info.age_in_minutes.toLocaleString()} menit\n`
            caption += `• Detik hidup: ${r.basic_info.age_in_seconds.toLocaleString()} detik\n\n`

            caption += `❤️ *Sistem Kardiovaskular*\n`
            caption += `• Total detak jantung: ${r.cardiovascular.heart_beats_total.toLocaleString()}\n`
            caption += `• Darah dipompa: ${r.cardiovascular.blood_pumped_l.toLocaleString()} liter\n`
            caption += `• Jarak aliran darah: ${r.cardiovascular.blood_distance_km.toLocaleString()} km\n\n`


            caption += `🫁 *Sistem Pernapasan*\n`
            caption += `• Total napas: ${r.respiratory.total_breaths.toLocaleString()}\n`
            caption += `• Oksigen dikonsumsi: ${r.respiratory.oxygen_consumed_l.toLocaleString()} liter\n`
            caption += `• CO₂ dihasilkan: ${r.respiratory.co2_produced_l.toLocaleString()} liter\n\n`

            caption += `🧠 *Sistem Saraf & Otak*\n`
            caption += `• Aktivitas saraf: ${r.neurological.action_potentials.toLocaleString()}\n`
            caption += `• Transmisi sinaps: ${r.neurological.synaptic_transmissions.toLocaleString()}\n`
            caption += `• Energi otak: ${r.neurological.brain_energy_consumed_kj.toLocaleString()} kJ\n\n`

            caption += `🔥 *Ringkasan Metabolisme*\n`
            caption += `• Kalori terbakar: ${r.metabolic_summary.total_calories_burned.toLocaleString()} kcal\n`
            caption += `• Energi dihasilkan: ${r.metabolic_summary.energy_produced_kj.toLocaleString()} kJ\n`
            caption += `• Air diproses: ${r.metabolic_summary.water_processed_l.toLocaleString()} liter\n\n`

            caption += `✨ *Fakta Menakjubkan*\n`
            caption += `• Total sel tubuh: ${r.amazing_facts.total_body_cells.toLocaleString()}\n`
            caption += `• Panjang DNA: ${r.amazing_facts.total_dna_length_km.toLocaleString()} km\n`
            caption += `• Panjang pembuluh darah: ${r.amazing_facts.blood_vessel_length_km.toLocaleString()} km\n`
            caption += `• Kekuatan tulang: ${r.amazing_facts.bone_strength_psi} PSI\n\n`

            caption += `🌍 *Perbandingan Kehidupan*\n`
            caption += `• Rata-rata harapan hidup dunia: ${r.life_comparison.world_life_expectancy} tahun\n`
            caption += `• Persentase hidup dijalani: ${r.life_comparison.percentage_of_life_lived}%\n`
            caption += `• Estimasi sisa umur: ${r.life_comparison.estimated_remaining_years} tahun\n`
            caption += `• Kondisi biologis: ${r.life_comparison.biological_systems_optimal}\n\n`

            caption += `⚠️ *Catatan Medis*\n${r.medical_disclaimer}`

            replyalya(caption)

        } catch (err) {
            console.error(err)
            replyalya('❌ Terjadi kesalahan saat mengambil data.')
        }
    }
//     	case 'aiimg':
  }
