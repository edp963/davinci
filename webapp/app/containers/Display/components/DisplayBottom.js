import React from 'react'
import PropTypes from 'prop-types'

import Slider from 'antd/lib/slider'
import Icon from 'antd/lib/icon'

import styles from '../Display.less'

export function DisplayBottom (props) {
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

DisplayBottom.propTypes = {
  sliderValue: PropTypes.number,
  onZoomIn: PropTypes.func,
  onZoomOut: PropTypes.func,
  onSliderChange: PropTypes.func
}

export default DisplayBottom
