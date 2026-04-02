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

const getDashboardSummaryService = async () => {
  const now = new Date();
  const inventoryItems = await InventoryItem.find({}, { expiryDate: 1, status: 1, daysRemaining: 1 });

  const statusUpdates = [];
  let freshItems = 0;
  let expiringSoonItems = 0;
  let expiredItems = 0;

  inventoryItems.forEach((item) => {
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

    if (status === 'fresh') {
      freshItems += 1;
    } else if (status === 'expiring-soon') {
      expiringSoonItems += 1;
    } else {
      expiredItems += 1;
    }
  });

  if (statusUpdates.length > 0) {
    await InventoryItem.bulkWrite(statusUpdates);
  }

  const totalItems = inventoryItems.length;
  const wastePercentage = totalItems > 0 ? Number(((expiredItems / totalItems) * 100).toFixed(2)) : 0;

  return {
    totalItems,
    freshItems,
    expiringSoonItems,
    expiredItems,
    wastePercentage,
  };
};

module.exports = { getDashboardSummaryService };
