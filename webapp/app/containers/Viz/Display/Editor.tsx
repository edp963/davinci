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

import React, { useEffect, useCallback, useState } from 'react'
import Helmet from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'

import { makeSelectCurrentProject } from 'containers/Projects/selectors'
import {
  makeSelectCurrentDisplay,
  makeSelectCurrentSlides,
  makeSelectCurrentSlide
} from '../selectors'

import { VizActions } from '../actions'

import { Route } from 'react-router-dom'
import { RouteComponentWithParams } from 'utils/types'

import { Layout, PageHeader } from 'antd'
import SplitPane from 'components/SplitPane'
import SlideThumbnailList from '../components/SlideThumbnail'
import DisplayHeader from 'containers/Display/Editor/Header'
import { Display } from 'containers/Display/Loadable'

import styles from '../Viz.less'
import {ISlideFormed} from "containers/Viz/components/types";

const VizDisplayEditor: React.FC<RouteComponentWithParams> = (props) => {
  const dispatch = useDispatch()
  const { id: projectId } = useSelector(makeSelectCurrentProject())
  const currentDisplay = useSelector(makeSelectCurrentDisplay())
  const displayId = currentDisplay.id
  const { id: slideId } = useSelector(makeSelectCurrentSlide())
  const currentSlides = useSelector(makeSelectCurrentSlides())
  const { history } = props

  const [selectedSlideIds, setSelectedSlideIds] = useState([])//nx-test
  // const [slides, setSlides] = useState(currentSlides)//nx-test

  const clearSelectedSlide = useCallback(() => {
    setSelectedSlideIds([])
  }, [])

  useEffect(() => {
    window.addEventListener('click', clearSelectedSlide, false)
    return () => {
      window.removeEventListener('click', clearSelectedSlide, false)
    }
  }, [])

  const goToViz = useCallback(() => {
    history.replace(`/project/${projectId}/vizs`)
  }, [projectId])

  const goToSlide = useCallback(
    (slideId: number) => {
      setSelectedSlideIds([slideId])
      history.replace(
        `/project/${projectId}/display/${displayId}/slide/${slideId}`
      )
    },
    [projectId, displayId]
  )

  //test-nx
  const changeDisplayAvatar = useCallback(
    (avatar: string) => {
      dispatch(
        VizActions.editDisplay({
          ...currentDisplay,
          avatar,
          config: {
            ...currentDisplay.config
          }
        }, () => {})
      )
    }, [])

  const multiSelect = useCallback(
    (slideId: number) => {
      setSelectedSlideIds(() => {
        let tmp = selectedSlideIds.concat([slideId]);
        // console.log(tmp)
        return tmp;
      })
      // console.log('multi', selectedSlideIds)
    },
    [selectedSlideIds, displayId]
  )

  // hovering
  const moveSlides = useCallback(
    (slides: ISlideFormed[]) => {
      dispatch(
        VizActions.moveSlides(displayId, slides)
      )
    }, [])

  // didDrag
  const moveSlide = useCallback(
    (newSlides: ISlideFormed[]) => {
        dispatch(VizActions.editSlides(newSlides))
    },
    []
  )
  //test-nx

  const deleteSlides = useCallback(
    (slideIds: number[]) => {
      dispatch(VizActions.deleteSlides(displayId, slideIds))
    },
    [displayId]
  )

  return (
    <>
      <Helmet title={`${currentDisplay.name} - Display`} />
      <Layout>
        <PageHeader
          ghost={false}
          title={currentDisplay.name}
          subTitle={currentDisplay.description}
          avatar={{
            src: currentDisplay.avatar,
            shape: 'square'
          }}
          extra={<DisplayHeader />}
          onBack={goToViz}
        />
        <SplitPane
          className="ant-layout-content"
          type="horizontal"
          initialSize={120}
          minSize={120}
          maxSize={200}
        >
          <SlideThumbnailList
            className={styles.slides}
            currentSlideId={slideId}
            selectedSlideIds={selectedSlideIds}
            slides={currentSlides}
            // slides={slides}//test-nx
            onMoveSlide={moveSlide}//test-nx
            onMoveSlides={moveSlides}//test-nx
            onSelect={goToSlide}
            onMultiSelect={multiSelect}//test-nx
            onDelete={deleteSlides}
            onChangeDisplayAvatar={changeDisplayAvatar}
          />
          <Route
            path="/project/:projectId/display/:displayId/slide/:slideId"
            component={Display}
          />
        </SplitPane>
      </Layout>
    </>
  )
}

export default VizDisplayEditor
