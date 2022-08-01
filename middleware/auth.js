const jwt = require("jsonwebtoken")
const config = require("../config/connection")
const User = require("../models/user")

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]

        const verify = jwt.verify(token, config.tokenKey)
        req.user = await User.findById(verify.userId);
        next()
    }
    catch (error) {
        return res.status(401).json({
            msg: "invalid token"
        })
    }
}
exports.verify = async (token) => {
    try {
        const verify = jwt.verify(token, config.tokenKey)
        let user = await User.findById(verify.userId);
        console.log(user,"user")
        if (!user) {
            return false
        }
        return true
    }
    catch (error) {
        return res.status(401).json({
            msg: "invalid token"
        })
    }
}