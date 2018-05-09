import * as React from 'react'

import DisplayEditor from './DisplayEditor'
import DisplayBottom from './DisplayBottom'
import DisplaySidebar from './DisplaySidebar'

const styles = require('../Display.less')

interface IDisplayBodyProps {
  children: JSX.Element[],
}

export function DisplayBody (props: IDisplayBodyProps) {
  let editor
  let bottom
  let sidebar

  props.children.forEach((c) => {
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

export default DisplayBody
