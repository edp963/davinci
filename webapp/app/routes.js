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

// import { getAsyncInjectors } from './utils/asyncInjectors'

import Report from './containers/Report'
import Group from './containers/Group'
import User from './containers/User'
import Source from './containers/Source'
import Bizlogic from './containers/Bizlogic'
import Widget from './containers/Widget'
import Dashboard from './containers/Dashboard'
import Grid from './containers/Dashboard/Grid'
import Login from './containers/Login'
import Visual from './containers/Visual'

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
      path: '/login',
      component: Login
    },
    {
      path: '/visual',
      component: Visual,
      indexRoute: {
        onEnter: (_, replace) => {
          replace('/visual/report')
        }
      },
      childRoutes: [
        {
          path: '/visual/report',
          name: 'report',
          indexRoute: {
            onEnter: (_, replace) => {
              replace('/visual/report/dashboard')
            }
          },
          component: Report,
          childRoutes: [
            {
              path: '/visual/report/dashboard',
              name: 'dashboard',
              component: Dashboard
            },
            {
              path: '/visual/report/grid/:id',
              name: 'grid',
              component: Grid
            },
            {
              path: '/visual/report/widget',
              name: 'widget',
              component: Widget
            },
            {
              path: '/visual/report/bizlogic',
              name: 'bizlogic',
              component: Bizlogic
            },
            {
              path: '/visual/report/source',
              name: 'source',
              component: Source
            },
            {
              path: '/visual/report/user',
              name: 'user',
              component: User
            },
            {
              path: '/visual/report/group',
              name: 'group',
              component: Group
            }
          ]
        }
      ]
    },
    {
      path: '*',
      name: 'notfound',
      getComponent (nextState, cb) {
        import('containers/NotFoundPage')
          .then(loadModule(cb))
          .catch(errorLoading)
      }
    }
  ]
}
