const admin_model = require('../model/admin')
const jwt = require('jsonwebtoken')

exports.authorization = async function (req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        let token;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }

        if (!token) {
            return res.status(401).json({
                status: false,
                message: 'No token provided'
            });
        }

        // ✅ verify token (sync)
        let verifytoken;
        try {
            verifytoken = jwt.verify(token, 'rushabh');
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: 'Token expired or invalid'
            });
        }

        const usercheck = await admin_model
            .findOne({ _id: verifytoken.id })
            .populate('role', 'permissions');

        if (!usercheck) {
            return res.status(404).json({
                status: false,
                message: 'User Not Found'
            });
        }

        req.admin = usercheck;
        next();

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// exports.authorization = async function (req, res, next) {
//     try {

//         // Extract Bearer token from Authorization header
//         const authHeader = req.headers.authorization;
//         let token;
        
//         if (authHeader && authHeader.startsWith('Bearer ')) {
//             token = authHeader.slice(7); // Remove "Bearer " prefix
//         }
        
//         if (!token) {
//             return res.status(401).json({
//                 status: false,
//                 message: 'no token provided'
//             })

//         }

//         let verifytoken = await jwt.verify(token, 'rushabh')
//         if (!verifytoken) {
//             return res.status(500).json({
//                 status: false,
//                 message: 'invalid token'

//             })
//         }

//         let usercheck = await admin_model.findOne({
//             _id: verifytoken.id
//         }).populate('role', 'permissions')

//         if (!usercheck) {
//             return res.status(500).json({
//                 status: false,
//                 message: 'User Not Found'

//             })
//         }
//         req.admin = usercheck
//         next()
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message

//         })
//     }
// }