const User = require('../models/User');
const Discord = require('../models/Discord');
const Youtube = require('../models/Youtube');
const Meteo = require('../models/Meteo');
const Steam = require('../models/Steam');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { google } = require('googleapis');
const axios = require('axios');
const { GOOGLE_CLIENT, GOOGLE_SECRET } = require('../Config');

const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
];
const Oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT,
    GOOGLE_SECRET,
    "http://localhost:8081/googleVerify"
);

google.options({
    auth: Oauth2Client
});


async function getgoogleinfo({ code }) {
    code = decodeURIComponent(code);
    try {
        const { tokens } = await Oauth2Client.getToken(code);
        Oauth2Client.setCredentials(tokens);
        const us = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`, {
            headers: {
                Authorization: `Bearer ${tokens.id_token}`,
            },
        },
        )
        .then(res => res.data)
        .catch(error => {
            throw new Error(error.message);
        });
        return us;
    } catch (e) {
        return;
    }
}

exports.getConnexionUrl = (req, res, next) => {
    const uri = Oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    return res.status(200).json({url: uri});
};

exports.getUserInfo = async (req, res, next) => {
    if (!req.body.code)
        return res.status(401).json({error: "params missing"});
    const info = await getgoogleinfo({code: req.body.code});
    if (!info)
        return res.status(401).json({error: "Bad Code"});
    var check = await User.findOne({email: info.email})
    if (!check) {
        check = new User({
            email: info.email,
            firstname: info.given_name,
            lastname: info.family_name
        });
        check.save()
    }
    return res.status(201).json({
        userId: check._id,
        token: jwt.sign(
            {userId: check._id},
            'RANDOM_TOKEN_SECRET',
            {expiresIn: '24h'}
        )
    });
};

exports.signup = async (req, res, next) => {
    if (!req.body.email || !req.body.password)
        return res.status(401).json({error: "params missing"});
    const check = await User.findOne({email: req.body.email})
    if (check)
        return res.status(401).json({error: "Email alreay in use"})
    bcrypt.hash(req.body.password, 10)
    .then (hash => {
        const client = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hash
        });
        client.save()
            .then(() => res.status(201).json({client}))
            .catch(err => res.status(500).json({err}));
    }).catch(err => res.status(500).json({err}));
}

exports.login = async (req, res, next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if (!user)
            return res.status(401).json({error: "user not found"});
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid)
                    return res.status(401).json({error: "invalid password"});
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        {userId: user._id},
                        'RANDOM_TOKEN_SECRET',
                        {expiresIn: '24h'}
                    )
                });
            }).catch(err => res.status(501).json({error: err}));
    }).catch (err => res.status(400).json({error: err}));
};

exports.me = async (req, res, next) => {
    const user = await User.findOne({_id: res.locals.user})
    if (!user)
        return res.status(500).json({error: "no user found"});
    return res.status(200).json(user);
}

exports.update = async(req, res, next) => {
    if (!req.body.firstname || !req.body.lastname)
        return res.status(500).json({err: "params missing"});
    var user = await User.findOne({_id: res.locals.user})
    if (!user)
        return res.status(500).json({error: "no user found"});
    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    user.save();
    return res.status(201).json(user);
}

exports.changePwd = async(req, res, next) => {
    if (!req.body.last || !req.body.new)
        return res.status(500).json({err: "params missing"})
    var user = await User.findOne({_id: res.locals.user});
    bcrypt.compare(req.body.last, user.password)
            .then(valid =>  {
                if (!valid)
                    return res.status(401).json({error: "invalid password"});
                bcrypt.hash(req.body.new, 10)
                .then(hash => {
                    user.password = hash;
                    user.save();
                })
                res.status(200).json({message: "ok"});
            }).catch(err => res.status(501).json({error: err}));
}

exports.deleteMe = async(req, res, next) => {
    const user = await User.findOne({_id: res.locals.user});
    if (!user)
        return res.status(400).json({err: "no user"})
    Steam.deleteMany({
        _id: {
            $in: user.steam
        }
    })
    Meteo.deleteMany({
        _id: {
            $in: user.meteo
        }
    })
    Discord.deleteMany({
        _id: {
            $in: user.discord
        }
    })
    Youtube.deleteMany({
        _id: {
            $in: user.youtube
        }
    })
    User.deleteOne({_id: res.locals.user})
    .catch(err => console.log(err))
    return res.status(201).json({message: "ok"});
}