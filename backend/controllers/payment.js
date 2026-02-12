const Myflight = require('../models/Myflight')

function getStripeClient() {
    try {
        // Lazy load so backend can still boot if stripe isn't installed yet.
        const Stripe = require('stripe')
        const secretKey = process.env.STRIPE_SECRET_KEY
        if (!secretKey) return { error: 'STRIPE_SECRET_KEY is not configured' }
        return { stripe: new Stripe(secretKey) }
    } catch (error) {
        return { error: "Stripe SDK not installed. Run 'cd backend && npm install stripe'" }
    }
}

const createCheckoutSession = async (req, res) => {
    try {
        const { stripe, error } = getStripeClient()
        if (error) return res.status(500).json({ success: false, message: error })

        const { bookingId } = req.body
        if (!bookingId) {
            return res.status(400).json({ success: false, message: 'bookingId is required' })
        }

        const booking = await Myflight.findOne({ _id: bookingId, user: req.user.id })
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' })
        }

        const amount = Math.round(Number(booking.totalprice) * 100)
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid booking amount' })
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: amount,
                        product_data: {
                            name: `Eco Flights Booking ${booking._id}`,
                            description: `${booking.departurecode} -> ${booking.destinationcode}${booking.triptype === 'Return' ? ' (Return)' : ''}`,
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${frontendUrl}/dashboard/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking._id}`,
            cancel_url: `${frontendUrl}/dashboard/payment/cancel?booking_id=${booking._id}`,
            metadata: {
                bookingId: String(booking._id),
                userId: String(req.user.id),
            },
        })

        await Myflight.findByIdAndUpdate(booking._id, {
            paymentStatus: 'pending',
            stripeSessionId: session.id,
        })

        return res.status(200).json({
            success: true,
            url: session.url,
            sessionId: session.id,
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to create checkout session', error: error.message })
    }
}

const getCheckoutSessionStatus = async (req, res) => {
    try {
        const { stripe, error } = getStripeClient()
        if (error) return res.status(500).json({ success: false, message: error })

        const sessionId = req.query.session_id
        if (!sessionId) {
            return res.status(400).json({ success: false, message: 'session_id is required' })
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId)
        const booking = await Myflight.findOne({
            _id: session.metadata?.bookingId,
            user: req.user.id,
        })

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' })
        }

        return res.status(200).json({
            success: true,
            status: booking.paymentStatus,
            sessionPaymentStatus: session.payment_status,
            bookingId: String(booking._id),
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to fetch payment status', error: error.message })
    }
}

const handleStripeWebhook = async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const signature = req.headers['stripe-signature']

    const { stripe, error } = getStripeClient()
    if (error) return res.status(500).send(`Webhook error: ${error}`)
    if (!webhookSecret) return res.status(500).send('Webhook error: STRIPE_WEBHOOK_SECRET is not configured')
    if (!signature) return res.status(400).send('Webhook error: Missing stripe-signature header')

    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
    } catch (err) {
        return res.status(400).send(`Webhook signature verification failed: ${err.message}`)
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const bookingId = session.metadata?.bookingId
            if (bookingId) {
                await Myflight.findByIdAndUpdate(bookingId, {
                    paymentStatus: 'paid',
                    stripeSessionId: session.id,
                    stripePaymentIntentId: session.payment_intent || '',
                    paidAt: new Date(),
                })
            }
        }

        if (event.type === 'checkout.session.expired') {
            const session = event.data.object
            const bookingId = session.metadata?.bookingId
            if (bookingId) {
                await Myflight.findByIdAndUpdate(bookingId, {
                    paymentStatus: 'expired',
                    stripeSessionId: session.id,
                })
            }
        }

        return res.status(200).json({ received: true })
    } catch (error) {
        return res.status(500).send(`Webhook handling failed: ${error.message}`)
    }
}

module.exports = {
    createCheckoutSession,
    getCheckoutSessionStatus,
    handleStripeWebhook,
}
