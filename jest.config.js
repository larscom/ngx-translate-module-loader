module.exports = {
  preset: 'jest-preset-angular',
  globalSetup: 'jest-preset-angular/global-setup',
  roots: ['<rootDir>/projects/ngx-translate-module-loader'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  setupFilesAfterEnv: ['<rootDir>/projects/ngx-translate-module-loader/src/test.ts'],
  coveragePathIgnorePatterns: ['models', 'public_api', 'test']
};
