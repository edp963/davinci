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

const selectProject = (state) => state.get('project')

const makeSelectProjects = () => createSelector(
  selectProject,
  (projectState) => projectState.get('projects')
)

const makeSelectCurrentProject = () => createSelector(
  selectProject,
  (projectState) => projectState.get('currentProject')
)

const makeSelectSearchProject = () => createSelector(
  selectProject,
  (projectState) => projectState.get('searchProject')
)

const makeSelectStarUserList = () => createSelector(
  selectProject,
  (projectState) => projectState.get('starUserList')
)

const makeSelectCollectProjects = () => createSelector(
  selectProject,
  (projectState) => projectState.get('collectProjects')
)

const makeSelectCurrentProjectRole = () => createSelector(
  selectProject,
  (projectState) => projectState.get('currentProjectRole')
)

const makeSelectProjectRoles = () => createSelector(
  selectProject,
  (projectState) => projectState.get('projectRoles')
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
