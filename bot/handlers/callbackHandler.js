const { User, GiftCard, Rate } = require("../models/allModels");
const {
    setTempState,
    getTempState,
    clearTempState,
} = require("../state/tempState");
const { calculateGiftcard } = require("../services/priceCalculator");

const USERS_PER_PAGE = 7;
const adminActions = {};
const handleCallbackQuery = async (bot, query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    if (data.startsWith("users_page_")) {
        // Handle all users pages
        const page = parseInt(data.replace("users_page_", ""), 10);
        await bot.deleteMessage(chatId, messageId);
        await sendUserPage(bot, chatId, page);
    } else if (data === "confirm_yes") {
        const actions = adminActions[chatId];

        if (!actions)
            return await bot.sendMessage(
                chatId,
                "حدث خطأ يرجى إعادة تشغيل البوت بإستخدام /start"
            );

        if (actions.type === "delete_user") {
            const { userId } = actions;
            await User.deleteOne({ userId });
            await bot.deleteMessage(chatId, messageId);
            await bot.sendMessage(chatId, `🗑️ تم حذف المستخدم بنجاح`);
        } else if (actions.type === "make_admin") {
            const { userId } = actions;
            await bot.deleteMessage(chatId, messageId);
            await User.findOneAndUpdate({ userId: userId }, { isAdmin: true });
            await bot.sendMessage(chatId, `👤 المستخدم أصبح مشرف `);
        } else if (actions.type === "make_user") {
            const { userId } = actions;
            await bot.deleteMessage(chatId, messageId);
            await User.findOneAndUpdate({ userId: userId }, { isAdmin: false });
            bot.sendMessage(chatId, `👤 المستخدم لم يعد مشرف `);
        } else if (actions.type === "delete_card") {
            const { userId, cardId } = actions;
            const user = await User.findOne({ userId });
            const deleteCard = await user.giftcards.id(cardId).deleteOne();
            await user.save();

            await bot.deleteMessage(chatId, messageId);
            await bot.sendMessage(chatId, `تم حذف البطاقة`, {
                parse_mode: "Markdown",
            });
        } else if (actions.type === "delete_all_cards") {
            const { userId } = actions;
            await User.findOneAndUpdate({ userId }, { giftcards: [] });
            await bot.deleteMessage(chatId, messageId);
            bot.sendMessage(chatId, `تم حذف كل البطاقات`, {
                parse_mode: "Markdown",
            });
        }

        delete adminActions[chatId];
    } else if (data === "confirm_cancel") {
        await bot.deleteMessage(chatId, messageId);
        await bot.sendMessage(chatId, "تم الالغاء");
        sendUserPage(bot, chatId, 0);
    } else if (data.startsWith("user_info_")) {
        // Handle info for the choosen user
        await bot.deleteMessage(chatId, messageId);
        const userId = data.split("user_info_")[1];
        const user = await User.findOne({ userId });

        if (!user) {
            return bot.sendMessage(chatId, "❌ المستخدم غير موجود");
        }

        const buttons = [
            [
                {
                    text: "📦 عرض البطاقات",
                    callback_data: `show_cards_${userId}`,
                },
            ],
            [{ text: "🧮 حساب القيمة", callback_data: `calc_cards_${userId}` }],
            [
                {
                    text: "🗑️ حذف المستخدم",
                    callback_data: `delete_user_${userId}`,
                },
            ],
            [
                {
                    text: "👤 تعيين مشرف",
                    callback_data: `make_admin_${userId}`,
                },
                {
                    text: "👤❌ إزالة مشرف",
                    callback_data: `make_user_${userId}`,
                },
            ],
            [
                {
                    text: "↩️ الرجوع",
                    callback_data: `back_to_users`,
                },
            ],
        ];

        bot.sendMessage(chatId, `اختر إجراء للمستخدم: ${user.username}`, {
            reply_markup: { inline_keyboard: buttons },
        });
    } else if (data.startsWith("show_cards_")) {
        //Show giftcards that are sent by a user
        await bot.deleteMessage(chatId, messageId);
        const userId = data.split("show_cards_")[1];
        const user = await User.findOne({ userId });

        if (!user || user.giftcards.length === 0) {
            return bot.sendMessage(chatId, "❌ لا توجد بطاقات.");
        }

        sendCardsPage(bot, chatId, user);
    } else if (data.startsWith("calc_cards_")) {
        // Calculate the total price of the giftcards
        const userId = data.split("calc_cards_")[1];
        const user = await User.findOne({ userId });
        const rate = await Rate.findOne({ currency: "USD" });
        let totalGiftcardValues = 0;

        const respArray = await Promise.all(
            user.giftcards.map(async (card, i) => {
                const { giftcardTotalPrice, giftcardRate, giftcardValue } =
                    await calculateGiftcard(userId, card._id);

                // ✅ Add as number (not string)
                totalGiftcardValues += Number(giftcardTotalPrice);

                return `(${
                    i + 1
                }). ${giftcardValue} x ${giftcardRate} = ${giftcardTotalPrice}`;
            })
        );

        const tempResp = respArray.join("\n");
        await bot.deleteMessage(chatId, messageId);

        if (!tempResp) return bot.sendMessage(chatId, "❌ لا توجد بطاقات.");

        // ✅ Multiply correctly and fix formatting
        const total = totalGiftcardValues * rate.rate;
        const totalResp =
            `\n\nقيمة كل البطاقات = ${totalGiftcardValues.toFixed(2)}\n` +
            `إجمالي الحساب =\n` +
            `${totalGiftcardValues.toFixed(2)} x ${rate.rate} =\n` +
            `${total.toFixed(0)}`;

        const resp = `حساب :${user.username} \n\n${tempResp} ${totalResp}`;
        setTempState(chatId, { resp });
        const keyboard = [
            [
                {
                    text: "إرسال الفاتورة 💳",
                    callback_data: `send_bill_${user.userId}`,
                },
            ],
            [
                {
                    text: "الرجوع ↩️",
                    callback_data: `user_info_${user.userId}`,
                },
            ],
        ];

        await bot.sendMessage(chatId, resp, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard,
            },
        });
    } else if (data.startsWith("delete_user_")) {
        // Delete selected user
        await bot.deleteMessage(chatId, messageId);

        const userId = data.split("delete_user_")[1];
        adminActions[chatId] = { type: "delete_card", userId };
        confirmation(bot, chatId);
    } else if (data.startsWith("back_to_users")) {
        // Back to users menu
        await bot.deleteMessage(chatId, messageId);
        await sendUserPage(bot, chatId, 0);
    } else if (data.startsWith("make_admin_")) {
        await bot.deleteMessage(chatId, messageId);

        // TO ADD =>> confirmation before make admin
        const userId = data.split("make_admin_")[1];

        adminActions[chatId] = { type: "make_admin", userId };
        confirmation(bot, chatId);
    } else if (data.startsWith("make_user_")) {
        await bot.deleteMessage(chatId, messageId);

        // TO ADD =>> confirmation before make user
        const userId = data.split("make_user_")[1];
        adminActions[chatId] = { type: "make_user", userId };
        confirmation(bot, chatId);
    } else if (data.startsWith("edit_country_")) {
        //
        const country = data.replace("edit_country_", "");
        const types = await GiftCard.find({ country }).distinct("type");

        const keyboard = types.map((t) => [
            { text: t, callback_data: `edit_type_${country}_${t}` },
        ]);

        return bot.editMessageText(
            `البلد المختار: *${country}*\nاختار نوع البطاقة:`,
            {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: keyboard },
            }
        );
    } else if (data.startsWith("edit_type_")) {
        const country = data.split("_").slice(2)[0];
        const type = data.split("_").slice(2)[1];

        const giftCard = await GiftCard.findOne({ country, type });
        if (!giftCard) {
            return bot.sendMessage(chatId, "لم يتم إيجاد البطاقة.");
        }

        setTempState(chatId, { country, type });

        await bot.sendMessage(
            chatId,
            `*${country} / ${type}*\nالسعر القديم: \`${giftCard.price}\`\nيرجى إرسال سعر البطاقة الجديد:`,
            {
                parse_mode: "Markdown",
            }
        );

        // Delete inline keyboard
        return bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            {
                chat_id: chatId,
                message_id: query.message.message_id,
            }
        );
    } else if (data.startsWith("edit_card_")) {
        // Manange giftcard
        const userId = data.split("_").slice(2)[0];
        const cardId = data.split("_").slice(2)[1];

        const user = await User.findOne({ userId });
        const card = await user.giftcards.id(cardId);
        const resp = `البطاقة المحددة:\n\nاسم المستخدم: ${user.username} \nبلد البطاقة: ${card.country} \nنوع البطاقة: ${card.type} \nقيمة البطاقة: ${card.value} \nرمز البطاقة: ${card.pin} \nرابط البطاقة: ${card.link}`;
        const keyboard = [
            [
                {
                    text: "حذف البطاقة ",
                    callback_data: `delete_card_${userId}_${cardId}`,
                },
                {
                    text: "الرجوع ↩️",
                    callback_data: `show_cards_${userId}`,
                },
            ],
        ];
        await bot.deleteMessage(chatId, messageId);

        await bot.sendMessage(chatId, resp, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard,
            },
        });
    } else if (data.startsWith("delete_card_")) {
        await bot.deleteMessage(chatId, messageId);
        const userId = data.split("_").slice(2)[0];
        const cardId = data.split("_").slice(2)[1];

        adminActions[chatId] = { type: "delete_card", userId, cardId };
        confirmation(bot, chatId);
    } else if (data.startsWith("delete_all_cards_")) {
        await bot.deleteMessage(chatId, messageId);
        const userId = data.split("_").slice(3)[0];

        adminActions[chatId] = { userId, type: "delete_all_cards" };
        confirmation(bot, chatId);
    } else if (data.startsWith("send_bill_")) {
        const userId = data.split("_").slice(2)[0];
        //await bot.deleteMessage(chatId, messageId);
        const { resp } = getTempState(chatId);
        await bot.sendMessage(userId, resp, {
            parse_mode: "Markdown",
        });
        await bot.sendMessage(chatId, `تم إرسال الفاتورة`, {
            parse_mode: "Markdown",
        });
        clearTempState(chatId);
    }
};

// Users Pages Menu
const sendUserPage = async (bot, chatId, page) => {
    try {
        const totalUsers = await User.countDocuments();
        const users = await User.find()
            .skip(page * USERS_PER_PAGE)
            .limit(USERS_PER_PAGE);

        const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

        if (!users.length) {
            return bot.sendMessage(
                chatId,
                "❌ لا يوجد مستخدمون في هذه الصفحة."
            );
        }

        const userButtons = users.map((user) => [
            {
                text: `👤 ${user.username || "بدون اسم"}`,
                callback_data: `user_info_${user.userId}`,
            },
        ]);

        const paginationButtons = [];
        if (page > 0) {
            paginationButtons.push({
                text: "⏮ Prev",
                callback_data: `users_page_${page - 1}`,
            });
        }
        if (page < totalPages - 1) {
            paginationButtons.push({
                text: "⏭ Next",
                callback_data: `users_page_${page + 1}`,
            });
        }

        const inlineKeyboard = userButtons;
        if (paginationButtons.length > 0) {
            inlineKeyboard.push(paginationButtons); // put them on a new row
        }

        await bot.sendMessage(
            chatId,
            `📋 *قائمة المستخدمين (صفحة ${page + 1}/${totalPages}):*`,
            {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: inlineKeyboard,
                },
            }
        );
    } catch (err) {
        console.error("❌ Error in sendUserPage:", err);
        bot.sendMessage(chatId, "حدث خطأ أثناء عرض المستخدمين.");
    }
};

// Countries Menu
const sendCountryPage = async (bot, chatId) => {
    const countries = await GiftCard.distinct("country");
    const keyboard = countries
        .map((c) => [{ text: c, callback_data: `edit_country_${c}` }])
        .reverse();

    await bot.sendMessage(chatId, "اختار بلد البطاقة:", {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: keyboard,
        },
    });
};

// Giftcards Menu
const sendCardsPage = async (bot, chatId, user) => {
    const tempKeyboard = user.giftcards.map((card, i) => [
        {
            text: `🔹 ${i + 1}. ${card.type} - ${card.value} (${card.country})`,
            callback_data: `edit_card_${user.userId}_${card._id}`,
        },
    ]);
    const extraButtons = [
        {
            text: `حذف كل البطاقات ❌`,
            callback_data: `delete_all_cards_${user.userId}`,
        },

        {
            text: "الرجوع ↩️",
            callback_data: `user_info_${user.userId}`,
        },
    ];

    const keyboard = [...tempKeyboard, extraButtons];

    bot.sendMessage(chatId, `📦 بطاقات:\n`, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: keyboard,
        },
    });
};

// Confirmation Menu
const confirmation = async (bot, chatId) => {
    const keyboard = [
        [
            {
                text: `نعم ✅`,
                callback_data: `confirm_yes`,
            },

            {
                text: "الغاء ❌",
                callback_data: `confirm_cancel`,
            },
        ],
    ];

    await bot.sendMessage(chatId, `*هل أنت متأكد ؟*`, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: keyboard,
        },
    });
};

module.exports = { handleCallbackQuery, sendUserPage, sendCountryPage };
