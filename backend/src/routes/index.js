const express = require('express');
const healthRouter = require('./health.routes');
const uploadRouter = require('./upload.routes');
const itemsRouter = require('./items.routes');
const alertsRouter = require('./alerts.routes');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/upload', uploadRouter);
router.use('/items', itemsRouter);
router.use('/alerts', alertsRouter);

module.exports = router;
