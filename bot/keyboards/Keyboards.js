// List of supported countries with flags for display
const countries = [
    "USA 🇺🇸",
    "UK 🇬🇧",
    "Germany 🇩🇪",
    "France 🇫🇷",
    "Sweden 🇸🇪",
    "Italy 🇮🇹",
    "Spain 🇪🇸",
    "Netherlands 🇳🇱",
    "Canada 🇨🇦",
];

// Supported gift card types
const cards = ["Amazon", "Mastercard", "PayPal", "VisaCard", "GoGift"];

/**
 * Generates a Telegram keyboard with country options (one button per row).
 */
const countryKeyboard = () => ({
    reply_markup: {
        keyboard: countries.map((c) => [c]), // each country in its own row
        resize_keyboard: true,
    },
});

/**
 * Generates a Telegram keyboard with gift card type options (one button per row).
 */
const cardTypeKeyboard = () => ({
    reply_markup: {
        keyboard: cards.map((c) => [c]),
        resize_keyboard: true,
    },
});

/**
 * Generates a keyboard with a single "Cancel" button.
 */
const cancelKeyboard = () => ({
    reply_markup: {
        keyboard: [["❌ Cancel"]],
        resize_keyboard: true,
    },
});

/**
 * Generates a keyboard with "Done" and "Cancel" buttons side by side.
 */
const doneCancelKeyboard = () => ({
    reply_markup: {
        keyboard: [["✅ Done", "❌ Cancel"]],
        resize_keyboard: true,
    },
});

/**
 * Removes the custom keyboard (returns to default input).
 */
const removeKeyboard = () => ({
    reply_markup: {
        remove_keyboard: true,
    },
});

module.exports = {
    countryKeyboard,
    cardTypeKeyboard,
    cancelKeyboard,
    doneCancelKeyboard,
    removeKeyboard,
};
