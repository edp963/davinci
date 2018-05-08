import * as React from 'react'

const styles = require('../Display.less')

interface IDisplayEditorProps {
  width: number,
  height: number,
  padding: string,
  scale: number,
  displayWidth: number,
  displayHeight: number,
  children: JSX.Element
}

export class DisplayEditor extends React.PureComponent<IDisplayEditorProps, {}> {
  private container: any

  public render () {
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

export default DisplayEditor
