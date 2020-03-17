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
  call,
  put,
  all,
  select,
  takeLatest,
  takeEvery
} from 'redux-saga/effects'
import produce from 'immer'
import { message } from 'antd'
import { push, replace } from 'connected-react-router'
import { Location } from 'history'
import { matchDisplayPath, matchDisplaySlidePath } from 'utils/router'
import { ActionTypes } from './constants'
import { VizActions, VizActionType } from './actions'

import { makeSelectLocation } from 'containers/App/selectors'
import {
  makeSelectCurrentDisplay,
  makeSelectCurrentSlides,
  makeSelectCurrentSlide
} from './selectors'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'

import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'
import { getDashboardNodes } from './util'
import { ISlideRaw, ISlideFormed, Slide } from './types'
import { getDefaultSlideParams } from 'containers/Display/components/util'

export function* getPortals(action: VizActionType) {
  if (action.type !== ActionTypes.LOAD_PORTALS) {
    return
  }

  const { payload } = action
  try {
    const asyncData = yield call(
      request,
      `${api.portal}?projectId=${payload.projectId}`
    )
    const portals = asyncData.payload
    yield put(VizActions.portalsLoaded(portals))
  } catch (err) {
    yield put(VizActions.loadPortalsFail())
    errorHandler(err)
  }
}

export function* addPortal(action: VizActionType) {
  if (action.type !== ActionTypes.ADD_PORTAL) {
    return
  }

  const { payload } = action
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.portal,
      data: payload.portal
    })
    yield put(VizActions.portalAdded(asyncData.payload))
    payload.resolve()
  } catch (err) {
    yield put(VizActions.addPortalFail())
    errorHandler(err)
  }
}

export function* deletePortal(action: VizActionType) {
  if (action.type !== ActionTypes.DELETE_PORTAL) {
    return
  }

  const { payload } = action
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.portal}/${payload.id}`
    })
    yield put(VizActions.portalDeleted(payload.id))
  } catch (err) {
    yield put(VizActions.deletePortalFail())
    errorHandler(err)
  }
}

export function* editPortal(action: VizActionType) {
  if (action.type !== ActionTypes.EDIT_PORTAL) {
    return
  }

  const { payload } = action
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/${payload.values.id}`,
      data: payload.values
    })
    yield put(VizActions.portalEdited(payload.values))
    payload.resolve()
  } catch (err) {
    yield put(VizActions.editPortalFail())
    errorHandler(err)
  }
}

export function* getPortalDashboards(action: VizActionType) {
  if (action.type !== ActionTypes.LOAD_PORTAL_DASHBOARDS) {
    return
  }
  const { portalId, resolve, convertTree } = action.payload
  try {
    const asyncData = yield call(
      request,
      `${api.portal}/${portalId}/dashboards`
    )
    const dashboardNodes = convertTree
      ? getDashboardNodes(asyncData.payload)
      : asyncData.payload
    yield put(VizActions.portalDashboardsLoaded(portalId, dashboardNodes))
    if (resolve) {
      resolve(dashboardNodes)
    }
  } catch (err) {
    yield put(VizActions.loadPortalDashboardsFail(portalId))
    errorHandler(err)
  }
}

export function* getDisplays(action: VizActionType) {
  if (action.type !== ActionTypes.LOAD_DISPLAYS) {
    return
  }

  const { projectId } = action.payload
  try {
    const asyncData = yield call(
      request,
      `${api.display}?projectId=${projectId}`
    )
    const displays = asyncData.payload
    yield put(VizActions.displaysLoaded(displays))
  } catch (err) {
    yield put(VizActions.loadDisplaysFail(err))
    errorHandler(err)
  }
}

export function* addDisplay(action: VizActionType) {
  if (action.type !== ActionTypes.ADD_DISPLAY) {
    return
  }

  const { display, resolve } = action.payload
  try {
    const asyncDisplayData = yield call(request, api.display, {
      method: 'post',
      data: display
    })
    const resultDisplay = asyncDisplayData.payload
    const { id } = resultDisplay
    const slide = {
      displayId: id,
      index: 0,
      config: JSON.stringify({ slideParams: getDefaultSlideParams() })
    }
    yield call(request, `${api.display}/${id}/slides`, {
      method: 'post',
      data: slide
    })
    yield put(VizActions.displayAdded(resultDisplay))
    resolve()
  } catch (err) {
    yield put(VizActions.addDisplayFail())
    errorHandler(err)
  }
}

export function* editDisplay(action: VizActionType) {
  if (action.type !== ActionTypes.EDIT_DISPLAY) {
    return
  }

  const { display, resolve } = action.payload
  try {
    yield call(request, `${api.display}/${display.id}`, {
      method: 'put',
      data: { ...display, config: JSON.stringify(display.config) }
    })
    yield put(VizActions.displayEdited(display))
    if (resolve) {
      resolve()
    }
  } catch (err) {
    yield put(VizActions.editDisplayFail(err))
    errorHandler(err)
  }
}

export function* deleteDisplay(action: VizActionType) {
  if (action.type !== ActionTypes.DELETE_DISPLAY) {
    return
  }

  const { id } = action.payload
  try {
    yield call(request, `${api.display}/${id}`, {
      method: 'delete'
    })
    yield put(VizActions.displayDeleted(id))
  } catch (err) {
    yield put(VizActions.deleteDisplayFail())
    errorHandler(err)
  }
}

export function* copyDisplay(action: VizActionType) {
  if (action.type !== ActionTypes.COPY_DISPLAY) {
    return
  }

  const { display, resolve } = action.payload
  const { id, name, description, publish, roleIds} = display
  try {
    const asyncData = yield call(request, `${api.display}/copy/${id}`, {
      method: 'post',
      data: {
        name,
        description,
        publish,
        roleIds
      }
    })
    yield put(VizActions.displayCopied(asyncData.payload))
    resolve()
    message.success('Display 复制成功')
  } catch (err) {
    yield put(VizActions.copyDisplayFail())
    errorHandler(err)
  }
}

export function* getDisplaySlides(action: VizActionType) {
  if (action.type !== ActionTypes.LOAD_DISPLAY_SLIDES) {
    return
  }

  const { displayId } = action.payload
  try {
    const asyncData = yield call(request, `${api.display}/${displayId}/slides`)
    const { slides, ...rest } = asyncData.payload
    slides.forEach((slide: ISlideRaw) => {
      slide.config = JSON.parse(slide.config || '{}')
    })
    rest.config = JSON.parse(rest.config || '{}')
    yield put(VizActions.displaySlidesLoaded(rest, slides))

    const location: Location = yield select(makeSelectLocation())
    const matchDisplay = matchDisplayPath(location.pathname)
    const matchDisplaySlide = matchDisplaySlidePath(location.pathname)
    if (!matchDisplay && !matchDisplaySlide) {
      return
    }

    let previewSubPath: string = ''
    if (matchDisplay) {
      previewSubPath = matchDisplay.params[0]
      previewSubPath = previewSubPath ? `/${previewSubPath}` : ''
    }

    let nextSlideId: number = slides[0].id
    let paramSlideId: number
    if (matchDisplaySlide) {
      paramSlideId = +matchDisplaySlide.params.slideId
      if (paramSlideId) {
        const slideExists = ~(slides as ISlideFormed[]).findIndex(
          ({ id }) => id === paramSlideId
        )
        if (slideExists) {
          nextSlideId = paramSlideId
        }
      }
    }
    const { id: projectId } = yield select(makeSelectCurrentProject())

    const nextPath = `/project/${projectId}/display/${displayId}${previewSubPath}/slide/${nextSlideId}`
    yield put(replace(nextPath))
    yield put(VizActions.updateCurrentDisplay(rest))
  } catch (err) {
    yield put(VizActions.loadDisplaySlidesFail(displayId))
    errorHandler(err)
  }
}

export function* addDashboard(action: VizActionType) {
  if (action.type !== ActionTypes.ADD_DASHBOARD) {
    return
  }

  const { payload } = action
  const { dashboard, resolve } = payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.portal}/${dashboard.dashboardPortalId}/dashboards`,
      data: dashboard
    })
    yield put(VizActions.dashboardAdded(asyncData.payload))
    resolve(asyncData.payload.id)
  } catch (err) {
    yield put(VizActions.addDashboardFail())
    errorHandler(err)
  }
}

export function* editDashboard(action: VizActionType) {
  if (action.type !== ActionTypes.EDIT_DASHBOARD) {
    return
  }

  const { payload } = action
  const { formType, dashboard, resolve } = payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/${dashboard[0].dashboardPortalId}/dashboards`,
      data: dashboard
    })
    yield put(VizActions.dashboardEdited(dashboard, formType))
    resolve(dashboard)
  } catch (err) {
    yield put(VizActions.editDashboardFail())
    errorHandler(err)
  }
}

export function* editCurrentDashboard(action) {
  const { dashboard, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/${dashboard.dashboardPortalId}/dashboards`,
      data: [dashboard]
    })
    yield put(VizActions.currentDashboardEdited(dashboard))
    resolve()
  } catch (err) {
    yield put(VizActions.editCurrentDashboardFail())
    errorHandler(err)
  }
}

export function* deleteDashboard(action: VizActionType) {
  if (action.type !== ActionTypes.DELETE_DASHBOARD) {
    return
  }

  const { payload } = action
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.portal}/dashboards/${payload.id}`
    })
    yield put(VizActions.dashboardDeleted(payload.id, payload.portalId))
    if (payload.resolve) {
      payload.resolve()
    }
  } catch (err) {
    yield put(VizActions.deleteDashboardFail())
    errorHandler(err)
  }
}

export function* addSlide(action: VizActionType) {
  if (action.type !== ActionTypes.ADD_SLIDE) {
    return
  }

  const { id: displayId } = yield select(makeSelectCurrentDisplay())
  const currentSlides: ISlideFormed[] = yield select(makeSelectCurrentSlides())
  const currentSlide: ISlideFormed = yield select(makeSelectCurrentSlide())
  const slide: Omit<ISlideFormed, 'id'> = produce(currentSlide, (draft) => {
    draft.id = undefined
    draft.displayId = displayId
    draft.index = currentSlide.index + 1
    draft.config.slideParams.avatar = undefined
  })

  const insertSlideIdx =
    currentSlides.findIndex(({ id }) => id === currentSlide.id) + 1
  const afterSlides = produce(currentSlides.slice(insertSlideIdx), (draft) => {
    let cursorIndex = slide.index + 1
    draft.forEach((s) => {
      s.index = cursorIndex++
    })
  })

  try {
    const result = yield all({
      slideResponse: call(request, {
        method: 'post',
        url: `${api.display}/${displayId}/slides`,
        data: slide
      }),
      slidesUpdate:
        afterSlides.length &&
        call(request, {
          method: 'put',
          url: `${api.display}/${displayId}/slides`,
          data: afterSlides.map<ISlideRaw>((s) => ({
            ...s,
            displayId,
            config: JSON.stringify(s.config)
          }))
        })
    })
    const slideReponse: Slide = result.slideResponse.payload
    slideReponse.config = JSON.parse(slideReponse.config)
    yield put(VizActions.slideAdded(slideReponse, insertSlideIdx, afterSlides))
    const { id: projectId } = yield select(makeSelectCurrentProject())
    const nextPath = `/project/${projectId}/display/${displayId}/slide/${
      slideReponse.id
    }`
    yield put(push(nextPath))
  } catch (err) {
    yield put(VizActions.addSlideFail())
    errorHandler(err)
  }
}

export function* editSlides(action: VizActionType) {
  if (action.type !== ActionTypes.EDIT_SLIDES) {
    return
  }

  const { slides } = action.payload
  const { id: displayId } = yield select(makeSelectCurrentDisplay())
  try {
    yield call(request, {
      method: 'put',
      url: `${api.display}/${displayId}/slides`,
      data: slides.map((slide) => ({
        ...slide,
        config: JSON.stringify(slide.config),
        displayId
      }))
    })
    yield put(VizActions.slidesEdited(displayId, slides))
  } catch (err) {
    yield put(VizActions.editSlidesFail())
    errorHandler(err)
  }
}
export function* editCurrentSlideParams(action: VizActionType) {
  if (action.type !== ActionTypes.EDIT_CURRENT_SLIDE_PARAMS) {
    return
  }
  const currentSlide: ISlideFormed = yield select(makeSelectCurrentSlide())
  const updateSlide = produce(currentSlide, (draft) => {
    draft.config.slideParams = {
      ...draft.config.slideParams,
      ...action.payload.changedParams
    }
  })
  yield put(VizActions.editSlides([updateSlide]))
}

export function* deleteSlides(action: VizActionType) {
  if (action.type !== ActionTypes.DELETE_SLIDES) {
    return
  }
  const { displayId, slideIds } = action.payload
  try {
    yield all(
      slideIds.map((id) =>
        call(request, {
          method: 'delete',
          url: `${api.display}/slides/${id}`
        })
      )
    )
    const currentSlides: ISlideFormed[] = yield select(
      makeSelectCurrentSlides()
    )
    const { id: projectId } = yield select(makeSelectCurrentProject())
    const lastDeleteSlideId = slideIds[slideIds.length - 1]
    const lastDeleteSlideIdx = currentSlides.findIndex(
      ({ id }) => id === lastDeleteSlideId
    )
    let i = lastDeleteSlideIdx
    let nextSlideId = currentSlides[0].id
    while (++i < currentSlides.length) {
      if (!slideIds.includes(currentSlides[i].id)) {
        nextSlideId = currentSlides[i].id
        break
      }
    }
    if (nextSlideId === currentSlides[0].id) {
      i = lastDeleteSlideIdx
      while (--i < currentSlides.length) {
        if (!slideIds.includes(currentSlides[i].id)) {
          nextSlideId = currentSlides[i].id
          break
        }
      }
    }
    yield put(
      replace(`/project/${projectId}/display/${displayId}/slide/${nextSlideId}`)
    )
    yield put(VizActions.slidesDeleted(displayId, slideIds))
  } catch (err) {
    yield put(VizActions.deleteSlidesFail())
    errorHandler(err)
  }
}

export default function* rootVizSaga(): IterableIterator<any> {
  yield all([
    takeLatest(ActionTypes.LOAD_PORTALS, getPortals),
    takeEvery(ActionTypes.ADD_PORTAL, addPortal),
    takeEvery(ActionTypes.EDIT_PORTAL, editPortal),
    takeEvery(ActionTypes.DELETE_PORTAL, deletePortal),
    takeEvery(ActionTypes.LOAD_PORTAL_DASHBOARDS, getPortalDashboards),

    takeLatest(ActionTypes.LOAD_DISPLAYS, getDisplays),
    takeEvery(ActionTypes.ADD_DISPLAY, addDisplay),
    takeEvery(ActionTypes.EDIT_DISPLAY, editDisplay),
    takeEvery(ActionTypes.DELETE_DISPLAY, deleteDisplay),
    takeEvery(ActionTypes.COPY_DISPLAY, copyDisplay),
    takeEvery(ActionTypes.LOAD_DISPLAY_SLIDES, getDisplaySlides),

    takeLatest(ActionTypes.ADD_DASHBOARD, addDashboard),
    takeEvery(ActionTypes.EDIT_DASHBOARD, editDashboard),
    takeEvery(ActionTypes.EDIT_CURRENT_DASHBOARD, editCurrentDashboard),
    takeEvery(ActionTypes.DELETE_DASHBOARD, deleteDashboard),

    takeLatest(ActionTypes.ADD_SLIDE, addSlide),
    takeEvery(ActionTypes.EDIT_SLIDES, editSlides),
    takeEvery(ActionTypes.EDIT_CURRENT_SLIDE_PARAMS, editCurrentSlideParams),
    takeEvery(ActionTypes.DELETE_SLIDES, deleteSlides)
  ])
}
