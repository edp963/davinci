import React from 'react'
import PropTypes from 'prop-types'

import styles from '../Display.less'

export function DisplaySidebar (props) {
  return (
    <div className={styles.sidebar}>
      {props.children}
    </div>
  )
}

DisplaySidebar.propTypes = {
  children: PropTypes.node
}

export default DisplaySidebar
