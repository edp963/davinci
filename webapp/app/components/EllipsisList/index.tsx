import React from 'react'

import { Row } from 'antd'
const styles = require('./EllipsisList.less')

interface IEllipsisListProps {
  rows?: number
  children: JSX.Element[]
}

interface IEllipsisListStates {
  screenWidth: number
  withEllipsis: boolean
}

export class EllipsisList extends React.Component<IEllipsisListProps, IEllipsisListStates> {

  private container: any

  constructor (props) {
    super(props)
    this.state = {
      screenWidth: 0,
      withEllipsis: true
    }
  }

  public componentWillMount () {
    this.setScreenWidth()
    window.addEventListener('resize', this.setScreenWidth, false)
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.setScreenWidth, false)
  }

  private setScreenWidth = () => {
    this.setState({
      screenWidth: document.documentElement.clientWidth
    })
  }

  private static layoutSetting = {
    xs: {
      minWidth: 0,
      cols: 1
    },
    sm: {
      minWidth: 768,
      cols: 2
    },
    md: {
      minWidth: 992,
      cols: 3
    },
    lg: {
      minWidth: 1200,
      cols: 4
    },
    xl: {
      minWidth: 1600,
      cols: 6
    }
  }

  private getColumns = () => {
    const { screenWidth } = this.state
    let cols = 0
    Object.keys(EllipsisList.layoutSetting).every((item) => {
      const setting = EllipsisList.layoutSetting[item]
      const pass = screenWidth >= setting.minWidth
      if (pass) { cols = setting.cols }
      return pass
    })
    return cols
  }

  private showAll = () => {
    this.setState({
      withEllipsis: false
    })
  }

  private renderEllipsis = (rowIdx: number, colIdx: number) => {
    const cols = this.getColumns()
    let style: React.CSSProperties = { }
    if (colIdx !== 0) {
      style = {
        bottom: `${100 / (2 * (rowIdx + 1))}%`,
        left: `${((2 * colIdx + 1) / (2 * cols)) * 100}%`,
        position: 'absolute',
        transform: 'translate3d(-50%, 50%, 0)'
      }
    } else {
      style = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    }

    return (
      <div style={style}>
        <div onClick={this.showAll} className={styles.moreList}>
          <div className={styles.more}/>
          <div className={styles.more}/>
          <div className={styles.more}/>
        </div>
      </div>
    )
  }

  public render () {
    const { rows, children } = this.props
    if (!Array.isArray(children)) { return null }

    const { withEllipsis } = this.state

    const cols = this.getColumns()
    let shownChildren = [...children]
    if (rows && withEllipsis) {
      shownChildren = shownChildren.slice(0, rows * cols - 1)
    }

    const rowIdx = Math.floor(shownChildren.length / cols)
    const colIdx = shownChildren.length % cols
    return (
      <Row
        gutter={20}
        ref={(f) => { this.container = f }}
      >
        {shownChildren}
        {rows && withEllipsis ? this.renderEllipsis(rowIdx, colIdx) : null}
      </Row>
    )
  }
}

export default EllipsisList
