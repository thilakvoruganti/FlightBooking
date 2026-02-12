const express = require('express')
const router = express.Router()
const {
    allflights,
    createFlight,
    getAirports,
    fetchFlightsFromAmadeus,
    syncFlightsFromAmadeus,
} = require('../controllers/flight')


router.get('/airports', getAirports)
router.get('/flights',allflights)
router.post('/flights',createFlight)
router.get('/flights/amadeus', fetchFlightsFromAmadeus)
router.post('/flights/sync', syncFlightsFromAmadeus)

module.exports = router
