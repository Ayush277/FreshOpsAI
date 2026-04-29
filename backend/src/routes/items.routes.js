const express = require('express');
const { deleteItem, getItems } = require('../controllers/items.controller');

const itemsRouter = express.Router();

itemsRouter.get('/', getItems);
itemsRouter.delete('/:id', deleteItem);

module.exports = itemsRouter;
