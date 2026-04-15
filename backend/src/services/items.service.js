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

const getItemsService = async () => {
  const now = new Date();
  const inventoryItems = await InventoryItem.find({}).sort({ createdAt: -1 });

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
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  if (statusUpdates.length > 0) {
    await InventoryItem.bulkWrite(statusUpdates);
  }

  return normalizedItems;
};

module.exports = { getItemsService };
