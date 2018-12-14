import * as React from 'react'

const styles = require('../Display.less')

interface IDisplayBodyProps {
  children: Array<React.ReactElement<any>>
}

export const DisplayBody: React.SFC<IDisplayBodyProps> = (props) => {
  let container
  let bottom
  let sidebar

  props.children.forEach((c) => {
    const displayName = (c.type as React.ComponentClass<any> | React.FunctionComponent<any>).displayName

    switch (displayName) {
      case 'DisplayContainer':
        container = c
        break
      case 'DisplayBottom':
        bottom = c
        break
      case 'DisplaySidebar':
        sidebar = c
        break
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
