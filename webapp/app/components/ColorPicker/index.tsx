import * as React from 'react'
import { ChromePicker } from 'react-color'
const Popover = require('antd/lib/popover')
const styles = require('./ColorPicker.less')

export function ColorPicker (props) {
  return (
    <Popover
      content={
        <div style={{margin: '-8px -16px'}}>
          <ChromePicker disableAlpha={true} />
        </div>}
      trigger="click"
      placement="right"
    >
      <div className={styles.picker}>
        <span className={styles.colorIndicator} style={{background: '#263F8C'}} />
      </div>
    </Popover>
  )
}

export default ColorPicker
