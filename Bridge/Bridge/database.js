import fs from 'fs'
import path from 'path'

class Database {
    constructor() {
        this.data = {
            users: {},
            groups: {},
            settings: {}
        }
        this.file = path.join(process.cwd(), 'database', 'botdata.json')
        this.load()
    }

    load() {
        if (fs.existsSync(this.file)) {
            try {
                this.data = JSON.parse(fs.readFileSync(this.file, 'utf8'))
            } catch {
                this.save()
            }
        } else {
            this.save()
        }
    }

    save() {
        const dir = path.dirname(this.file)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2))
    }

    getUser(jid) {
        const id = jid.split('@')[0]
        if (!this.data.users[id]) {
            this.data.users[id] = {
                name: '',
                limit: 100,
                exp: 0,
                level: 1,
                banned: false,
                registered: Date.now(),
                chatCount: 0
            }
            this.save()
        }
        return this.data.users[id]
    }

    getGroup(jid) {
        if (!this.data.groups[jid]) {
            this.data.groups[jid] = {
                name: '',
                welcome: false,
                goodbye: false,
                antilink: false,
                antilinkall: false,
                antibot: false,
                antimedia: false,
                antisticker: false,
                antidocument: false,
                antiremove: false,
                antitagsw: false,
                antitoxic: false,
                antispam: false,
                slowmode: { enabled: false, delay: 30 },
                mutedUsers: {},
                warnings: {},
                welcomeMsg: '',
                goodbyeMsg: '',
                antilinkList: [],
                toxicWords: [],
                chatStats: {},
                botMode: 'md'
            }
            this.save()
        }
        return this.data.groups[jid]
    }

    setGroup(jid, data) {
        this.data.groups[jid] = { ...this.getGroup(jid), ...data }
        this.save()
    }

    updateChatStats(jid, sender) {
        const group = this.getGroup(jid)
        if (!group.chatStats[sender]) {
            group.chatStats[sender] = 0
        }
        group.chatStats[sender]++
        this.setGroup(jid, group)
    }

    getSetting(key) {
        return this.data.settings[key]
    }

    setSetting(key, value) {
        this.data.settings[key] = value
        this.save()
    }
}

export default new Database()