const isPowerOfTwo = (num) => (num !== 0) && ((num & (num - 1)) === 0);

module.exports = { isPowerOfTwo };
