const admin_model = require("../model/admin")
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
exports.signup = async function (req, res, next) {
    try {
        let { name, email, password, role } = req.body
        let admin = await admin_model.findOne({
            email: email
        })

        if (admin) {
            return res.status(500).json({
                status: false,
                message: 'email alredy exists'
            })
        }
        password = await bcrypt.hash(password, 10)

        let data = await admin_model.create({
            name: name,
            email: email,
            password: password,
            role: role
        })
        const token = await jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            id: data._id
        }, 'rushabh');

        return res.status(200).json({
            status: true,
            message: 'admin created successfully',
            data,
            token
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}
exports.login = async function (req, res, next) {
    try {
        let { email, password } = req.body
        let check_email = await admin_model.findOne({
            email: email
        })
        if (!check_email) {
            return res.status(500).json({
                status: false,
                message: "Plz Check Your Email User Not Found"

            })
        }

        let checkpassword = await bcrypt.compare(password, check_email.password)
        if (!checkpassword) {
            throw new Error('password do not match')
        }

        var token = await jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            id: check_email._id
        }, 'rushabh');

        return res.status(200).json({
            status: true,
            message: 'login success',
            result: {
                token,
                name: check_email.name
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: error.message

        })
    }
}


exports.read = async function (req, res, next) {
    try {
        let data = await adminModel.find().populate('role')
        res.status(200).json({
            status: true,
            message: 'all user',
            data
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message

        })
    }
}

