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

import { useSelector } from 'react-redux'
import { makeSelectCurrentProject } from '../selectors'

import { IProjectPermission } from '../types'

function useProjectPermission<T>(
  component: T,
  permissionNames: keyof IProjectPermission,
  type?: 2 | 3
): T
function useProjectPermission<T>(
  component: T,
  permissionNames: keyof IProjectPermission | Array<keyof IProjectPermission>,
  type?: 2 | 3
): T[]
function useProjectPermission<T>(
  component: T,
  permissionNames: keyof IProjectPermission | Array<keyof IProjectPermission>,
  type?: 2 | 3
) {
  const currentProject = useSelector(makeSelectCurrentProject())
  const names: Array<keyof IProjectPermission> = [].concat(permissionNames)
  const authorizedComponents = names.map((permissionName) => {
    if (!currentProject) {
      return () => null
    }
    const { permission } = currentProject
    const typePermission = permission[permissionName]
    if (!typePermission) {
      return () => null
    }
    let hasPermission = false
    if (typeof typePermission === 'boolean') {
      hasPermission = typePermission
    } else {
      // 0 隐藏
      // 1 只读
      // 2 修改
      // 3 删除
      switch (+typePermission) {
        case 3:
          hasPermission = true
          break
        case 2:
        case 1:
          hasPermission = type ? typePermission >= type : true // default readonly
          break
      }
    }
    if (hasPermission) {
      return component
    }
    const nullComponent = Array.isArray(component)
      ? component.map(() => () => null)
      : () => null
    return nullComponent
  })
  return typeof permissionNames === 'string'
    ? authorizedComponents[0]
    : authorizedComponents
}

export default useProjectPermission
