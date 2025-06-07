// Load environment variables from .env file into process.env
require("dotenv").config();

/**
 * Export important configuration variables from environment
 */
module.exports = {
    telegramToken: process.env.BOT_TOKEN, // Telegram bot token
    MongoURI: process.env.MONGODB_URI, // MongoDB connection URI
};
