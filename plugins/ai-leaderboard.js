import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default {
    command: ['ai-leaderboard', 'aiboard'],
    category: 'ai',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const category = args[0]?.toLowerCase()
        
        await newsletter.sendText(sock, m.chat, '*AI LEADERBOARD*\n\nFetching data...', m)
        
        try {
            const { data: html } = await axios.get('https://lmarena.ai/leaderboard', {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            
            const $ = cheerio.load(html)
            const leaderboards = {}
            
            $('div.my-7 > div.w-full').each((_, element) => {
                const categoryTitle = $(element).find('h2.font-heading').text().trim()
                if (!categoryTitle) return
                
                const models = []
                $(element).find('table tbody tr').each((_, row) => {
                    const rank = $(row).find('td:nth-of-type(1)').text().trim()
                    const modelName = $(row).find('td:nth-of-type(2) a > span').text().trim()
                    const scoreText = $(row).find('td:nth-of-type(3) > span').first().text().trim()
                    const votesText = $(row).find('td:nth-of-type(4)').text().trim()
                    
                    if (rank && modelName && scoreText && votesText) {
                        models.push({
                            rank: parseInt(rank, 10),
                            model: modelName,
                            score: parseInt(scoreText.replace(/,/g, ''), 10),
                            votes: parseInt(votesText.replace(/,/g, ''), 10)
                        })
                    }
                })
                
                if (models.length > 0) {
                    leaderboards[categoryTitle] = models
                }
            })
            
            const categories = Object.keys(leaderboards)
            
            if (categories.length === 0) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo leaderboard data found', m)
            }
            
            if (!category) {
                let text = `*AI LEADERBOARD*\n\n`
                
                for (const cat of categories) {
                    const topModels = leaderboards[cat].slice(0, 3)
                    text += `┏⧉ *${cat.toUpperCase()}*\n`
                    for (const m of topModels) {
                        text += `┣𖣠 ${m.rank}. ${m.model}\n`
                        text += `┃   Score: ${m.score.toLocaleString()} | Votes: ${m.votes.toLocaleString()}\n`
                    }
                    text += `┗━━━━━━━━━\n\n`
                }
                
                text += `Use ${m.prefix}ai-leaderboard <category> for details\n`
                text += `Categories: ${categories.join(', ')}`
                
                await newsletter.sendText(sock, m.chat, text, m)
                
            } else {
                const matchedCat = categories.find(c => c.toLowerCase().includes(category))
                
                if (!matchedCat) {
                    return newsletter.sendText(sock, m.chat,
                        `*KNOX INFO*\n\nCategory not found. Available: ${categories.join(', ')}`,
                        m
                    )
                }
                
                const models = leaderboards[matchedCat].slice(0, 10)
                
                let text = `*AI LEADERBOARD - ${matchedCat.toUpperCase()}*\n\n`
                
                for (const m of models) {
                    text += `${m.rank}. ${m.model}\n`
                    text += `   Score: ${m.score.toLocaleString()} | Votes: ${m.votes.toLocaleString()}\n\n`
                }
                
                await newsletter.sendText(sock, m.chat, text, m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}