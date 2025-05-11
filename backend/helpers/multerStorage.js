const multer = require('multer');

module.exports = () => {
    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './backend/uploads');
        },
        filename: function (req, file, cb){
            const uniqueSuffix = Date.now();
            cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
    });

    return storage;
}
