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

const styles = require('../Display.less')

interface IDisplayContainerProps {
  displayParams: any
  width: number,
  height: number,
  padding: string,
  scale: number
  children: JSX.Element[]
}

interface IDisplayStyle {
  width: string
  height: string
  transform: string
  backgroundColor?: string
  backgroundImage?: string
}

export class DisplayContainer extends React.PureComponent<IDisplayContainerProps, {}> {
  private container: any

  private getDisplayStyle = (displayParams, scale) => {
    let displayStyle: IDisplayStyle
    displayStyle  = {
      width: `${displayParams.width}px`,
      height: `${displayParams.height}px`,
      transform: `scale(${scale})`
    }

    if (displayParams.backgroundColor) {
      const rgb = [...displayParams.backgroundColor, (displayParams.opacity / 100)].join()
      displayStyle.backgroundColor = `rgb(${rgb})`
    }
    if (displayParams.backgroundImage) {
      displayStyle.backgroundImage = `url("${displayParams.backgroundImage}")`
    }

    return displayStyle
  }

  public render () {
    const {
      displayParams,
      width,
      height,
      padding,
      scale,
      children
    } = this.props

    const displayStyle = this.getDisplayStyle(displayParams, scale)

    return (
      <div className={styles.editor}>
        <div ref={(f) => { this.container = f }} className={styles.editorContainer}>
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
                className={styles.displayPanel}
                style={displayStyle}
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
