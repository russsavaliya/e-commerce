/**
 * Checkout Controller
 * Handles checkout-related operations like pincode validation
 */

const axios = require('axios');

// Validate pincode using external API
exports.validate_pincode = async (req, res) => {
    try {
        const { pincode } = req.query;

        if (!pincode) {
            return res.status(400).json({
                status: false,
                message: 'Pincode is required'
            });
        }

        // Validate format first (6 digits, first digit 1-9)
        if (!/^[1-9][0-9]{5}$/.test(pincode)) {
            return res.status(200).json({
                status: false,
                message: 'Invalid pincode format',
                valid: false
            });
        }

        // Try to validate using external API
        try {
            // Using postalpincode.in API (free, no API key required)
            const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
                timeout: 5000
            });

            if (response.data && response.data[0]) {
                const data = response.data[0];
                console.log(data);
                if (data.Status === 'Success' && data.PostOffice && data.PostOffice.length > 0) {
                    // Pincode is valid, return location details
                    const postOffice = data.PostOffice[0];
                    return res.status(200).json({
                        status: true,
                        message: 'Pincode is valid',
                        valid: true,
                        data: {
                            district: postOffice.District || '',
                            state: postOffice.State || '',
                            city: postOffice.District || postOffice.Division || ''
                        }
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        message: 'Pincode not found',
                        valid: false
                    });
                }
            } else {
                return res.status(200).json({
                    status: false,
                    message: 'Unable to validate pincode',
                    valid: false
                });
            }
        } catch (apiError) {
            // If API fails, just validate format
            console.error('Pincode API error:', apiError.message);
            return res.status(200).json({
                status: true,
                message: 'Pincode format is valid',
                valid: true,
                data: null
            });
        }
    } catch (error) {
        console.error('Pincode validation error:', error);
        return res.status(500).json({
            status: false,
            message: error.message || 'Error validating pincode'
        });
    }
};

