/*
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

// import { getAsyncInjectors } from './utils/asyncInjectors'

import Dashboard from './containers/Dashboard'
import Display from './containers/Display'

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err) // eslint-disable-line no-console
}

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default)
}

export default function createRoutes (store) {
  // const { injectReducer, injectSagas } = getAsyncInjectors(store)

  return [
    {
      path: '/share/dashboard',
      component: Dashboard
    },
    {
      path: '/share/display',
      component: Display
    },
    {
      path: '*',
      name: 'notfound',
      getComponent (nextState, cb) {
        import('../app/containers/NotFoundPage')
          .then(loadModule(cb))
          .catch(errorLoading)
      }
    }
  ]
}
