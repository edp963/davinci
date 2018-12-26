import * as React from 'react'
import { areComponentsEqual } from 'react-hot-loader'

import LayerList from './LayerList'
import SettingForm from './SettingForm'
import LayerAlign from './LayerAlign'

const styles = require('../Display.less')

export class DisplaySidebar extends React.Component<{}, {}> {

  public static displayName = 'DisplaySidebar'

  public render () {
    let layerList
    let settingForm
    let layerAlign

    React.Children.forEach(this.props.children, (c) => {
      if (!c) { return }

      const type = (c as React.ReactElement<any>).type as React.ComponentClass<any>
      if (areComponentsEqual(type, LayerList)) {
        layerList = c
      } else if (areComponentsEqual(type, SettingForm)) {
        settingForm = c
      } else if (areComponentsEqual(type, LayerAlign)) {
        layerAlign = c
      }

    })

    return (
      <div className={styles.sidebar}>
        {layerList}
        {settingForm}
        {layerAlign}
      </div>
    )
  }

}

export default DisplaySidebar
