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

import { createTypes } from 'app/utils/redux'

enum Types {
  LOAD_SHARE_DASHBOARD = 'davinci/Share/Dashboard/LOAD_SHARE_DASHBOARD',
  LOAD_SHARE_DASHBOARD_SUCCESS = 'davinci/Share/Dashboard/LOAD_SHARE_DASHBOARD_SUCCESS',
  LOAD_SHARE_DASHBOARD_FAILURE = 'davinci/Share/Dashboard/LOAD_SHARE_DASHBOARD_FAILURE',
  SET_INDIVIDUAL_DASHBOARD = 'davinci/Share/Dashboard/SET_INDIVIDUAL_DASHBOARD',
  LOAD_SHARE_WIDGET = 'davinci/Share/Dashboard/LOAD_SHARE_WIDGET',
  LOAD_SHARE_WIDGET_SUCCESS = 'davinci/Share/Dashboard/LOAD_SHARE_WIDGET_SUCCESS',
  LOAD_SHARE_RESULTSET = 'davinci/Share/Dashboard/LOAD_SHARE_RESULTSET',
  LOAD_SHARE_RESULTSET_SUCCESS = 'davinci/Share/Dashboard/LOAD_SHARE_RESULTSET_SUCCESS',
  LOAD_SHARE_RESULTSET_FAILURE = 'davinci/Share/Dashboard/LOAD_SHARE_RESULTSET_FAILURE',
  LOAD_BATCH_DATA_WITH_CONTROL_VALUES = 'davinci/Share/Dashboard/LOAD_BATCH_DATA_WITH_CONTROL_VALUES',
  LOAD_WIDGET_CSV = 'davinci/Share/Dashboard/LOAD_WIDGET_CSV',
  LOAD_WIDGET_CSV_SUCCESS = 'davinci/Share/Dashboard/LOAD_WIDGET_CSV_SUCCESS',
  LOAD_WIDGET_CSV_FAILURE = 'davinci/Share/Dashboard/LOAD_WIDGET_CSV_FAILURE',
  LOAD_SELECT_OPTIONS = 'davinci/Share/Dashboard/LOAD_SELECT_OPTIONS',
  LOAD_SELECT_OPTIONS_SUCCESS = 'davinci/Share/Dashboard/LOAD_SELECT_OPTIONS_SUCCESS',
  LOAD_SELECT_OPTIONS_FAILURE = 'davinci/Share/Dashboard/LOAD_SELECT_OPTIONS_FAILURE',
  RESIZE_DASHBOARDITEM = 'davinci/Share/Dashboard/RESIZE_DASHBOARDITEM',
  RESIZE_ALL_DASHBOARDITEM = 'davinci/Share/Dashboard/RESIZE_ALL_DASHBOARDITEM',
  RENDER_CHART_ERROR = 'davinci/Share/Dashboard/RENDER_CHART_ERROR',
  DRILL_DASHBOARDITEM = 'davinci/Share/Dashboard/DRILL_DASHBOARDITEM',
  DELETE_DRILL_HISTORY = 'davinci/Share/Dashboard/DELETE_DRILL_HISTORY',
  SELECT_DASHBOARD_ITEM_CHART = 'davinci/Share/Dashboard/SELECT_DASHBOARD_ITEM_CHART',
  SEND_SHARE_PARAMS = 'davinci/Share/Dashboard/SEND_SHARE_PARAMS',
  SET_FULL_SCREEN_PANEL_ITEM_ID = 'davinci/Share/Dashboard/SET_FULL_SCREEN_PANEL_ITEM_ID',
  LOAD_DOWNLOAD_LIST = 'davinci/Share/Dashboard/LOAD_DOWNLOAD_LIST',
  LOAD_DOWNLOAD_LIST_SUCCESS = 'davinci/Share/Dashboard/LOAD_DOWNLOAD_LIST_SUCCESS',
  LOAD_DOWNLOAD_LIST_FAILURE = 'davinci/Share/Dashboard/LOAD_DOWNLOAD_LIST_FAILURE',
  DOWNLOAD_FILE = 'davinci/Share/Dashboard/DOWNLOAD_FILE',
  DOWNLOAD_FILE_SUCCESS = 'davinci/Share/Dashboard/DOWNLOAD_FILE_SUCCESS',
  DOWNLOAD_FILE_FAILURE = 'davinci/Share/Dashboard/DOWNLOAD_FILE_FAILURE',
  INITIATE_DOWNLOAD_TASK = 'davinci/Share/Dashboard/INITIATE_DOWNLOAD_TASK',
  INITIATE_DOWNLOAD_TASK_SUCCESS = 'davinci/Share/Dashboard/INITIATE_DOWNLOAD_TASK_SUCCESS',
  INITIATE_DOWNLOAD_TASK_FAILURE = 'davinci/Share/Dashboard/INITIATE_DOWNLOAD_TASK_FAILURE'
}

export const ActionTypes = createTypes(Types)

export enum DashboardItemStatus {
  Pending,
  Fulfilled,
  Error
}
