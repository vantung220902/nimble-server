module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/app.ts',
    '!src/main.ts',
    '!src/workers/**/*.{js,ts}',
    '!src/generated/**/*.{js,ts}',
    '!src/events/**/*.{js,ts}',
    '!src/integration/**/*.{js,ts}',
    '!**/index.ts',
    '!**/*.module.ts',
  ],
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports',
        outputName: 'jest-junit.xml',
      },
    ],
  ],
  verbose: true,
  coverageDirectory: './coverage',
  setupFiles: ['./jest.setup.ts'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@generated/(.*)$': '<rootDir>/src/generated/$1',
    '^@generated': '<rootDir>/src/generated',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@services': '<rootDir>/src/services',
    '^@events/(.*)$': '<rootDir>/src/events/$1',
    '^@events': '<rootDir>/src/events',
    '^@integration/(.*)$': '<rootDir>/src/integration/$1',
    '^@integration': '<rootDir>/src/integration',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@common': '<rootDir>/src/common',
    '^@events/(.*)$': '<rootDir>/src/events/$1',
    '^@events': '<rootDir>/src/events',
    '^@workers/(.*)$': '<rootDir>/src/workers/$1',
    '^@workers': '<rootDir>/src/workers',
  },
};
