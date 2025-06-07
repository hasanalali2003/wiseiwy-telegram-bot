/**
 * Generates the main keyboard for admin users.
 *
 * Keyboard layout:
 * - Row 1: "عرض المستخدمين" (View Users)
 * - Row 2: "تعديل اسعار البطاقات", "تعديل سعر الصرف" (Edit Card Prices, Edit Exchange Rate)
 * - Row 3: "إرسال رسالة للكل" (Send Message to All)
 */
const adminMainKeyboard = () => ({
    reply_markup: {
        keyboard: [
            ["عرض المستخدمين"],
            ["تعديل اسعار البطاقات", "تعديل سعر الصرف"],
            ["إرسال رسالة للكل"],
        ],
        resize_keyboard: true,
    },
});

module.exports = adminMainKeyboard;
