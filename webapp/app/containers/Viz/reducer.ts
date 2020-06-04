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

import produce from 'immer'

import { ActionTypes } from './constants'
import { VizActionType } from './actions'
import { IVizState, ISlideFormed } from './types'
import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router'
import { matchPortalPath, matchDisplaySlidePath } from 'utils/router'

const initialState: IVizState = {
  portals: [],
  displays: [],
  portalDashboards: {},
  displaySlides: {},
  currentPortalId: 0,
  currentDisplay: null,
  currentSlide: null,
  loading: {
    portal: false,
    display: false,
    editing: false,
    dashboards: false,
    slides: false
  }
}

const vizReducer = (
  state = initialState,
  action: VizActionType | LocationChangeAction
) =>
  produce(state, (draft: IVizState) => {
    let displayId: number
    let slide: ISlideFormed
    let slides: ISlideFormed[]
    let slideId: number

    switch (action.type) {
      case ActionTypes.LOAD_PORTALS:
        draft.loading.portal = true
        break
      case ActionTypes.LOAD_PORTALS_SUCCESS:
        draft.portals = action.payload.result
        draft.loading.portal = false
        break
      case ActionTypes.LOAD_PORTALS_FAILURE:
        draft.loading.portal = false
        break

      case ActionTypes.ADD_PORTAL:
        draft.loading.editing = true
        break
      case ActionTypes.ADD_PORTAL_SUCCESS:
        draft.portals.unshift(action.payload.result)
        draft.loading.editing = false
        break
      case ActionTypes.ADD_PORTAL_FAILURE:
        draft.loading.editing = false
        break

      case ActionTypes.DELETE_PORTAL:
        break
      case ActionTypes.DELETE_PORTAL_SUCCESS:
        draft.portals = draft.portals.filter((g) => g.id !== action.payload.id)
        break
      case ActionTypes.DELETE_PORTAL_FAILURE:
        break

      case ActionTypes.EDIT_PORTAL:
        draft.loading.editing = true
        break
      case ActionTypes.EDIT_PORTAL_SUCCESS:
        draft.portals.splice(
          draft.portals.findIndex((g) => g.id === action.payload.result.id),
          1,
          action.payload.result
        )
        draft.loading.editing = false
        break
      case ActionTypes.EDIT_PORTAL_FAILURE:
        draft.loading.editing = true
        break

      case ActionTypes.LOAD_PORTAL_DASHBOARDS:
        draft.loading.dashboards = true
        break
      case ActionTypes.LOAD_PORTAL_DASHBOARDS_SUCCESS:
        draft.portalDashboards[action.payload.portalId] =
          action.payload.dashboards
        draft.loading.dashboards = false
        if (!draft.currentPortalId) {
          draft.currentPortalId = action.payload.portalId
        }
        break
      case ActionTypes.LOAD_PORTAL_DASHBOARDS_FAILURE:
        delete draft.portalDashboards[action.payload.portalId]
        draft.loading.dashboards = false
        break

      case ActionTypes.ADD_DASHBOARD:
        draft.loading.editing = true
        break
      case ActionTypes.ADD_DASHBOARD_SUCCESS:
        draft.portalDashboards[action.payload.result.dashboardPortalId].push(
          action.payload.result
        )
        draft.loading.editing = false
        break
      case ActionTypes.ADD_DASHBOARD_FAILURE:
        draft.loading.editing = false
        break
      case ActionTypes.EDIT_DASHBOARD:
        draft.loading.editing = true
        break
      case ActionTypes.EDIT_DASHBOARD_SUCCESS:
        const { result, formType } = action.payload
        if (formType === 'edit') {
          result.forEach((r) => {
            draft.portalDashboards[r.dashboardPortalId].splice(
              draft.portalDashboards[r.dashboardPortalId].findIndex(
                (d) => d.id === r.id
              ),
              1,
              r
            )
          })
        } else if (formType === 'move') {
          draft.portalDashboards[
            result[0].dashboardPortalId
          ] = draft.portalDashboards[result[0].dashboardPortalId].filter(
            (d) => result.findIndex(({ id }) => id === d.id) < 0
          )
          draft.portalDashboards[
            result[0].dashboardPortalId
          ] = draft.portalDashboards[result[0].dashboardPortalId].concat(result)
        }
        draft.loading.editing = false
        break
      case ActionTypes.EDIT_DASHBOARD_FAILURE:
        draft.loading.editing = false
        break
      case ActionTypes.DELETE_DASHBOARD_SUCCESS:
        draft.portalDashboards[
          action.payload.portalId
        ] = draft.portalDashboards[action.payload.portalId].filter(
          ({ id }) => id !== action.payload.id
        )
        break

      case ActionTypes.LOAD_DISPLAYS:
        draft.loading.display = true
        break
      case ActionTypes.LOAD_DISPLAYS_SUCCESS:
        draft.displays = action.payload.displays
        draft.loading.display = false
        break
      case ActionTypes.LOAD_DISPLAYS_FAILURE:
        draft.loading.display = false
        break

      case ActionTypes.ADD_DISPLAY:
      case ActionTypes.EDIT_DISPLAY:
      case ActionTypes.COPY_DISPLAY:
        draft.loading.editing = true
        break
      case ActionTypes.ADD_DISPLAY_SUCCESS:
        draft.displays.unshift(action.payload.result)
        draft.loading.editing = false
        break
      case ActionTypes.EDIT_DISPLAY_SUCCESS:
        draft.displays.splice(
          draft.displays.findIndex(({ id }) => id === action.payload.result.id),
          1,
          action.payload.result
        )
        if (
          draft.currentDisplay &&
          action.payload.result.id === draft.currentDisplay.id
        ) {
          draft.currentDisplay = action.payload.result
        }
        draft.loading.editing = false
        break
      case ActionTypes.COPY_DISPLAY_SUCCESS:
        draft.displays.unshift(action.payload.display)
        break

      case ActionTypes.ADD_DISPLAY_FAILURE:
      case ActionTypes.EDIT_DISPLAY_FAILURE:
      case ActionTypes.COPY_DISPLAY_FAILURE:
        draft.loading.editing = false
        break

      case ActionTypes.DELETE_DISPLAY_SUCCESS:
        draft.displays = draft.displays.filter(
          (d) => d.id !== action.payload.id
        )
        break
      case ActionTypes.DELETE_DISPLAY_FAILURE:
        break

      case ActionTypes.UPDATE_CURRENT_DISPLAY:
        draft.currentDisplay = action.payload.display
        break

      case ActionTypes.LOAD_DISPLAY_SLIDES:
        draft.loading.slides = true
        break
      case ActionTypes.LOAD_DISPLAY_SLIDES_SUCCESS:
        draft.displaySlides[action.payload.display.id] = action.payload.slides
        draft.loading.slides = false
        break
      case ActionTypes.LOAD_DISPLAY_SLIDES_FAILURE:
        delete draft.displaySlides[action.payload.displayId]
        draft.loading.slides = false
        break

      case ActionTypes.ADD_SLIDE_SUCCESS:
        slide = action.payload.slide
        const { insertIdx, afterSlides } = action.payload
        displayId = slide.displayId
        draft.displaySlides[displayId].splice(insertIdx)
        draft.displaySlides[displayId].push(slide)
        draft.displaySlides[displayId] = draft.displaySlides[displayId].concat(
          afterSlides
        )
        break
      case ActionTypes.EDIT_SLIDES_SUCCESS:
        slides = action.payload.slides
        displayId = action.payload.displayId
        slides.forEach((s) => {
          draft.displaySlides[displayId].splice(
            draft.displaySlides[displayId].findIndex(({ id }) => s.id === id),
            1,
            s
          )
          if (draft.currentSlide.id === s.id) {
            draft.currentSlide = s
          }
        })
        break
      case ActionTypes.DELETE_SLIDES:
        console.log(111111)
        break
      case ActionTypes.DELETE_SLIDES_SUCCESS:
        displayId = action.payload.displayId
        action.payload.slideIds.forEach((deleteId) => {
          draft.displaySlides[displayId].splice(
            draft.displaySlides[displayId].findIndex(
              ({ id }) => id === deleteId
            ),
            1
          )
        })
        break

      case LOCATION_CHANGE:
        const matchPortal = matchPortalPath(action.payload.location.pathname)
        if (matchPortal) {
          draft.currentPortalId = +matchPortal.params.portalId || 0
          break
        }
        const matchDisplaySlide = matchDisplaySlidePath(
          action.payload.location.pathname
        )
        if (matchDisplaySlide) {
          const nextDisplayId = +matchDisplaySlide.params.displayId
          const nextSlides = draft.displaySlides[nextDisplayId]
          if (nextSlides) {
            const nextSlideId = +matchDisplaySlide.params.slideId
            const nextSlide = nextSlides.find(({ id }) => id === nextSlideId)
            draft.currentSlide = nextSlide
          } else {
            draft.currentSlide = null
          }
        } else {
          draft.currentDisplay = null
          draft.currentSlide = null
        }
        break
    }
  })

export default vizReducer
