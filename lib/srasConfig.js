const buildExtensionRegex = (extensions) => {
  return new RegExp('\\.(' + extensions.join('|') + ')$');
};

const parseSRASConfig = (data) => {
  data = data || {};

  const rules = data.rules || {};
  const imgRules = rules.images || {};
  const audRules = rules.audio || {};
  const requiredTypes = [
    ...Object.keys(imgRules).filter((i) => !!imgRules[i].require),
    ...Object.keys(audRules).filter((i) => !!audRules[i].require),
  ];
  const ignored = buildExtensionRegex(data.ignore || []);
  const unpermitted = buildExtensionRegex(data.unpermitted || []);

  return {
    imgRules,
    audRules,
    requiredTypes,
    ignored,
    unpermitted,
  };
};

module.exports = { parseSRASConfig };
