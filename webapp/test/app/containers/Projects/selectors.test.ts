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

import {
  selectProject,
  makeSelectProjects,
  makeSelectCurrentProject,
  makeSelectSearchProject,
  makeSelectStarUserList,
  makeSelectCollectProjects,
  makeSelectCurrentProjectRole,
  makeSelectProjectRoles
} from 'app/containers/Projects/selectors'
import { initialState } from 'app/containers/Projects/reducer'

const state = {
  projects: initialState
}

describe('selectProject', () => {
  it('should select the projects state', () => {
    expect(selectProject(state)).toEqual(state.projects)
  })
})

describe('makeSelectProjects', () => {
  const projectsSelector = makeSelectProjects()

  const currentProjectSelector = makeSelectCurrentProject()
  const searchProjectsSelector = makeSelectSearchProject()
  const starUserListSelector = makeSelectStarUserList()
  const collectProjectsSelector = makeSelectCollectProjects()
  const currentProjectsRoleSelector = makeSelectCurrentProjectRole()
  const projectRolesSelector = makeSelectProjectRoles()

  it('should select the projects', () => {
    expect(projectsSelector(state)).toEqual(state.projects.projects)
  })

  it('should select the currentProjectSelector', () => {
    expect(currentProjectSelector(state)).toEqual(state.projects.currentProject)
  })

  it('should select the searchProjectsSelector', () => {
    expect(searchProjectsSelector(state)).toEqual(state.projects.searchProject)
  })

  it('should select the starUserListSelector', () => {
    expect(starUserListSelector(state)).toEqual(state.projects.starUserList)
  })

  it('should select the collectProjectsSelector', () => {
    expect(collectProjectsSelector(state)).toEqual(
      state.projects.collectProjects
    )
  })

  it('should select the currentProjectsRoleSelector', () => {
    expect(currentProjectsRoleSelector(state)).toEqual(
      state.projects.currentProjectRole
    )
  })

  it('should select the projectRolesSelector', () => {
    expect(projectRolesSelector(state)).toEqual(state.projects.projectRoles)
  })
})
