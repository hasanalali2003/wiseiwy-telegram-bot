// Import the Telegram Bot API package
const TelegramBot = require("node-telegram-bot-api");

// Import environment token from config
const { telegramToken } = require("../config");

// Import command and message handlers
const { handleCommand } = require("./handlers/commandHandler");
const userHandler = require("./handlers/userHandler");
const { handleAdminMessage } = require("./handlers/adminHandler");
const { getCommand } = require("./state/commandState");
const { handleCallbackQuery } = require("./handlers/callbackHandler");

/**
 * Initializes and starts the Telegram bot with polling.
 */
const startBot = () => {
    const bot = new TelegramBot(telegramToken, { polling: true });

    // Handle /admin command
    bot.onText(/\/admin/, (msg) => handleAdminMessage(bot, msg));

    // Handle /start command
    bot.onText(/\/start/, (msg) => handleCommand(bot, msg));

    // Handle normal text messages (non-commands)
    bot.on("message", (msg) => {
        // Ignore command messages
        if (!msg.text.startsWith("/")) {
            const command = getCommand(msg.chat.id).c;

            // If command state is 'start', treat user as a normal user
            if (command === "start") {
                userHandler(bot, msg);
            } else {
                // Otherwise, treat as admin
                handleAdminMessage(bot, msg);
            }
        }
    });

    // Handle inline button callbacks
    bot.on("callback_query", (query) => handleCallbackQuery(bot, query));

    // Log polling errors (network, token, etc.)
    bot.on("polling_error", (error) => {
        console.error("[Polling Error]", error.code, error.message);
    });

    console.log("🤖 The bot is now running...");
};

module.exports = startBot;
