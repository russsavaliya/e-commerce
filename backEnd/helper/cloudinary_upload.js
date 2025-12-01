const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, folder = 'products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
                // Optimize for faster uploads
                quality: 'auto:good', // Auto quality optimization
                fetch_format: 'auto', // Auto format (WebP when supported)
                eager_async: false, // Don't wait for transformations
                chunk_size: 6000000, // 6MB chunks for faster upload
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

module.exports = { uploadToCloudinary };