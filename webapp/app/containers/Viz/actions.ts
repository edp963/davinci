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
import {
  IPortal,
  IDashboardNode,
  IDisplayRaw,
  IDisplayFormed,
  ISlideFormed,
  ISlideParams,
  IDashboard
} from './types'

export const VizActions = {
  loadPortals(projectId: number) {
    return {
      type: ActionTypes.LOAD_PORTALS,
      payload: {
        projectId
      }
    }
  },
  portalsLoaded(result: IPortal[]) {
    return {
      type: ActionTypes.LOAD_PORTALS_SUCCESS,
      payload: {
        result
      }
    }
  },
  loadPortalsFail() {
    return {
      type: ActionTypes.LOAD_PORTALS_FAILURE,
      payload: {}
    }
  },

  addPortal(portal: IPortal, resolve) {
    return {
      type: ActionTypes.ADD_PORTAL,
      payload: {
        portal,
        resolve
      }
    }
  },
  portalAdded(result) {
    return {
      type: ActionTypes.ADD_PORTAL_SUCCESS,
      payload: {
        result
      }
    }
  },
  addPortalFail() {
    return {
      type: ActionTypes.ADD_PORTAL_FAILURE,
      payload: {}
    }
  },

  editPortal(values, resolve) {
    return {
      type: ActionTypes.EDIT_PORTAL,
      payload: {
        values,
        resolve
      }
    }
  },
  portalEdited(result) {
    return {
      type: ActionTypes.EDIT_PORTAL_SUCCESS,
      payload: {
        result
      }
    }
  },
  editPortalFail() {
    return {
      type: ActionTypes.EDIT_PORTAL_FAILURE,
      payload: {}
    }
  },

  deletePortal(id) {
    return {
      type: ActionTypes.DELETE_PORTAL,
      payload: {
        id
      }
    }
  },
  portalDeleted(id) {
    return {
      type: ActionTypes.DELETE_PORTAL_SUCCESS,
      payload: {
        id
      }
    }
  },
  deletePortalFail() {
    return {
      type: ActionTypes.DELETE_PORTAL_FAILURE,
      payload: {}
    }
  },

  loadPortalDashboards(portalId: number, resolve?: (result) => void, convertTree: boolean = true) {
    return {
      type: ActionTypes.LOAD_PORTAL_DASHBOARDS,
      payload: {
        portalId,
        resolve,
        convertTree
      }
    }
  },
  portalDashboardsLoaded(portalId: number, dashboards: IDashboardNode[]) {
    return {
      type: ActionTypes.LOAD_PORTAL_DASHBOARDS_SUCCESS,
      payload: {
        portalId,
        dashboards
      }
    }
  },
  loadPortalDashboardsFail(portalId: number) {
    return {
      type: ActionTypes.LOAD_PORTAL_DASHBOARDS_FAILURE,
      payload: {
        portalId
      }
    }
  },

  loadDisplays(projectId: number) {
    return {
      type: ActionTypes.LOAD_DISPLAYS,
      payload: {
        projectId
      }
    }
  },
  displaysLoaded(displays: IDisplayRaw[]) {
    return {
      type: ActionTypes.LOAD_DISPLAYS_SUCCESS,
      payload: {
        displays
      }
    }
  },
  loadDisplaysFail(error) {
    return {
      type: ActionTypes.LOAD_DISPLAYS_FAILURE,
      payload: {
        error
      }
    }
  },

  updateCurrentDisplay(display: IDisplayFormed) {
    return {
      type: ActionTypes.UPDATE_CURRENT_DISPLAY,
      payload: {
        display
      }
    }
  },

  loadDisplaySlides(displayId: number) {
    return {
      type: ActionTypes.LOAD_DISPLAY_SLIDES,
      payload: {
        displayId
      }
    }
  },
  displaySlidesLoaded(display: IDisplayFormed, slides: ISlideFormed[]) {
    return {
      type: ActionTypes.LOAD_DISPLAY_SLIDES_SUCCESS,
      payload: {
        display,
        slides
      }
    }
  },
  loadDisplaySlidesFail(displayId: number) {
    return {
      type: ActionTypes.LOAD_DISPLAY_SLIDES_FAILURE,
      payload: {
        displayId
      }
    }
  },

  addDisplay(display, resolve) {
    return {
      type: ActionTypes.ADD_DISPLAY,
      payload: {
        display,
        resolve
      }
    }
  },
  displayAdded(result) {
    return {
      type: ActionTypes.ADD_DISPLAY_SUCCESS,
      payload: {
        result
      }
    }
  },
  addDisplayFail() {
    return {
      type: ActionTypes.ADD_DISPLAY_FAILURE,
      payload: {}
    }
  },

  editDisplay(display: IDisplayFormed, resolve?) {
    return {
      type: ActionTypes.EDIT_DISPLAY,
      payload: {
        display,
        resolve
      }
    }
  },
  displayEdited(result: IDisplayFormed) {
    return {
      type: ActionTypes.EDIT_DISPLAY_SUCCESS,
      payload: {
        result
      }
    }
  },
  editDisplayFail(error) {
    return {
      type: ActionTypes.EDIT_DISPLAY_FAILURE,
      payload: {
        error
      }
    }
  },

  deleteDisplay(id) {
    return {
      type: ActionTypes.DELETE_DISPLAY,
      payload: {
        id
      }
    }
  },
  displayDeleted(id) {
    return {
      type: ActionTypes.DELETE_DISPLAY_SUCCESS,
      payload: {
        id
      }
    }
  },
  deleteDisplayFail() {
    return {
      type: ActionTypes.DELETE_DISPLAY_FAILURE,
      payload: {}
    }
  },

  copyDisplay(display: IDisplayFormed, resolve) {
    return {
      type: ActionTypes.COPY_DISPLAY,
      payload: {
        display,
        resolve
      }
    }
  },
  displayCopied(display: IDisplayFormed) {
    return {
      type: ActionTypes.COPY_DISPLAY_SUCCESS,
      payload: {
        display
      }
    }
  },
  copyDisplayFail() {
    return {
      type: ActionTypes.COPY_DISPLAY_FAILURE,
      payload: {}
    }
  },

  addDashboard(dashboard, resolve) {
    return {
      type: ActionTypes.ADD_DASHBOARD,
      payload: {
        dashboard,
        resolve
      }
    }
  },
  dashboardAdded(result) {
    return {
      type: ActionTypes.ADD_DASHBOARD_SUCCESS,
      payload: {
        result
      }
    }
  },
  addDashboardFail() {
    return {
      type: ActionTypes.ADD_DASHBOARD_FAILURE
    }
  },

  editDashboard(formType, dashboard, resolve) {
    return {
      type: ActionTypes.EDIT_DASHBOARD,
      payload: {
        formType,
        dashboard,
        resolve
      }
    }
  },
  dashboardEdited(result, formType) {
    return {
      type: ActionTypes.EDIT_DASHBOARD_SUCCESS,
      payload: {
        result,
        formType
      }
    }
  },
  editDashboardFail() {
    return {
      type: ActionTypes.EDIT_DASHBOARD_FAILURE
    }
  },

  editCurrentDashboard (
    dashboard: IDashboard,
    type: 'linkage' | 'control',
    resolve: () => void) {
    return {
      type: ActionTypes.EDIT_CURRENT_DASHBOARD,
      payload: {
        dashboard,
        type,
        resolve
      }
    }
  },
  currentDashboardEdited (result: IDashboard, type: 'linkage' | 'control') {
    return {
      type: ActionTypes.EDIT_CURRENT_DASHBOARD_SUCCESS,
      payload: {
        result,
        type
      }
    }
  },
  editCurrentDashboardFail () {
    return {
      type: ActionTypes.EDIT_CURRENT_DASHBOARD_FAILURE
    }
  },


  deleteDashboard(id, portalId, resolve) {
    return {
      type: ActionTypes.DELETE_DASHBOARD,
      payload: {
        resolve,
        id,
        portalId
      }
    }
  },
  dashboardDeleted(id, portalId) {
    return {
      type: ActionTypes.DELETE_DASHBOARD_SUCCESS,
      payload: {
        id,
        portalId
      }
    }
  },
  deleteDashboardFail() {
    return {
      type: ActionTypes.DELETE_DASHBOARD_FAILURE
    }
  },

  addSlide() {
    return {
      type: ActionTypes.ADD_SLIDE,
      payload: {
      }
    }
  },
  slideAdded(slide: ISlideFormed, insertIdx: number, afterSlides: ISlideFormed[]) {
    return {
      type: ActionTypes.ADD_SLIDE_SUCCESS,
      payload: {
        slide,
        insertIdx,
        afterSlides
      }
    }
  },
  addSlideFail() {
    return {
      type: ActionTypes.ADD_SLIDE_FAILURE,
      payload: {}
    }
  },

  editSlides(slides: ISlideFormed[]) {
    return {
      type: ActionTypes.EDIT_SLIDES,
      payload: {
        slides
      }
    }
  },
  slidesEdited(displayId: number, slides: ISlideFormed[]) {
    return {
      type: ActionTypes.EDIT_SLIDES_SUCCESS,
      payload: {
        displayId,
        slides
      }
    }
  },
  editSlidesFail() {
    return {
      type: ActionTypes.EDIT_SLIDES_FAILURE,
      payload: {}
    }
  },
  editCurrentSlideParams(changedParams: Partial<ISlideParams>) {
    return {
      type: ActionTypes.EDIT_CURRENT_SLIDE_PARAMS,
      payload: {
        changedParams
      }
    }
  },

  deleteSlides(displayId: number, slideIds: number[]) {
    return {
      type: ActionTypes.DELETE_SLIDES,
      payload: {
        displayId,
        slideIds
      }
    }
  },
  slidesDeleted(displayId: number, slideIds: number[]) {
    return {
      type: ActionTypes.DELETE_SLIDES_SUCCESS,
      payload: {
        displayId,
        slideIds
      }
    }
  },
  deleteSlidesFail() {
    return {
      type: ActionTypes.DELETE_SLIDES_FAILURE,
      payload: {}
    }
  }
}

const mockAction = returnType(VizActions)
export type VizActionType = typeof mockAction

export default VizActions
