// In-memory storage for user states, keyed by chat ID
const userStates = {};

/**
 * Retrieves the current state for a given chatId.
 * Returns a default state if none is found.
 *
 * @param {string|number} chatId - The chat identifier
 * @returns {object} User state object
 */
const getState = (chatId) => {
    return userStates[chatId] ?? { step: "country", data: {} };
};

/**
 * Updates the state for a given chatId.
 *
 * @param {string|number} chatId - The chat identifier
 * @param {object} newState - New state object to save
 */
const setState = (chatId, newState) => {
    userStates[chatId] = newState;
};

module.exports = { getState, setState };
