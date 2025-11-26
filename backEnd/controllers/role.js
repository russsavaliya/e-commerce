const role_model = require("../model/role");

exports.create_role = async (req, res) => {
    try {
        let { name, title, permissions } = req.body;
        
        if (!name || !title || !permissions) {
            return res.status(400).json({
                status: false,
                message: "Name, title, and permissions are required"
            });
        }

        let exist_role = await role_model.findOne({ name: name });
        if (exist_role) {
            return res.status(400).json({
                status: false,
                message: "Role already exists"
            });
        }

        const role = await role_model.create({
            name: name,
            title: title,
            permissions: Array.isArray(permissions) ? permissions : [permissions]
        });

        return res.status(201).json({
            status: true,
            message: "Role created successfully",
            data: role
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.get_role_list = async (req, res) => {
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
                    { title: { $regex: search.trim(), $options: 'i' } }
                ]
            };
        }

        const roles = await role_model.find(searchCondition).skip(skip).limit(limit);

        const total_count = await role_model.countDocuments(searchCondition);
        const total_pages = Math.ceil(total_count / limit);

        return res.status(200).json({
            status: true,
            message: "Role list fetched successfully",
            data: {
                roles,
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

exports.get_role_one = async (req, res) => {
    try {
        let { id } = req.query;

        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Role id is required"
            });
        }

        const role = await role_model.findById(id);

        if (!role) {
            return res.status(404).json({
                status: false,
                message: "Role not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Role fetched successfully",
            data: role
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.update_role = async (req, res) => {
    try {
        let { id } = req.query;
        let { name, title, permissions } = req.body;

        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Role id is required"
            });
        }

        let exist_role = await role_model.findOne({ name: name, _id: { $ne: id } });
        if (exist_role) {
            return res.status(400).json({
                status: false,
                message: "Role name already exists"
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (title) updateData.title = title;
        if (permissions) {
            updateData.permissions = Array.isArray(permissions) ? permissions : [permissions];
        }

        const role = await role_model.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!role) {
            return res.status(404).json({
                status: false,
                message: "Role not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Role updated successfully",
            data: role
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.delete_role = async (req, res) => {
    try {
        let { id } = req.query;

        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Role id is required"
            });
        }

        const role = await role_model.findByIdAndDelete(id);

        if (!role) {
            return res.status(404).json({
                status: false,
                message: "Role not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Role deleted successfully",
            data: role
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

