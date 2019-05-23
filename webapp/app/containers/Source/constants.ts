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

import { createTypes } from 'utils/redux'

enum Types {
  LOAD_SOURCES = 'davinci/Source/LOAD_SOURCES',
  LOAD_SOURCES_SUCCESS = 'davinci/Source/LOAD_SOURCES_SUCCESS',
  LOAD_SOURCES_FAILURE = 'davinci/Source/LOAD_SOURCES_FAILURE',

  ADD_SOURCE = 'davinci/Source/ADD_SOURCE',
  ADD_SOURCE_SUCCESS = 'davinci/Source/ADD_SOURCE_SUCCESS',
  ADD_SOURCE_FAILURE = 'davinci/Source/ADD_SOURCE_FAILURE',

  DELETE_SOURCE = 'davinci/Source/DELETE_SOURCE',
  DELETE_SOURCE_SUCCESS = 'davinci/Source/DELETE_SOURCE_SUCCESS',
  DELETE_SOURCE_FAILURE = 'davinci/Source/DELETE_SOURCE_FAILURE',

  EDIT_SOURCE = 'davinci/Source/EDIT_SOURCE',
  EDIT_SOURCE_SUCCESS = 'davinci/Source/EDIT_SOURCE_SUCCESS',
  EDIT_SOURCE_FAILURE = 'davinci/Source/EDIT_SOURCE_FAILURE',

  TEST_SOURCE_CONNECTION = 'davinci/Source/TEST_SOURCE_CONNECTION',
  TEST_SOURCE_CONNECTION_SUCCESS = 'davinci/Source/TEST_SOURCE_CONNECTION_SUCCESS',
  TEST_SOURCE_CONNECTION_FAILURE = 'davinci/Source/TEST_SOURCE_CONNECTION_FAILURE',

  GET_CSV_META_ID = 'davinci/Source/GET_CSV_META_ID',
  GET_CSV_META_ID_SUCCESS = 'davinci/Source/GET_CSV_META_ID_SUCCESS',
  GET_CSV_META_ID_FAILURE = 'davinci/Source/GET_CSV_META_ID_FAILURE',

  LOAD_SOURCE_TABLES = 'davinci/Source/LOAD_SOURCE_TABLES',
  LOAD_SOURCE_TABLES_SUCCESS = 'davinci/Source/LOAD_SOURCE_TABLES_SUCCESS',
  LOAD_SOURCE_TABLES_FAILURE = 'davinci/Source/LOAD_SOURCE_TABLES_FAILURE',

  LOAD_SOURCE_TABLE_COLUMNS = 'davinci/Source/LOAD_SOURCE_TABLE_COLUMNS',
  LOAD_SOURCE_TABLE_COLUMNS_SUCCESS = 'davinci/Source/LOAD_SOURCE_TABLE_COLUMNS_SUCCESS',
  LOAD_SOURCE_TABLE_COLUMNS_FAILURE = 'davinci/Source/LOAD_SOURCE_TABLE_COLUMNS_FAILURE'
}

export const ActionTypes = createTypes(Types)
