const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;
        
        if (!uri || uri.includes('example.mongodb.net') || uri.includes('<username>') || uri.includes('test:test')) {
            console.log('⚠️ Invalid or example MONGO_URI detected.');
            console.log('🔄 Starting an In-Memory MongoDB Server for out-of-the-box testing...');
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            console.log(`✅ In-Memory MongoDB running at: ${uri}`);
        } else {
            console.log(`🔄 Attempting to connect to MongoDB URI...`);
        }
        
        await mongoose.connect(uri);
        console.log('✅ MongoDB successfully connected.');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('Make sure your IP is whitelisted in MongoDB Atlas and the URI is correct.');
        // Don't forcefully exit if memory server failed to start, so we can see the full log
        process.exit(1);
    }
};

module.exports = connectDB;
