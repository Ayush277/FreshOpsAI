const getItemsService = async () => {
  const now = new Date();

  const mockItems = [
    {
      id: 'item-001',
      itemName: 'Milk',
      category: 'Dairy',
      imageUrl: 'https://images.example.com/milk.jpg',
      detectedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 1,
      status: 'expiring-soon',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'item-002',
      itemName: 'Bread',
      category: 'Bakery',
      imageUrl: 'https://images.example.com/bread.jpg',
      detectedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 3,
      status: 'fresh',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'item-003',
      itemName: 'Apples',
      category: 'Fruits',
      imageUrl: 'https://images.example.com/apples.jpg',
      detectedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 5,
      status: 'fresh',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'item-004',
      itemName: 'Yogurt',
      category: 'Dairy',
      imageUrl: 'https://images.example.com/yogurt.jpg',
      detectedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: -1,
      status: 'expired',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return mockItems;
};

module.exports = { getItemsService };
