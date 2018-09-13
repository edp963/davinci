/**
 * This script will extract the internationalization messages from all components
   and package them in the translation json files in the translations file.
 */
const fs = require('fs')
const nodeGlob = require('glob')
const transform = require('babel-core').transform

const animateProgress = require('./helpers/progress')
const addCheckmark = require('./helpers/checkmark')

const pkg = require('../../package.json')
const presets = pkg.babel.presets
const plugins = pkg.babel.plugins || []

const i18n = require('../../app/i18n')
import { DEFAULT_LOCALE } from '../../app/containers/App/constants'

require('shelljs/global')

// Glob to match all js files except test files
const FILES_TO_PARSE = 'app/**/!(*.test).js'
const locales = i18n.appLocales

const newLine = () => process.stdout.write('\n')

// Progress Logger
let progress
const task = (message) => {
  progress = animateProgress(message)
  process.stdout.write(message)

  return (error) => {
    if (error) {
      process.stderr.write(error)
    }
    clearTimeout(progress)
    return addCheckmark(() => newLine())
  }
}

// Wrap async functions below into a promise
const glob = (pattern) => new Promise((resolve, reject) => {
  nodeGlob(pattern, (error, value) => (error ? reject(error) : resolve(value)))
})

const readFile = (fileName) => new Promise((resolve, reject) => {
  fs.readFile(fileName, (error, value) => (error ? reject(error) : resolve(value)))
})

const writeFile = (fileName, data) => new Promise((resolve, reject) => {
  fs.writeFile(fileName, data, (error, value) => (error ? reject(error) : resolve(value)))
})

// Store existing translations into memory
const oldLocaleMappings = []
const localeMappings = []
// Loop to run once per locale
for (const locale of locales) {
  oldLocaleMappings[locale] = {}
  localeMappings[locale] = {}
  // File to store translation messages into
  const translationFileName = `app/translations/${locale}.json`
  try {
    // Parse the old translation message JSON files
    const messages = JSON.parse(fs.readFileSync(translationFileName))
    const messageKeys = Object.keys(messages)
    for (const messageKey of messageKeys) {
      oldLocaleMappings[locale][messageKey] = messages[messageKey]
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      process.stderr.write(
        `There was an error loading this translation file: ${translationFileName}
        \n${error}`
      )
    }
  }
}

/* push `react-intl` plugin to the existing plugins that are already configured in `package.json`
   Example:
   ```
  "babel": {
    "plugins": [
      ["transform-object-rest-spread", { "useBuiltIns": true }]
    ],
    "presets": [
      "latest",
      "react"
    ]
  }
  ```
*/
plugins.push(['react-intl'])

const extractFromFile = async (fileName) => {
  try {
    const code = await readFile(fileName)
    // Use babel plugin to extract instances where react-intl is used
    const { metadata: result } = await transform(code, { presets, plugins }) // object-shorthand
    for (const message of result['react-intl'].messages) {
      for (const locale of locales) {
        const oldLocaleMapping = oldLocaleMappings[locale][message.id]
        // Merge old translations into the babel extracted instances where react-intl is used
        const newMsg = (locale === DEFAULT_LOCALE) ? message.defaultMessage : ''
        localeMappings[locale][message.id] = (oldLocaleMapping)
          ? oldLocaleMapping
          : newMsg
      }
    }
  } catch (error) {
    process.stderr.write(`Error transforming file: ${fileName}\n${error}`)
  }
};

(async function main () {
  const memoryTaskDone = task('Storing language files in memory')
  const files = await glob(FILES_TO_PARSE)
  memoryTaskDone()

  const extractTaskDone = task('Run extraction on all files')
  // Run extraction on all files that match the glob on line 16
  await Promise.all(files.map((fileName) => extractFromFile(fileName)))
  extractTaskDone()

  // Make the directory if it doesn't exist, especially for first run
  mkdir('-p', 'app/translations')
  for (const locale of locales) {
    const translationFileName = `app/translations/${locale}.json`

    try {
      const localeTaskDone = task(
        `Writing translation messages for ${locale} to: ${translationFileName}`
      )

      // Sort the translation JSON file so that git diffing is easier
      // Otherwise the translation messages will jump around every time we extract
      let messages = {}
      Object.keys(localeMappings[locale]).sort().forEach(function (key) {
        messages[key] = localeMappings[locale][key]
      })

      // Write to file the JSON representation of the translation messages
      const prettified = `${JSON.stringify(messages, null, 2)}\n`

      await writeFile(translationFileName, prettified)

      localeTaskDone()
    } catch (error) {
      localeTaskDone(
        `There was an error saving this translation file: ${translationFileName}
        \n${error}`
      )
    }
  }

  process.exit()
}())
