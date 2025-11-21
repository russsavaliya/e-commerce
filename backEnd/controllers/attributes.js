
const Attributes = require("../model/attributes");
exports.create_attribute = async (req, res) => {
    const { name, values } = req.body;
    if (!name || !values) {
        return res.status(400).send({
            success: false,
            message: "All fields are required."
        });
    }
    let exit_attribute = await Attributes.findOne({ name: name });
    if (exit_attribute) {
        return res.status(400).send({
            success: false,
            message: "Attribute already exists."
        });
    }
    const attribute = await Attributes.create({
        name,
        values: typeof values === 'string' ? JSON.parse(values) : values,
    });
    return res.status(200).send({
        success: true,
        message: "Attribute created successfully.",
        data: attribute
    });
}

exports.update_attribute = async (req, res) => {
    const { name, values } = req.body;
    if (!req.params.id) {
        return res.status(400).send({
            success: false,
            message: "Attribute id is required."
        });
    }
    const attribute = await Attributes.findByIdAndUpdate(req.params.id, {
        name,
        values: typeof values === 'string' ? JSON.parse(values) : values
    }, { new: true });
    return res.status(200).send({
        success: true,
        message: "Attribute updated successfully.",
        data: attribute
    });
}
exports.get_attributes = async (req, res) => {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const attributes = await Attributes.find().skip(skip).limit(limit)
    const total_count = await Attributes.countDocuments();
    const total_pages = Math.ceil(total_count / limit);
    if (!attributes) {
        return res.status(200).send({
            success: false,
            message: "Attributes not found."
        });
    }
    return res.status(200).send({
        success: true,
        message: "Attributes fetched successfully.",
        data: { attributes, total_count, total_pages },
    });
}
exports.get_attributes_values = async (req, res) => {
    let id = req.query.id
    const attributes = await Attributes.findById(id)
    if (!attributes) {
        return res.status(200).send({
            success: false,
            message: "Attributes not found."
        });
    }
    return res.status(200).send({
        success: true,
        message: "Attributes fetched successfully.",
        data: attributes
    });
}

exports.delete_attribute = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({
            success: false,
            message: "Attribute id is required."
        });
    }
    const attribute = await Attributes.findByIdAndDelete(req.params.id);
    return res.status(200).send({
        success: true,
        message: "Attribute deleted successfully.",
        data: attribute
    });
}