const express = require('express');
const { postUpload } = require('../controllers/upload.controller');

const uploadRouter = express.Router();

uploadRouter.post('/', postUpload);

module.exports = uploadRouter;
