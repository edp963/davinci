const resolve = require('path').resolve
const pullAll = require('lodash/pullAll')
const uniq = require('lodash/uniq')

const davinci = {
  version: '0.3.0',

  /**
   * The DLL Plugin provides a dramatic speed increase to webpack build and hot module reloading
   * by caching the module metadata for all of our npm dependencies. We enable it by default
   * in development.
   *
   *
   * To disable the DLL Plugin, set this value to false.
   */
  dllPlugin: {
    defaults: {
      /**
       * we need to exclude dependencies which are not intended for the browser
       * by listing them here.
       */
      exclude: [
        'chalk',
        'compression',
        'cross-env',
        'express',
        'ip',
        'minimist'
      ],

      /**
       * Specify any additional dependencies here. We include core-js and lodash
       * since a lot of our dependencies depend on them and they get picked up by webpack.
       */
      include: [
        'core-js',
        'eventsource-polyfill',
        'babel-polyfill',
        'lodash'
      ],

      // The path where the DLL manifest and bundle will get built
      path: resolve('../node_modules/davinci-dlls')
    },

    entry (pkg) {
      const dependencyNames = Object.keys(pkg.dependencies)
      const exclude = pkg.dllPlugin.exclude || davinci.dllPlugin.defaults.exclude
      const include = pkg.dllPlugin.include || davinci.dllPlugin.defaults.include
      const includeDependencies = uniq(dependencyNames.concat(include))

      return {
        davinciDeps: pullAll(includeDependencies, exclude)
      }
    }
  }
}

module.exports = davinci
