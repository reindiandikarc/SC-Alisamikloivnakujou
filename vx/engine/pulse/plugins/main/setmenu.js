import crypto from 'crypto'
import moment from 'moment-timezone'
import sharp from 'sharp'

const cmdName = (c) => (typeof c === 'string' ? c : c?.cmd ?? '')
const getDate = () => {
	const now = moment().tz('Asia/Jakarta')
	return `${now.format('DD MMMM YYYY')} | ${now.format('HH:mm:ss')} WIB`
}

// buttons list menu
const buttonsList = {
	label: 'Buttons',
	description: 'Buttons list message + image',
	async build({ sock, m, menu, usedPrefix, status, customText }) {
		const finalBody = customText
		const userName = m.pushName || 'User'
		const categories = Object.keys(menu)
		const commandRows = [
			{
				header: "MENU UTAMA",
				title: `⛩️ List [ all ] feature`,
				description: `Display All Command`,
				id: `${usedPrefix}menu all`
			},
			...Object.entries(menu).map(([cat, cmds]) => ({
				header: `MENU ${cat.toUpperCase()}`,
				title: `⛩️ List [ ${cat} ] feature`,
				description: `Buka kategori ${cat} (${(cmds || []).length} commands)`,
				id: `${usedPrefix}menu ${cat}`
			}))
		]
		const infoRows = [
			{
				header: "👤 INFORMASI OWNER",
				title: `Informasi dan kontak owner bot`,
				description: "",
				id: `${usedPrefix}owner`
			},
			{
				header: "🎗️ SOURCE CODE",
				title: `Informasi mengenai source code bot`,
				description: "",
				id: `${usedPrefix}sc`
			},
			{
				header: "📑 TUTORIAL Bot",
				title: `Tutorial penggunaan bot`,
				description: "",
				id: `${usedPrefix}guide`
			}
		]
		return await sock.sendButtons(m.chat, {
			image: { url: global.thumbnail },
			text: finalBody,
			footer: global.namaBot,
			messageParams: {
				limited_time_offer: {
					text: "haii " + userName,
					url: global.wagc,
					copy_code: "By " + global.namaOwner,
					expiration_time: Date.now() * 99999
				},
				bottom_sheet: {
					in_thread_buttons_limit: 1,
					list_title: global.namaBot,
					button_title: "Menu"
				}
			},
			buttons: [
				{
					title: 'List Command',
					sections: [
						{
							title: 'LIST KATEGORI MENU',
							highlight_label: 'vanXone〽️',
							rows: commandRows
						}
					],
					icon: 'NONE'
				},
				{
					title: 'Information Bot',
					sections: [
						{
							title: 'INFORMASI BOT',
							highlight_label: 'Info',
							rows: infoRows
						}
					],
					icon: 'NONE'
				},
				{
					displayText: 'Group Bot',
					url: global.wagc
				}
			]
		}, { quoted: global.qpix })
	}
}

// menu extendedTextMessage
const menuExtendedTextMessage = {
	label: 'Extended Text',
	description: 'Link priview atau extendedTextMessage',
	async build({ sock, m, menu, usedPrefix, status, customText }) {
		const date = getDate()
		const finalBody = customText

		return sock.sendLinkPreview(m.chat, {
			text: `https://t.me/${global.tele}\n` + finalBody,
			contextInfo: { mentionedJid: [m.sender] },
			url: `https://t.me/${global.tele}`,
			title: '© ' + global.namaBot,
			description: date,
			thumbnail: global.thumbnail,
			thumbnailWidth: 768,
			thumbnailHeight: 1280
		}, { quoted: global.qpix })
	}
}

// location buttons list mesage
const locationButtons = {
	label: 'Location',
	description: 'Menu tampil sebagai location buttons dengan list per kategori',
	async build({ sock, m, menu, usedPrefix, status, customText }) {
		const finalBody = customText

		const categories = Object.keys(menu)
		const rows = [
			{
				header: 'Category Menu',
				title: `menu all`,
				description: 'Tampilkan semua command',
				id: `${usedPrefix}menu all`
			},
			...categories.map(cat => ({
				header: 'Category Menu',
				title: `menu ${cat}`,
				description: `Tampilkan menu ${cat}`,
				id: `${usedPrefix}menu ${cat}`
			}))
		]

		const sections = [
			{
				title: 'Category Menu',
				highlight_label: '',
				rows
			}
		]

		return sock.sendMessage(m.chat, {
			type: 'location_buttons',
			thumbnail: global.thumbnail,
			text: finalBody,
			footer: '© ' + global.namaBot,
			contextInfo: { mentionedJid: [m.sender] },
			lat: 0,
			lng: 0,
			buttons: [
				{
					displayText: global.namaBot,
					id: 'menu',
					sections
				}
			]
		}, { quoted: global.qpix })
	}
}

// buttons inap signup
const inapSignup = {
	label: 'Inap Signup',
	description: 'Buttons inap signup mesage',
	async build({ sock, m, menu, usedPrefix, status, customText }) {
		const finalBody = customText

		return sock.sendMessage(m.chat, {
          title: global.namaBot,
          text: finalBody,
          contextInfo: { mentionedJid: [m.sender] },
          buttons: [
            {
              name: 'inapp_signup', 
              buttonParamsJson: '{}' 
            }
          ],
        }, { quoted: m })
	}
}

// limited_time_offer mesage
const memuTimeOffer = {
	label: 'Limited time offer',
	description: 'Limited time offer mesages',
	async build({ sock, m, menu, usedPrefix, status, customText }) {
		const finalBody = customText

		let thumb = null
		try {
			const res = await fetch(global.thumbnail)
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const buff = Buffer.from(await res.arrayBuffer())
			thumb = await sharp(buff).resize(300, 300, { fit: 'cover' }).jpeg().toBuffer()
		} catch (err) {
			console.error('[THUMB]', err?.message || err)
		}

		await sock.sendMessage(m.chat, {
			location: {
				degreesLatitude: -0,
				degreesLongitude: 0,
				address: '© ' + global.namaBot,
				...(thumb ? { jpegThumbnail: thumb } : {})
			},
			text: finalBody,
			footer: '© ' + global.namaBot,
			contextInfo: { mentionedJid: [m.sender] },
			messageParams: {
				limited_time_offer: {
					text: 'ジャー',
					url: `https://t.me/${global.tele}`,
				},
			},
			buttons: [
				{
					flow_id: '26625178293769528',
					flow_cta: 'honey your familiar',
					flow_action: 'navigate',
					icon: 'GALAXY',
					flow_action_payload: {
						screen: 'SATISFACTION_SCREEN',
						data: { title: global.namaBot }
					}
				},
			]
		}, { quoted: m })
	}
}

// review & payment mesage
const riviewPay = {
	label: 'Review & pay',
	description: 'Review and pay mesages',
	async build({ sock, m, menu, usedPrefix, status, customText }) {
		const finalBody = customText

		await sock.sendMessage(m.chat, {
			type: 'review_and_pay',
			image: { url: global.thumbnail },
			text: finalBody,
			footer: '© ' + global.namaBot,
			paymentParams: {
				currency: 'USD',
				total_amount: { value: 1000000, offset: 100 },
				reference_id: 'wongasor',
				order_request_id: crypto.randomUUID(),
				type: 'digital-goods',
				order: {
					status: 'shipped',
					subtotal: { value: 1000000, offset: 100 },
					tax: { value: 8, offset: 100 },
					discount: { value: 6400, offset: 100 },
					shipping: { value: 4, offset: 100 },
					order_type: 'ORDER',
					items: [{
						retailer_id: '778739a4-e7b1-4295-9f29-ed3daec92a95',
						name: 's for ' + global.namaBot,
						amount: { value: 1000000, offset: 100 },
						quantity: 1000
					}]
				},
				additional_note: global.namaBot
			}
		}, { quoted: m })
	}
}

// poll menu
const POLL_MENU_CATEGORIES = ['all', 'owner', 'random', 'grup', 'panel', 'nsfw', 'download', 'search', 'tools', 'game', 'github', 'ai']

const registerPollEntry = (sock, sent, chat, options) => {
	const pollId = sent?.key?.id
	if (!pollId) return
	const db = sock.db.getPollCommands()
	db[pollId] = {
		chat,
		creator: 'menu',
		createdAt: Date.now(),
		expireAt: Date.now() + 24 * 60 * 60 * 1000,
		options
	}
	sock.db.saveDatabase()
}

const pollMenu = {
	label: 'Poll Menu',
	description: 'Menu utama & submenu berupa polling -- teks + opsi jadi satu bubble poll',
	async build({ sock, m, usedPrefix, customText, isMainMenu }) {
		const body = customText || `Menu ${global.namaBot}`

		if (!isMainMenu) {
			return sock.sendMessage(m.chat, { text: body }, { quoted: m })
		}

		const options = {}
		for (const cat of POLL_MENU_CATEGORIES) options[cat] = `menu ${cat}`

		const sent = await sock.sendPoll(m.chat, {
			title: body,
			options: Object.keys(options),
			selectableCount: 1
		}, { quoted: m })

		if (sock.saveMessageToStore) sock.saveMessageToStore(sent)
		registerPollEntry(sock, sent, m.chat, options)
	},

	async buildSubmenuPoll({ sock, m, customText }) {
		const options = {
			'back': 'menu',
			'all': 'menu all'
		}

		const sent = await sock.sendPoll(m.chat, {
			title: customText || 'Navigasi:',
			options: Object.keys(options),
			selectableCount: 1
		}, { quoted: m })

		if (sock.saveMessageToStore) sock.saveMessageToStore(sent)
		registerPollEntry(sock, sent, m.chat, options)
	}
}

export const MENU_TYPES = {
	1: { key: 'buttons list', ...buttonsList },
	2: { key: 'extended', ...menuExtendedTextMessage },
	3: { key: 'location buttons', ...locationButtons },
	4: { key: 'inap signup buttons', ...inapSignup },
	5: { key: 'limited time offer', ...memuTimeOffer },
	6: { key: 'review and pay', ...riviewPay },
	7: { key: 'poll menu', ...pollMenu }
}

const handler = async (m, { sock, text, usedPrefix, reply, isJadiBot, getMenuConfig, setMenuConfig }) => {
	const arg = (text || '').trim()

	if (!arg) {
		const current = getMenuConfig()
		const currentEntry = Object.entries(MENU_TYPES).find(([, v]) => v.key === current.type)
		const list = Object.entries(MENU_TYPES)
			.map(([num, v]) => ` ${num}. *${v.label}* — ${v.description}`)
			.join('\n')

		return reply(`*Set type menu*
Menu saat ini: *${currentEntry ? currentEntry[1].label : 'Extended Text'}*

*Available type:*
${list}

Use: *${usedPrefix}setmenu 1*`
		)
	}

	const choice = MENU_TYPES[arg]
	if (!choice) {
		return reply(`Pilihan tidak valid. Ketik *${usedPrefix}setmenu* untuk lihat daftar tipe menu yang tersedia.`)
	}

	if (isJadiBot && choice.key === 'poll menu') return reply('Poll menu hanya tersedia di bot utama.')

	setMenuConfig({ type: choice.key })
	return reply(`Tipe menu berhasil diubah ke *${choice.label}*`)
}

handler.command = ['setmenu']
handler.owner = true

export default handler