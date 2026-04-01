const InventoryItem = require('../models/inventory-item.model');

const CATEGORY_DEFAULT_DAYS = {
  Dairy: 4,
  Bakery: 3,
  Fruits: 7,
  Vegetables: 6,
  Meat: 2,
  General: 5,
};

const resolveStatus = (daysRemaining) => {
  if (daysRemaining <= 0) {
    return 'expired';
  }

  if (daysRemaining <= 2) {
    return 'expiring-soon';
  }

  return 'fresh';
};

const uploadService = async (itemData) => {
  const {
    itemName,
    category,
    imageUrl,
    detectedAt,
    expiryDate,
    daysRemaining,
  } = itemData;

  const normalizedCategory = category || 'General';
  const detectedAtDate = detectedAt ? new Date(detectedAt) : new Date();

  const calculatedDaysRemaining =
    Number.isFinite(daysRemaining) && daysRemaining !== null
      ? Number(daysRemaining)
      : CATEGORY_DEFAULT_DAYS[normalizedCategory] || CATEGORY_DEFAULT_DAYS.General;

  const calculatedExpiryDate = expiryDate
    ? new Date(expiryDate)
    : new Date(detectedAtDate.getTime() + calculatedDaysRemaining * 24 * 60 * 60 * 1000);

  const itemToCreate = {
    itemName,
    category: normalizedCategory,
    imageUrl: imageUrl || null,
    detectedAt: detectedAtDate,
    expiryDate: calculatedExpiryDate,
    daysRemaining: calculatedDaysRemaining,
    status: resolveStatus(calculatedDaysRemaining),
  };

  const createdItem = await InventoryItem.create(itemToCreate);
  return createdItem;
};

module.exports = { uploadService };
