const User = require('../models/User');
const Steam = require('../models/Steam');
const {STEAM_WEB_API_KEY} = require('../Config')
const axios = require('axios');
const {FeedSteam} = require('../Constant');

const BASE_URL = "http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/"
var steamdb = FeedSteam();

exports.AddModule = async (req, res, next) => {
    if (!req.body.timer || !req.body.steamid || !req.body.type)
        return res.status(401).json({error: "params missing"});
    const steam = new Steam({
        originX: 0,
        originY: 0,
        width: 300,
        height: 300,
        type: req.body.type,
        steamid: req.body.steamid,
        refreshTimer: req.body.timer
    });
    steam.save();
    await User.findOneAndUpdate({_id: res.locals.user}, {
        $push: {
            steam: steam._id
        }
    })
    if (steam)
        return res.status(201).json({steam});
}

exports.UpdateModule = async (req, res, next) => {
    if (!req.body.timer || !req.body.type || !req.body.id)
        return res.status(401).json({error: "params missing"});
    const steam = await Steam.findOneAndUpdate({_id: req.body.id}, {
        $set: {
            refreshTimer: req.body.timer,
            type: req.body.type
        }}, {new: true}
    ).then(steam => res.status(201).json({steam}))
     .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
     });
}

exports.DeleteModule = async (req, res, next) => {
    if (!req.body.id)
        return res.status(401).json({error: "params missing"});
    await Steam.deleteOne({_id: req.body.id})
    const user = await User.findOneAndUpdate({_id: res.locals.user}, {
        $pull: {
            steam: req.body.id
        }
    },{new: true})
    return res.status(201).json("ok")
}

exports.MoveModule = async (req, res, next) => {
    const originX = (req.body.originX ? req.body.originX : 0)
    const originY = (req.body.originY ? req.body.originY : 0)
    if (!req.body.width || !req.body.height || !req.body.id)
        return res.status(401).json({error: "params missing"});
    const steam = await Steam.findOneAndUpdate({_id: req.body.id}, {
        $set : {
            originX: originX,
            originY: originY,
            width: req.body.width,
            height: req.body.height
        }
    }, {new: true})
    .then(steam => res.status(201).json({steam}))
    .catch(err => res.status(500).json({error: err}));
}

exports.GetModuleById = async (req, res, next) => {
    if (!req.params.id)
        return res.status(401).json({error: "params missing"});
    const steam = await Steam.findOne({_id: req.params.id});
    if (!steam)
        return res.status(500).json({error: "No Widget found"})
    return res.status(200).json({steam});
}

exports.GetTimesGame = async(req, res, next) => {
    if (!req.params.id)
        return res.status(401).json({error: "params missing"});
    const steam = await Steam.findOne({_id: req.params.id});
    if (!steam)
        return res.status(500).json({error: "No Widget found"})
    data = {
        widget: steam,
    };
    data.games = await GetRecentGames(steam.steamid)
    return res.status(200).json({data})
}

exports.GetPlayerByGame = async(req, res, next) => {
    if (!req.params.appid)
        return res.status(401).json({error: "params missing"});
    const game = decodeURIComponent(req.params.appid);
    const data = await GetPlayers(game)
    const details = await GetGameDetails(game)
    if (!details || !data)
        return res.status(400).json({err: "No game found"});
    return res.status(200).json({
        name: details.name,
        type: details.type,
        image: details.header_image,
        author: details.developers[0],
        price: details && details.is_free ? "free" : details.price_overview.final_formatted,
        store: "https://store.steampowered.com/app/" + game,
        players: data
    })
}

exports.GetFriendList = async(req, res, next) => {
    if (!req.params.id)
        return res.status(401).json({error: "params missing"})
    const steam = await Steam.findOne({_id: req.params.id});
    if (!steam)
        return res.status(401).json({error: "No Widget"})
    const friendlist = await GetFriendList(steam.steamid)
    const resp = [];
    const promise = Promise.all(friendlist.map(f => {
        return GetPlayerInfo(f);
    })).then(res => {
        resp.push(res)
    }).catch(err => console.log(err))
    Promise.resolve(promise)
    .then(() => res.status(200).json(resp))
}

exports.SearchGame = async(req, res, next) => {
    if (!req.params.name)
        return res.status(401).json({error: "params missing"})
    const name = decodeURIComponent(req.params.name);
    if (!steamdb)   
        return res.status(500).json("loading")
    Promise.resolve(steamdb)
    .then(result => {
        const regex = new RegExp(`\\b${name}(\\w | \\b)`, 'gi');
        const data = result.filter(val => val.name.match(regex, '/i'));
        res.status(200).json({data})
    }).catch(() => res.status(500).json({err: "loading"}))
}

async function GetPlayerInfo(player) {
    const data = await axios.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key="+ STEAM_WEB_API_KEY +"&steamids=" + player.steamid)
    const res = data.data.response.players[0];
    const resp = {
        name: res.personaname,
        url: res.profileurl,
        avatar: res.avatar
    }
    return resp;
}

async function GetFriendList(steamid) {
    const data = await axios.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key="+ STEAM_WEB_API_KEY +"&steamid="+ steamid +"&relationship=friend")
    return data.data.friendslist.friends;
}

async function GetPlayers(appid) {
    const data = await axios.get("http://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid="+appid)
    .then((resp) => {return resp.data.response.player_count})
    .catch(() => {return null})
    return data
}

async function GetGameDetails(appid) {
    const data = await axios.get("https://store.steampowered.com/api/appdetails?appids=" + appid)
    .then(res => {return res.data[appid].data})
    .catch(() => { return null})
    return data;
}

async function GetRecentGames(steamid) {
    const data = await axios.get(BASE_URL + "?key=" + STEAM_WEB_API_KEY + "&steamid=" + steamid + "&format=json")
    return data.data;
}