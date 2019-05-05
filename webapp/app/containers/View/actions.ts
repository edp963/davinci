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

import { ActionTypes } from './constants'
import { returnType } from 'utils/redux'
import { IDavinciResponse } from 'utils/request'
import { IViewBase, IView, IExecuteSqlParams, IExecuteSqlResponse } from './types'

export const ViewActions = {
  viewsLoaded (views: IViewBase[]) {
    return {
      type: ActionTypes.LOAD_VIEWS_SUCCESS,
      payload: {
        views
      }
    }
  },
  loadViews (projectId: number, resolve?: (views: IViewBase[]) => void) {
    return {
      type: ActionTypes.LOAD_VIEWS,
      payload: {
        projectId,
        resolve
      }
    }
  },
  loadViewsFail () {
    return {
      type: ActionTypes.LOAD_VIEWS_FAILURE,
      payload: {}
    }
  },

  viewDetailLoaded (view: IView) {
    return {
      type: ActionTypes.LOAD_VIEW_DETAIL_SUCCESS,
      payload: {
        view
      }
    }
  },
  loadViewDetail (viewId: number) {
    return {
      type: ActionTypes.LOAD_VIEW_DETAIL,
      payload: {
        viewId
      }
    }
  },
  loadViewDetailFail () {
    return {
      type: ActionTypes.LOAD_VIEW_DETAIL_FAILURE,
      payload: {}
    }
  },

  addView (view: IView, resolve: () => void) {
    return {
      type: ActionTypes.ADD_VIEW,
      payload: {
        view,
        resolve
      }
    }
  },
  viewAdded (result: IView) {
    return {
      type: ActionTypes.ADD_VIEW_SUCCESS,
      payload: {
        result
      }
    }
  },
  addViewFail () {
    return {
      type: ActionTypes.ADD_VIEW_FAILURE,
      payload: {}
    }
  },

  editView (view: IView, resolve: () => void) {
    return {
      type: ActionTypes.EDIT_VIEW,
      payload: {
        view,
        resolve
      }
    }
  },
  viewEdited (result: IView) {
    return {
      type: ActionTypes.EDIT_VIEW_SUCCESS,
      payload: {
        result
      }
    }
  },
  editViewFail () {
    return {
      type: ActionTypes.EDIT_VIEW_FAILURE,
      payload: {}
    }
  },

  deleteView (id: number, resolve: (id: number) => void) {
    return {
      type: ActionTypes.DELETE_VIEW,
      payload: {
        id,
        resolve
      }
    }
  },
  viewDeleted (id: number) {
    return {
      type: ActionTypes.DELETE_VIEW_SUCCESS,
      payload: {
        id
      }
    }
  },
  deleteViewFail () {
    return {
      type: ActionTypes.DELETE_VIEW_FAILURE,
      payload: {}
    }
  },

  executeSql (params: IExecuteSqlParams) {
    return {
      type: ActionTypes.EXECUTE_SQL,
      payload: {
        params
      }
    }
  },
  sqlExecuted (result: IDavinciResponse<IExecuteSqlResponse>) {
    return {
      type: ActionTypes.EXECUTE_SQL_SUCCESS,
      payload: {
        result
      }
    }
  },
  executeSqlFail (err: IDavinciResponse<any>['header']) {
    return {
      type: ActionTypes.EXECUTE_SQL_FAILURE,
      payload: {
        err
      }
    }
  },

  setSqlLimit (limit: number) {
    return {
      type: ActionTypes.SET_SQL_LIMIT,
      payload: {
        limit
      }
    }
  },

  resetViewState () {
    return {
      type: ActionTypes.RESET_VIEW_STATE,
      payload: {}
    }
  }
}
const mockAction = returnType(ViewActions)
export type ViewActionType = typeof mockAction

export default ViewActions
