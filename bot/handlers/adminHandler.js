const { User, GiftCard, Rate } = require("../models/allModels");
const adminMainKeyboard = require("../keyboards/adminKeyboards");
const { removeKeyboard } = require("../keyboards/Keyboards");
const { getState, setState } = require("../state/userState");
const { setCommand } = require("../state/commandState");
const { sendUserPage, sendCountryPage } = require("./callbackHandler");
const { getTempState, clearTempState } = require("../state/tempState");

const handleAdminMessage = async (bot, msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const state = getState(chatId);

    // Check if user is admin by fetching admin userIds from DB
    const admins = (await User.find({ isAdmin: true })).map(
        (user) => user.userId
    );

    if (!admins.includes(chatId)) {
        return bot.sendMessage(chatId, "انت لست أدمن ❌");
    }

    if (text === "/admin") setState(chatId, { step: "adminPanel", data: {} });
    setCommand(chatId, { c: "admin" });

    // === Handle updating gift card prices (session data stored in tempState) ===
    const tempState = getTempState(chatId);
    if (tempState && tempState.country && tempState.type) {
        const { country, type } = getTempState(chatId);
        const newPrice = parseFloat(text);

        if (isNaN(newPrice)) {
            return bot.sendMessage(chatId, "❌ سعر خاطئ، يرجى إرسال رقم.");
        }

        await GiftCard.findOneAndUpdate({ country, type }, { price: newPrice });

        clearTempState(chatId); // clear session after update

        return bot.sendMessage(
            chatId,
            `✅ تم تحديث السعر لـ *${country} / ${type}* إلى \`${newPrice}\``,
            {
                ...adminMainKeyboard(),
                parse_mode: "Markdown",
            }
        );
    }

    // === Handle / commands (send admin main menu) ===
    if (text.startsWith("/")) {
        const resp = "*لوحة الأدمن*";
        return bot.sendMessage(chatId, resp, {
            ...adminMainKeyboard(),
            parse_mode: "Markdown",
        });
    }

    // === Handle multi-step states ===

    if (state.step === "sendMessageAll") {
        setState(chatId, { step: "adminPanel", data: {} });

        const resp = `*تم إرسال الرسالة*`;

        // Send the message to all users (async but no waiting for all)
        const users = (await User.find()).map((u) => u.userId);
        users.forEach(async (id) => {
            try {
                await bot.sendMessage(id, text, {
                    ...removeKeyboard(),
                    parse_mode: "Markdown",
                });
            } catch (err) {
                console.error("error:", err);
            }
        });

        return bot.sendMessage(chatId, resp, {
            ...adminMainKeyboard(),
            parse_mode: "Markdown",
        });
    }

    if (state.step === "editRate") {
        setState(chatId, { step: "adminPanel", data: {} });

        const newRate = parseFloat(text);
        if (isNaN(newRate)) {
            return bot.sendMessage(chatId, "❌ سعر خاطئ، يرجى إرسال رقم.");
        }

        await Rate.findOneAndUpdate({ currency: "USD" }, { rate: newRate });

        const resp = `تم تعديل سعر الصرف إلى \`${newRate}\``;
        return bot.sendMessage(chatId, resp, {
            ...adminMainKeyboard(),
            parse_mode: "Markdown",
        });
    }

    // === Handle admin commands from main keyboard ===
    if (text === "عرض المستخدمين") {
        setState(chatId, { step: "showUsers", data: {} });
        return sendUserPage(bot, chatId, 0);
    }

    if (text === "إرسال رسالة للكل") {
        setState(chatId, { step: "sendMessageAll", data: {} });
        const resp = `*أكتب الرسالة المراد إرسالها لكل المستخدمين :*`;
        return bot.sendMessage(chatId, resp, {
            ...removeKeyboard(),
            parse_mode: "Markdown",
        });
    }

    if (text === "تعديل اسعار البطاقات") {
        setState(chatId, { step: "editGifrcardsPrices", data: {} });
        const resp = `*تعديل أسعار البطاقات (النسبة)*`;
        sendCountryPage(bot, chatId);
        return bot.sendMessage(chatId, resp, {
            ...removeKeyboard(),
            parse_mode: "Markdown",
        });
    }

    if (text === "تعديل سعر الصرف") {
        setState(chatId, { step: "editRate", data: {} });
        const rate = await Rate.findOne({ currency: "USD" });
        const currRate = rate.rate;
        const resp = `سعر الصرف القديم هو \`${currRate}\` \n\n قم بإرسال سعر الصرف الجديد :`;

        return bot.sendMessage(chatId, resp, {
            ...removeKeyboard(),
            parse_mode: "Markdown",
        });
    }
};

module.exports = { handleAdminMessage };
