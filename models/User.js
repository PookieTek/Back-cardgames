const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    google_token: {
        type: String,
    },
    steam: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'steam'
    }],
    meteo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'meteo'
    }],
    discord: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'discord'
    }],
    youtube: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'youtube'
    }],
    news: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'news'
    }]
});

module.exports = mongoose.model('user', userSchema, 'user');