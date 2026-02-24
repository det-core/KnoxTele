import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default {
    command: ['mediafiledl', 'mfdl'],
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
                `┏⧉ *MEDIAFIRE DOWNLOADER*
┣𖣠 ${m.prefix}mediafiledl <url>
┣𖣠 Example: ${m.prefix}mediafiledl https://www.mediafire.com/file/xxx
┗━━━━━━━━━`,
                m
            )
        }
        
        if (!url.match(/mediafire\.com/i)) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid MediaFire URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*MEDIAFIRE DOWNLOADER*\n\nFetching file info...', m)
        
        try {
            const { data: html } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            
            const $ = cheerio.load(html)
            
            const title = $('meta[property="og:title"]').attr('content') || 'Unknown'
            const downloadUrl = $('#downloadButton').attr('href')
            const sizeText = $('#downloadButton').text().trim()
            const size = sizeText.replace('Download (', '').replace(')', '')
            
            if (!downloadUrl) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to get download link', m)
            }
            
            await newsletter.sendText(sock, m.chat,
                `*MEDIAFIRE FILE*\n\n` +
                `File: ${title}\n` +
                `Size: ${size}\n\n` +
                `Sending file...`,
                m
            )
            
            await newsletter.sendDocument(sock, m.chat, { url: downloadUrl }, title, '', m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}