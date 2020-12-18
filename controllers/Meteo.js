const User = require('../models/User');
const Meteo = require('../models/Meteo');
const axios = require('axios');
const { METEO_KEY } = require('../Config');

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?q=";

async function getData(city) {
    const url = BASE_URL + city + '&appid=' + METEO_KEY + '&lang=fr';
    const data = await axios.get(url)
    return data;
}

exports.AddModule = async (req, res, next) => {
    if (!req.body.city || !req.body.temp || !req.body.timer)
        return res.status(401).json({error: "params missing"});
    const weather = new Meteo({
        originX: 0,
        originY: 0,
        width: 300,
        height: 300,
        refreshTimer: req.body.timer,
        city: req.body.city,
        celsius: req.body.temp
    });
    weather.save();
    await User.findOneAndUpdate({_id: res.locals.user}, {
        $push: {
            meteo: weather._id
        }
    })
    if (weather)
        return res.status(201).json({weather});
}

exports.UpdateModule = async (req, res, next) => {
    if (!req.body.city || !req.body.timer || !req.body.id)
        return res.status(401).json({error: "params missing"});
    const weather = await Meteo.findOneAndUpdate({_id: req.body.id}, {
        $set: {
            refreshTimer: req.body.timer,
            city: req.body.city,
            celsius: req.body.temp
        }}, {new: true}
    ).then(result => res.status(201).json({result}))
     .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
     });
}

exports.DeleteModule = async (req, res, next) => {
    if (!req.body.id)
        return res.status(401).json({error: "params missing"});
    const user = await User.findOneAndUpdate({_id: res.locals.user}, {
        $pull: {
            meteo: req.body.id
        }
    },{new: true})
    Promise.resolve(user);
    await Meteo.deleteOne({_id: req.body.id})
    return res.status(201).json("ok")
}

exports.MoveModule = async (req, res, next) => {
    const originX = (req.body.originX ? req.body.originX : 0)
    const originY = (req.body.originY ? req.body.originY : 0)
    if (!req.body.width || !req.body.height || !req.body.id)
        return res.status(401).json({error: "params missing"});
    const weather = await Meteo.findOneAndUpdate({_id: req.body.id}, {
        $set : {
            originX: originX,
            originY: originY,
            width: req.body.width,
            height: req.body.height
        }
    }, {new: true})
    .then(weather => res.status(201).json({weather}))
    .catch(err => res.status(500).json({error: err}));
}

exports.GetModuleById = async (req, res, next) => {
    if (!req.params.id)
        return res.status(401).json({error: "params missing"});
    const weather = await Meteo.findOne({_id: req.params.id});
    if (!weather)
        return res.status(500).json({error: "No Widget found"})
    var data = await getData(weather.city);
    data = data.data;
    const result = {
        widget: weather,
        temp: (weather.celsius ? data.main.temp - 273.15 : (data.main.temp - 273.15) * 9/5 + 32),
        humidity: 75,
        wind: data.wind.speed,
        country: data.sys.country,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        weather: {
            description: data.weather[0].description,
            icon: 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png'
        }
    }
    return res.status(200).json({result});
}