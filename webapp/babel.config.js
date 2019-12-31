module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false
      }
    ],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    'react-hot-loader/babel',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": true
    }],
    ["transform-imports", {
      "react-router": {
        "transform": "react-router/${member}",
        "preventFullImport": true
      },
      "lodash": {
        "transform": "lodash/${member}",
        "preventFullImport": true
      }
    }]
  ],
  env: {
    production: {
      only: ['app', 'libs', 'share'],
      plugins: [
        'lodash',
        'transform-react-remove-prop-types',
        // '@babel/plugin-transform-react-inline-elements',
        '@babel/plugin-transform-react-constant-elements'
      ]
    },
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        'dynamic-import-node'
      ]
    }
  }
}
