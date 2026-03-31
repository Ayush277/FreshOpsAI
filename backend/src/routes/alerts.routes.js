const express = require('express');
const { getAlerts } = require('../controllers/alerts.controller');

const alertsRouter = express.Router();

alertsRouter.get('/', getAlerts);

module.exports = alertsRouter;
