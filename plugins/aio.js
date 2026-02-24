import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import * as cheerio from 'cheerio'
import CryptoJS from 'crypto-js'

export default {
    command: ['aio', 'allinone'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const url = text?.trim()
        
        if (!url) {
            return newsletter.sendText(sock, m.chat,
                `┏⧉ *ALL IN ONE DOWNLOADER*
┣𖣠 ${m.prefix}aio <url>
┣𖣠 Supports: Instagram, TikTok, Facebook, Twitter, YouTube
┗━━━━━━━━━

Example: ${m.prefix}aio https://www.instagram.com/p/xxx`,
                m
            )
        }
        
        if (!url.startsWith('http')) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*AIO DOWNLOADER*\n\nFetching media...', m)
        
        try {
            const baseUrl = 'https://allinonedownloader.com'
            const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            
            const initRes = await axios.get(baseUrl, { headers: { 'User-Agent': ua } })
            const $ = cheerio.load(initRes.data)
            
            const token = $('#token').val()
            const apiPath = $('#scc').val()
            const cookies = initRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ')
            
            if (!token || !apiPath) throw new Error('Token not found')
            
            const jsPath = $('script[src*="template/main/assets/js/main.js"]').attr('src')
            const jsUrl = new URL(jsPath, baseUrl).href
            const { data: jsContent } = await axios.get(jsUrl, {
                headers: { 'User-Agent': ua, 'Cookie': cookies }
            })
            
            const ivMatch = jsContent.match(/CryptoJS\.enc\.Hex\.parse\(['"]([a-f0-9]{32})['"]\)/)
            const ivHex = ivMatch ? ivMatch[1] : 'afc4e290725a3bf0ac4d3ff826c43c10'
            
            const key = CryptoJS.enc.Hex.parse(token)
            const iv = CryptoJS.enc.Hex.parse(ivHex)
            const urlhash = CryptoJS.AES.encrypt(url, key, {
                iv: iv,
                padding: CryptoJS.pad.ZeroPadding
            }).toString()
            
            const apiUrl = apiPath.startsWith('http') ? apiPath : `${baseUrl}${apiPath}`
            
            const { data } = await axios.post(apiUrl,
                new URLSearchParams({ url, token, urlhash }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Referer': baseUrl,
                        'Cookie': cookies,
                        'User-Agent': ua
                    }
                }
            )
            
            if (!data.links || data.links.length === 0) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo media found', m)
            }
            
            const title = data.title || 'Media'
            
            for (const link of data.links.slice(0, 3)) {
                try {
                    const mediaUrl = link.url
                    const type = link.type?.toLowerCase() || ''
                    const isVideo = ['mp4', 'mov', 'webm', 'video'].some(t => type.includes(t))
                    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'image'].some(t => type.includes(t))
                    
                    const caption = `*AIO DOWNLOADER*\n\nTitle: ${title}\nQuality: ${link.quality || 'HD'}\nSize: ${link.size || '?'}`
                    
                    if (isVideo) {
                        await newsletter.sendVideo(sock, m.chat, { url: mediaUrl }, caption, m)
                    } else if (isImage) {
                        const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' })
                        const imgBuffer = Buffer.from(response.data)
                        await newsletter.sendImage(sock, m.chat, imgBuffer, caption, m)
                    } else {
                        await newsletter.sendDocument(sock, m.chat, { url: mediaUrl }, `download.${link.type || 'mp4'}`, caption, m)
                    }
                    
                    await new Promise(r => setTimeout(r, 1000))
                    
                } catch (err) {
                    console.log('Media send failed:', err.message)
                }
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}