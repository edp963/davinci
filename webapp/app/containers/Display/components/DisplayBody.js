import React from 'react'
import PropTypes from 'prop-types'
import DisplayEditor from './DisplayEditor'
import DisplayBottom from './DisplayBottom'
import DisplaySidebar from './DisplaySidebar'

import styles from '../Display.less'

export function DisplayBody (props) {
  let editor
  let bottom
  let sidebar

  props.children.forEach(c => {
    if (c.type === DisplayEditor) {
      editor = c
    }
    if (c.type === DisplayBottom) {
      bottom = c
    }
    if (c.type === DisplaySidebar) {
      sidebar = c
    }
  })

  return (
    <div className={styles.body}>
      <div className={styles.main}>
        {editor}
        {bottom}
      </div>
      {sidebar}
    </div>
  )
}

DisplayBody.propTypes = {
  children: PropTypes.node
}

export default DisplayBody
