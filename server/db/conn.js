const mongoose = require('mongoose')
const DB = process.env.Database

if(!DB){
    console.error('ERROR: Database connection string not found in config.env');
    console.error('Please set the Database variable in server/config.env');
    process.exit(1);
}

mongoose.set("strictQuery", false);

// Increase timeout and add connection options
const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
    socketTimeoutMS: 45000,
};

mongoose.connect(DB, options).then(() => {
    console.log('✓ MongoDB connection successful');
}).catch((err) => {
    console.error('✗ MongoDB connection failed:', err.message);
    console.error('Make sure MongoDB is running or check your connection string in server/config.env');
    // Don't exit - let the server continue but operations will fail
});