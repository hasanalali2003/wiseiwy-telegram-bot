const mongoose = require("mongoose");

// Schema for individual giftcards owned by users
const giftcardSchema = new mongoose.Schema({
    type: { type: String, required: true }, // Giftcard type, e.g. "Amazon", "iTunes"
    country: { type: String, required: true }, // Country code, e.g. "US", "UK"
    pin: { type: String, required: true }, // Giftcard PIN code
    value: { type: Number, required: true }, // Monetary value of the giftcard
    link: { type: String, required: true }, // Link to the giftcard or related info
});

// Schema for users, including their giftcards and admin status
const userSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true }, // Telegram user ID
    username: { type: String }, // Telegram username (optional)
    giftcards: [giftcardSchema], // Array of user's giftcards
    isAdmin: { type: Boolean, default: false }, // Admin flag
});

// Schema for giftcard prices by type and country
const giftcardPriceSchema = new mongoose.Schema({
    type: { type: String, required: true }, // Giftcard type
    country: { type: String, required: true }, // Country code
    price: { type: Number, required: true }, // Local price of this giftcard type
});

// Schema for currency exchange rates
const exchangeRateSchema = new mongoose.Schema({
    currency: { type: String, required: true, unique: true }, // Currency code e.g. "USD"
    rate: { type: Number, required: true }, // Exchange rate (e.g., 1.0 for USD)
});

// Models based on the schemas
const GiftCard = mongoose.model("GiftcardPrice", giftcardPriceSchema);
const Rate = mongoose.model("ExchangeRate", exchangeRateSchema);
const User = mongoose.model("User", userSchema);

module.exports = { User, Rate, GiftCard };
