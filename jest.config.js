/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  verbose: true,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(nanoid)/)'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
