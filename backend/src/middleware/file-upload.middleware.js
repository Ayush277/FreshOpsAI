const multer = require('multer');
const { AppError } = require('../utils/app-error');

const storage = multer.memoryStorage();

const fileFilter = (request, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new AppError('Only image files are allowed', 400));
  }

  return callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const handleSingleImageUpload = upload.single('image');

module.exports = {
  handleSingleImageUpload,
};
