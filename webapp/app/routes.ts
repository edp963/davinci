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
import { Route, RouteProps } from 'react-router'

import Report from './containers/Report'
import Group from './containers/Group'
import User from './containers/User'
import Source from './containers/Source'
import Bizlogic from './containers/Bizlogic'
import Widget from './containers/Widget'
import Dashboard from './containers/Dashboard'
// import Grid from './containers/Dashboard/Grid'
import Login from './containers/Login'
import Main from './containers/Main'
import Schedule from './containers/Schedule'
// import Display from './containers/Display'

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err) // eslint-disable-line no-console
}

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default)
}

interface IExtendedRouteProps extends RouteProps {
  name?: string
  indexRoute?: object
  childRoutes?: IExtendedRouteProps[]
}

export default function createRoutes (store): IExtendedRouteProps[] {
  // const { injectReducer, injectSagas } = getAsyncInjectors(store)

  return [
    {
      path: '/login',
      component: Login
    },
    {
      component: Main,
      childRoutes: [
        {
          path: '/report',
          name: 'report',
          indexRoute: {
            onEnter: (_, replace) => {
              replace('/report/dashboards')
            }
          },
          component: Report,
          childRoutes: [
            {
              path: '/report/dashboards',
              name: 'dashboards',
              component: Dashboard
            },
            // {
            //   path: '/report/dashboard/:dashboardId',
            //   name: 'dashboard',
            //   component: Grid
            // },
            {
              path: '/report/widgets',
              name: 'widgets',
              component: Widget
            },
            {
              path: '/report/bizlogics',
              name: 'bizlogics',
              component: Bizlogic
            },
            {
              path: '/report/sources',
              name: 'sources',
              component: Source
            },
            {
              path: '/report/users',
              name: 'users',
              component: User
            },
            {
              path: '/report/groups',
              name: 'groups',
              component: Group
            },
            {
              path: '/report/schedule',
              name: 'schedule',
              component: Schedule
            }
          ]
        }
        // {
        //   path: '/display',
        //   name: 'display',
        //   component: Display
        // }
      ]
    },
    {
      path: '*',
      name: 'notfound',
      getComponent (nextState, cb) {
        import('./containers/NotFoundPage')
          .then(loadModule(cb))
          .catch(errorLoading)
      }
    }
  ]
}
