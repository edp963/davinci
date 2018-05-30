import * as React from 'react'

import LayerList from './LayerList'
import DisplayContainer from './DisplayContainer'
import DisplayBottom from './DisplayBottom'
import DisplaySidebar from './DisplaySidebar'

const styles = require('../Display.less')

interface IDisplayBodyProps {
  children: JSX.Element[],
}

export function DisplayBody (props: IDisplayBodyProps) {
  let layer
  let editor
  let bottom
  let sidebar

  props.children.forEach((c) => {
    if (c.type === LayerList) {
      layer = c
    }
    if (c.type === DisplayContainer) {
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
      {layer}
      <div className={styles.main}>
        {editor}
        {bottom}
      </div>
      {sidebar}
    </div>
  )
}

export default DisplayBody
