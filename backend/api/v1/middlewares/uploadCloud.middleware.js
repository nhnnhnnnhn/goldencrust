const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

module.exports.upload = (req, res, next) => {
    if(req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            })
        };

        async function upload(req) {
            try {
                let result = await streamUpload(req);
                req.body[req.file.fieldname] = result.secure_url;
                next();
            } catch (error) {
                console.error("Upload error:", error);
                res.status(500).json({ error: "Upload failed", details: error.message });
            }
        }
        upload(req);
    } else {
        next();
    }      
}