/*
Run from /Users/ayush/FreshOpsAI/backend
1) npm install mongodb
2) node mongodbExample.js
*/

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const DATABASE_NAME = 'freshops_ai';
const COLLECTION_NAME = 'inventory_activity_feed';

function readEnvFileValue(key) {
  const envFilePath = path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envFilePath)) {
    return '';
  }

  const envFileContent = fs.readFileSync(envFilePath, 'utf8');
  const lines = envFileContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const parsedKey = trimmedLine.slice(0, separatorIndex).trim();
    const parsedValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (parsedKey === key) {
      return parsedValue.replace(/^"|"$/g, '');
    }
  }

  return '';
}

function getMongoUri() {
  const fromEnvVariable = process.env.MONGODB_URI;

  if (fromEnvVariable) {
    return fromEnvVariable;
  }

  return readEnvFileValue('MONGODB_URI');
}

function buildSampleDocuments() {
  const now = Date.now();

  return [
    {
      itemName: 'Milk',
      category: 'Dairy',
      status: 'fresh',
      location: 'Store A',
      action: 'stocked',
      actor: 'inventory-bot',
      timestamp: new Date(now - 90 * 60 * 1000),
    },
    {
      itemName: 'Yogurt',
      category: 'Dairy',
      status: 'expiring-soon',
      location: 'Store A',
      action: 'status-updated',
      actor: 'inventory-bot',
      timestamp: new Date(now - 80 * 60 * 1000),
    },
    {
      itemName: 'Bread',
      category: 'Bakery',
      status: 'fresh',
      location: 'Store B',
      action: 'stocked',
      actor: 'warehouse-team',
      timestamp: new Date(now - 70 * 60 * 1000),
    },
    {
      itemName: 'Spinach',
      category: 'Vegetables',
      status: 'expiring-soon',
      location: 'Store A',
      action: 'quality-check',
      actor: 'ops-manager',
      timestamp: new Date(now - 60 * 60 * 1000),
    },
    {
      itemName: 'Apple',
      category: 'Fruits',
      status: 'fresh',
      location: 'Store C',
      action: 'stocked',
      actor: 'inventory-bot',
      timestamp: new Date(now - 50 * 60 * 1000),
    },
    {
      itemName: 'Banana',
      category: 'Fruits',
      status: 'expiring-soon',
      location: 'Store C',
      action: 'discounted',
      actor: 'pricing-engine',
      timestamp: new Date(now - 40 * 60 * 1000),
    },
    {
      itemName: 'Paneer',
      category: 'Dairy',
      status: 'fresh',
      location: 'Store B',
      action: 'stocked',
      actor: 'warehouse-team',
      timestamp: new Date(now - 30 * 60 * 1000),
    },
    {
      itemName: 'Tomato',
      category: 'Vegetables',
      status: 'expiring-soon',
      location: 'Store A',
      action: 'reallocated',
      actor: 'ops-manager',
      timestamp: new Date(now - 20 * 60 * 1000),
    },
    {
      itemName: 'Cheese',
      category: 'Dairy',
      status: 'expired',
      location: 'Store C',
      action: 'removed',
      actor: 'inventory-bot',
      timestamp: new Date(now - 10 * 60 * 1000),
    },
    {
      itemName: 'Cucumber',
      category: 'Vegetables',
      status: 'fresh',
      location: 'Store B',
      action: 'stocked',
      actor: 'warehouse-team',
      timestamp: new Date(now - 5 * 60 * 1000),
    },
  ];
}

async function runMongoAtlasExample() {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error(
      'MONGODB_URI is missing. Set it in your environment or add it to backend/.env before running this file.'
    );
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log('1) Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully.');

    const database = client.db(DATABASE_NAME);
    const collection = database.collection(COLLECTION_NAME);

    console.log('2) Inserting 10 realistic inventory activity documents...');
    const documents = buildSampleDocuments();
    const insertResult = await collection.insertMany(documents);
    console.log(`✅ Inserted ${insertResult.insertedCount} documents.`);

    console.log('3) Reading 5 most recent full documents by timestamp...');
    const recentDocuments = await collection.find({}).sort({ timestamp: -1 }).limit(5).toArray();
    console.log(JSON.stringify(recentDocuments, null, 2));

    const oneDocumentId = Object.values(insertResult.insertedIds)[0];
    console.log(`4) Reading one full document by _id: ${oneDocumentId.toString()}...`);
    const oneDocument = await collection.findOne({ _id: oneDocumentId });
    console.log(JSON.stringify(oneDocument, null, 2));

    console.log('✅ Example completed successfully.');
  } catch (error) {
    console.error('❌ MongoDB example failed.');
    console.error(error.message);
  } finally {
    console.log('5) Closing MongoDB connection...');
    await client.close();
    console.log('✅ Connection closed.');
  }
}

runMongoAtlasExample();
