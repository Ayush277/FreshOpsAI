const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboard.controller');

const dashboardRouter = express.Router();

dashboardRouter.get('/summary', getDashboardSummary);

module.exports = dashboardRouter;
