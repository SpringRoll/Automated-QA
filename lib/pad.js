const left = (value, width, pad = ' ') => {
  while (value.length < width) {
    value = pad + value;
  }
  return value;
};

const right = (value, width, pad = ' ') => {
  while (value.length < width) {
    value += pad;
  }
  return value;
};

module.exports = { left, right };
