const express = require('express')
const cors = require('cors')
const app = express()
const connectDB = require('./db/db')
require('dotenv').config()
const flightRouter = require('./routes/flight')
const userRouter = require('./routes/user')
const myflightrouter = require('./routes/myflight')
const passengerRouter = require('./routes/passenger')
const pdfRouter = require('./routes/pdf')
const paymentRouter = require('./routes/payment')
const { handleStripeWebhook } = require('./controllers/payment')
const bodyParser = require('body-parser');

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
    throw new Error('MONGO_URI is required')
}

app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

app.use(express.json())
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://flightbooking-backend-f0eafuafcpdaavfn.canadacentral-01.azurewebsites.net',
        'https://flight-booking-pdmr.vercel.app'
    ],
    credentials: true
}))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



app.use('/api/v1',flightRouter)
app.use('/api/v1',userRouter)
app.use('/api/v1',myflightrouter)
app.use('/api/v1',passengerRouter)
app.use('/api/v1',pdfRouter)
app.use('/api/v1',paymentRouter)


const port = process.env.PORT || 4000

const start = async () => {
    try {
        connectDB(MONGO_URI)
        app.listen(port,()=>{console.log(`listening to port ${port}`)})
    } catch (error) {
        console.log(error)
    }
}

start()
