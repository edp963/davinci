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

import { matchPath } from 'react-router-dom'

import { IRouteParams } from 'utils/types'

export const matchPortalPath = (pathname: string, exact: boolean = false) => {
  const result = matchPath<IRouteParams>(pathname, {
    path: '/project/:projectId/portal/:portalId',
    exact,
    strict: false
  })
  return result
}

export const matchDisplayPath = (pathname: string, exact: boolean = false) => {
  const result = matchPath<IRouteParams>(pathname, {
    path: '/project/:projectId/display/:displayId/(preview)?',
    exact,
    strict: false
  })
  return result
}

export const matchDisplaySlidePath = (pathname: string, exact: boolean = true) => {
  const result = matchPath<IRouteParams>(pathname, {
    path: '/project/:projectId/display/:displayId/(preview)?/slide/:slideId',
    exact,
    strict: false
  })
  return result
}
