// Simple in-memory temporary state storage shared across all imports
const state = {};

/**
 * Set temporary state data for a given chatId.
 * @param {string|number} chatId - Unique chat identifier
 * @param {any} data - Data to store temporarily
 */
function setTempState(chatId, data) {
    state[chatId] = data;
}

/**
 * Retrieve temporary state data for a given chatId.
 * @param {string|number} chatId - Unique chat identifier
 * @returns {any} Stored temporary data or undefined if none
 */
function getTempState(chatId) {
    return state[chatId];
}

/**
 * Clear temporary state data for a given chatId.
 * @param {string|number} chatId - Unique chat identifier
 */
function clearTempState(chatId) {
    delete state[chatId];
}

module.exports = {
    setTempState,
    getTempState,
    clearTempState,
};
