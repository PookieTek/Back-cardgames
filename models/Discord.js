const mongoose = require('mongoose');

// Widget : 
// - Friends online         https://discord.com/api/users/@me/connections

// Get Invite      https://discord.com/api/invites/{invite.code}

const discordSchema = mongoose.Schema({
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
    token: {
        type: String
    },
    tokentype : {
        type: String
    }
});

module.exports = mongoose.model('discord', discordSchema, 'discord');