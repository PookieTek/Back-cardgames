const axios = require('axios');

async function FeedSteam() {
    const data = await axios.get("http://api.steampowered.com/ISteamApps/GetAppList/v0002/")
    return data.data.applist.apps;
}

module.exports = {
    FeedSteam
};