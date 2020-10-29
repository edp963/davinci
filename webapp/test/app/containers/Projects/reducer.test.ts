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

import produce from 'immer'
import reducer, { initialState } from 'app/containers/Projects/reducer'
import actions from 'app/containers/Projects/actions'
import OrganizationActionTypes from 'app/containers/Organizations/actions'
import { mockAnonymousAction } from 'test/utils/fixtures'
import { mockStore } from './fixtures'

describe('projectsReducer', () => {
  const { projectId, projects, project, user, role } = mockStore
  let state
  beforeEach(() => {
    state = initialState
  })

  it('should return the initial state', () => {
    expect(reducer(void 0, mockAnonymousAction)).toEqual(state)
  })

  it('should handle the  projectsLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.projects = projects
    })
    expect(reducer(state, actions.projectsLoaded(projects))).toEqual(
      expectedResult
    )
  })

  it('should handle the  relRoleProjectLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentProjectRole = projects
    })
    expect(reducer(state, actions.relRoleProjectLoaded(projects))).toEqual(
      expectedResult
    )
  })

  it('should handle the  projectAdded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      if (draft.projects) {
        draft.projects.unshift(project)
      } else {
        draft.projects = [project]
      }
    })
    expect(reducer(state, actions.projectAdded(project))).toEqual(
      expectedResult
    )
  })

  it('should handle the  projectDeleted action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      if (draft.projects) {
        draft.projects = draft.projects.filter((d) => d.id !== project.id)
        draft.collectProjects = draft.collectProjects.filter(
          (d) => d.id !== project.id
        )
      }
    })
    expect(reducer(state, actions.projectDeleted(project.id))).toEqual(
      expectedResult
    )
  })

  it('should handle the  loadProjectDetail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentProjectLoading = true
    })
    expect(reducer(state, actions.loadProjectDetail(project.id))).toEqual(
      expectedResult
    )
  })

  it('should handle the  clearCurrentProject action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentProject = null
    })
    expect(reducer(state, actions.clearCurrentProject())).toEqual(
      expectedResult
    )
  })

  it('should handle the  projectDetailLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentProjectLoading = false
      draft.currentProject = project
    })
    expect(reducer(state, actions.projectDetailLoaded(project))).toEqual(
      expectedResult
    )
  })

  it('should handle the  projectSearched action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.searchProject = project
    })
    expect(reducer(state, actions.projectSearched(project))).toEqual(
      expectedResult
    )
  })

  it('should handle the  getProjectStarUserSuccess action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.starUserList = [user]
    })
    expect(reducer(state, actions.getProjectStarUserSuccess([user]))).toEqual(
      expectedResult
    )
  })

  it('should handle the  collectProjectLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.collectProjects = projects
    })
    expect(reducer(state, actions.collectProjectLoaded(projects))).toEqual(
      expectedResult
    )
  })

  it('should handle the  projectRolesLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.projectRoles = [role]
    })
    expect(
      reducer(state, OrganizationActionTypes.projectRolesLoaded([role]))
    ).toEqual(expectedResult)
  })
})
