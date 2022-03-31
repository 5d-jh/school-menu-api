/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 15000,
  automock: false,
  setupFilesAfterEnv: ['../mocks/http/jest.mockFetch.js']
}
