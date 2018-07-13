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
import { getBase64 } from 'utils/util'
const styles = require('../Display.less')

interface IDisplayContainerProps {
  slideParams: any
  width: number,
  height: number,
  padding: string,
  scale: number
  children: JSX.Element[],
  onCoverCutCreated: (blob: Blob) => void
}

interface IDisplayStyle {
  width: string
  height: string
  transform: string
  backgroundColor?: string
  backgroundImage?: string
}

export class DisplayContainer extends React.PureComponent<IDisplayContainerProps, {}> {

  private container: HTMLDivElement
  private content: HTMLDivElement
  private refHandlers = {
    container: (f) => { this.container = f },
    content: (f) => { this.content = f }
  }

  public createCoverCut = () => {
    const { onCoverCutCreated, scale } = this.props
    this.content.style.transform = 'scale(1)'
    html2canvas(this.content).then((canvas) => {
      this.content.style.transform = `scale(${scale})`
      canvas.toBlob((blob) => {
        onCoverCutCreated(blob)
      })
    })
  }

  private getSlideStyle = (slideParams, scale) => {
    let slideStyle: IDisplayStyle
    slideStyle  = {
      width: `${slideParams.width}px`,
      height: `${slideParams.height}px`,
      transform: `scale(${scale})`
    }

    if (slideParams.backgroundColor) {
      const rgb = [...slideParams.backgroundColor, (slideParams.opacity / 100)].join()
      slideStyle.backgroundColor = `rgb(${rgb})`
    }
    if (slideParams.backgroundImage) {
      slideStyle.backgroundImage = `url("${slideParams.backgroundImage}")`
    }

    return slideStyle
  }

  public render () {
    const {
      slideParams,
      width,
      height,
      padding,
      scale,
      children
    } = this.props

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
          >
            <div className={styles.displayPanelWrapper}>
              <div
                ref={this.refHandlers.content}
                className={styles.displayPanel}
                style={slideStyle}
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
