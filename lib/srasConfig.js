const parseSRASConfig = (data) => {
  data = data || {};

  const rules = data.rules || {};
  const jsRules = rules.js || {};
  const imgRules = rules.images || {};
  const audRules = rules.audio || {};
  const requiredTypes = [
    ...Object.keys(imgRules).filter((i) => !!imgRules[i].require),
    ...Object.keys(audRules).filter((i) => !!audRules[i].require),
  ];

  let ignored = /$doesntmatch/;
  if (data.ignore) {
    ignored = new RegExp(data.ignore.join('|'));
  }

  let unpermitted = /$doesntmatch/;
  if (data.unpermitted) {
    unpermitted = new RegExp(data.unpermitted.join('|'));
  }

  return {
    jsRules,
    imgRules,
    audRules,
    requiredTypes,
    ignored,
    unpermitted,
  };
};

module.exports = { parseSRASConfig };
