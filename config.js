var path = require('path');

module.exports = {
    IMAGES_TARGET_FOLDER: path.join(__dirname, '/uploads/'),
    IMAGES_TARGET_PATH: '/uploads/',
    IMAGE_TYPE: "image/jpeg",
    IMAGE_EXPIRY: 60 * 60 * 24 * 90,
    IMAGE_EXPIRY_SHORT: 60 * 60 * 24 * 2,
    VERSION_DATEFORMAT: 'd-mmm-yyyy-h:MMTT'
}
