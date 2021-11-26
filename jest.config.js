require('jest-preset-angular/ngcc-jest-processor');

module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/projects/ngx-translate-module-loader'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': 'jest-preset-angular'
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  setupFilesAfterEnv: ['<rootDir>/projects/ngx-translate-module-loader/src/test.ts'],
  coveragePathIgnorePatterns: ['models', 'public_api', 'test']
};
