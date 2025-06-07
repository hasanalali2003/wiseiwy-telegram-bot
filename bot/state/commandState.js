// In-memory storage for user commands keyed by chat ID
const userCommand = {};

/**
 * Get the current command state for a chatId.
 * Returns a default command object if none exists.
 *
 * @param {string|number} chatId - Unique chat identifier
 * @returns {object} Current command state, e.g., { c: "start" }
 */
const getCommand = (chatId) => {
    return userCommand[chatId] ?? { c: "start" };
};

/**
 * Set or update the command state for a chatId.
 *
 * @param {string|number} chatId - Unique chat identifier
 * @param {object} newState - New command state to store
 */
const setCommand = (chatId, newState) => {
    userCommand[chatId] = newState;
};

module.exports = { getCommand, setCommand };
