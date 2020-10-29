module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  collectCoverage: true,
  coverageReporters: ['html', 'lcov', 'text-summary'],
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/app.tsx',
    '!app/*/*/Loadable.{ts,tsx}'
  ],
  // coverageThreshold: {
  //   global: {
  //     statements: 98,
  //     branches: 91,
  //     functions: 98,
  //     lines: 98
  //   }
  // },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
  moduleDirectories: ['node_modules', 'libs', 'app'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '.*\\.(css|less|styl|scss|sass)$': '<rootDir>/test/mocks/cssModule.js',
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/mocks/image.js',
    '^app/(.*)$': '<rootDir>/app/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
    '^libs/(.*)$': '<rootDir>/libs/$1',
    '^assets/fonts/(.*)$': '<rootDir>/test/mocks/font.js'
  },
  setupFilesAfterEnv: [
    // '<rootDir>/test/utils/test-bundler.js',
    '@testing-library/jest-dom/extend-expect'
  ],
  setupFiles: ['raf/polyfill'],
  snapshotSerializers: [],
  testRegex: '\\/test\\/.*\\.test\\.tsx?$',
  transform: {
    // '^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    // '^.+\\.svg$': 'jest-svg-transformer'
  }
}
