const config = require('./jest.config');

config.collectCoverage = true;
config.testMatch = [
  "**/src/**/*\.spec.+(ts|tsx)"
];
config.coverageThreshold = {
  global: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100
  }
};

console.info(`RUNNING UNIT TESTS ${config.collectCoverage ? 'WITH COVERAGE' : ''}`);

module.exports = config;
