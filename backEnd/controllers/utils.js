const { add_random_data } = require("../helper/utils");

exports.add_random_data = async (req, res) => {
    try {
        const result = await add_random_data();
        
        if (result.success) {
            return res.status(200).json({
                status: true,
                message: result.message,
                data: result.data
            });
        } else {
            return res.status(500).json({
                status: false,
                message: result.message,
                error: result.error?.message
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

