const config = require('./jest.config');

config.collectCoverage = false;
config.testMatch = [
  "**/src/**/*\.ispec.+(ts|tsx)",
  "**/examples/**/*\.ispec.+(ts|tsx)"
];

console.info(`RUNNING INTEGRATION TESTS ${config.collectCoverage ? 'WITH COVERAGE' : ''}`);

module.exports = config;
