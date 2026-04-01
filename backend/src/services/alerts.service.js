const InventoryItem = require('../models/inventory-item.model');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const resolveStatus = (daysRemaining) => {
  if (daysRemaining <= 0) {
    return 'expired';
  }

  if (daysRemaining <= 2) {
    return 'expiring-soon';
  }

  return 'fresh';
};

const resolveSeverity = (status) => {
  if (status === 'expired') {
    return 'critical';
  }

  if (status === 'expiring-soon') {
    return 'high';
  }

  return 'normal';
};

const resolveMessage = (daysRemaining, status) => {
  if (status === 'expired') {
    const absoluteDays = Math.abs(daysRemaining);
    return `Expired ${absoluteDays} day${absoluteDays === 1 ? '' : 's'} ago`;
  }

  if (status === 'expiring-soon') {
    return `Expiring in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
  }

  return 'Fresh item';
};

const getAlertsService = async () => {
  const now = new Date();
  const inventoryItems = await InventoryItem.find({}).sort({ expiryDate: 1 });

  const statusUpdates = [];
  const normalizedItems = inventoryItems.map((item) => {
    const expiryDate = new Date(item.expiryDate);
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / MS_PER_DAY);
    const status = resolveStatus(daysRemaining);

    if (item.status !== status || item.daysRemaining !== daysRemaining) {
      statusUpdates.push({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { status, daysRemaining } },
        },
      });
    }

    return {
      id: item._id,
      itemName: item.itemName,
      category: item.category,
      imageUrl: item.imageUrl,
      detectedAt: item.detectedAt,
      expiryDate: item.expiryDate,
      daysRemaining,
      status,
      severity: resolveSeverity(status),
      message: resolveMessage(daysRemaining, status),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  if (statusUpdates.length > 0) {
    await InventoryItem.bulkWrite(statusUpdates);
  }

  const alerts = normalizedItems.filter((item) => item.status !== 'fresh');

  const buckets = {
    fresh: normalizedItems.filter((item) => item.status === 'fresh').length,
    'expiring-soon': normalizedItems.filter((item) => item.status === 'expiring-soon').length,
    expired: normalizedItems.filter((item) => item.status === 'expired').length,
  };

  return {
    alerts,
    buckets,
    totalItems: normalizedItems.length,
    alertCount: alerts.length,
  };
};

module.exports = { getAlertsService };
