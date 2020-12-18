const User = require('../models/User');
const Discord = require('../models/Discord');
const { DISCORD_CLIENT, DISCORD_SECRET } = require('../Config');
const qs = require('qs');
const axios = require('axios');

const BASE_URL = "https://discord.com/api/oauth2/authorize?client_id=" + DISCORD_CLIENT +"&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Fdiscord%2Fauth&response_type=code&scope=identify%20email%20guilds";



exports.AddModule = async (req, res, next) => {
    if (!req.body.timer || !req.body.code)
        return res.status(401).json({error: "params missing"});
    const tokens = await GetTokens(req.body.code);
    const discord =  await Discord.create({
        originX: 0,
        originY: 0,
        width: 300,
        height: 300,
        token: tokens.access_token,
        tokentype: tokens.token_type,
        refreshTimer: req.body.timer
    });
    await User.findOneAndUpdate({_id: res.locals.user}, {
        $push: {
            discord: discord._id
        }
    })
    if (discord)
        return res.status(201).json({discord});
}

exports.UpdateModule = async (req, res, next) => {
    if (!req.body.timer || !req.body.id)
        return res.status(401).json({error: "params missing"});
    const discord = await Discord.findOneAndUpdate({_id: req.body.id}, {
        $set: {
            refreshTimer: req.body.timer,
        }}, {new: true}
    ).then(discord => res.status(201).json({discord}))
     .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
     });
}

exports.DeleteModule = async (req, res, next) => {
    if (!req.body.id)
        return res.status(401).json({error: "params missing"});
    await Discord.deleteOne({_id: req.body.id})
    const user = await User.findOneAndUpdate({_id: res.locals.user}, {
        $pull: {
            discord: req.body.id
        }
    },{new: true})
    return res.status(201).json("ok")
}

exports.MoveModule = async (req, res, next) => {
    const originX = (req.body.originX ? req.body.originX : 0)
    const originY = (req.body.originY ? req.body.originY : 0)
    if (!req.body.width || !req.body.height || !req.body.id)
        return res.status(401).json({error: "params missing"});
    const discord = await Discord.findOneAndUpdate({_id: req.body.id}, {
        $set : {
            originX: originX,
            originY: originY,
            width: req.body.width,
            height: req.body.height
        }
    }, {new: true})
    .then(discord => res.status(201).json({discord}))
    .catch(err => res.status(500).json({error: err}));
}

exports.GetModuleById = async (req, res, next) => {
    if (!req.params.id)
        return res.status(401).json({error: "params missing"});
    const discord = await Discord.findOne({_id: req.params.id});
    if (!discord)
        return res.status(500).json({error: "No Widget found"})
    return res.status(200).json({discord});
}

exports.GetLogin = (req, res, next) => {
    return res.status(200).json({url: BASE_URL});
}

exports.GetMe = async (req, res, next) => {
    if (!req.params.id)
        return res.status(401).json({error: "params missing"})
    const discord = await Discord.findOne({_id: req.params.id})
    if (!discord)
        return res.status(500).json({err: "no widget found"});
    const data = await GetUserInfo(discord);
    if (!data)
        return res.status(500).json({err: "no info"});
    return res.status(200).json(data);
}

exports.GetFriends = async(req, res, next) => {
    if (!req.params.id)
        return res.status(401).json({error: "params missing"})
    const discord = await Discord.findOne({_id: req.params.id})
    if (!discord)
        return res.status(500).json({err: "no widget found"});
    const data = await GetFriends(discord);
    if (!data)
        return res.status(500).json({err: "no info"});
    return res.status(200).json(data);
}

async function GetUserInfo(tokens) {
    const data = await axios.get("https://discord.com/api/users/@me", {
        headers: {
            authorization: `${tokens.tokentype} ${tokens.token}`
        }
    }).then(res => {return res.data})
    Promise.resolve(data);
    console.log(data)
    return data;
}

async function GetTokens(code) {
    const data = await axios({
        method: 'post',
        url: 'https://discord.com/api/oauth2/token',
        data: qs.stringify({
            'client_id': DISCORD_CLIENT,
            'client_secret': DISCORD_SECRET,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': 'http://localhost:8081/discord/auth',
            'scope': 'identify email guilds'
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(res => {return res.data})
    .catch(err => console.log(err))
    Promise.resolve(data);
    console.log(data)
    return data;
}

async function GetFriends(discord) {
    const data = await axios.get("https://discord.com/api/users/@me/guilds", {
        headers: {
            Authorization: `${discord.tokentype} ${discord.token}`
        }
    }).then(res => {
        console.log(res)
        return res.data
    })
    Promise.resolve(data)
    console.log(data)
    return data;
}