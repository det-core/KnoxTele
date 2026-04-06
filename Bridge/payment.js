import axios from 'axios'
import fs from 'fs'

class PaymentSystem {
    constructor() {
        this.paymentsFile = './database/payments.json'
        this.ordersFile = './database/orders.json'
        this.initFiles()
    }

    initFiles() {
        if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true })
        if (!fs.existsSync(this.paymentsFile)) fs.writeFileSync(this.paymentsFile, JSON.stringify([]))
        if (!fs.existsSync(this.ordersFile)) fs.writeFileSync(this.ordersFile, JSON.stringify([]))
    }

    // ── Paystack: Initialize transaction ─────────────────────────────────────
    async createPaystackPayment(amount, email, phone, panelSize) {
        try {
            const reference = `knox-${Date.now()}-${phone}`

            const { data } = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email,
                    amount: amount * 100,   // Paystack uses kobo (100 kobo = ₦1)
                    reference,
                    callback_url: global.paystackCallbackUrl || '',
                    metadata: {
                        phone,
                        panelSize,
                        custom_fields: [
                            { display_name: 'Phone', variable_name: 'phone', value: phone },
                            { display_name: 'Panel', variable_name: 'panel', value: panelSize }
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${global.paystackSecretKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (data.status) {
                this.savePayment({
                    id: reference,
                    userId: phone,
                    amount,
                    email,
                    panelSize,
                    status: 'pending',
                    link: data.data.authorization_url,
                    accessCode: data.data.access_code,
                    createdAt: Date.now()
                })

                return {
                    success: true,
                    paymentLink: data.data.authorization_url,
                    reference,
                    accessCode: data.data.access_code
                }
            }

            return { success: false, message: data.message || 'Payment initialization failed' }

        } catch (error) {
            console.error('Paystack init error:', error?.response?.data || error.message)
            return { success: false, message: error?.response?.data?.message || error.message }
        }
    }

    // ── Paystack: Verify transaction ──────────────────────────────────────────
    async verifyPaystackPayment(reference) {
        try {
            const { data } = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        'Authorization': `Bearer ${global.paystackSecretKey}`
                    }
                }
            )

            if (data.status && data.data.status === 'success') {
                this.updatePaymentStatus(reference, 'completed', data.data)
                return { success: true, data: data.data }
            }

            return { success: false, message: `Payment status: ${data.data?.status || 'unknown'}` }

        } catch (error) {
            console.error('Paystack verify error:', error?.response?.data || error.message)
            return { success: false, message: error.message }
        }
    }

    // ── Manual order (negotiate with owner) ──────────────────────────────────
    createManualOrder(userId, panelSize, customPrice = null) {
        const order = {
            id: `order-${Date.now()}`,
            userId,
            panelSize,
            price: customPrice || global.panelPrices?.[panelSize]?.price || 0,
            status: 'negotiation',
            createdAt: Date.now(),
            notes: []
        }
        this.saveOrder(order)
        return { success: true, orderId: order.id, price: order.price }
    }

    // ── Auto-create panel after payment confirmed ─────────────────────────────
    async autoPanelCreate(payment) {
        const { userId: phone, panelSize, email } = payment
        const panelData = global.panelPrices?.[panelSize]
        if (!panelData) {
            console.error('[AUTO-PANEL] Unknown panel size:', panelSize)
            return
        }

        console.log(`[AUTO-PANEL] Creating ${panelSize} panel for ${phone}...`)

        try {
            // 1. Get or create Pterodactyl user
            let pteroUserId = await this.getPteroUserId(phone)
            if (!pteroUserId) {
                const userRes = await axios.post(`${global.domain}/api/application/users`, {
                    email: email || `${phone}@knox.bot`,
                    username: `knox_${phone}`,
                    first_name: 'Knox',
                    last_name: phone,
                    password: `Knox${phone.slice(-4)}!Kx`
                }, {
                    headers: {
                        'Authorization': `Bearer ${global.apikey}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                pteroUserId = userRes.data?.attributes?.id
            }

            if (!pteroUserId) throw new Error('Could not get/create Pterodactyl user')

            // 2. Create the server
            const serverRes = await axios.post(`${global.domain}/api/application/servers`, {
                name: `knox_${phone}_${panelSize}`,
                user: pteroUserId,
                egg: parseInt(global.egg),
                docker_image: 'ghcr.io/pterodactyl/yolks:nodejs_18',
                startup: 'node index.js',
                environment: { SERVER_JARFILE: 'server.jar', BUILD_NUMBER: 'latest' },
                limits: {
                    memory: panelData.ram,
                    swap: 0,
                    disk: panelData.disk,
                    io: 500,
                    cpu: panelData.cpu
                },
                feature_limits: { databases: 1, allocations: 1, backups: 2 },
                deploy: {
                    locations: [parseInt(global.loc)],
                    dedicated_ip: false,
                    port_range: []
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${global.apikey}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })

            const server = serverRes.data?.attributes
            console.log(`[AUTO-PANEL] ✅ Created: ${server.name} (ID: ${server.id}) for ${phone}`)

            // Mark panel as created
            this.updatePaymentStatus(payment.id, 'panel_created')

            // 3. Notify user via WhatsApp
            if (global.autoNotifySock && phone) {
                const jid = phone + '@s.whatsapp.net'
                await global.autoNotifySock.sendMessage(jid, {
                    text: `*✅ PANEL CREATED*\n\nYour Paystack payment was confirmed and your panel is ready!\n\nServer: ${server.name}\nID: ${server.id}\nRAM: ${panelData.ram/1024}GB\nCPU: ${panelData.cpu}%\nDisk: ${panelData.disk/1024}GB\n\n🌐 Login: ${global.domain}\n📧 Email: ${email || phone + '@knox.bot'}`
                })
            }

        } catch (err) {
            console.error('[AUTO-PANEL] Error:', err?.response?.data || err.message)
        }
    }

    async getPteroUserId(phone) {
        try {
            const res = await axios.get(
                `${global.domain}/api/application/users?filter[email]=${phone}@knox.bot`,
                { headers: { 'Authorization': `Bearer ${global.apikey}`, 'Accept': 'application/json' } }
            )
            const users = res.data?.data || []
            return users.length > 0 ? users[0].attributes.id : null
        } catch {
            return null
        }
    }

    savePayment(payment) {
        let payments = []
        try { payments = JSON.parse(fs.readFileSync(this.paymentsFile)) } catch { payments = [] }
        payments.push(payment)
        fs.writeFileSync(this.paymentsFile, JSON.stringify(payments, null, 2))
    }

    saveOrder(order) {
        let orders = []
        try { orders = JSON.parse(fs.readFileSync(this.ordersFile)) } catch { orders = [] }
        orders.push(order)
        fs.writeFileSync(this.ordersFile, JSON.stringify(orders, null, 2))
    }

    updatePaymentStatus(reference, status, paystackData = null) {
        let payments = []
        try { payments = JSON.parse(fs.readFileSync(this.paymentsFile)) } catch { return }

        const idx = payments.findIndex(p => p.id === reference)
        if (idx !== -1) {
            payments[idx].status = status
            payments[idx].updatedAt = Date.now()
            if (paystackData) payments[idx].paystackData = paystackData
            fs.writeFileSync(this.paymentsFile, JSON.stringify(payments, null, 2))

            // Auto-create panel on confirmed payment
            if (status === 'completed') {
                this.autoPanelCreate(payments[idx]).catch(e =>
                    console.error('[AUTO-PANEL] Failed:', e.message)
                )
            }
        }
    }

    getOwnerVCF() {
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${global.ownerName}\nTEL;type=CELL;type=VOICE;waid=${global.ownerNumber}:+${global.ownerNumber}\nEND:VCARD`
    }
}

export default new PaymentSystem()
