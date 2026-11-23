// scrape/samehadaku.js
// Diadaptasi dari samehadaku.js (CLI). Fungsi resolveStreamingUrls() (puppeteer
// + CHROME_PATH hardcoded ke Termux) sengaja TIDAK diikutkan karena tidak
// portable ke server/panel biasa dan rapuh (bergantung Chromium terpasang).
// Sisanya (home, daftar anime, jadwal rilis, daftar batch, detail, episode
// player-list & download-links) murni cheerio, aman dipakai di server mana pun.
'use strict';

const { shz: bycf } = require('bycf');
const cheerio = require('cheerio');

const BASE_URL = 'https://v2.samehadaku.how';

async function fetchPage(url) {
  return await bycf.source(url);
}

async function scrapeHome() {
  const html = await fetchPage(BASE_URL);
  const $ = cheerio.load(html);
  const result = { top_10_minggu_ini: [], latest_anime: [], movie_terbaru: [] };

  $('.topten-animesu li').each((i, el) => {
    if (result.top_10_minggu_ini.length >= 10) return false;
    const $el = $(el);
    const a = $el.find('a.series').first();
    const rank = $el.find('b.is-topten b:last-child').text().trim();
    const title = $el.find('.judul').text().trim();
    const rating = $el.find('.rating').text().trim();
    const url = a.attr('href') || '';
    const image = $el.find('img').attr('src') || '';
    result.top_10_minggu_ini.push({ rank, title, rating, url, image });
  });

  $('h2.entry-title').each((i, el) => {
    const a = $(el).find('a').first();
    const title = $(el).text().trim();
    let url = a.attr('href') || '';
    if (!url.startsWith('http')) url = BASE_URL + url;
    const li = $(el).closest('li');
    const image = li.find('.thumb img').attr('src') || li.find('img').first().attr('src') || '';
    const episode = li.find('.dtla span').first().text().trim();
    const postedBy = li.find('.dtla .author').text().trim();
    const releasedOn = li.find('.dtla span').last().text().trim();
    result.latest_anime.push({ title, url, image, episode, posted_by: postedBy, released_on: releasedOn });
  });

  const seenMovies = new Set();
  $('.widgetseries').last().find('li').each((i, el) => {
    const $el = $(el);
    const a = $el.find('a.series').first();
    const h2 = $el.find('h2').first();
    const title = h2.text().trim() || $el.find('.judul').text().trim();
    let url = a.attr('href') || h2.find('a').attr('href') || '';
    if (!url.startsWith('http')) url = BASE_URL + url;
    if (!title || seenMovies.has(url)) return;
    seenMovies.add(url);
    const image = $el.find('img').attr('src') || '';
    const genres = [];
    $el.find("span a[rel='tag']").each((j, g) => genres.push($(g).text().trim()));
    const date = $el.find('.lftinfo span').last().text().trim();
    result.movie_terbaru.push({ title, url, image, genres, date });
  });

  return result;
}

async function scrapeDaftarAnime() {
  const html = await fetchPage(BASE_URL + '/daftar-anime-2/?list');
  const $ = cheerio.load(html);
  const items = [];
  $('.listttl ul li a, .listpst li a').each((i, el) => {
    const title = $(el).text().trim();
    let url = $(el).attr('href') || '';
    if (!url.startsWith('http')) url = BASE_URL + url;
    if (title) items.push({ title, url });
  });
  return items;
}

async function scrapeJadwalRilis() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = { monday: 'Senin', tuesday: 'Selasa', wednesday: 'Rabu', thursday: 'Kamis', friday: 'Jumat', saturday: 'Sabtu', sunday: 'Minggu' };
  const result = {};

  for (const day of days) {
    try {
      const url = `${BASE_URL}/wp-json/custom/v1/all-schedule?perpage=20&day=${day}`;
      const html = await fetchPage(url);
      const $ = cheerio.load(html);
      const jsonStr = $('pre').text() || html;
      const data = JSON.parse(jsonStr);
      result[dayNames[day]] = data.map((item) => ({
        title: item.title,
        url: item.url,
        time: item.east_time || '',
        image: item.featured_img_src || '',
        score: item.east_score || '',
        type: item.east_type || '',
        genres: item.genre || '',
      }));
    } catch (e) {
      result[dayNames[day]] = [];
    }
  }
  return result;
}

async function scrapeDaftarBatch() {
  const html = await fetchPage(BASE_URL + '/daftar-batch');
  const $ = cheerio.load(html);
  const items = [];
  $('article.animpost, .relat article, .animepost').each((i, el) => {
    const $el = $(el);
    let url = $el.find('a').first().attr('href') || '';
    if (!url.startsWith('http')) url = BASE_URL + url;
    const genres = [];
    $el.find(".genres a, .mta a, a[rel='tag']").each((j, g) => genres.push($(g).text().trim()));
    items.push({
      title: $el.find('.data .title h2, .data .title, h2').first().text().trim(),
      url,
      image: $el.find('img').attr('src') || '',
      score: $el.find('.score').text().trim(),
      status: $el.find('.data .type, .type').first().text().trim(),
      genres,
    });
  });
  return items;
}

async function scrapeBatchDetail(url) {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const title = $('h1').first().text().trim() || '';

  const downloads = [];
  $('.download-eps').each((i, el) => {
    const $el = $(el);
    const format = $el.find('p b').text().trim() || 'Unknown';
    const links = [];
    $el.find('ul li').each((j, li) => {
      const $li = $(li);
      const quality = $li.find('strong').text().trim();
      const providers = [];
      $li.find('span a').each((k, a) => {
        providers.push({ provider: $(a).text().trim(), url: $(a).attr('href') || '' });
      });
      if (quality) links.push({ quality, providers });
    });
    if (links.length) downloads.push({ format, links });
  });

  return { title, downloads };
}

async function scrapeDetailAnime(url) {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  let title = $('h1.titless, .animetitle-episode, h1').first().text().trim() || '';
  title = title.replace(/^(Tonton|Watch|Streaming|List Episode)\s+/i, '').trim();
  const image = $("img[class*='anmsa'], img[itemprop='image'], .thumb img").first().attr('src') || '';
  const synopsis = $('.series-synopsis, .desc, .sinopsis, .entry-content entry-content').first().text().trim() || '';

  const info = {};
  $('.infox .spe span, .spe span, .seriestuinfo span').each((i, el) => {
    const text = $(el).text().trim();
    if (text.includes(':')) {
      const [k, ...v] = text.split(':');
      info[k.trim()] = v.join(':').trim();
    }
  });

  const genres = [];
  $("a[href*='genre'], .seriestugenre a").each((i, el) => genres.push($(el).text().trim()));

  const episodes = [];
  const seenUrls = new Set();
  $(".eplister ul li a, a[href*='episode']").each((i, el) => {
    let epUrl = $(el).attr('href') || '';
    if (!epUrl.startsWith('http')) epUrl = BASE_URL + epUrl;
    if (seenUrls.has(epUrl) || !epUrl.includes('episode')) return;
    seenUrls.add(epUrl);
    episodes.push({ title: $(el).text().trim(), url: epUrl });
  });

  const recommendations = [];
  $('.rand-animesu li').each((i, el) => {
    const $el = $(el);
    const a = $el.find('a.series').first();
    let recUrl = a.attr('href') || '';
    if (!recUrl.startsWith('http')) recUrl = BASE_URL + recUrl;
    recommendations.push({
      title: $el.find('.judul').text().trim(),
      url: recUrl,
      image: $el.find('img').attr('src') || '',
      rating: $el.find('.rating').text().trim(),
      episode: $el.find('.episode').text().trim(),
    });
  });

  const batchLinks = [];
  $('.mctbx .boxdownload a, .boxdl a').each((i, el) => batchLinks.push({ title: $(el).text().trim(), url: $(el).attr('href') || '' }));

  return { title, image, synopsis, info, genres, episodes, recommendations, batch_links: batchLinks };
}

async function scrapeEpisode(url) {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const title = $('h1').first().text().trim() || '';
  const animeUrl = $('a').filter(function () { return $(this).text().trim() === 'All Episode'; }).attr('href') || '';

  const players = [];
  $('.east_player_option').each((i, el) => {
    const $el = $(el);
    players.push({
      name: $el.find('span').text().trim() || $el.text().trim(),
      data_post: $el.attr('data-post') || '',
      data_nume: $el.attr('data-nume') || '',
      data_type: $el.attr('data-type') || '',
    });
  });
  $("iframe.embed-embed, .mirrorifram iframe, iframe[src*='embed'], iframe[src*='player']").each((i, el) => {
    players.push({ name: 'iframe', src: $(el).attr('src') || '', type: 'iframe' });
  });

  const downloads = [];
  $('.download-eps').each((i, el) => {
    const $el = $(el);
    const format = $el.find('p b').text().trim() || 'Unknown';
    const links = [];
    $el.find('ul li').each((j, li) => {
      const $li = $(li);
      const quality = $li.find('strong').text().trim();
      const providers = [];
      $li.find('span a').each((k, a) => {
        providers.push({ provider: $(a).text().trim(), url: $(a).attr('href') || '' });
      });
      if (quality) links.push({ quality, providers });
    });
    if (links.length) downloads.push({ format, links });
  });

  const episodeList = [];
  const seenEpUrls = new Set();
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    if (href.includes('episode') && text.match(/Episode\s+\d+/) && !seenEpUrls.has(href)) {
      seenEpUrls.add(href);
      episodeList.push({ title: text, url: href });
    }
  });

  return { title, anime_url: animeUrl, players, downloads, episode_list: episodeList };
}

module.exports = {
  BASE_URL,
  scrapeHome,
  scrapeDaftarAnime,
  scrapeJadwalRilis,
  scrapeDaftarBatch,
  scrapeBatchDetail,
  scrapeDetailAnime,
  scrapeEpisode,
};
