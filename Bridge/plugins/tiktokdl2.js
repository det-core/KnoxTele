import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default {
    command: ['tiktokdl2', 'tt2'],
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
                `┏⧉ *TIKTOK DOWNLOADER V2*
┣𖣠 ${m.prefix}tiktokdl2 <url>
┣𖣠 Example: ${m.prefix}tiktokdl2 https://vt.tiktok.com/xxx
┗━━━━━━━━━`,
                m
            )
        }
        
        if (!url.match(/tiktok\.com|vt\.tiktok/i)) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid TikTok URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*TIKTOK DOWNLOADER*\n\nDownloading video...', m)
        
        try {
            const { data: html } = await axios.get('https://savett.cc/en1/download')
            const $ = cheerio.load(html)
            
            const csrf = html.match(/name="csrf_token" value="([^"]+)"/)?.[1]
            const cookies = html.match(/csrf_cookie_([^;]+)/)?.[0] || ''
            
            if (!csrf) {
                throw new Error('Could not get token')
            }
            
            const postRes = await axios.post(
                'https://savett.cc/en1/download',
                `csrf_token=${encodeURIComponent(csrf)}&url=${encodeURIComponent(url)}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': cookies
                    }
                }
            )
            
            const $$ = cheerio.load(postRes.data)
            
            const username = $$('#video-info h3').first().text().trim()
            const videoUrl = $$('a.download').first().attr('href')
            
            if (!videoUrl) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo video found', m)
            }
            
            await newsletter.sendVideo(sock, m.chat, { url: videoUrl },
                `*TIKTOK DOWNLOADER*\n\nUsername: ${username || 'Unknown'}`,
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}