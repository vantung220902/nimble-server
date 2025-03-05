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
    'src/**/*.{service,handler,config,controller,subscriber}.{js,ts}',
    'src/common/**/*',
    '!src/common/guards/**/*.{js,ts}',
    '!src/common/interfaces/**/*.{js,ts}',
    '!src/**/*.index.{js,ts}',
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
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@config': '<rootDir>/src/config',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@database': '<rootDir>/src/database',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@common': '<rootDir>/src/common',
    '^@email/(.*)$': '<rootDir>/src/email/$1',
    '^@email': '<rootDir>/src/email',
    '^@redis/(.*)$': '<rootDir>/src/redis/$1',
    '^@redis': '<rootDir>/src/redis',
    '^@logger/(.*)$': '<rootDir>/src/logger/$1',
    '^@logger': '<rootDir>/src/logger',
    '^@health/(.*)$': '<rootDir>/src/health/$1',
    '^@health': '<rootDir>/src/health',
  },
};
