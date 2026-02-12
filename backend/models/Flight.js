const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightname:{
        type:String,
        required: true
    },
    flightnumber:{
        type:String,
        required: true,
    },
    economyprice:{
        type:Number,
        required: true,
    },
    premiumprice:{
        type:Number,
        required: true,
    },
    departure:{
        type:String,
        required: true,
    },
    departuretime:{
        type:String,
        required: true,
    },
    departureairport:{
        type:String,
    },
    departurecode:{
        type:String,
        required: true,
    },
    destination:{
        type:String,
        required: true,
    },
    destinationtime:{
        type:String,
        required: true,
    },
    destinationairport:{
        type:String,
        required: true,
    },
    destinationcode:{
        type:String,
        required: true,
    },
    departuredate:{
        type:String,
    },
    destinationdate:{
        type:String,
    },
    duration:{
        type:String,
    },
    stops:{
        type:Number,
    },
    distancekm:{
        type:Number,
    },
    co2kg:{
        type:Number,
    },
    ecolevel:{
        type:String,
    },
    ecocomparison:{
        type:String,
    },
    source:{
        type:String,
        default: 'manual',
    },
    lastsyncedat:{
        type:Date,
    },
})


module.exports = mongoose.model('Flight',flightSchema)
