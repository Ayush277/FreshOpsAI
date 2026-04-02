const CATEGORY_SHELF_LIFE_DAYS = {
  Dairy: 4,
  Bakery: 3,
  Fruits: 7,
  Vegetables: 6,
  Meat: 2,
  General: 5,
};

const FOOD_LABEL_CATEGORY_MAP = {
  milk: 'Dairy',
  cheese: 'Dairy',
  yogurt: 'Dairy',
  butter: 'Dairy',
  bread: 'Bakery',
  pastry: 'Bakery',
  cake: 'Bakery',
  apple: 'Fruits',
  banana: 'Fruits',
  orange: 'Fruits',
  grape: 'Fruits',
  strawberry: 'Fruits',
  mango: 'Fruits',
  spinach: 'Vegetables',
  broccoli: 'Vegetables',
  carrot: 'Vegetables',
  lettuce: 'Vegetables',
  cucumber: 'Vegetables',
  tomato: 'Vegetables',
  chicken: 'Meat',
  beef: 'Meat',
  fish: 'Meat',
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

const resolveCategoryFromLabel = (label, fallbackCategory = 'General') => {
  const normalizedLabel = normalizeText(label);

  if (!normalizedLabel) {
    return fallbackCategory || 'General';
  }

  const directMatch = FOOD_LABEL_CATEGORY_MAP[normalizedLabel];
  if (directMatch) {
    return directMatch;
  }

  const matchedEntry = Object.entries(FOOD_LABEL_CATEGORY_MAP).find(([key]) =>
    normalizedLabel.includes(key)
  );

  if (matchedEntry) {
    return matchedEntry[1];
  }

  return fallbackCategory || 'General';
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

const calculateExpiryPlan = ({
  detectedLabel,
  fallbackCategory,
  detectedAt,
  manualDaysRemaining,
  manualExpiryDate,
}) => {
  const category = resolveCategoryFromLabel(detectedLabel, fallbackCategory);
  const detectedAtDate = detectedAt ? new Date(detectedAt) : new Date();

  const shelfLifeDays =
    Number.isFinite(manualDaysRemaining) && manualDaysRemaining !== null
      ? Number(manualDaysRemaining)
      : CATEGORY_SHELF_LIFE_DAYS[category] || CATEGORY_SHELF_LIFE_DAYS.General;

  const expiryDate = manualExpiryDate
    ? new Date(manualExpiryDate)
    : new Date(detectedAtDate.getTime() + shelfLifeDays * MS_PER_DAY);

  const daysRemaining = Math.ceil((expiryDate.getTime() - detectedAtDate.getTime()) / MS_PER_DAY);
  const status = resolveStatus(daysRemaining);

  return {
    category,
    detectedAt: detectedAtDate,
    expiryDate,
    daysRemaining,
    status,
    shelfLifeDays,
  };
};

module.exports = {
  calculateExpiryPlan,
  resolveCategoryFromLabel,
  resolveStatus,
  CATEGORY_SHELF_LIFE_DAYS,
};
