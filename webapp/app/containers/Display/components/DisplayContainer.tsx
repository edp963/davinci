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

import * as React from 'react'
import * as html2canvas from 'html2canvas'
import { captureVideosWithImages } from './util'
const styles = require('../Display.less')

export enum Keys {
  Up,
  Down,
  Left,
  Right,
  Delete,
  Copy,
  Paste,
  UnDo,
  Redo
}

interface IDisplayContainerProps {
  slideParams: any
  zoomRatio: number
  children: JSX.Element[],
  onScaleChange: (scale: number) => void
  onCoverCutCreated: (blob: Blob) => void
  onKeyDown: (key: Keys) => void
  onLayersSelectionRemove: () => void
}

interface IDisplayContainerStates {
  translate: string
  scale: number
  containerStyle: React.CSSProperties
}

export class DisplayContainer extends React.Component<IDisplayContainerProps, IDisplayContainerStates> {

  public static displayName = 'DisplayContainer'

  private container = React.createRef<HTMLDivElement>()
  private content = React.createRef<HTMLDivElement>()

  constructor (props: IDisplayContainerProps) {
    super(props)
    this.state = {
      translate: '',
      scale: 1,
      containerStyle: null
    }
  }

  public componentDidMount () {
    document.addEventListener('keydown', this.keyDown, false)
    window.addEventListener('resize', this.containerResize, false)
    const { zoomRatio, slideParams, onScaleChange } = this.props
    this.updateStyle(zoomRatio, slideParams, onScaleChange)
  }

  public componentWillUnmount () {
    document.removeEventListener('keydown', this.keyDown, false)
    window.removeEventListener('resize', this.containerResize, false)
  }

  public componentWillReceiveProps (nextProps: IDisplayContainerProps) {
    const { zoomRatio, slideParams, onScaleChange } = nextProps
    if (zoomRatio !== this.props.zoomRatio || slideParams !== this.props.slideParams) {
      this.updateStyle(zoomRatio, slideParams, onScaleChange)
    }
  }

  private containerResize = () => {
    const { zoomRatio, slideParams, onScaleChange } = this.props
    this.updateStyle(zoomRatio, slideParams, onScaleChange)
  }

  private updateStyle = (zoomRatio: number, slideParams: any, onScaleChange: (scale: number) => void) => {
    const { clientWidth, clientHeight } = this.container.current
    const [containerWidth, containerHeight] = [clientWidth, clientHeight].map((item) => Math.max(zoomRatio, 1) * item)
    const { width: slideWidth, height: slideHeight } = slideParams

    let scale = (slideWidth / slideHeight > containerWidth / containerHeight) ?
      // landscape
      (containerWidth - 64) / slideWidth * zoomRatio :
      // portrait
      (containerHeight - 64) / slideHeight * zoomRatio
    scale = +(Math.floor(scale / 0.05) * 0.05).toFixed(2)
    const translateX = (Math.max(clientWidth - slideWidth * scale, 64)) / (2 * slideWidth) * 100
    const translateY = (Math.max(clientHeight - slideHeight * scale, 64)) / (2 * slideHeight) * 100
    const translate = `translate(${translateX}%, ${translateY}%)`
    const containerStyle: React.CSSProperties = { overflow: 'hidden' }
    if (slideWidth * scale + 64 > containerWidth || slideHeight * scale + 64 > containerHeight) {
      containerStyle.overflow = 'auto'
    }
    this.setState({
      scale,
      translate,
      containerStyle
    })
    onScaleChange(scale)
  }

  public createCoverCut = () => {
    const { onCoverCutCreated } = this.props
    const transformTemp = this.content.current.style.transform
    this.content.current.style.transform = 'scale(1)'
    // captureVideosWithImages()
    html2canvas(this.content.current, { useCORS: true }).then((canvas) => {
      this.content.current.style.transform = transformTemp
      canvas.toBlob((blob) => {
        onCoverCutCreated(blob)
      })
    })
  }

  private getSlideStyle = (slideParams, scale: number, translate: string) => {
    if (!this.container.current) { return null }

    const { width: slideWidth, height: slideHeight } = slideParams
    let slideStyle: React.CSSProperties
    slideStyle  = {
      width: `${slideWidth}px`,
      height: `${slideHeight}px`,
      backgroundSize: 'cover',
      transform: `${translate} scale(${scale})`
    }

    const { backgroundColor, backgroundImage } = slideParams
    if (backgroundColor) {
      const rgb = backgroundColor.join()
      slideStyle.backgroundColor = `rgba(${rgb})`
    }
    if (backgroundImage) {
      slideStyle.backgroundImage = `url("${backgroundImage}")`
    }

    return slideStyle
  }

  private keyDown = (e: KeyboardEvent) => {
    e.stopPropagation()
    if (['button', 'input', 'select'].indexOf((e.target as HTMLElement).tagName.toLowerCase()) > 0) {
      return
    }
    const { key, ctrlKey, metaKey, shiftKey } = e
    const { onKeyDown } = this.props
    switch (key) {
      case 'ArrowUp':
        onKeyDown(Keys.Up)
        break
      case 'ArrowDown':
        onKeyDown(Keys.Down)
        break
      case 'ArrowLeft':
        onKeyDown(Keys.Left)
        break
      case 'ArrowRight':
        onKeyDown(Keys.Right)
        break
      case 'Delete':
      case 'Backspace':
        onKeyDown(Keys.Delete)
        break
      case 'c':
      case 'C':
        if (ctrlKey || metaKey) {
          onKeyDown(Keys.Copy)
        }
        break
      case 'v':
      case 'V':
        if (ctrlKey || metaKey) {
          onKeyDown(Keys.Paste)
        }
        break
      case 'y':
      case 'Y':
        if (ctrlKey && !metaKey) {
          onKeyDown(Keys.Redo)
        }
        break
      case 'z':
      case 'Z':
        if (metaKey) {
          onKeyDown(shiftKey ? Keys.Redo : Keys.UnDo)
        } else if (ctrlKey) {
          onKeyDown(Keys.UnDo)
        }
    }
  }

  public render () {
    const {
      slideParams,
      children,
      onLayersSelectionRemove
    } = this.props

    const { scale, translate, containerStyle } = this.state

    const slideStyle = this.getSlideStyle(slideParams, scale, translate)

    return (
      <div
        ref={this.container}
        className={styles.displayContainer}
        style={containerStyle}
        tabIndex={0}
      >
        <div
          ref={this.content}
          className={styles.displayPanel}
          style={slideStyle}
          onClick={onLayersSelectionRemove}
        >
          {children}
        </div>
      </div>
    )
  }
}

export default DisplayContainer
