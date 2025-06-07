const { User } = require("../models/allModels");
const { getState, setState } = require("../state/userState");
const {
    cardTypeKeyboard,
    cancelKeyboard,
    countryKeyboard,
    doneCancelKeyboard,
} = require("../keyboards/Keyboards");
const { handleCommand, startedUsers } = require("../handlers/commandHandler");
const countryCurrencyMap = require("../utils/currencyMap");
const { setCommand } = require("../state/commandState");

// Helper to check if input text is a valid number, send error message if not
const checkNumber = (bot, text, chatId) => {
    if (isNaN(text)) {
        bot.sendMessage(chatId, `*يرجى إدخال رقم ❌*`, {
            ...cancelKeyboard(text),
            parse_mode: "Markdown",
        });
        return false;
    }
    return true;
};

const userHandler = async (bot, msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Reset command state on each message processed here
    setCommand(chatId, { c: "start" });

    // If message is a command, ignore here (handled elsewhere)
    if (text.startsWith("/")) return;

    const user = await User.findOne({ userId: chatId });
    const state = getState(chatId);

    // If user not registered or not started, handle name registration
    if (!startedUsers.has(chatId) || !user) {
        if (state.step === "name" && !user) {
            // Create new user with username as entered text
            await User.create({
                userId: chatId,
                username: text,
                giftcards: [],
            });
        }
        startedUsers.add(chatId);

        // Ask user to restart bot to proceed (could be improved UX)
        bot.sendMessage(chatId, `يرجى إعادة تشغيل البوت بإستخدام /start`);
        return;
    }

    // Cancel button pressed - reset to country selection and show main menu
    if (text === "❌ Cancel") {
        setState(chatId, { step: "country", data: {} });
        bot.sendMessage(chatId, "تم الإلغاء.");
        handleCommand(bot, msg);
        return;
    }

    // Done button pressed - save the gift card and prompt for new input
    if (text === "✅ Done") {
        setState(chatId, { step: "country", data: {} });

        const giftCard = {
            type: state.data.card,
            country: state.data.country,
            pin: state.data.pin,
            value: state.data.value,
            link: state.data.link,
        };

        user.giftcards.push(giftCard);
        await user.save();

        bot.sendMessage(
            chatId,
            `تم إرسال البطاقة بنجاح ✅\n\n*يرجى اختيار بلد البطاقة*`,
            {
                ...countryKeyboard(),
                parse_mode: "Markdown",
            }
        );
        return;
    }

    // Flow for entering gift card info step by step
    switch (state.step) {
        case "country":
            state.data.country = text;
            state.step = "card";
            setState(chatId, state);

            bot.sendMessage(
                chatId,
                `🛒 بلد البطاقة : *${text}*\n\n*يرجى اختيار نوع البطاقة*`,
                {
                    ...cardTypeKeyboard(text),
                    parse_mode: "Markdown",
                }
            );
            break;

        case "card":
            state.data.card = text;
            state.step = "value";
            setState(chatId, state);

            bot.sendMessage(
                chatId,
                `🛒 بلد البطاقة : *${state.data.country}*\n💳 نوع البطاقة : *${text}*\n\n*يرجى إرسال قيمة البطاقة رقماً فقط بدون نوع العملة*`,
                {
                    ...cancelKeyboard(text),
                    parse_mode: "Markdown",
                }
            );
            break;

        case "value":
            if (!checkNumber(bot, text, chatId)) return;

            state.data.value = parseFloat(text);
            state.step = "pin";
            setState(chatId, state);

            bot.sendMessage(
                chatId,
                `🛒 بلد البطاقة : *${state.data.country}*\n💳 نوع البطاقة : *${state.data.card}*\n💰 قيمة البطاقة : *${text}*\n\n*يرجى إرسال الرمز السري البطاقة اذا كانت البطاقة بدون رمز قم بإرسال 0*`,
                {
                    ...cancelKeyboard(text),
                    parse_mode: "Markdown",
                }
            );
            break;

        case "pin":
            if (!checkNumber(bot, text, chatId)) return;

            state.data.pin = text;
            state.step = "verify";
            setState(chatId, state);

            bot.sendMessage(
                chatId,
                `🛒 بلد البطاقة : *${state.data.country}*\n💳 نوع البطاقة : *${state.data.card}*\n💰 قيمة البطاقة : *${state.data.value}*\n🔐 رمز البطاقة : *${text}*\n\n*يرجى إرسال رابط البطاقة:*`,
                {
                    ...cancelKeyboard(text),
                    parse_mode: "Markdown",
                }
            );
            break;

        case "verify":
            state.data.link = text;
            setState(chatId, state);

            const countryName = state.data.country;
            const currency = countryCurrencyMap[countryName.split(" ")[0]];

            bot.sendMessage(
                chatId,
                `🛒 بلد البطاقة : *${state.data.country}*\n💳 نوع البطاقة : *${state.data.card}*\n💰 قيمة البطاقة : *${state.data.value}*\n🔐 رمز البطاقة : *${state.data.pin}*\n🛒 عملة البطاقة : *${currency}*\n🔗 رابط البطاقة : *${text}*\n\n*يرجى التأكد من معلومات البطاقة قبل الإرسال*`,
                {
                    ...doneCancelKeyboard(text),
                    parse_mode: "Markdown",
                }
            );
            break;

        default:
            // Optional: handle unexpected states
            break;
    }
};

module.exports = userHandler;
