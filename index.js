// Import the function that starts the Telegram bot
const startBot = require("./bot");

// Import the function that connects to the MongoDB database
const connect = require("./config/db.js");

// Establish the database connection before starting the bot
connect();

// Start the Telegram bot
startBot();
