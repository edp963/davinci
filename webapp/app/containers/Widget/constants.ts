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
  LOAD_WIDGETS = 'davinci/Widget/LOAD_WIDGETS',
  LOAD_WIDGETS_SUCCESS = 'davinci/Widget/LOAD_WIDGETS_SUCCESS',
  LOAD_WIDGETS_FAILURE = 'davinci/Widget/LOAD_WIDGETS_FAILURE',

  ADD_WIDGET = 'davinci/Widget/ADD_WIDGET',
  ADD_WIDGET_SUCCESS = 'davinci/Widget/ADD_WIDGET_SUCCESS',
  ADD_WIDGET_FAILURE = 'davinci/Widget/ADD_WIDGET_FAILURE',

  LOAD_WIDGET_DETAIL = 'davinci/Widget/LOAD_WIDGET_DETAIL',
  LOAD_WIDGET_DETAIL_SUCCESS = 'davinci/Widget/LOAD_WIDGET_DETAIL_SUCCESS',
  LOAD_WIDGET_DETAIL_FAILURE = 'davinci/Widget/LOAD_WIDGET_DETAIL_FAILURE',

  EDIT_WIDGET = 'davinci/Widget/EDIT_WIDGET',
  EDIT_WIDGET_SUCCESS = 'davinci/Widget/EDIT_WIDGET_SUCCESS',
  EDIT_WIDGET_FAILURE = 'davinci/Widget/EDIT_WIDGET_FAILURE',

  COPY_WIDGET = 'davinci/Widget/COPY_WIDGET',
  COPY_WIDGET_SUCCESS = 'davinci/Widget/COPY_WIDGET_SUCCESS',
  COPY_WIDGET_FAILURE = 'davinci/Widget/COPY_WIDGET_FAILURE',

  DELETE_WIDGET = 'davinci/Widget/DELETE_WIDGET',
  DELETE_WIDGET_SUCCESS = 'davinci/Widget/DELETE_WIDGET_SUCCESS',
  DELETE_WIDGET_FAILURE = 'davinci/Widget/DELETE_WIDGET_FAILURE',

  CLEAR_CURRENT_WIDGET = 'davinci/Widget/CLEAR_CURRENT_WIDGET',
  EXECUTE_COMPUTED_SQL = 'davinci/Widget/EXECUTE_COMPUTED_SQL'
}

export const ActionTypes = createTypes(Types)

