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
  LOAD_SOURCES,
  LOAD_SOURCES_SUCCESS,
  LOAD_SOURCES_FAILURE,
  ADD_SOURCE,
  ADD_SOURCE_SUCCESS,
  ADD_SOURCE_FAILURE,
  DELETE_SOURCE,
  DELETE_SOURCE_SUCCESS,
  DELETE_SOURCE_FAILURE,
  LOAD_SOURCE_DETAIL,
  LOAD_SOURCE_DETAIL_SUCCESS,
  LOAD_SOURCE_DETAIL_FAILURE,
  EDIT_SOURCE,
  EDIT_SOURCE_SUCCESS,
  EDIT_SOURCE_FAILURE,
  TEST_SOURCE_CONNECTION,
  TEST_SOURCE_CONNECTION_SUCCESS,
  TEST_SOURCE_CONNECTION_FAILURE,
  GET_CSV_META_ID,
  GET_CSV_META_ID_FAILURE,
  GET_CSV_META_ID_SUCCESS,
  SET_SOURCE_FORM_VALUE,
  SET_UPLOAD_FORM_VALUE
} from './constants'

export function loadSources (projectId) {
  return {
    type: LOAD_SOURCES,
    payload: {
      projectId
    }
  }
}

export function sourcesLoaded (sources) {
  return {
    type: LOAD_SOURCES_SUCCESS,
    payload: {
      sources
    }
  }
}

export function loadSourceFail () {
  return {
    type: LOAD_SOURCES_FAILURE
  }
}

export function addSource (source, resolve) {
  return {
    type: ADD_SOURCE,
    payload: {
      source,
      resolve
    }
  }
}

export function sourceAdded (result) {
  return {
    type: ADD_SOURCE_SUCCESS,
    payload: {
      result
    }
  }
}

export function addSourceFail () {
  return {
    type: ADD_SOURCE_FAILURE
  }
}

export function deleteSource (id) {
  return {
    type: DELETE_SOURCE,
    payload: {
      id
    }
  }
}

export function sourceDeleted (id) {
  return {
    type: DELETE_SOURCE_SUCCESS,
    payload: {
      id
    }
  }
}

export function deleteSourceFail () {
  return {
    type: DELETE_SOURCE_FAILURE
  }
}

export function loadSourceDetail (id) {
  return {
    type: LOAD_SOURCE_DETAIL,
    payload: {
      id
    }
  }
}

export function sourceDetailLoaded (source) {
  return {
    type: LOAD_SOURCE_DETAIL_SUCCESS,
    payload: {
      source
    }
  }
}

export function loadSourceDetailFail () {
  return {
    type: LOAD_SOURCE_DETAIL_FAILURE
  }
}

export function editSource (source, resolve) {
  return {
    type: EDIT_SOURCE,
    payload: {
      source,
      resolve
    }
  }
}

export function sourceEdited (result) {
  return {
    type: EDIT_SOURCE_SUCCESS,
    payload: {
      result
    }
  }
}

export function editSourceFail () {
  return {
    type: EDIT_SOURCE_FAILURE
  }
}

export function testSourceConnection (url) {
  return {
    type: TEST_SOURCE_CONNECTION,
    payload: {
      url
    }
  }
}

export function sourceConnected () {
  return {
    type: TEST_SOURCE_CONNECTION_SUCCESS
  }
}

export function testSourceConnectionFail () {
  return {
    type: TEST_SOURCE_CONNECTION_FAILURE
  }
}

export function getCsvMetaId (csvMeta, resolve) {
  return {
    type: GET_CSV_META_ID,
    payload: {
      csvMeta,
      resolve
    }
  }
}

export function csvMetaIdGeted () {
  return {
    type: GET_CSV_META_ID_SUCCESS
  }
}

export function getCsvMetaIdFail (error) {
  return {
    type: GET_CSV_META_ID_FAILURE,
    payload: {
      error
    }
  }
}

export function setSourceFormValue (values) {
  return {
    type: SET_SOURCE_FORM_VALUE,
    payload: {
      values
    }
  }
}

export function setUploadFormValue (values) {
  return {
    type: SET_UPLOAD_FORM_VALUE,
    payload: {
      values
    }
  }
}
