const mongoose = require('mongoose');

// Widget : 
// - Times on game (1)
// - N° Player on search game (2)
// - Friend List (3) ?      http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&steamid=76561197960435530&relationship=friend

// Get Global Stats For Games      http://api.steampowered.com/ISteamUserStats/GetGlobalStatsForGame/v0001/?format=xml&appid=17740&count=1&name%5B0%5D=global.map.emp_isle



const steamSchema = mongoose.Schema({
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
    type: {
        type: Number,
        required: true,
    },
    steamid: {
        type: String,
    }
});

module.exports = mongoose.model('steam', steamSchema, 'steam');
