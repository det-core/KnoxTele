import fs from "fs"
import database from './database.js'

const det = {}

det.db = {
    owner: [],
    admin: [],
    reseller: [],
    user: []
}

const loadDB = () => {
    try {
        if (fs.existsSync("./database/owner.json")) {
            det.db.owner = JSON.parse(fs.readFileSync("./database/owner.json"))
        }
        if (fs.existsSync("./database/admin.json")) {
            det.db.admin = JSON.parse(fs.readFileSync("./database/admin.json"))
        }
        if (fs.existsSync("./database/reseller.json")) {
            det.db.reseller = JSON.parse(fs.readFileSync("./database/reseller.json"))
        }
        if (fs.existsSync("./database/user.json")) {
            det.db.user = JSON.parse(fs.readFileSync("./database/user.json"))
        }
    } catch (e) {
        console.log('Error loading DB files:', e.message)
    }
}

loadDB()

det.saveDB = () => {
    try {
        const dir = './database'
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        
        fs.writeFileSync("./database/owner.json", JSON.stringify(det.db.owner, null, 2))
        fs.writeFileSync("./database/admin.json", JSON.stringify(det.db.admin, null, 2))
        fs.writeFileSync("./database/reseller.json", JSON.stringify(det.db.reseller, null, 2))
        fs.writeFileSync("./database/user.json", JSON.stringify(det.db.user, null, 2))
    } catch (e) {
        console.log('Error saving DB files:', e.message)
    }
}

det.getPrefix = (text = "") => {
    return global.prefixes?.find(p => text.startsWith(p))
}

det.parseCommand = (text = "") => {
    const prefix = det.getPrefix(text)
    if (!prefix) return null
    const body = text.slice(prefix.length).trim()
    const command = body.split(" ")[0].toLowerCase()
    return { prefix, command, body }
}

det.isOwner = (id) => {
    const number = id.toString().replace(/[^0-9]/g, '')
    return det.db.owner.includes(number) || global.owner?.includes(number)
}

det.isAdmin = (id) => {
    const number = id.toString().replace(/[^0-9]/g, '')
    return det.db.admin.includes(number) || det.isOwner(number)
}

det.isReseller = (id) => {
    const number = id.toString().replace(/[^0-9]/g, '')
    return det.db.reseller.includes(number) || det.isOwner(number)
}

det.checkMembership = async (userId) => {
    return true
}

det.startHandler = async (msg) => {
    return true
}

det.reqpair = async (msg, bot) => {
    return true
}

det.delsess = async (msg, bot) => {
    return true
}

det.help = async (msg) => {
    return true
}

det.mainMenu = (id) => {
    const status = det.isOwner(id) ? "Owner" : det.isReseller(id) ? "Reseller" : "User"
    
    return `*KNOX INFO* 
> Bot name : *${global.nameBot}*
> Developer : *${global.ownerName}*
> Version : *${global.versionBot}*
> Runtime : *${det.runtime(process.uptime())}*
> Bot mode : *${global.feature.public ? 'public' : 'self'}*
> Status : *${status}*

┏⧉ *General Menu* 
┣𖣠 /reqpair
┣𖣠 /delsess
┣𖣠 /help
┗━━━━━━━━━━━━━❖`
}

det.runtime = (seconds) => {
    seconds = Number(seconds)
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor(seconds % (3600 * 24) / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)
    return `${d}d ${h}h ${m}m ${s}s`
}

export default det