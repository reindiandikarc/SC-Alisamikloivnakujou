/*!-======[ Contoh Plugin ]======-!
  !- Ini contoh plugin paling sederhana untuk referensi format.
  !- Plugin ini bisa dihapus kapan saja lewat: .delplugin ping
*/
export const meta = {
  name: 'Ping',
  desc: 'Cek apakah bot aktif & hitung kecepatan respon',
  version: '1.0.0',
  author: 'System',
  category: 'tools',
};

export default async function on({ cht, ev, Exp }) {
  ev.on(
    {
      cmd: ['ping'],
      listmenu: ['ping'],
      tag: 'tools',
    },
    async () => {
      let start = Date.now();
      await cht.reply('🏓 Pong!');
      let speed = Date.now() - start;
      cht.reply(`⚡ Kecepatan respon: ${speed}ms`);
    }
  );
}
