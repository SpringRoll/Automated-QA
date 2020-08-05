/**
 * Pads a string on the left
 * @param {string} value The string to pad
 * @param {number} width The total width of the string after padding
 * @param {string} pad The string to pad with
 * @return {string} The padded string
 */
const left = (value, width, pad = ' ') => {
  while (value.length < width) {
    value = pad + value;
  }
  return value;
};

/**
 * Pads a string on the right
 * @param {string} value The string to pad
 * @param {number} width The total width of the string after padding
 * @param {string} pad The string to pad with
 * @return {string} The padded string
 */
const right = (value, width, pad = ' ') => {
  while (value.length < width) {
    value += pad;
  }
  return value;
};

module.exports = { left, right };
