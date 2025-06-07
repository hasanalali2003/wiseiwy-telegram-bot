const { User } = require("../models/allModels");
const { countryKeyboard, removeKeyboard } = require("../keyboards/Keyboards");
const { setState } = require("../state/userState");
const { setCommand } = require("../state/commandState");

// Track users who have started interacting with the bot
const startedUsers = new Set();

const handleCommand = async (bot, msg) => {
    const chatId = msg.chat.id;

    // Add user to startedUsers set for any further tracking you might want
    startedUsers.add(chatId);

    // Set default command state to 'start'
    setCommand(chatId, { c: "start" });

    // Check if user already exists in DB
    const user = await User.findOne({ userId: chatId });

    // If user does not exist, ask for full name and set state to 'name'
    if (!user) {
        const resp = `مرحبا بك في بوت WISEIWY 👋\n\n*يرجى إدخال اسمك الثلاثي*`;

        setState(chatId, { step: "name", data: {} });

        return bot.sendMessage(chatId, resp, {
            ...removeKeyboard(),
            parse_mode: "Markdown",
        });
    }

    // If user sends /start and user already exists, ask to select country
    if (msg.text === "/start") {
        const resp = `مرحبا بك في بوت WISEIWY 👋 \n\n*يرجى اختيار بلد البطاقة*`;

        setState(chatId, { step: "country", data: {} });

        return bot.sendMessage(chatId, resp, {
            ...countryKeyboard(),
            parse_mode: "Markdown",
        });
    }
};

module.exports = { handleCommand, startedUsers };
