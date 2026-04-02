const LABEL_TO_CATEGORY_MAP = {
  milk: 'Dairy',
  cheese: 'Dairy',
  yogurt: 'Dairy',
  butter: 'Dairy',
  cream: 'Dairy',
  bread: 'Bakery',
  pastry: 'Bakery',
  cake: 'Bakery',
  bun: 'Bakery',
  fruits: 'Fruits',
  fruit: 'Fruits',
  apple: 'Fruits',
  banana: 'Fruits',
  orange: 'Fruits',
  grape: 'Fruits',
  strawberry: 'Fruits',
  mango: 'Fruits',
  peach: 'Fruits',
  pear: 'Fruits',
  vegetables: 'Vegetables',
  vegetable: 'Vegetables',
  spinach: 'Vegetables',
  broccoli: 'Vegetables',
  carrot: 'Vegetables',
  lettuce: 'Vegetables',
  cucumber: 'Vegetables',
  tomato: 'Vegetables',
  pepper: 'Vegetables',
  onion: 'Vegetables',
  garlic: 'Vegetables',
  chicken: 'Meat',
  beef: 'Meat',
  fish: 'Meat',
  pork: 'Meat',
};

const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

const resolveCategoryFromLabel = (label, fallbackCategory = 'General') => {
  const normalizedLabel = normalizeText(label);

  if (!normalizedLabel) {
    return fallbackCategory || 'General';
  }

  const directMatch = LABEL_TO_CATEGORY_MAP[normalizedLabel];
  if (directMatch) {
    return directMatch;
  }

  const matchedEntry = Object.entries(LABEL_TO_CATEGORY_MAP).find(([key]) =>
    normalizedLabel.includes(key)
  );

  if (matchedEntry) {
    return matchedEntry[1];
  }

  return fallbackCategory || 'General';
};

const getKnownLabelCategories = () => {
  return { ...LABEL_TO_CATEGORY_MAP };
};

module.exports = {
  LABEL_TO_CATEGORY_MAP,
  resolveCategoryFromLabel,
  getKnownLabelCategories,
};
