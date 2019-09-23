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
import {
  LOAD_PROJECTS,
  ADD_PROJECT,
  EDIT_PROJECT,
  DELETE_PROJECT,
  LOAD_PROJECT_DETAIL,
  TRANSFER_PROJECT,
  SEARCH_PROJECT,
  GET_PROJECT_STAR_USER,
  PROJECT_UNSTAR,
  LOAD_COLLECT_PROJECTS,
  CLICK_COLLECT_PROJECT,
  ADD_PROJECT_ADMIN,
  DELETE_PROJECT_ADMIN,
  ADD_PROJECT_ROLE,
  LOAD_RELATION_ROLE_PROJECT,
  UPDATE_RELATION_ROLE_PROJECT,
  DELETE_RELATION_ROLE_PROJECT,
  EXCLUDE_ROLES
} from './constants'

import {
  LOAD_PROJECT_ROLES
} from '../Organizations/constants'

import {
  projectRolesLoaded,
  loadProjectRolesFail
} from '../Organizations/actions'

import {
  projectsLoaded,
  loadProjectsFail,
  projectAdded,
  addProjectFail,
  projectEdited,
  editProjectFail,
  projectDeleted,
  deleteProjectFail,
  projectDetailLoaded,
  transferProjectFail,
  projectTransfered,
  projectSearched,
  searchProjectFail,
  unStarProjectSuccess,
  unStarProjectFail,
  getProjectStarUserSuccess,
  getProjectStarUserFail,
  collectProjectLoaded,
  collectProjectFail,
  collectProjectClicked,
  clickCollectProjectFail,
  addProjectRoleFail,
  relRoleProjectLoaded,
  relRoleProjectUpdated,
  loadRelRoleProjectFail,
  updateRelRoleProjectFail,
  relRoleProjectDeleted,
  deleteRelRoleProjectFail,
  rolesExcluded,
  excludeRolesFail
} from './actions'

import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

export function* getProjects (action) {
  try {
    const asyncData = yield call(request, api.projects)
    const projects = asyncData.payload
    yield put(projectsLoaded(projects))
  } catch (err) {
    yield put(loadProjectsFail())
    errorHandler(err)
  }
}

export function* addProject (action) {
  const { project, resolve } = action.payload
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

export function* editProject (action) {
  const { project, resolve } = action.payload
  const {id} = project
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

export function* deleteProject (action) {
  const { id, resolve } = action.payload
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


export function* addProjectAdmin (action) {
  const { id, adminIds, resolve } = action.payload
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

export function* deleteProjectAdmin (action) {
  const { id, relationId, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'delete',
      url:  `${api.projects}/${id}/admin/${relationId}`
    })
    const result = asyncData.payload
  //  yield put(projectAdded(result))
    resolve(result)
  } catch (err) {
    yield put(addProjectFail())
    errorHandler(err)
  }
}


export function* addProjectRole (action) {
  const { projectId, roleIds, resolve } = action.payload
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

export function* getProjectDetail ({ payload }) {
  try {
    const asyncData = yield  call(request, `${api.projects}/${payload.id}`)
    const project = asyncData.payload
    yield put(projectDetailLoaded(project))
  } catch (err) {
    errorHandler(err)
  }
}

export function* transferProject ({payload}) {
  const {id, orgId, resolve} = payload
  try {
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.projects}/${id}/transfer`,
      data: {orgId}
    })
    const result = asyncData.payload
    yield put(projectTransfered(result))
    resolve()
  } catch (err) {
    yield put(transferProjectFail())
    errorHandler(err)
  }
}

export function* searchProject ({payload}) {
  const {param: {keywords, pageNum, pageSize}} = payload
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

export function* unStarProject ({payload}) {
  const {id, resolve} = payload
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

export function* getProjectStarUser ({payload}) {
  const {id} = payload
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

export function* getCollectProjects (action) {
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

export function* editCollectProject ({payload}) {
  const {formType, project, resolve} = payload
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
    yield put(collectProjectClicked(payload))
    yield resolve()
  } catch (err) {
    yield put(clickCollectProjectFail())
    errorHandler(err)
  }
}

export function* loadRelRoleProject (action) {
  try {
    const {id, roleId} = action.payload
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

export function* updateRelRoleProject (action) {
  try {
    const {roleId, projectId, projectRole} = action.payload
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.roles}/${roleId}/project/${projectId}`,
      data: projectRole
    })
    const result = asyncData.payload
    yield put(relRoleProjectUpdated(projectRole))
  } catch (err) {
    yield put(updateRelRoleProjectFail())
    errorHandler(err)
  }
}

export function* deleteRelRoleProject (action) {
  try {
    const {roleId, projectId, resolve} = action.payload
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

export function* getProjectRoles ({payload}) {
  const { projectId } = payload
  try {
    const asyncData = yield call(request, `${api.projects}/${projectId}/roles`)
    const results = asyncData.payload
    yield put(projectRolesLoaded(results))
  } catch (err) {
    yield put(loadProjectRolesFail())
    errorHandler(err)
  }
}

export function* excludeRole ({payload}) {
  const { id, type, resolve } = payload
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
    takeLatest(LOAD_PROJECTS, getProjects as any),
    takeLatest(ADD_PROJECT_ROLE, addProjectRole as any),
    takeEvery(ADD_PROJECT, addProject as any),
    takeEvery(EDIT_PROJECT, editProject as any),
    takeEvery(DELETE_PROJECT, deleteProject as any),
    takeLatest(LOAD_PROJECT_DETAIL, getProjectDetail as any),
    takeEvery(TRANSFER_PROJECT, transferProject as any),
    takeEvery(PROJECT_UNSTAR, unStarProject as any),
    takeEvery(GET_PROJECT_STAR_USER, getProjectStarUser as any),
    throttle(1000, SEARCH_PROJECT, searchProject as any),
    takeLatest(LOAD_COLLECT_PROJECTS, getCollectProjects as any),
    takeEvery(CLICK_COLLECT_PROJECT, editCollectProject as any),
    takeEvery(ADD_PROJECT_ADMIN, addProjectAdmin as any),
    takeEvery(DELETE_PROJECT_ADMIN, deleteProjectAdmin as any),
    takeEvery(LOAD_RELATION_ROLE_PROJECT, loadRelRoleProject as any),
    takeEvery(UPDATE_RELATION_ROLE_PROJECT, updateRelRoleProject as any),
    takeEvery(DELETE_RELATION_ROLE_PROJECT, deleteRelRoleProject as any),
    takeEvery(LOAD_PROJECT_ROLES, getProjectRoles as any),
    takeEvery(EXCLUDE_ROLES, excludeRole as any)
  ])
}
