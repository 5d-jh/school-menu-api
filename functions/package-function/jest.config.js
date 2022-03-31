/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 10000,
  setupFilesAfterEnv: ['../mocks/http/jest.mockFetch.js']
}
