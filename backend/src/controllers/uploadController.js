import cloudinary from '../config/cloudinary.js';

// Upload images to Cloudinary
export const uploadImages = async (req, res) => {
    try {
        console.log('Upload endpoint hit');
        console.log('Files received:', req.files ? req.files.length : 0);

        if (!req.files || req.files.length === 0) {
            console.log('No files in request');
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        console.log('Starting Cloudinary upload for', req.files.length, 'files');

        // Upload all files to Cloudinary
        const uploadPromises = req.files.map((file, index) => {
            return new Promise((resolve, reject) => {
                console.log(`Uploading file ${index + 1}:`, file.originalname);
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'geekspot/products',
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) {
                            console.error(`Error uploading file ${index + 1}:`, error);
                            reject(error);
                        } else {
                            console.log(`File ${index + 1} uploaded successfully:`, result.secure_url);
                            resolve(result.secure_url);
                        }
                    }
                );
                uploadStream.end(file.buffer);
            });
        });

        const imageUrls = await Promise.all(uploadPromises);
        console.log('All uploads complete:', imageUrls);

        res.json({
            success: true,
            message: 'Images uploaded successfully',
            urls: imageUrls
        });
    } catch (error) {
        console.error('Upload error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error uploading images',
            error: error.message
        });
    }
};
