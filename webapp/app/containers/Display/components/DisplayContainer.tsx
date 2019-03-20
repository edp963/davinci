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
  scale: number
  width: number
  height: number
  padding: string
}

export class DisplayContainer extends React.Component<IDisplayContainerProps, IDisplayContainerStates> {

  public static displayName = 'DisplayContainer'

  private container: HTMLDivElement
  private content: HTMLDivElement
  private refHandlers = {
    container: (f) => { this.container = f },
    content: (f) => { this.content = f }
  }

  constructor (props: IDisplayContainerProps) {
    super(props)
    this.state = {
      scale: 1,
      width: 0,
      height: 0,
      padding: ''
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
    const { offsetHeight, offsetWidth } = this.container
    const [containerWidth, containerHeight] = [offsetWidth, offsetHeight].map((item) => Math.max(zoomRatio, 1) * item)

    let scale = (slideParams.width / slideParams.height > containerWidth / containerHeight) ?
      // landscape
      (containerWidth - 64) / slideParams.width * zoomRatio :
      // portrait
      (containerHeight - 64) / slideParams.height * zoomRatio
    scale = +(Math.floor(scale / 0.05) * 0.05).toFixed(2)

    const leftRightPadding = Math.max((offsetWidth - slideParams.width * scale) / 2, 32)
    const topBottomPadding = Math.max((offsetHeight - slideParams.height * scale) / 2, 32)
    const nextStyle = {
      width: containerWidth,
      height: containerHeight,
      padding: `${topBottomPadding}px ${leftRightPadding}px`,
      scale
    }
    this.setState({ ...nextStyle })
    onScaleChange(nextStyle.scale)
  }

  public createCoverCut = () => {
    const { onCoverCutCreated } = this.props
    const { scale } = this.state
    this.content.style.transform = 'scale(1)'
    // captureVideosWithImages()
    html2canvas(this.content, { useCORS: true }).then((canvas) => {
      this.content.style.transform = `scale(${scale})`
      canvas.toBlob((blob) => {
        onCoverCutCreated(blob)
      })
    })
  }

  private getSlideStyle = (slideParams, scale: number) => {
    let slideStyle: React.CSSProperties
    slideStyle  = {
      width: `${slideParams.width}px`,
      height: `${slideParams.height}px`,
      transform: `scale(${scale})`,
      backgroundSize: 'cover'
    }

    if (slideParams.backgroundColor) {
      const rgb = slideParams.backgroundColor.join()
      slideStyle.backgroundColor = `rgba(${rgb})`
    }
    if (slideParams.backgroundImage) {
      slideStyle.backgroundImage = `url("${slideParams.backgroundImage}")`
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

    const { width, height, padding, scale } = this.state

    const slideStyle = this.getSlideStyle(slideParams, scale)

    return (
      <div className={styles.editor}>
        <div ref={this.refHandlers.container} className={styles.editorContainer}>
          <div
            className={styles.displayContainer}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              padding
            }}
            tabIndex={0}
          >
            <div className={styles.displayPanelWrapper}>
              <div
                ref={this.refHandlers.content}
                className={styles.displayPanel}
                style={slideStyle}
                onClick={onLayersSelectionRemove}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DisplayContainer
