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

import { takeLatest, takeEvery, throttle } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import {
  LOAD_SOURCES,
  ADD_SOURCE,
  DELETE_SOURCE,
  LOAD_SOURCE_DETAIL,
  EDIT_SOURCE,
  TEST_SOURCE_CONNECTION,
  GET_CSV_META_ID
} from './constants'
import {
  sourcesLoaded,
  loadSourceFail,
  sourceAdded,
  addSourceFail,
  sourceDetailLoaded,
  loadSourceDetailFail,
  sourceEdited,
  editSourceFail,
  sourceDeleted,
  deleteSourceFail,
  sourceConnected,
  testSourceConnectionFail,
  csvMetaIdGeted,
  getCsvMetaIdFail
} from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import { errorHandler } from '../../utils/util'
const message = require('antd/lib/message')

export function* getSources (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, `${api.source}?projectId=${payload.projectId}`)
    const sources = asyncData.payload
    yield put(sourcesLoaded(sources))
  } catch (err) {
    yield put(loadSourceFail())
    errorHandler(err)
  }
}

export function* addSource (action) {
  const { payload } = action
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.source,
      data: payload.source
    })
    payload.resolve()
    yield put(sourceAdded(asyncData.payload))
  } catch (err) {
    yield put(addSourceFail())
    errorHandler(err)
  }
}

export function* deleteSource (action) {
  const { payload } = action
  try {
    const result = yield call(request, {
      method: 'delete',
      url: `${api.source}/${payload.id}`
    })
    const { code } = result.header
    yield put(sourceDeleted(payload.id))
  } catch (err) {
    yield put(deleteSourceFail())
    errorHandler(err)
  }
}

export function* getSourceDetail (action) {
  const { payload } = action
  try {
    const source = yield call(request, `${api.source}/${payload.id}`)
    yield put(sourceDetailLoaded(source))
  } catch (err) {
    yield put(loadSourceDetailFail())
    errorHandler(err)
  }
}

export function* editSource (action) {
  const { source, resolve } = action.payload
  const { config, description, id, name, type } = source
  try {
    yield call(request, {
      method: 'put',
      url: `${api.source}/${source.id}`,
      data: {
        config,
        description,
        id,
        name,
        type
      }
    })

    const { password, url, username } = config
    source['config'] = JSON.stringify(config)
    source['password'] = password
    source['jdbcUrl'] = url
    source['username'] = username
    yield put(sourceEdited(source))
    resolve()
  } catch (err) {
    yield put(editSourceFail())
    errorHandler(err)
  }
}

export function* testSourceConnection (action) {
  const { payload } = action
  try {
    const res = yield call(request, {
      method: 'post',
      url: `${api.source}/test`,
      data: payload.url
    })
    yield put(sourceConnected())
    message.success('测试成功')
  } catch (err) {
    yield put(testSourceConnectionFail())
    errorHandler(err)
  }
}

export function* getCsvMetaId (action) {
  const { resolve, reject } = action.payload
  const { source_id, replace_mode, table_name } = action.payload.csvMeta
  try {
    const res = yield call(request, {
      url: `${api.source}/${source_id}/csvmeta`,
      method: 'post',
      data: {
        mode: replace_mode,
        tableName: table_name
      }
    })
    yield put(csvMetaIdGeted())
    resolve()
  } catch (err) {
    yield put(getCsvMetaIdFail(err))
    errorHandler(err)
  }
}

export default function* rootSourceSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_SOURCES, getSources),
    takeEvery(ADD_SOURCE, addSource),
    takeEvery(DELETE_SOURCE, deleteSource),
    takeLatest(LOAD_SOURCE_DETAIL, getSourceDetail),
    takeEvery(EDIT_SOURCE, editSource),
    takeEvery(TEST_SOURCE_CONNECTION, testSourceConnection),
    takeEvery(GET_CSV_META_ID, getCsvMetaId)
  ]
}
