module.exports = {
  testRunner: "jest-circus/runner",
  setupFilesAfterEnv: ["./detox.setup.js"],
  testEnvironment: "detox/runners/jest/testEnvironment.js",
};
