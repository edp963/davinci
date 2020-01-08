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

import React, { useEffect } from 'react'
import Helmet from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'

import {
  makeSelectCurrentDisplay,
  makeSelectCurrentSlides,
  makeSelectCurrentSlide
} from '../selectors'

import { hideNavigator } from 'containers/App/actions'
import { VizActions } from '../actions'

import { Route, matchPath } from 'react-router-dom'
import { RouteComponentWithParams, IRouteParams } from 'utils/types'

import { Display } from 'containers/Display/Loadable'
import { VizDisplayEditor } from './Loadable'

const VizDisplay: React.FC<RouteComponentWithParams> = (props) => {
  const dispatch = useDispatch()
  const currentDisplay = useSelector(makeSelectCurrentDisplay())
  const currentSlides = useSelector(makeSelectCurrentSlides())
  const currentSlide = useSelector(makeSelectCurrentSlide())
  const {
    history,
    match: { params }
  } = props
  const displayId = +params.displayId
  const { pathname } = history.location

  useEffect(() => {
    dispatch(hideNavigator())
  }, [])

  useEffect(() => {
    dispatch(VizActions.loadDisplaySlides(displayId))
  }, [displayId])

  if (!currentDisplay || !currentSlide) {
    return null
  }

  return (
    <>
      <Helmet title={`${currentDisplay.name} - Display`} />
      <Route exact path="/project/:projectId/display/:displayId/preview/slide/:slideId" component={Display} />
      <Route exact path="/project/:projectId/display/:displayId/slide/:slideId" component={VizDisplayEditor} />
    </>
  )
}

export default VizDisplay
