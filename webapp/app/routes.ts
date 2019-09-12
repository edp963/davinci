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

import { RouteProps } from 'react-router'

import Report from 'containers/Report'
import SourceList from 'containers/Source'

import ViewIndex from 'containers/View'
import ViewEditor from 'containers/View/Editor'

import Widget from 'containers/Widget'
import Workbench from 'containers/Widget/components/Workbench/index'
import Viz from 'containers/Viz'
import Dashboard from 'containers/Dashboard'
import Grid from 'containers/Dashboard/Grid'
import Register from 'containers/Register'
import Activate from 'containers/Register/Activate'
import JoinOrganization from 'containers/Register/JoinOrganization'
import Background from 'containers/Background'
import Login from 'containers/Login'
import Main from 'containers/Main'
import Schedule from 'containers/Schedule'
import Editor from 'containers/Display/Editor'
import Preview from 'containers/Display/Preview'
import Account from 'containers/Account'
import Projects from 'containers/Projects/index'
import Profile from 'containers/Profile'
import ResetPassword from 'containers/ResetPassword'
import Organizations from 'containers/Organizations/index'
import Organization from 'containers/Organizations/Organization'
import UserProfile from 'containers/Profile/UserProfile'
import {replace} from 'react-router-redux'
import NoAuthorization from 'containers/NoAuthorization'

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
  return [
    {
      component: Background,
      childRoutes: [
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
          path: '/joinOrganization',
          name: 'joinOrganization',
          component: JoinOrganization
        }
      ]
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
          // indexRoute: {
          //   onEnter: (_, replace) => {
          //     const { params } = _
          //     replace(`/project/${params.pid}/vizs`)
          //   }
          // },
          childRoutes: [
            {
              path: '/project/:pid/vizs',
              name: 'vizs',
              components: Viz
            },
            {
              path: '/project/:pid/widgets',
              name: 'widgets',
              component: Widget
            },
            {
              path: '/project/:pid/views',
              name: 'views',
              component: ViewIndex
            },
            {
              path: '/project/:pid/sources',
              name: 'sources',
              component: SourceList
            },
            {
              path: '/project/:pid/schedule',
              name: 'schedule',
              component: Schedule
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
              path: '/account/profile/:uid',
              name: 'userProfile',
              component: UserProfile
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
            }
          ]
        },
        {
          path: '/project/:pid/view(/:viewId)',
          name: 'viewEditor',
          component: ViewEditor
        },
        {
          path: '/project/:pid/portal/:portalId/portalName/:portalName',
          name: 'dashboard',
          component: Dashboard,
          childRoutes: [
            {
              path: '/project/:pid/portal/:portalId/portalName/:portalName/dashboard/:dashboardId',
              name: 'grid',
              component: Grid
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
          path: '/project/:pid/widget/:wid',
          name: 'workbench',
          component: Workbench
        }
      ]
    },
    {
      path: '/noAuthorization',
      name: 'noAuthorization',
      component: NoAuthorization
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

export interface IRouteParams {
  pid?: string
  viewId?: string
}
