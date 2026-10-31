const { expo } = require('./app.json');

module.exports = {
  ...expo,
  updates: {
    ...expo.updates,
    ...(process.env.EXPO_UPDATE_URL
      ? { url: process.env.EXPO_UPDATE_URL }
      : {}),
  },
};
