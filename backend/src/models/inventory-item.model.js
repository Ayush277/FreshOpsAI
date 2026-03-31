const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Dairy', 'Bakery', 'Fruits', 'Vegetables', 'Meat', 'General'],
        message: '{VALUE} is not a valid category',
      },
    },
    imageUrl: {
      type: String,
      default: null,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    daysRemaining: {
      type: Number,
      required: [true, 'Days remaining is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['fresh', 'expiring-soon', 'expired'],
        message: '{VALUE} is not a valid status',
      },
      default: 'fresh',
    },
  },
  {
    timestamps: true,
  }
);

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
