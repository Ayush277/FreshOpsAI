const {
  resolveCategoryFromLabel,
} = require('./food-label-mapping.service');

const LABEL_SHELF_LIFE_DAYS = {
  milk: 3,
  bread: 5,
  fruits: 7,
  fruit: 7,
  vegetables: 6,
  vegetable: 6,
  yogurt: 7,
};

const CATEGORY_SHELF_LIFE_DAYS = {
  Dairy: 3,
  Bakery: 5,
  Fruits: 7,
  Vegetables: 6,
  Meat: 2,
  General: 5,
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

const resolveShelfLifeDays = (detectedLabel, category = 'General', fallbackDays = 5) => {
  const normalizedLabel = normalizeText(detectedLabel);

  if (normalizedLabel && LABEL_SHELF_LIFE_DAYS[normalizedLabel] !== undefined) {
    return LABEL_SHELF_LIFE_DAYS[normalizedLabel];
  }

  const normalizedCategory = category || 'General';
  if (CATEGORY_SHELF_LIFE_DAYS[normalizedCategory] !== undefined) {
    return CATEGORY_SHELF_LIFE_DAYS[normalizedCategory];
  }

  return fallbackDays;
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
      : resolveShelfLifeDays(detectedLabel, category, CATEGORY_SHELF_LIFE_DAYS.General);

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
  resolveShelfLifeDays,
  resolveStatus,
  CATEGORY_SHELF_LIFE_DAYS,
  LABEL_SHELF_LIFE_DAYS,
};
