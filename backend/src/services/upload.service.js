const InventoryItem = require('../models/inventory-item.model');
const { calculateExpiryPlan } = require('./expiry.service');

const uploadService = async (itemData) => {
  const {
    itemName,
    category,
    imageUrl,
    detectedAt,
    expiryDate,
    daysRemaining,
    aiDetection,
  } = itemData;

  const expiryPlan = calculateExpiryPlan({
    detectedLabel: aiDetection?.success ? aiDetection.label : itemName,
    fallbackCategory: category || 'General',
    detectedAt,
    manualDaysRemaining: daysRemaining,
    manualExpiryDate: expiryDate,
  });

  const itemToCreate = {
    itemName,
    category: expiryPlan.category,
    imageUrl: imageUrl || null,
    detectedAt: expiryPlan.detectedAt,
    expiryDate: expiryPlan.expiryDate,
    daysRemaining: expiryPlan.daysRemaining,
    status: expiryPlan.status,
  };

  const createdItem = await InventoryItem.create(itemToCreate);

  return {
    item: createdItem,
    expiryPlan: {
      category: expiryPlan.category,
      detectedAt: expiryPlan.detectedAt,
      expiryDate: expiryPlan.expiryDate,
      daysRemaining: expiryPlan.daysRemaining,
      status: expiryPlan.status,
      shelfLifeDays: expiryPlan.shelfLifeDays,
    },
  };
};

module.exports = { uploadService };
