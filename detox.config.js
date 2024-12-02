/** detox.config.js */
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json', // Додайте файл налаштувань Jest, якщо ще не існує
  configurations: {
    android: {
      type: 'android.emulator',
      name: 'Pixel_4_API_30', // Замініть на назву вашого емулятора
    },
    ios: {
      type: 'ios.simulator',
      name: 'iPhone 14', // Замініть на потрібну модель
    },
  },
};
