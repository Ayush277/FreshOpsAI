const express = require('express');
const { getItems } = require('../controllers/items.controller');

const itemsRouter = express.Router();

itemsRouter.get('/', getItems);

module.exports = itemsRouter;
