import * as React from 'react'

import LayerList from './LayerList'
import SettingForm from './SettingForm'
import LayerAlign from './LayerAlign'

const styles = require('../Display.less')

interface IDisplaySidebarProps {
  children: JSX.Element[]
}

export function DisplaySidebar (props: IDisplaySidebarProps) {
  let layerList
  let settingContent

  props.children.forEach(((c) => {
    if (!c) { return }
    if (c.type === LayerList) {
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

export default DisplaySidebar
