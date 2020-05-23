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

import { createSelector } from 'reselect'
import { IProjectState } from './types'
import { initialState } from './reducer'

const selectProject = (state) => state.project || initialState

const makeSelectProjects = () => createSelector(
  selectProject,
  (projectState: IProjectState) => projectState.projects
)

const makeSelectCurrentProject = () => createSelector(
  selectProject,
  (projectState: IProjectState) => projectState.currentProject
)

const makeSelectSearchProject = () => createSelector(
  selectProject,
  (projectState: IProjectState) => projectState.searchProject
)

const makeSelectStarUserList = () => createSelector(
  selectProject,
  (projectState: IProjectState) => projectState.starUserList
)

const makeSelectCollectProjects = () => createSelector(
  selectProject,
  (projectState: IProjectState) => projectState.collectProjects
)

const makeSelectCurrentProjectRole = () => createSelector(
  selectProject,
  (projectState: IProjectState) => projectState.currentProjectRole
)

const makeSelectProjectRoles = () => createSelector(
  selectProject,
  (projectState: IProjectState) => projectState.projectRoles
)

export {
  selectProject,
  makeSelectProjects,
  makeSelectSearchProject,
  makeSelectCurrentProject,
  makeSelectStarUserList,
  makeSelectCollectProjects,
  makeSelectCurrentProjectRole,
  makeSelectProjectRoles
}
