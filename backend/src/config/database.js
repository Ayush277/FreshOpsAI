const mongoose = require('mongoose');
const { env } = require('./env');

const mongoUri = process.env.MONGODB_URI;

const validateMongoConnection = () => {
  if (!mongoUri) {
    const error = new Error(
      'MONGODB_URI environment variable is not set. Please configure it before starting the application.'
    );
    error.statusCode = 500;
    throw error;
  }
};

const connectDatabase = async () => {
  try {
    validateMongoConnection();

    await mongoose.connect(mongoUri);

    console.log('MongoDB connection established successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error.message);
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  validateMongoConnection,
};
