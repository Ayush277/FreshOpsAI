const express = require('express');
const { postUpload } = require('../controllers/upload.controller');
const { validateUploadRequest } = require('../middleware/upload-validation.middleware');

const uploadRouter = express.Router();

uploadRouter.post('/', validateUploadRequest, postUpload);

module.exports = uploadRouter;
