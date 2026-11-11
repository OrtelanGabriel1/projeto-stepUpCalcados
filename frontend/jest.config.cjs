module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Testes - StepUp Calçados',
        outputPath: '<rootDir>/tests/reports/jest-report.html',
        includeFailureMsg: true
      }
    ]
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx'
  ],
  coverageDirectory: '<rootDir>/coverage'
};
