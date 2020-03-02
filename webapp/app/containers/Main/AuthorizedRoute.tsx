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

import React from 'react'
import { Route, RouteProps } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { makeSelectCurrentProject } from 'containers/Projects/selectors'

import { IProjectPermission } from 'containers/Projects/types'

import { NoAuthorization } from 'containers/NoAuthorization/Loadable'

interface IAuthorizedRouteProps extends RouteProps {
  permission: keyof IProjectPermission
  redirect?: boolean
}

const AuthorizedRoute: React.FC<IAuthorizedRouteProps> = (props) => {
  const { permission, ...rest } = props

  const currentProject = useSelector(makeSelectCurrentProject())
  if (!currentProject || !currentProject.permission) {
    return null
  }

  if (!currentProject.permission[permission]) {
    return (
      <Route {...rest} component={NoAuthorization} />
    )
  }

  return (
    <Route {...rest} />
  )
}

export default AuthorizedRoute
