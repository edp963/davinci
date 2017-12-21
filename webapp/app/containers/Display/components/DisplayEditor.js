import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import styles from '../Display.less'

export class DisplayEditor extends PureComponent {
  render () {
    const {
      width,
      height,
      padding,
      scale,
      displayWidth,
      displayHeight,
      children
    } = this.props

    return (
      <div className={styles.editor}>
        <div ref={f => { this.container = f }} className={styles.editorContainer}>
          <div
            className={styles.displayContainer}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              padding: padding
            }}
          >
            <div className={styles.displayPanelWrapper}>
              <div
                className={styles.displayPanel}
                style={{
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                  transform: `scale(${scale})`
                }}
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

DisplayEditor.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  padding: PropTypes.string,
  scale: PropTypes.number,
  displayWidth: PropTypes.number,
  displayHeight: PropTypes.number,
  children: PropTypes.node
}

export default DisplayEditor
