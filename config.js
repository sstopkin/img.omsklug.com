var path = require('path');

module.exports = {
    OLD_IMAGES_PATH: path.join(__dirname, '/old_images/'),
    IMAGES_TARGET_PATH: path.join(__dirname, '/uploads/'),
    WWW: path.join(__dirname, 'www'),
    METADATA_PATH: path.join(__dirname, '/metadata/'),
    
    IMAGE_TYPE: "image/jpeg",
    IMAGE_EXPIRY: 60 * 60 * 24 * 90,
    IMAGE_EXPIRY_SHORT: 60 * 60 * 24 * 2,
    VERSION_DATEFORMAT: 'd-mmm-yyyy-h:MMTT'
};
