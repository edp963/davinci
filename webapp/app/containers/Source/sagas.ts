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
  testSourceConnectionFail
} from './actions'

const message = require('antd/lib/message')
import request from '../../utils/request'
import api from '../../utils/api'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'

export function* getSources () {
  try {
    const asyncData = yield call(request, api.source)
    const sources = readListAdapter(asyncData)
    yield put(sourcesLoaded(sources))
  } catch (err) {
    yield put(loadSourceFail())
    message.error('加载 Source 列表失败')
  }
}

export function* addSource ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.source,
      data: writeAdapter(payload.source)
    })
    const result = readObjectAdapter(asyncData)
    payload.resolve()
    yield put(sourceAdded(result))
  } catch (err) {
    yield put(addSourceFail())
    message.error('新增失败')
  }
}

export function* deleteSource ({ payload }) {
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.source}/${payload.id}`
    })
    yield put(sourceDeleted(payload.id))
  } catch (err) {
    yield put(deleteSourceFail())
    message.error('删除失败')
  }
}

export function* getSourceDetail ({ payload }) {
  try {
    const source = yield call(request, `${api.source}/${payload.id}`)
    yield put(sourceDetailLoaded(source))
  } catch (err) {
    yield put(loadSourceDetailFail())
    message.error('加载详情失败')
  }
}

export function* editSource ({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: api.source,
      data: writeAdapter(payload.source)
    })
    yield put(sourceEdited(payload.source))
    payload.resolve()
  } catch (err) {
    yield put(editSourceFail())
    message.error('修改失败')
  }
}

export function* testSourceConnection ({ payload }) {
  try {
    const res = yield call(request, {
      method: 'post',
      url: `${api.source}/test_connection`,
      data: payload.url
    })

    if (res.header.code !== 400) {
      yield put(sourceConnected())
      message.success('测试成功')
    } else {
      yield put(testSourceConnectionFail())
      message.error(res.header.msg)
    }
  } catch (err) {
    yield put(testSourceConnectionFail())
    message.error('测试 Source 连接失败')
  }
}

export function* getCsvMetaId ({payload}) {
  try {
    const res = yield call(request, {
      url: `${api.uploads}/meta`,
      method: 'post',
      data: {
        table_name: payload.csvMeta.table_name,
        source_id: payload.csvMeta.source_id,
        primary_keys: payload.csvMeta.primary_keys,
        index_keys: payload.csvMeta.index_keys,
        replace_mode: payload.csvMeta.replace_mode
      }
    })
    if (res && res.header && res.header.code === 200) {
      payload.resolve(res)
    } else {
      payload.reject(res.header.msg)
    }
  } catch (err) {
    payload.reject(err)
  }
}

export default function* rootSourceSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_SOURCES, getSources),
    takeEvery(ADD_SOURCE, addSource as any),
    takeEvery(DELETE_SOURCE, deleteSource as any),
    takeLatest(LOAD_SOURCE_DETAIL, getSourceDetail as any),
    takeEvery(EDIT_SOURCE, editSource as any),
    takeEvery(TEST_SOURCE_CONNECTION, testSourceConnection as any),
    takeEvery(GET_CSV_META_ID, getCsvMetaId as any)
  ]
}
