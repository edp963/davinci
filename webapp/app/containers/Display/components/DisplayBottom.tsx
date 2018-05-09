import * as React from 'react'

const Slider = require('antd/lib/slider')
const Icon = require('antd/lib/icon')

const styles = require('../Display.less')

interface IDisplayBottomProps {
  sliderValue: number,
  onZoomIn: () => void,
  onZoomOut: () => void,
  onSliderChange: (val: number) => void
}

export function DisplayBottom (props: IDisplayBottomProps) {
  return (
    <div className={styles.bottom}>
      <div className={styles.sliderWrapper}>
        <Icon type="minus-circle-o" onClick={props.onZoomIn} />
        <Slider value={props.sliderValue} className={styles.slider} onChange={props.onSliderChange} />
        <Icon type="plus-circle-o" onClick={props.onZoomOut} />
      </div>
    </div>
  )
}

export default DisplayBottom
