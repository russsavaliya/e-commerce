const admin_model = require('../model/admin')
const jwt = require('jsonwebtoken')

exports.authorization = async function (req, res, next) {
    try {

        let token = req.headers.admin_token
        if (!token) {
            return res.status(500).json({
                status: false,
                message: 'Plz Enter a Token'
            })

        }

        let verifytoken = await jwt.verify(token, 'rushabh')
        if (!verifytoken) {
            return res.status(500).json({
                status: false,
                message: 'invalid token'

            })
        }

        let usercheck = await admin_model.findOne({
            _id: verifytoken.id
        }).populate('role', 'permissions')

        if (!usercheck) {
            return res.status(500).json({
                status: false,
                message: 'User Not Found'

            })
        }
        req.admin = usercheck
        next()
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message

        })
    }
}