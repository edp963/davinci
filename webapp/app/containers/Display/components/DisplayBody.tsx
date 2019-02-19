import * as React from 'react'
import { areComponentsEqual } from 'react-hot-loader'
import DisplayContainer from './DisplayContainer'
import DisplayBottom from './DisplayBottom'
import DisplaySidebar from './DisplaySidebar'

const styles = require('../Display.less')

export class DisplayBody extends React.Component<{}, {}> {

  private container
  private bottom
  private sidebar

  public constructor (props) {
    super(props)
    this.distributeChild()
  }

  public componentDidUpdate () {
    this.distributeChild()
  }

  public shouldComponentUpdate (nextProps) {
    const needUpdate = nextProps.children.some((child, idx) => this.props.children[idx] !== child)
    console.log('shouldUpdate: ', needUpdate)
    return needUpdate
  }

  private distributeChild = () => {
    React.Children.forEach(this.props.children, (c) => {
      if (!c) { return }

      const type = (c as React.ReactElement<any>).type as React.ComponentClass<any>
      if (areComponentsEqual(type, DisplayContainer)) {
        this.container = c
      } else if (areComponentsEqual(type, DisplayBottom)) {
        this.bottom = c
      } else if (areComponentsEqual(type, DisplaySidebar)) {
        this.sidebar = c
      }
    })
  }

  public render () {
    return (
      <div className={styles.body}>
        <div className={styles.main}>
          {this.container}
          {this.bottom}
        </div>
        {this.sidebar}
      </div>
    )
  }
}

export default DisplayBody
