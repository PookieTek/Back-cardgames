const mongoose = require('mongoose');
const youtubeSchema = mongoose.Schema({
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
});

module.exports = mongoose.model('youtube', youtubeSchema, 'youtube');
