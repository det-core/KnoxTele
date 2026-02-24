import axios from 'axios'
import * as cheerio from 'cheerio'

export async function pinterest(query) {
  try {
    const { data } = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const $ = cheerio.load(data)
    const results = []
    
    $('img[srcset]').each((i, el) => {
      const src = $(el).attr('src')
      if (src && src.startsWith('https://i.pinimg.com/')) {
        results.push(src.replace(/236x/g, 'originals'))
      }
    })
    
    return [...new Set(results)].slice(0, 10)
  } catch (error) {
    console.log('Pinterest error:', error.message)
    return []
  }
}