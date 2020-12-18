const mongoose = require('mongoose');

// Widget : 
// - T° / City    (Documentation = https://openweathermap.org/current )             api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

const meteoSchema = mongoose.Schema({
    originX: {
        type: Number,
    },
    originY: {
        type: Number,
    },
    width: {
        type: Number,
    },
    height: {
        type: Number,
    },
    refreshTimer: {
        type: Number,
    },
    city: {
        type: String,
        required: true
    },
    celsius: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('meteo', meteoSchema, 'meteo');