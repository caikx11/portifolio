import nextJest from 'next/jest.js';
export default nextJest({ dir: './' })({ testEnvironment: 'node', testMatch: ['**/__tests__/**/*.test.js'] });
