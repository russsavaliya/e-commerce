const Attributes = require("../../model/attributes");

// User: Get Attributes List (for filters)
exports.get_attributes_list = async (req, res) => {
    try {
        const attributes = await Attributes.find({})
            .select('name values _id')
            .sort({ name: 1 });

        return res.status(200).json({
            status: true,
            message: "Attributes fetched successfully",
            data: attributes
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

