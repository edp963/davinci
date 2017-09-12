/*-
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { applyRouterMiddleware, Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { useScroll } from 'react-router-scroll'
import config from '../app/globalConfig'

import App from './containers/App/index'

import { makeSelectLocationState } from 'containers/App/selectors'

import LanguageProvider from 'containers/LanguageProvider'

import '!file-loader?name=[name].[ext]!../app/favicon.ico'
import '!file-loader?name=[name].[ext]!../app/manifest.json'
import 'file-loader?name=[name].[ext]!../app/.htaccess'

import configureStore from './store'

import { translationMessages } from '../app/i18n'

import createRoutes from './routes'

import '../node_modules/antd/dist/antd.less'
import '../node_modules/react-grid-layout/css/styles.css'
import '../node_modules/react-resizable/css/styles.css'
import '../app/assets/fonts/iconfont.css'
import '../app/assets/override/antd.css'
import '../app/assets/override/react-grid.css'
import '../app/assets/less/style.less'

import echarts from 'echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/sankey'
import 'echarts/lib/chart/funnel'
import 'echarts/lib/chart/treemap'
import '../app/containers/Widget/temp/wordCloud'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'

echarts.registerTheme('default', config.echarts.theme.default)

const initialState = {}
const store = configureStore(initialState, hashHistory)

const history = syncHistoryWithStore(hashHistory, store, {
  selectLocationState: makeSelectLocationState()
})

const rootRoute = {
  path: '/',
  component: App,
  childRoutes: createRoutes(store),
  indexRoute: {
    onEnter: (_, replace) => {
      replace('/share')
    }
  }
}

const render = (messages) => {
  ReactDOM.render(
    <Provider store={store}>
      <LanguageProvider messages={messages}>
        <Router
          history={history}
          routes={rootRoute}
          render={
            // Scroll to top when going to a new page, imitating default browser
            // behaviour
            applyRouterMiddleware(useScroll())
          }
        />
      </LanguageProvider>
    </Provider>,
    document.getElementById('app')
  )
}

// Hot reloadable translation json files
if (module.hot) {
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept('../app/i18n', () => {
    render(translationMessages)
  })
}

// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
  (new Promise((resolve) => {
    resolve(import('intl'))
  }))
    .then(() => Promise.all([
      import('intl/locale-data/jsonp/en.js'),
      import('intl/locale-data/jsonp/de.js')
    ]))
    .then(() => render(translationMessages))
    .catch((err) => {
      throw err
    })
} else {
  render(translationMessages)
}

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install() // eslint-disable-line global-require
}

// if (process.env.NODE_ENV !== 'production') {
//   const { whyDidYouUpdate } = require('why-did-you-update')
//   whyDidYouUpdate(React)
// }
