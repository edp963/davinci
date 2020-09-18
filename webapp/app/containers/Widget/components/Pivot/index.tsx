import React from 'react'
import Pivot, { IPivotProps } from './Pivot'

type ScrollConfigType = 'vertical' | 'horizontal' | 'duplex'
type ScrollRole = 'header' | 'body'

export class ScrollablePivot extends React.Component<IPivotProps, {}> {
  private scrollThrottle: boolean = false
  private scrollEnd: number
  private headerScrolling = false
  private bodyScrolling = false

  private columnHeaderListenerCallback: (e) => void = null
  private columnFooterListenerCallback: (e) => void = null
  private rowHeaderListenerCallback: (e) => void = null
  private tableBodyListenerCallback: (e) => void = null

  private pivot: Pivot = null

  public shouldComponentUpdate (nextProps: IPivotProps) {
    return nextProps.renderType !== 'loading'
  }

  public componentDidMount () {
    const { rowHeader, columnHeader, columnFooter, tableBody } = this.pivot

    this.columnHeaderListenerCallback = this.duplexScroll({
      type: 'horizontal',
      role: 'header',
      follower: [tableBody, columnFooter]
    })
    this.columnFooterListenerCallback = this.duplexScroll({
      type: 'horizontal',
      role: 'header',
      follower: [tableBody, columnHeader]
    })
    this.rowHeaderListenerCallback = this.duplexScroll({
      type: 'vertical',
      role: 'header',
      follower: [tableBody]
    })
    this.tableBodyListenerCallback = this.duplexScroll({
      type: 'duplex',
      role: 'body',
      follower: [columnHeader, columnFooter, rowHeader]
    })

    columnHeader.addEventListener('scroll', this.columnHeaderListenerCallback, false)
    columnFooter.addEventListener('scroll', this.columnFooterListenerCallback, false)
    rowHeader.addEventListener('scroll', this.rowHeaderListenerCallback, false)
    tableBody.addEventListener('scroll', this.tableBodyListenerCallback, false)
  }

  public componentWillUnmount () {
    const { rowHeader, columnHeader, columnFooter, tableBody } = this.pivot
    columnHeader.removeEventListener('scroll', this.columnHeaderListenerCallback, false)
    columnFooter.removeEventListener('scroll', this.columnFooterListenerCallback, false)
    rowHeader.removeEventListener('scroll', this.rowHeaderListenerCallback, false)
    tableBody.removeEventListener('scroll', this.tableBodyListenerCallback, false)
  }

  private duplexScroll = (config: { type: ScrollConfigType, role: ScrollRole, follower: HTMLElement[]}) => (e) => {
    if (!this.scrollThrottle) {
      this.scrollThrottle = true

      if (!this.headerScrolling && !this.bodyScrolling) {
        if (config.role === 'header') {
          this.headerScrolling = true
        } else {
          this.bodyScrolling = true
        }
      } else {
        if (config.role === 'header' && !this.headerScrolling ||
            config.role === 'body' && !this.bodyScrolling) {
          this.scrollThrottle = false
          return
        }
      }

      requestAnimationFrame(() => {
        clearTimeout(this.scrollEnd)

        this.syncScroll(config.type, config.follower, e)
        this.scrollThrottle = false

        this.scrollEnd = window.setTimeout(() => {
          this.headerScrolling = false
          this.bodyScrolling = false
        }, 100)
      })
    }
  }

  private syncScroll (type: ScrollConfigType, follower: HTMLElement[], e) {
    switch (type) {
      case 'horizontal':
        follower[0].scrollLeft = follower[1].scrollLeft = e.target.scrollLeft
        break
      case 'vertical':
        follower[0].scrollTop = e.target.scrollTop
        break
      default:
        follower[0].scrollLeft = follower[1].scrollLeft = e.target.scrollLeft
        follower[2].scrollTop = e.target.scrollTop
        break
    }
  }

  public render () {
    return (
      <Pivot {...this.props} ref={(f) => this.pivot = f} />
    )
  }
}

export default ScrollablePivot
