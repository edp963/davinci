/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React from 'react'
import classnames from 'classnames'
import './Marquee.less'

interface IMarqueeProps {
  className?: string
  loop?: boolean
  leading?: number
  trailing?: number
  fps?: number
  hoverToStop?: boolean
}

interface IMarqueeStates {
  animatedWidth: number
  overflowWidth: number
}

const ANIMATE_STEP = 1

class Marquee extends React.Component<IMarqueeProps, IMarqueeStates> {
  private marqueeTimer: number
  private refBox = React.createRef<HTMLDivElement>()
  private refText = React.createRef<HTMLDivElement>()

  static defaultProps: Partial<IMarqueeProps> = {
    hoverToStop: true,
    loop: true,
    leading: 500,
    trailing: 800,
    fps: 50
  }

  state: IMarqueeStates = {
    animatedWidth: 0,
    overflowWidth: 0
  }

  public componentDidMount() {
    this.measureText()
    if (this.props.hoverToStop) {
      this.startAnimation()
    }
  }

  public componentDidUpdate() {
    this.measureText()
    if (this.props.hoverToStop && !this.marqueeTimer) {
      this.startAnimation()
    }
  }

  public componentWillUnmount() {
    window.clearTimeout(this.marqueeTimer)
  }

  private handleMouseEnter = () => {
    const { hoverToStop } = this.props
    if (hoverToStop) {
      window.clearTimeout(this.marqueeTimer)
      return
    }
    const { overflowWidth } = this.state
    if (overflowWidth > 0) {
      this.startAnimation()
    }
  }

  private handleMouseLeave = () => {
    const { hoverToStop } = this.props
    const { overflowWidth } = this.state
    if (hoverToStop && overflowWidth > 0) {
      this.startAnimation()
      return
    }
    window.clearTimeout(this.marqueeTimer)
    this.setState({ animatedWidth: 0 })
  }

  private startAnimation = () => {
    clearTimeout(this.marqueeTimer)

    const isLeading = this.state.animatedWidth === 0
    const TIMEOUT = (1 / this.props.fps) * 1000
    const timeout = isLeading ? this.props.leading : TIMEOUT

    const animate = () => {
      const { overflowWidth } = this.state
      let animatedWidth = this.state.animatedWidth + ANIMATE_STEP
      const isRoundOver = animatedWidth > overflowWidth

      if (isRoundOver) {
        if (!this.props.loop) {
          return
        }
        animatedWidth = 0
      }

      if (isRoundOver && this.props.trailing) {
        this.marqueeTimer = window.setTimeout(() => {
          this.setState({ animatedWidth })
          this.marqueeTimer = window.setTimeout(animate, TIMEOUT)
        }, this.props.trailing)
      } else {
        this.setState({ animatedWidth })
        this.marqueeTimer = window.setTimeout(animate, TIMEOUT)
      }
    }

    this.marqueeTimer = window.setTimeout(animate, timeout)
  }

  private measureText = () => {
    if (!this.refBox.current || !this.refText.current) {
      return
    }
    const boxWidth = this.refBox.current.offsetWidth
    const textWidth = this.refText.current.offsetWidth
    const overflowWidth = textWidth - boxWidth

    if (overflowWidth !== this.state.overflowWidth) {
      this.setState({ overflowWidth })
    }
  }

  public render() {
    const { className } = this.props
    const { overflowWidth, animatedWidth } = this.state

    const cls = classnames({
      'marquee-box': true,
      [className]: !!className
    })

    const boxProps =
      overflowWidth < 0
        ? {}
        : {
            onMouseEnter: this.handleMouseEnter,
            onMouseLeave: this.handleMouseLeave
          }

    return (
      <div ref={this.refBox} className={cls} {...boxProps}>
        <div
          ref={this.refText}
          className="marquee-text"
          style={{ right: animatedWidth }}
        >
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Marquee

// refs:
//    1. https://github.com/jasonslyvia/react-marquee/blob/master/src/index.js
//    2. https://github.com/ant-design/ant-design-mobile/blob/master/components/notice-bar/Marquee.tsx
