const { User, GiftCard } = require("../models/allModels");

/**
 * Calculates the total price of a specific gift card for a user.
 *
 * @param {string} userId - The user's unique identifier
 * @param {string} cardId - The gift card's unique identifier
 * @returns {Promise<object>} Object containing formatted giftcardTotalPrice, giftcardRate, and giftcardValue
 */
const calculateGiftcard = async (userId, cardId) => {
    // Fetch the user document by userId
    const user = await User.findOne({ userId });
    if (!user) throw new Error(`User not found with userId: ${userId}`);

    // Get the specific giftcard subdocument by cardId
    const card = user.giftcards.id(cardId);
    if (!card) throw new Error(`Giftcard not found with cardId: ${cardId}`);

    // Find the current rate for the giftcard type and country
    const rate = await GiftCard.findOne({
        type: card.type,
        country: card.country,
    });

    if (!rate)
        throw new Error(
            `Rate not found for type: ${card.type} and country: ${card.country}`
        );

    // Convert values to numbers and fix to 2 decimal places
    const giftcardRate = Number(rate.price).toFixed(2);
    const giftcardValue = Number(card.value).toFixed(2);

    // Calculate total price (as a number) and format to 2 decimals
    const giftcardTotalPrice = (giftcardValue * giftcardRate).toFixed(2);

    return { giftcardTotalPrice, giftcardRate, giftcardValue };
};

module.exports = { calculateGiftcard };
