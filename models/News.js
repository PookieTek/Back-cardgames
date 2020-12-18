const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
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
    config : {
        type: String
    }
});

module.exports = mongoose.model('news', newsSchema, 'news');