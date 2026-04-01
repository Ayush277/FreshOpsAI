const express = require('express');
const { postUpload } = require('../controllers/upload.controller');
const { validateUploadRequest } = require('../middleware/upload-validation.middleware');
const { handleSingleImageUpload } = require('../middleware/file-upload.middleware');

const uploadRouter = express.Router();

uploadRouter.post('/', handleSingleImageUpload, validateUploadRequest, postUpload);

module.exports = uploadRouter;
