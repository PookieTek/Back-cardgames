const User = require('../models/User');
const Youtube = require('../models/Youtube');

exports.AddModule = async (req, res, next) => {
    if (!req.body.timer)
        return res.status(401).json({error: "params missing"});
    const youtube = new Youtube({
        originX: 0,
        originY: 0,
        width: 300,
        height: 300,
        refreshTimer: req.body.timer,
    });
    youtube.save();
    await User.findOneAndUpdate({_id: res.locals.user}, {
        $push: {
            youtube: youtube._id
        }
    })
    if (youtube)
        return res.status(201).json({youtube});
}

exports.UpdateModule = async (req, res, next) => {
    if (!req.body.timer || !req.body.id)
        return res.status(401).json({error: "params missing"});
    const youtube = await Youtube.findOneAndUpdate({_id: req.body.id}, {
        $set: {
            refreshTimer: req.body.timer,
        }}, {new: true}
    ).then(youtube => res.status(201).json({youtube}))
     .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
     });
}

exports.DeleteModule = async (req, res, next) => {
    if (!req.body.id)
        return res.status(401).json({error: "params missing"});
    await Youtube.deleteOne({_id: req.body.id})
    const user = await User.findOneAndUpdate({_id: res.locals.user}, {
        $pull: {
            youtube: req.body.id
        }
    },{new: true})
    return res.status(201).json("ok")
}

exports.MoveModule = async (req, res, next) => {
    const originX = (req.body.originX ? req.body.originX : 0)
    const originY = (req.body.originY ? req.body.originY : 0)
    if (!req.body.width || !req.body.height || !req.body.id)
        return res.status(401).json({error: "params missing"});
    const youtube = await Youtube.findOneAndUpdate({_id: req.body.id}, {
        $set : {
            originX: originX,
            originY: originY,
            width: req.body.width,
            height: req.body.height
        }
    }, {new: true})
    .then(youtube => res.status(201).json({youtube}))
    .catch(err => res.status(500).json({error: err}));
}

exports.GetModuleById = async (req, res, next) => {
    if (!req.params.id)
        return res.status(401).json({error: "params missing"});
    const youtube = await Youtube.findOne({_id: req.params.id});
    if (!youtube)
        return res.status(500).json({error: "No Widget found"})
    return res.status(200).json({youtube});
}