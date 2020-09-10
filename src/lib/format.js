const formatMsToHRT = (ms) => {
  const milliseconds = ms % 1000;
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const formatted = [];
  if (hours > 0) {
    formatted.push(`${hours}h`);
  }
  if (minutes > 0) {
    formatted.push(`${minutes}m`);
  }
  if (seconds > 0) {
    formatted.push(`${seconds}s`);
  }
  formatted.push(`${milliseconds}ms`);

  return formatted.join(' ');
};

const formatHRTFileSize = (size) => {
  const units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];
  let i = 0;
  for (; size >= 1024 && i < units.length; i++) {
    size /= 1024;
  }
  return `${Math.round(size * 100) / 100} ${units[i]}`;
};

module.exports = { formatMsToHRT, formatHRTFileSize };
