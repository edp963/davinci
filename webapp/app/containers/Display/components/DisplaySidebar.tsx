import * as React from 'react'

import LayerList from './LayerList'
import SettingForm from './SettingForm'
import LayerAlign from './LayerAlign'

const styles = require('../Display.less')

interface IDisplaySidebarProps {
  children: Array<React.ReactElement<any>>
}

export const DisplaySidebar: React.SFC<IDisplaySidebarProps> = (props) => {
  let layerList
  let settingContent

  props.children.forEach(((c) => {
    if (!c) { return }

    const displayName = (c.type as React.ComponentClass<any> | React.FunctionComponent<any>).displayName

    if (displayName === 'LayerList') {
      layerList = c
    } else {
      settingContent = c
    }
  }))

  return (
    <div className={styles.sidebar}>
      {layerList}
      {settingContent}
    </div>
  )
}

DisplaySidebar.displayName = 'DisplaySidebar'

export default DisplaySidebar
