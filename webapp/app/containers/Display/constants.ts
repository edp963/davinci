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

  UPLOAD_CURRENT_SLIDE_COVER = 'davinci/Display/UPLOAD_CURRENT_SLIDE_COVER',
  UPLOAD_CURRENT_SLIDE_COVER_SUCCESS = 'davinci/Display/UPLOAD_CURRENT_SLIDE_COVER_SUCCESS',
  UPLOAD_CURRENT_SLIDE_COVER_FAILURE = 'davinci/Display/UPLOAD_CURRENT_SLIDE_COVER_FAILURE',

  LOAD_SLIDE_DETAIL = 'davinci/Display/LOAD_SLIDE_DETAIL',
  LOAD_SLIDE_DETAIL_SUCCESS = 'davinci/Display/LOAD_SLIDE_DETAIL_SUCCESS',
  LOAD_SLIDE_DETAIL_FAILURE = 'davinci/Display/LOAD_SLIDE_DETAIL_FAILURE',

  ADD_SLIDE_LAYERS = 'davinci/Display/ADD_SLIDE_LAYERS',
  ADD_SLIDE_LAYERS_SUCCESS = 'davinci/Display/ADD_SLIDE_LAYERS_SUCCESS',
  ADD_SLIDE_LAYERS_FAILURE = 'davinci/Display/ADD_SLIDE_LAYERS_FAILURE',

  EDIT_SLIDE_LAYERS = 'davinci/Display/EDIT_SLIDE_LAYERS',
  EDIT_SLIDE_LAYERS_SUCCESS = 'davinci/Display/EDIT_SLIDE_LAYERS_SUCCESS',
  EDIT_SLIDE_LAYERS_FAILURE = 'davinci/Display/EDIT_SLIDE_LAYERS_FAILURE',

  EDIT_SLIDE_LAYER_PARAMS = 'davinci/Display/EDIT_SLIDE_LAYER_PARAMS',

  DELETE_SLIDE_LAYERS = 'davinci/Display/DELETE_SLIDE_LAYERS',
  DELETE_SLIDE_LAYERS_SUCCESS = 'davinci/Display/DELETE_SLIDE_LAYERS_SUCCESS',
  DELETE_SLIDE_LAYERS_FAILURE = 'davinci/Display/DELETE_SLIDE_LAYERS_FAILURE',

  RESIZE_LAYER = 'davinci/Display/RESIZE_LAYER',
  RESIZE_LAYER_ADJUSTED = 'davinci/Display/RESIZE_LAYER_ADJUSTED',
  DRAG_LAYER = 'davinci/Display/DRAG_LAYER',
  DRAG_LAYER_ADJUSTED = 'davinci/Display/DRAG_LAYER_ADJUSTED',

  CHANGE_LAYERS_STACK = 'davinci/Display/CHANGE_LAYERS_STACK',
  SET_LAYERS_ALIGNMENT = 'davinci/Display/SET_LAYERS_ALIGNMENT',

  SELECT_LAYER = 'davinci/Display/SELECT_LAYER',
  CLEAR_LAYERS_SELECTION = 'davinci/Display/CLEAR_LAYERS_SELECTION',

  SHOW_EDITOR_BASELINES = 'davinci/Display/SHOW_EDITOR_BASELINES',
  CLEAR_EDITOR_BASELINES = 'davinci/Display/CLEAR_EDITOR_BASELINES',

  COPY_SLIDE_LAYERS = 'davinci/Display/COPY_SLIDE_LAYERS',
  COPY_SLIDE_LAYERS_SUCCESS = 'davinci/Display/COPY_SLIDE_LAYERS_SUCCESS',
  PASTE_SLIDE_LAYERS = 'davinci/Display/PASTE_SLIDE_LAYERS',

  UNDO_OPERATION = 'davinci/Display/UNDO_OPERATION',
  UNDO_OPERATION_SUCCESS = 'davinci/Display/UNDO_OPERATION_SUCCESS',
  UNDO_OPERATION_FAILURE = 'davinci/Display/UNDO_OPERATION_FAILURE',
  REDO_OPERATION = 'davinci/Display/REDO_OPERATION',
  REDO_OPERATION_SUCCESS = 'davinci/Display/REDO_OPERATION_SUCCESS',
  REDO_OPERATION_FAILURE = 'davinci/Display/REDO_OPERATION_FAILURE',

  LOAD_DISPLAY_SHARE_LINK = 'davinci/Display/LOAD_DISPLAY_SHARE_LINK',
  LOAD_DISPLAY_SHARE_LINK_SUCCESS = 'davinci/Display/LOAD_DISPLAY_SHARE_LINK_SUCCESS',
  LOAD_DISPLAY_SECRET_LINK_SUCCESS = 'davinci/Display/LOAD_DISPLAY_SECRET_LINK_SUCCESS',
  LOAD_DISPLAY_SHARE_LINK_FAILURE = 'davinci/Display/LOAD_DISPLAY_SHARE_LINK_FAILURE',

  RESET_DISPLAY_STATE = 'davinci/Display/RESET_DISPLAY_STATE',

  MONITORED_SYNC_DATA_ACTION = 'davinci/Display/MONITORED_SYNC_DATA_ACTION',
  MONITORED_SEARCH_DATA_ACTION = 'davinci/Display/MONITORED_SEARCH_DATA_ACTION',
  MONITORED_LINKAGE_DATA_ACTION = 'davinci/Display/MONITORED_LINKAGE_DATA_ACTION'
}

export const ActionTypes = createTypes(Types)

export { GraphTypes, DefaultDisplayParams } from './components/constants'
