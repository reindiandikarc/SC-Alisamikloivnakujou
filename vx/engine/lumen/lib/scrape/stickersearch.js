/**
 * Name : Sticker Telegram Search
 * Type : ESM
 * Url : https://www.sigstick.com
 * Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
 */
import axios from 'axios'

const baseURL = 'https://www.sigstick.com'

const headers = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

const axiosInstance = axios.create({
  timeout: 20000,
  headers
})

let cachedBuildId = null
let cachedBuildTime = 0

async function getBuildId() {
  if (cachedBuildId && Date.now() - cachedBuildTime < 15 * 60 * 1000) {
    return cachedBuildId
  }

  const { data: html } = await axiosInstance.get(`${baseURL}/stickers`)
  
  let match = html.match(/"buildId":"([a-zA-Z0-9_-]+)"/)
  if (!match?.[1]) {
    match = html.match(/data-build-id="([a-zA-Z0-9_-]+)"/)
  }
  
  if (!match?.[1]) {
    throw new Error('Build ID tidak ditemukan.')
  }
  
  cachedBuildId = match[1]
  cachedBuildTime = Date.now()
  
  return cachedBuildId
}

export async function searchPack(keyword) {
  const buildId = await getBuildId()
  const url = `${baseURL}/_next/data/${buildId}/stickers.json`
  
  const { data } = await axiosInstance.get(url, {
    params: { keyword },
    headers: {
      ...headers,
      'x-nextjs-data': '1',
      referer: `${baseURL}/stickers?keyword=${encodeURIComponent(keyword)}`
    }
  })
  
  return data?.pageProps?.packs || []
}

export async function getPack(pack) {
  let url = ''
  
  if (pack.id) {
    url = `${baseURL}/pack/${pack.id}`
  } else if (pack.url) {
    url = pack.url
  }
  
  if (!url) {
    throw new Error('URL pack tidak ditemukan.')
  }

  const { data: html } = await axiosInstance.get(url)

  const regex = /https?:\/\/cdn2\.cdnstep\.com\/[^"'\\\s<>]+/g
  let urls = html.match(regex) || []
  
  urls = urls
    .map(url => {
      return url
        .replace(/\\u0026/g, '&')
        .replace(/\\u002F/g, '/')
        .replace(/\\\//g, '/')
    })
    .filter(url => /\.(webp|png|jpg|jpeg)(\?.*)?$/i.test(url))
    
  urls = [...new Set(urls)]

  if (!urls.length) {
    throw new Error('URL sticker tidak ditemukan pada pack.')
  }

  return { url, stickers: urls }
}

export default {
  searchPack,
  getPack
}
