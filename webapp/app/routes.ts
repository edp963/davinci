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
import { RouteProps } from 'react-router'

import Report from './containers/Report'
import Group from './containers/Group'
import User from './containers/User'
import Source from './containers/Source'
import Bizlogics from './containers/Bizlogic'
import Bizlogic from './containers/Bizlogic/Bizlogic'
import Widget from './containers/Widget'
import Viz from './containers/Viz'
import Dashboard from './containers/Dashboard'
import Grid from './containers/Dashboard/Grid'
import Register from './containers/Register'
import Activate from './containers/Register/Activate'
import Login from './containers/Login'
import Main from './containers/Main'
import Schedule from './containers/Schedule'
import Display from './containers/Display'
import Editor from './containers/Display/Editor'
import Preview from './containers/Display/Preview'
import Account from './containers/Account'
import Projects from './containers/Projects'
import Profile from './containers/Profile'
import ResetPassword from './containers/ResetPassword'
import Organizations from './containers/Organizations/index'
import Organization from './containers/Organizations/Organization'
import Teams from './containers/Teams/index'
import Team from './containers/Teams/Team'
import {replace} from 'react-router-redux'

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

  // return [
  //   {
  //     path: '/login',
  //     component: Login
  //   },
  //   {
  //     path: '/register',
  //     name: 'register',
  //     component: Register
  //   },
  //   {
  //     path: '/activate',
  //     name: 'activate',
  //     component: Activate
  //   },
  //   {
  //     component: Main,
  //     childRoutes: [
  //       {
  //         path: '/report',
  //         name: 'report',
  //         indexRoute: {
  //           onEnter: (_, replace) => {
  //             replace('/report/dashboards')
  //           }
  //         },
  //         component: Report,
  //         childRoutes: [
  //           {
  //             path: '/report/dashboards',
  //             name: 'dashboards',
  //             component: Dashboard
  //           },
  //           {
  //             path: '/report/dashboard/:dashboardId',
  //             name: 'dashboard',
  //             component: Grid
  //           },
  //           {
  //             path: '/report/widgets',
  //             name: 'widgets',
  //             component: Widget
  //           },
  //           {
  //             path: '/report/bizlogics',
  //             name: 'bizlogics',
  //             component: Bizlogic
  //           },
  //           {
  //             path: '/report/sources',
  //             name: 'sources',
  //             component: Source
  //           },
  //           {
  //             path: '/report/users',
  //             name: 'users',
  //             component: User
  //           },
  //           {
  //             path: '/report/groups',
  //             name: 'groups',
  //             component: Group
  //           },
  //           {
  //             path: '/report/schedule',
  //             name: 'schedule',
  //             component: Schedule
  //           }
  //         ]
  //       },
  //       {
  //         path: '/display',
  //         name: 'display',
  //         component: Display
  //       },
  //       {
  //         path: '/account',
  //         name: 'account',
  //         indexRoute: {
  //           onEnter: (_, replace) => {
  //             replace('/account/profile')
  //           }
  //         },
  //         component: Account,
  //         childRoutes: [
  //           {
  //             path: '/account/profile',
  //             name: 'profile',
  //             component: Profile
  //           },
  //           {
  //             path: '/account/resetPassword',
  //             name: 'resetPassword',
  //             component: ResetPassword
  //           },
  //           {
  //             path: '/account/organizations',
  //             name: 'organizations',
  //             component: Organizations
  //           },
  //           {
  //             path: '/account/organization/:organizationId',
  //             name: 'organization',
  //             component: Organization
  //           },
  //           {
  //             path: '/account/teams',
  //             name: 'teams',
  //             component: Teams
  //           },
  //           {
  //             path: '/account/team/:teamId',
  //             name: 'team',
  //             component: Team
  //           }
  //         ]
  //       },
  //       {
  //         path: '/project',
  //         name: 'project',
  //         component: Projects
  //       }
  //     ]
  //   },
  //   {
  //     path: '*',
  //     name: 'notfound',
  //     getComponent (nextState, cb) {
  //       import('./containers/NotFoundPage')
  //         .then(loadModule(cb))
  //         .catch(errorLoading)
  //     }
  //   }
  // ]

  return [
    {
      path: '/login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/activate',
      name: 'activate',
      component: Activate
    },
    {
      component: Main,
      childRoutes: [
        {
          path: '/projects',
          name: 'projects',
          component: Projects
        },
        {
          path: '/project/:pid',
          name: 'project',
          component: Report,
          indexRoute: {
            onEnter: (_, replace) => {
              const { params } = _
              replace(`/project/${params.pid}/dashboards`)
            }
          },
          childRoutes: [
            {
              path: '/project/:pid/vizs',
              name: 'vizs',
              components: Viz
            },
            {
              path: '/project/:pid/dashboards',
              name: 'dashboards',
              component: Dashboard
            },
            // {
            //   path: '/project/:pid/dashboard/:did/portal/:pid',
            //   name: 'dashboards',
            //   component: Dashboard
            // },
            // todo 待dashboard portal完成后，删除此路由
            {
              path: '/project/:pid/dashboard/:dashboardId',
              name: 'dashboard',
              component: Grid
            },
            {
              path: '/project/:pid/widgets',
              name: 'widgets',
              component: Widget
            },
            {
              path: '/project/:pid/bizlogics',
              name: 'bizlogics',
              component: Bizlogics
            },
            {
              path: '/project/:pid/sources',
              name: 'sources',
              component: Source
            },
            {
              path: '/project/:pid/users',
              name: 'users',
              component: User
            },
            {
              path: '/project/:pid/groups',
              name: 'groups',
              component: Group
            },
            {
              path: '/project/:pid/schedule',
              name: 'schedule',
              component: Schedule
            },
            {
              path: '/project/:pid/displays',
              name: 'displays',
              component: Display
            }
          ]
        },
        {
          path: '/account',
          name: 'account',
          indexRoute: {
            onEnter: (_, replace) => {
              replace('/account/profile')
            }
          },
          component: Account,
          childRoutes: [
            {
              path: '/account/profile',
              name: 'profile',
              component: Profile
            },
            {
              path: '/account/resetPassword',
              name: 'resetPassword',
              component: ResetPassword
            },
            {
              path: '/account/organizations',
              name: 'organizations',
              component: Organizations
            },
            {
              path: '/account/organization/:organizationId',
              name: 'organization',
              component: Organization
            },
            {
              path: '/account/teams',
              name: 'teams',
              component: Teams
            },
            {
              path: '/account/team/:teamId',
              name: 'team',
              component: Team
            }
          ]
        },
        {
          path: '/project/:pid/display/:displayId',
          name: 'display',
          component: Editor
        },
        {
          path: '/project/:pid/display/preview/:displayId',
          name: 'displayPreview',
          component: Preview
        },
        {
          path: '/project/:pid/bizlogic',
          name: 'bizlogic',
          component: Bizlogic
        },
        {
          path: '/project/:pid/bizlogic/:bid',
          name: 'bizlogic',
          component: Bizlogic
        }
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
