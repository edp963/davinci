import React from 'react'

import { Slider, Icon } from 'antd'

const styles = require('../Display.less')

interface IDisplayBottomProps {
  sliderValue: number,
  scale: number,
  onZoomIn: () => void,
  onZoomOut: () => void,
  onSliderChange: (val: number) => void
}

export const DisplayBottom: React.FunctionComponent<IDisplayBottomProps> = (props) => {
  const {
    scale,
    onZoomIn,
    onZoomOut,
    sliderValue,
    onSliderChange
  } = props

  const percentage = scale && `${Math.floor(scale * 100)}%`

  return (
    <div className={styles.bottom}>
      <div className={styles.sliderWrapper}>
        <label>{percentage}</label>
        <Icon type="minus-circle-o" onClick={onZoomIn} />
        <Slider value={sliderValue} className={styles.slider} onChange={onSliderChange} />
        <Icon type="plus-circle-o" onClick={onZoomOut} />
      </div>
    </div>
  )
}

export default DisplayBottom
