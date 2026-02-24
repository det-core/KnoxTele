import axios from 'axios'
import fs from 'fs'
import path from 'path'

class PaymentSystem {
    constructor() {
        this.paymentsFile = './database/payments.json'
        this.ordersFile = './database/orders.json'
        this.initFiles()
    }

    initFiles() {
        if (!fs.existsSync('./database')) {
            fs.mkdirSync('./database', { recursive: true })
        }
        
        if (!fs.existsSync(this.paymentsFile)) {
            fs.writeFileSync(this.paymentsFile, JSON.stringify([]))
        }
        
        if (!fs.existsSync(this.ordersFile)) {
            fs.writeFileSync(this.ordersFile, JSON.stringify([]))
        }
    }

    async createFlutterwavePayment(amount, email, name, phone) {
        try {
            const FLW_PUBLIC_KEY = 'YOUR_FLW_PUBLIC_KEY'
            const FLW_SECRET_KEY = 'YOUR_FLW_SECRET_KEY'
            
            const payload = {
                tx_ref: 'knox-' + Date.now(),
                amount: amount,
                currency: 'NGN',
                redirect_url: 'https://yourdomain.com/payment/callback',
                customer: {
                    email: email,
                    name: name,
                    phonenumber: phone
                },
                customizations: {
                    title: 'KNOX PANEL PAYMENT',
                    description: `Payment for panel - ₦${amount}`,
                    logo: 'https://files.catbox.moe/knox-logo.png'
                }
            }
            
            const { data } = await axios.post(
                'https://api.flutterwave.com/v3/payments',
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${FLW_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            
            if (data.status === 'success') {
                const payment = {
                    id: payload.tx_ref,
                    userId: phone,
                    amount: amount,
                    email: email,
                    status: 'pending',
                    link: data.data.link,
                    createdAt: Date.now()
                }
                
                this.savePayment(payment)
                
                return {
                    success: true,
                    paymentLink: data.data.link,
                    reference: payload.tx_ref
                }
            }
            
            return { success: false, message: 'Payment creation failed' }
            
        } catch (error) {
            console.error('Flutterwave error:', error)
            return { success: false, message: error.message }
        }
    }

    async verifyFlutterwavePayment(reference) {
        try {
            const FLW_SECRET_KEY = 'YOUR_FLW_SECRET_KEY'
            
            const { data } = await axios.get(
                `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
                {
                    headers: {
                        'Authorization': `Bearer ${FLW_SECRET_KEY}`
                    }
                }
            )
            
            if (data.status === 'success' && data.data.status === 'successful') {
                this.updatePaymentStatus(reference, 'completed')
                
                return {
                    success: true,
                    data: data.data
                }
            }
            
            return { success: false, message: 'Payment not verified' }
            
        } catch (error) {
            console.error('Verification error:', error)
            return { success: false, message: error.message }
        }
    }

    createManualOrder(userId, panelSize, customPrice = null) {
        const order = {
            id: 'order-' + Date.now(),
            userId: userId,
            panelSize: panelSize,
            price: customPrice || global.panelPrices[panelSize]?.price || 0,
            status: 'negotiation',
            createdAt: Date.now(),
            notes: []
        }
        
        this.saveOrder(order)
        
        return {
            success: true,
            orderId: order.id,
            message: 'Manual order created. Contact owner to negotiate.'
        }
    }

    savePayment(payment) {
        let payments = []
        try {
            payments = JSON.parse(fs.readFileSync(this.paymentsFile))
        } catch {
            payments = []
        }
        
        payments.push(payment)
        fs.writeFileSync(this.paymentsFile, JSON.stringify(payments, null, 2))
    }

    saveOrder(order) {
        let orders = []
        try {
            orders = JSON.parse(fs.readFileSync(this.ordersFile))
        } catch {
            orders = []
        }
        
        orders.push(order)
        fs.writeFileSync(this.ordersFile, JSON.stringify(orders, null, 2))
    }

    updatePaymentStatus(reference, status) {
        let payments = []
        try {
            payments = JSON.parse(fs.readFileSync(this.paymentsFile))
        } catch {
            return
        }
        
        const index = payments.findIndex(p => p.id === reference || p.reference === reference)
        if (index !== -1) {
            payments[index].status = status
            payments[index].updatedAt = Date.now()
            fs.writeFileSync(this.paymentsFile, JSON.stringify(payments, null, 2))
            
            if (status === 'completed') {
                this.createPanelAfterPayment(payments[index])
            }
        }
    }

    async createPanelAfterPayment(payment) {
        console.log('Creating panel for payment:', payment.id)
    }

    getOwnerVCF() {
        return 'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            `FN:${global.ownerName}\n` +
            `TEL;type=CELL;type=VOICE;waid=${global.ownerNumber}:+${global.ownerNumber}\n` +
            'END:VCARD'
    }
}

export default new PaymentSystem()