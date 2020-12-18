const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userid = decoded.userId;
        if (req.body.userid && req.body.userid !== userid)
            throw 'invalid id';
        else {
            res.locals.user = userid;
            next();
        }
    } catch (e) {
        res.status(401).json({e});
    }
}