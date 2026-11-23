// Pengelola API pihak ketiga. Kunci diambil dari global.apiKeys (settings.js).
import axios from 'axios'
const key = (k) => (global.apiKeys && global.apiKeys[k]) || ''

const ourinApi = {
  cuki: {
    // kirim pesan anonim ke satu tautan NGL
    async sendNgl({ link, text }, opts = {}) {
      const { data } = await axios.get('https://api.cuki.biz.id/api/tools/sendngl', {
        params: { apikey: key('cuki') || 'cuki-x', link, text },
        timeout: opts.timeout || 30000
      })
      return data
    }
  }
}
export default ourinApi
