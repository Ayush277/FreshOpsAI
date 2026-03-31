const uploadService = async (itemData) => {
  const { itemName, category, imageUrl } = itemData;

  const now = new Date();
  const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

  return {
    id: `item-${Date.now()}`,
    itemName: itemName || 'Unknown Item',
    category: category || 'General',
    imageUrl: imageUrl || null,
    detectedAt: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    daysRemaining,
    status: daysRemaining > 5 ? 'fresh' : daysRemaining > 2 ? 'expiring-soon' : 'expired',
    createdAt: now.toISOString(),
  };
};

module.exports = { uploadService };
