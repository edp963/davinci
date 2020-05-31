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

import { getInitialPaginationAndNativeQuery } from 'app/containers/Dashboard/util'
import { IShareDashboardItemInfo } from './types'
import { DashboardItemStatus } from './constants'
import { IGlobalControl } from 'app/components/Control/types'
import {
  ControlTypes,
  DatePickerDefaultValues
} from 'app/components/Control/constants'
import { IWidgetFormed } from 'app/containers/Widget/types'

export function initDefaultValuesFromShareParams(
  controls: IGlobalControl[],
  shareParams: object
) {
  controls.forEach((control) => {
    const { name, type } = control
    if (shareParams) {
      const defaultValue = shareParams[name]
      if (defaultValue && defaultValue.length) {
        if (type === ControlTypes.Date) {
          control.dynamicDefaultValue = DatePickerDefaultValues.Custom
        }
        control.defaultValue =
          Array.isArray(defaultValue) && defaultValue.length
            ? defaultValue.map((val) => decodeURI(val))
            : decodeURI(defaultValue)
      }
    }
  })
}

export function getShareInitialItemInfo(
  widget: IWidgetFormed
): IShareDashboardItemInfo {
  return {
    status: DashboardItemStatus.Pending,
    datasource: {
      columns: [],
      pageNo: 0,
      pageSize: 0,
      totalCount: 0,
      resultList: []
    },
    loading: false,
    queryConditions: {
      tempFilters: [], // @TODO combine widget static filters with local filters
      linkageFilters: [],
      globalFilters: [],
      variables: [],
      linkageVariables: [],
      globalVariables: [],
      drillpathInstance: [],
      ...getInitialPaginationAndNativeQuery(widget)
    },
    downloadCsvLoading: false,
    interactId: '',
    renderType: 'rerender',
    selectedItems: [],
    errorMessage: ''
  }
}
