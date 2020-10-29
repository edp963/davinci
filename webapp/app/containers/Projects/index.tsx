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

import React, { useEffect, memo } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'

import reducer from './reducer'
import saga from './sagas'
import organizationSaga from 'containers/Organizations/sagas'
import organizationReducer from 'containers/Organizations/reducer'
import { ProjectActions } from './actions'
import { makeSelectCurrentProject } from './selectors'
import { OrganizationActions } from 'containers/Organizations/actions'
const { loadProjectRoles, loadOrganizationMembers } = OrganizationActions
import { IRouteParams } from 'utils/types'

const Project: React.FC<any> = (props) => {
  useInjectReducer({ key: 'project', reducer })
  useInjectSaga({ key: 'project', saga })

  useInjectReducer({key: 'organization', reducer: organizationReducer})
  useInjectSaga({key: 'organization', saga: organizationSaga})

  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const currentProject = useSelector(makeSelectCurrentProject())

  // centralized handle for :projectId changing in router params
  // and update currentProject in redux
  useEffect(() => {
    const match = matchPath<IRouteParams>(pathname, {
      path: '/project/:projectId',
      exact: false,
      strict: false
    })

    const projectId = +match.params.projectId
    if (projectId) {
      dispatch(loadProjectRoles(projectId))
    }
    if (projectId && (!currentProject || +currentProject.id !== projectId)) {
      dispatch(ProjectActions.loadProjectDetail(projectId))
    }
  }, [pathname, currentProject])

  useEffect(() =>{
    if (currentProject) {
      const { orgId} = currentProject
      dispatch(loadOrganizationMembers(orgId))
    }
  }, [currentProject])

  useEffect(() => {
    // clear currentProject for not in router /project/:projectId when this project index component unmounted
    return () => {
      dispatch(ProjectActions.clearCurrentProject())
    }
  }, [])

  return <>{currentProject && props.children}</>
}

export default memo(Project)
