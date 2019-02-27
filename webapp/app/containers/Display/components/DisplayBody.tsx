import React from 'react'
import { areComponentsEqual } from 'react-hot-loader'
import DisplayContainer from './DisplayContainer'
import DisplayBottom from './DisplayBottom'
import DisplaySidebar from './DisplaySidebar'

const styles = require('../Display.less')

export const DisplayBody: React.FunctionComponent = (props) => {

  let container
  let bottom
  let sidebar

  React.Children.forEach(props.children, (c) => {
    if (!c) { return }

    const type = (c as React.ReactElement<any>).type as React.ComponentClass<any>
    if (areComponentsEqual(type, DisplayContainer)) {
      container = c
    } else if (areComponentsEqual(type, DisplayBottom)) {
      bottom = c
    } else if (areComponentsEqual(type, DisplaySidebar)) {
      sidebar = c
    }
  })

  return (
    <div className={styles.body}>
      <div className={styles.main}>
        {container}
        {bottom}
      </div>
      {sidebar}
    </div>
  )
}

export default DisplayBody
