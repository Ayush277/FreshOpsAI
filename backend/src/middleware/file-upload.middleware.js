const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { AppError } = require('../utils/app-error');

const uploadsDirectory = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const basename = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 60);

    callback(null, `${Date.now()}-${basename}${extension}`);
  },
});

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
  uploadsDirectory,
};
