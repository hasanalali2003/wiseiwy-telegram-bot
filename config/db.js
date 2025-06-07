const mongoose = require("mongoose");
// Import the MongoDB URI from index.js in the same directory
const { MongoURI } = require(".");

/**
 * Connects to MongoDB using Mongoose.
 */
const connect = () => {
    mongoose
        .connect(MongoURI)
        .then(() => {
            console.log("✅ Successfully connected to MongoDB");
        })
        .catch((err) => {
            console.error("❌ Failed to connect to MongoDB:");
            console.error(err);
        });
};

module.exports = connect;
