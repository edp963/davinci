/*
 *
 * Display
 *
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { createStructuredSelector } from 'reselect'
import makeSelectDisplay from './selectors'
import Draggable from '../../components/Draggable/react-draggable'

import DisplayHeader from './components/DisplayHeader'
import DisplayBody from './components/DisplayBody'
import DisplayEditor from './components/DisplayEditor'
import DisplayBottom from './components/DisplayBottom'
import DisplaySidebar from './components/DisplaySidebar'

import SettingForm from './components/SettingForm'

import { hideNavigator } from '../App/actions'
import { DEFAULT_DISPLAY_WIDTH, DEFAULT_DISPLAY_HEIGHT } from '../../globalConstants'
import styles from './Display.less'

export class Display extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      editorWidth: 0,
      editorHeight: 0,
      editorPadding: '',
      scale: 1,
      sliderValue: 20,

      displayWidth: DEFAULT_DISPLAY_WIDTH,
      displayHeight: DEFAULT_DISPLAY_HEIGHT,
      displayScale: 'auto',
      gridDistance: 10
    }
  }

  componentDidMount () {
    this.props.onHideNavigator()
    window.addEventListener('resize', this.containerResize, false)
    // onHideNavigator 导致页面渲染
    setTimeout(() => {
      this.doScale(1)
    })
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.containerResize, false)
  }

  containerResize = () => {
    this.sliderChange(this.state.sliderValue)
  }

  sliderChange = (value) => {
    this.doScale(value / 40 + 0.5)
    this.setState({
      sliderValue: value
    })
  }

  zoomIn = () => {
    if (this.state.sliderValue) {
      this.sliderChange(Math.max(this.state.sliderValue - 10, 0))
    }
  }

  zoomOut = () => {
    if (this.state.sliderValue !== 100) {
      this.sliderChange(Math.min(this.state.sliderValue + 10, 100))
    }
  }

  doScale = (times) => {
    const { displayWidth, displayHeight } = this.state
    const { offsetWidth, offsetHeight } = this.editor.container

    let editorWidth = Math.max(offsetWidth * times, offsetWidth)
    let editorHeight = Math.max(offsetHeight * times, offsetHeight)

    let scale = 1

    if (displayWidth / displayHeight > editorWidth / editorHeight) {
      // landscape
      scale = (editorWidth - 64) / displayWidth * times
    } else {
      // portrait
      scale = (editorHeight - 64) / displayHeight * times
    }

    const leftRightPadding = Math.max((offsetWidth - displayWidth * scale) / 2, 32)
    const topBottomPadding = Math.max((offsetHeight - displayHeight * scale) / 2, 32)

    this.setState({
      editorWidth: Math.max(editorWidth, displayWidth * scale + 64),
      editorHeight: Math.max(editorHeight, displayHeight * scale + 64),
      editorPadding: `${topBottomPadding}px ${leftRightPadding}px`,
      scale
    })
  }

  displaySizeChange = (width, height) => {
    this.setState({
      displayWidth: width,
      displayHeight: height
    }, () => {
      this.sliderChange(this.state.sliderValue)
    })
  }

  displayScaleChange = (event) => {
    this.setState({
      displayScale: event.target.value
    })
  }

  gridDistanceChange = (distance) => {
    this.setState({
      gridDistance: distance
    })
  }

  abc = (e, d) => {
    console.log(e, d)
  }

  render () {
    const {
      editorWidth,
      editorHeight,
      editorPadding,
      scale,
      sliderValue,
      displayWidth,
      displayHeight,
      displayScale,
      gridDistance
    } = this.state
    return (
      <div className={styles.display}>
        <Helmet
          title="Display"
        />
        <DisplayHeader

        />
        <DisplayBody>
          <DisplayEditor
            key="editor"
            width={editorWidth}
            height={editorHeight}
            padding={editorPadding}
            scale={scale}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            ref={f => { this.editor = f }}
          >
            <Draggable
              grid={[gridDistance * scale, gridDistance * scale]}
              bounds="parent"
              scale={scale}
              onStop={this.abc}
            >
              <div style={{width: '192px', height: '192px', border: '1px solid #000'}}></div>
            </Draggable>
          </DisplayEditor>
          <DisplayBottom
            sliderValue={sliderValue}
            onZoomIn={this.zoomIn}
            onZoomOut={this.zoomOut}
            onSliderChange={this.sliderChange}
          />
          <DisplaySidebar>
            <SettingForm
              screenWidth={displayWidth}
              screenHeight={displayHeight}
              scale={displayScale}
              gridDistance={gridDistance}
              onDisplaySizeChange={this.displaySizeChange}
              onDisplayScaleChange={this.displayScaleChange}
              onGridDistanceChange={this.gridDistanceChange}
            />
          </DisplaySidebar>
        </DisplayBody>
      </div>
    )
  }
}

Display.propTypes = {
  onHideNavigator: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  Display: makeSelectDisplay()
})

function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Display)
