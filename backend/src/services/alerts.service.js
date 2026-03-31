const getAlertsService = async () => {
  const now = new Date();

  const mockAlerts = [
    {
      id: 'alert-001',
      itemId: 'item-001',
      itemName: 'Milk',
      category: 'Dairy',
      status: 'expiring-soon',
      daysRemaining: 1,
      expiryDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      severity: 'high',
      message: 'Expiring in 1 day',
      createdAt: now.toISOString(),
    },
    {
      id: 'alert-002',
      itemId: 'item-004',
      itemName: 'Yogurt',
      category: 'Dairy',
      status: 'expired',
      daysRemaining: -1,
      expiryDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      severity: 'critical',
      message: 'Expired 1 day ago',
      createdAt: now.toISOString(),
    },
  ];

  return mockAlerts;
};

module.exports = { getAlertsService };
