const User = require('../models/User');
const News = require('../models/News');
const { NEWS_API } = require('../Config');
const axios = require('axios');

const BASE_URL = "http://newsapi.org/v2/everything?q=";

exports.AddModule = async (req, res, next) => {
    if (!req.body.timer || !req.body.info)
        return res.status(401).json({error: "params missing"});
    const news =  await News.create({
        originX: 0,
        originY: 0,
        width: 300,
        height: 300,
        config: req.body.info,
        refreshTimer: req.body.timer
    });
    await User.findOneAndUpdate({_id: res.locals.user}, {
        $push: {
            news: news._id
        }
    })
    if (news)
        return res.status(201).json({news});
}

exports.UpdateModule = async (req, res, next) => {
    if (!req.body.timer || !req.body.id || !req.body.info)
        return res.status(401).json({error: "params missing"});
    const news = await News.findOneAndUpdate({_id: req.body.id}, {
        $set: {
            config: req.body.info,
            refreshTimer: req.body.timer,
        }}, {new: true}
    ).then(news => res.status(201).json({news}))
     .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
     });
}

exports.DeleteModule = async (req, res, next) => {
    if (!req.body.id)
        return res.status(401).json({error: "params missing"});
    await News.deleteOne({_id: req.body.id})
    const user = await User.findOneAndUpdate({_id: res.locals.user}, {
        $pull: {
            news: req.body.id
        }
    },{new: true})
    return res.status(201).json("ok")
}

exports.MoveModule = async (req, res, next) => {
    const originX = (req.body.originX ? req.body.originX : 0)
    const originY = (req.body.originY ? req.body.originY : 0)
    if (!req.body.width || !req.body.height || !req.body.id)
        return res.status(401).json({error: "params missing"});
    const news = await News.findOneAndUpdate({_id: req.body.id}, {
        $set : {
            originX: originX,
            originY: originY,
            width: req.body.width,
            height: req.body.height
        }
    }, {new: true})
    .then(news => res.status(201).json({news}))
    .catch(err => res.status(500).json({error: err}));
}

exports.GetModuleById = async (req, res, next) => {
    if (!req.params.id)
        return res.status(401).json({error: "params missing"});
    const news = await News.findOne({_id: req.params.id})
    .catch(err => console.log(err))
    if (!news)
        return res.status(500).json({error: "No Widget found"})
    const date = new Date(Date.now() - 86400000);
    const data = await axios.get(BASE_URL + news.config + "&from=" + date.toISOString() + "&sortBy=publishedAt&language=fr&page=1&apiKey=" + NEWS_API)
    .catch(err => console.log(err));
    Promise.resolve(data);
    return res.status(200).json({
        articles : data.data.articles,
        widget: news
    });
}