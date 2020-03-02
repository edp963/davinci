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

import { call, all, put, takeLatest, takeEvery, throttle } from 'redux-saga/effects'

import { ActionTypes as OrganizationActionTypes } from '../Organizations/constants'
import { OrganizationActions, OrganizationActionType } from 'containers/Organizations/actions'

import { ActionTypes } from './constants'
import { ProjectActions, ProjectActionType } from './actions'

import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

export function* getProjects (action: ProjectActionType) {
  if (action.type !== ActionTypes.LOAD_PROJECTS) { return }

  const { projectsLoaded, loadProjectsFail } = ProjectActions
  try {
    const asyncData = yield call(request, api.projects)
    const projects = asyncData.payload
    yield put(projectsLoaded(projects))
  } catch (err) {
    yield put(loadProjectsFail())
    errorHandler(err)
  }
}

export function* addProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.ADD_PROJECT) { return }

  const { project, resolve } = action.payload
  const { projectAdded, addProjectFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.projects,
      data: project
    })
    const result = asyncData.payload
    yield put(projectAdded(result))
    resolve()
  } catch (err) {
    yield put(addProjectFail())
    errorHandler(err)
  }
}

export function* editProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.EDIT_PROJECT) { return }

  const { project, resolve } = action.payload
  const { id } = project
  const { projectEdited, editProjectFail } = ProjectActions
  try {
    yield call(request, {
      method: 'put',
      url: `${api.projects}/${id}`,
      data: project
    })
    yield put(projectEdited(project))
    resolve()
  } catch (err) {
    yield put(editProjectFail())
    errorHandler(err)
  }
}

export function* deleteProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.DELETE_PROJECT) { return }

  const { id, resolve } = action.payload
  const { projectDeleted, deleteProjectFail } = ProjectActions
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.projects}/${id}`
    })
    yield put(projectDeleted(id))
    if (resolve) {
      resolve()
    }
  } catch (err) {
    yield put(deleteProjectFail())
    errorHandler(err)
  }
}


export function* addProjectAdmin (action: ProjectActionType) {
  if (action.type !== ActionTypes.ADD_PROJECT_ADMIN) { return }

  const { id, adminIds, resolve } = action.payload
  const { addProjectFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.projects}/${id}/admins`,
      data: adminIds
    })
    const result = asyncData.payload
  //  yield put(projectAdded(result))
    resolve(result)
  } catch (err) {
    yield put(addProjectFail())
    errorHandler(err)
  }
}

export function* deleteProjectAdmin (action: ProjectActionType) {
  if (action.type !== ActionTypes.DELETE_PROJECT_ADMIN) { return }

  const { id, relationId, resolve } = action.payload
  const { deleteProjectAdminFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'delete',
      url:  `${api.projects}/${id}/admin/${relationId}`
    })
    const result = asyncData.payload
  //  yield put(projectAdded(result))
    resolve(result)
  } catch (err) {
    yield put(deleteProjectAdminFail())
    errorHandler(err)
  }
}


export function* addProjectRole (action: ProjectActionType) {
  if (action.type !== ActionTypes.ADD_PROJECT_ROLE) { return }

  const { projectId, roleIds, resolve } = action.payload
  const { addProjectRoleFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.projects}/${projectId}/roles`,
      data: roleIds
    })
    const result = asyncData.payload
    resolve(result)
  } catch (err) {
    yield put(addProjectRoleFail())
    errorHandler(err)
  }
}

export function* getProjectDetail (action: ProjectActionType) {
  if (action.type !== ActionTypes.LOAD_PROJECT_DETAIL) { return }

  const { id: projectId } = action.payload
  const { projectDetailLoaded } = ProjectActions
  try {
    const asyncData = yield  call(request, `${api.projects}/${projectId}`)
    const project = asyncData.payload
    yield put(projectDetailLoaded(project))
  } catch (err) {
    errorHandler(err)
  }
}

export function* transferProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.TRANSFER_PROJECT) { return }

  const { id, orgId } = action.payload
  const { projectTransfered, transferProjectFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.projects}/${id}/transfer`,
      data: {orgId}
    })
    const result = asyncData.payload
    yield put(projectTransfered(result))
  } catch (err) {
    yield put(transferProjectFail())
    errorHandler(err)
  }
}

export function* searchProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.SEARCH_PROJECT) { return }

  const { param: { keywords, pageNum, pageSize } } = action.payload
  const { projectSearched, searchProjectFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.projects}/search/?pageNum=${pageNum || 1}&pageSize=${pageSize || 10}&keywords=${keywords || ''}`
    })
    const result = asyncData.payload
    yield put(projectSearched(result))
  } catch (err) {
    yield put(searchProjectFail())
    errorHandler(err)
  }
}

export function* unStarProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.PROJECT_UNSTAR) { return }

  const { id, resolve } = action.payload
  const { unStarProjectSuccess, unStarProjectFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.star}/project/${id}`,
      data: {id}
    })
    const result = asyncData.payload
    yield put(unStarProjectSuccess(result))
    yield resolve()
  } catch (err) {
    yield put(unStarProjectFail())
    errorHandler(err)
  }
}

export function* getProjectStarUser (action: ProjectActionType) {
  if (action.type !== ActionTypes.GET_PROJECT_STAR_USER) { return }

  const { id } = action.payload
  const { getProjectStarUserSuccess, getProjectStarUserFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.star}/project/${id}`
    })
    const result = asyncData.payload
    yield put(getProjectStarUserSuccess(result))
  } catch (err) {
    yield put(getProjectStarUserFail())
    errorHandler(err)
  }
}

export function* getCollectProjects () {
  const { collectProjectLoaded, collectProjectFail } = ProjectActions

  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.projects}/favorites`
    })
    const result = asyncData.payload
    yield put(collectProjectLoaded(result))
  } catch (err) {
    yield put(collectProjectFail())
    errorHandler(err)
  }
}

export function* editCollectProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.CLICK_COLLECT_PROJECT) { return }

  const { formType, project, resolve } = action.payload
  const { collectProjectClicked, clickCollectProjectFail } = ProjectActions
  try {
    if (formType === 'collect') {
      yield call(request, {
        method: 'post',
        url: `${api.projects}/favorite/${project.id}`,
        data: {id: project.id}
      })
    } else {
      yield call(request, {
        method: 'delete',
        url: `${api.projects}/remove/favorites`,
        data: [project.id]
      })
    }
    yield put(collectProjectClicked(action.payload))
    yield resolve()
  } catch (err) {
    yield put(clickCollectProjectFail())
    errorHandler(err)
  }
}

export function* loadRelRoleProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.LOAD_RELATION_ROLE_PROJECT) { return }

  const { id, roleId } = action.payload
  const { relRoleProjectLoaded, loadRelRoleProjectFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.projects}/${id}/roles/${roleId}`
    })
    const result = asyncData.payload
    yield put(relRoleProjectLoaded(result))
  } catch (err) {
    yield put(loadRelRoleProjectFail())
    errorHandler(err)
  }
}

export function* updateRelRoleProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.UPDATE_RELATION_ROLE_PROJECT) { return }

  const { roleId, projectId, projectRole } = action.payload
  const { relRoleProjectUpdated, updateRelRoleProjectFail } = ProjectActions
  try {
    yield call(request, {
      method: 'put',
      url: `${api.roles}/${roleId}/project/${projectId}`,
      data: projectRole
    })
    yield put(relRoleProjectUpdated(projectRole))
  } catch (err) {
    yield put(updateRelRoleProjectFail())
    errorHandler(err)
  }
}

export function* deleteRelRoleProject (action: ProjectActionType) {
  if (action.type !== ActionTypes.DELETE_RELATION_ROLE_PROJECT) { return }

  const { roleId, projectId, resolve } = action.payload
  const { relRoleProjectDeleted, deleteRelRoleProjectFail } = ProjectActions
  try {
    const asyncData = yield call(request, {
      method: 'delete',
      url: `${api.roles}/${roleId}/project/${projectId}`
    })
    const result = asyncData.payload
    yield put(relRoleProjectDeleted(result))
    resolve()
  } catch (err) {
    yield put(deleteRelRoleProjectFail())
    errorHandler(err)
  }
}

export function* getProjectRoles (action: OrganizationActionType) {
  if (action.type !== OrganizationActionTypes.LOAD_PROJECT_ROLES) { return }

  const { projectId } = action.payload
  const { projectRolesLoaded, loadProjectRolesFail } = OrganizationActions
  try {
    const asyncData = yield call(request, `${api.projects}/${projectId}/roles`)
    const results = asyncData.payload
    yield put(projectRolesLoaded(results))
  } catch (err) {
    yield put(loadProjectRolesFail())
    errorHandler(err)
  }
}

export function* excludeRole (action: ProjectActionType) {
  if (action.type !== ActionTypes.EXCLUDE_ROLES) { return }

  const { id, type, resolve } = action.payload
  const { rolesExcluded, excludeRolesFail } = ProjectActions
  let host: string
  switch (type) {
    case 'dashboard':
      host = `${api.portal}/dashboard`
      break
    case 'portal':
      host = `${api.portal}`
      break
    case 'display':
      host = `${api.display}`
      break
    default:
      break
  }
  try {
    const asyncData = yield call(request, `${host}/${id}/exclude/roles`)
    const results = asyncData.payload
    yield put(rolesExcluded(results))
    resolve(results)
  } catch (err) {
    yield put(excludeRolesFail(err))
  }
}

export default function* rootProjectSaga (): IterableIterator<any> {
  yield all([
    takeLatest(ActionTypes.LOAD_PROJECTS, getProjects),
    takeLatest(ActionTypes.ADD_PROJECT_ROLE, addProjectRole),
    takeEvery(ActionTypes.ADD_PROJECT, addProject),
    takeEvery(ActionTypes.EDIT_PROJECT, editProject),
    takeEvery(ActionTypes.DELETE_PROJECT, deleteProject),
    takeLatest(ActionTypes.LOAD_PROJECT_DETAIL, getProjectDetail),
    takeEvery(ActionTypes.TRANSFER_PROJECT, transferProject),
    takeEvery(ActionTypes.PROJECT_UNSTAR, unStarProject),
    takeEvery(ActionTypes.GET_PROJECT_STAR_USER, getProjectStarUser),
    throttle(1000, ActionTypes.SEARCH_PROJECT, searchProject),
    takeLatest(ActionTypes.LOAD_COLLECT_PROJECTS, getCollectProjects),
    takeEvery(ActionTypes.CLICK_COLLECT_PROJECT, editCollectProject),
    takeEvery(ActionTypes.ADD_PROJECT_ADMIN, addProjectAdmin),
    takeEvery(ActionTypes.DELETE_PROJECT_ADMIN, deleteProjectAdmin),
    takeEvery(ActionTypes.LOAD_RELATION_ROLE_PROJECT, loadRelRoleProject),
    takeEvery(ActionTypes.UPDATE_RELATION_ROLE_PROJECT, updateRelRoleProject),
    takeEvery(ActionTypes.DELETE_RELATION_ROLE_PROJECT, deleteRelRoleProject),
    takeEvery(OrganizationActionTypes.LOAD_PROJECT_ROLES, getProjectRoles),
    takeEvery(ActionTypes.EXCLUDE_ROLES, excludeRole)
  ])
}
