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

import { takeLatest, takeEvery } from 'redux-saga'
import { call, all, put } from 'redux-saga/effects'
import {
  LOAD_ORGANIZATIONS,
  ADD_ORGANIZATION,
  EDIT_ORGANIZATION,
  DELETE_ORGANIZATION,
  LOAD_ORGANIZATION_DETAIL
} from './constants'

import {
  organizationsLoaded,
  loadOrganizationsFail,
  organizationAdded,
  addOrganizationFail,
  organizationEdited,
  editOrganizationFail,
  organizationDeleted,
  deleteOrganizationFail,
  organizationDetailLoaded
} from './actions'

import message from 'antd/lib/message'
import request from '../../utils/request'
import api from '../../utils/api'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'

export function* getOrganizations () {
  try {
    const asyncData = yield call(request, api.organization)
    const organizations = readListAdapter(asyncData)
    yield put(organizationsLoaded(organizations))
  } catch (err) {
    yield put(loadOrganizationsFail())
    message.error('获取 Organizations 失败，请稍后再试')
  }
}

export function* addOrganization (action) {
  const { organization, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.organization,
      data: writeAdapter(organization)
    })
    const result = readObjectAdapter(asyncData)
    yield put(organizationAdded(result))
    resolve()
  } catch (err) {
    yield put(addOrganizationFail())
    message.error('添加 Organization 失败，请稍后再试')
  }
}

export function* editOrganization (action) {
  const { organization, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: api.organization,
      data: writeAdapter(organization)
    })
    yield put(organizationEdited(organization))
    resolve()
  } catch (err) {
    yield put(editOrganizationFail())
    message.error('修改 Organization 失败，请稍后再试')
  }
}

export function* deleteOrganization (action) {
  const { id } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.organization}/${id}`
    })
    yield put(organizationDeleted(id))
  } catch (err) {
    yield put(deleteOrganizationFail())
    message.error('删除当前 Organization 失败，请稍后再试')
  }
}

export function* getOrganizationDetail ({ payload }) {
  try {
    const asyncData = yield all({
      organization: call(request, `${api.organization}/${payload.id}`),
      widgets: call(request, api.widget)
    })
    const organization = readListAdapter(asyncData.organization)
    const widgets = readListAdapter(asyncData.widgets)
    yield put(organizationDetailLoaded(organization, widgets))
  } catch (err) {
    console.log('getOrganizationDetail', err)
  }
}



export default function* rootOrganizationSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_ORGANIZATIONS, getOrganizations),
    takeEvery(ADD_ORGANIZATION, addOrganization),
    takeEvery(EDIT_ORGANIZATION, editOrganization),
    takeEvery(DELETE_ORGANIZATION, deleteOrganization),
    takeLatest(LOAD_ORGANIZATION_DETAIL, getOrganizationDetail as any)
  ]
}
