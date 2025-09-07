module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/lib/**",
  ],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  clearMocks: true,
  resetMocks: true,
};
