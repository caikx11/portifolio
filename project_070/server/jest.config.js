const nextJest = require('next/jest');
module.exports = nextJest({ dir: './' })({ testEnvironment: 'node', moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' }, testMatch: ['**/__tests__/**/*.test.ts'] });
