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
        let data = await admin_model.find().populate('role')
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

exports.get_admin_list = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = '' } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        // Build search condition
        let searchCondition = {};
        if (search && search.trim()) {
            searchCondition = {
                $or: [
                    { name: { $regex: search.trim(), $options: 'i' } },
                    { email: { $regex: search.trim(), $options: 'i' } }
                ]
            };
        }

        const admins = await admin_model.find(searchCondition).populate('role', 'name title').skip(skip).limit(limit);

        const total_count = await admin_model.countDocuments(searchCondition);
        const total_pages = Math.ceil(total_count / limit);

        return res.status(200).json({
            status: true,
            message: "Admin list fetched successfully",
            data: {
                admins,
                total_count,
                total_pages,
                page,
                limit
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.delete_admin = async (req, res) => {
    try {
        let { id } = req.query;

        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Admin id is required"
            });
        }

        const admin = await admin_model.findById(id);

        if (!admin) {
            return res.status(404).json({
                status: false,
                message: "Admin not found"
            });
        }

        // Prevent deletion of super admin
        if (admin.isSuperAdmin === true) {
            return res.status(403).json({
                status: false,
                message: "Cannot delete super admin"
            });
        }

        await admin_model.findByIdAndDelete(id);

        return res.status(200).json({
            status: true,
            message: "Admin deleted successfully",
            data: admin
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.get_admin_profile = async (req, res) => {
    try {
        // Admin is already attached by authorization middleware
        const adminId = req.admin._id;
        
        const admin = await admin_model.findById(adminId).populate('role', 'name title permissions');

        if (!admin) {
            return res.status(404).json({
                status: false,
                message: "Admin not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Admin profile fetched successfully",
            data: admin
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.update_password = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: false,
                message: "New password must be at least 6 characters long"
            });
        }

        const admin = await admin_model.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                status: false,
                message: "Admin not found"
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        admin.password = hashedPassword;
        await admin.save();

        return res.status(200).json({
            status: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

