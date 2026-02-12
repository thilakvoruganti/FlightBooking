const express = require('express')
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
const { createCheckoutSession, getCheckoutSessionStatus } = require('../controllers/payment')

router.post('/auth/payments/create-checkout-session', fetchuser, createCheckoutSession)
router.get('/auth/payments/session-status', fetchuser, getCheckoutSessionStatus)

module.exports = router
