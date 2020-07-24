const parseSRASConfig = (data) => {
  data = data || {};

  const rules = data.rules || {};
  const codeRules = rules.code || {};
  const imgRules = rules.images || {};
  const audRules = rules.audio || {};
  const requiredTypes = [
    ...Object.keys(imgRules).filter((i) => !!imgRules[i].require),
    ...Object.keys(audRules).filter((i) => !!audRules[i].require),
  ];

  const ignored = data.ignore ? new RegExp(data.ignore.join('|')) : /$doesntmatch/;
  const unpermitted = data.unpermitted ? new RegExp(data.unpermitted.join('|')) : /$doesntmatch/;

  return {
    codeRules,
    imgRules,
    audRules,
    requiredTypes,
    ignored,
    unpermitted,
  };
};

module.exports = { parseSRASConfig };
