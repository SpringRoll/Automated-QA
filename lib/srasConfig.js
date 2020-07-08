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

  const ignored = data.ignore ? /$doesntmatch/ : new RegExp(data.ignore.join('|'));
  const unpermitted = data.ignore ? /$doesntmatch/ : new RegExp(data.unpermitted.join('|'));

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
