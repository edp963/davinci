/*-
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
  ADD_SOURCE,
  ADD_SOURCE_SUCCESS,
  DELETE_SOURCE,
  DELETE_SOURCE_SUCCESS,
  LOAD_SOURCE_DETAIL,
  LOAD_SOURCE_DETAIL_SUCCESS,
  EDIT_SOURCE,
  EDIT_SOURCE_SUCCESS
} from './constants'

import { promiseActionCreator } from '../../utils/reduxPromisation'

export const loadSources = promiseActionCreator(LOAD_SOURCES)

export const addSource = promiseActionCreator(ADD_SOURCE, ['source'])

export const deleteSource = promiseActionCreator(DELETE_SOURCE, ['id'])

export const loadSourceDetail = promiseActionCreator(LOAD_SOURCE_DETAIL, ['id'])

export const editSource = promiseActionCreator(EDIT_SOURCE, ['source'])

export function sourcesLoaded (sources) {
  return {
    type: LOAD_SOURCES_SUCCESS,
    payload: {
      sources
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

export function sourceDeleted (id) {
  return {
    type: DELETE_SOURCE_SUCCESS,
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

export function sourceEdited (result) {
  return {
    type: EDIT_SOURCE_SUCCESS,
    payload: {
      result
    }
  }
}
