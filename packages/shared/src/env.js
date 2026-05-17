function getEnv(name, fallback) {
  const value = process.env[name];
  if (value !== undefined) {
    return value;
  }
  return fallback;
}

module.exports = { getEnv };
