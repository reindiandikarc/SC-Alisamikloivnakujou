// Plugin: clearchat
// Ported for Alya V13 Plugin System
// Commands: clearchat

module.exports = {
  command: ["clearchat"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { Ryuu, replytolak, replyalya } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)

    try {
      await alya.chatModify(
        { delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.messageTimestamp }] },
        m.chat
      )
    } catch (e) {
      replyalya('❌ Gagal clear chat: ' + e.message)
    }
  }
}
