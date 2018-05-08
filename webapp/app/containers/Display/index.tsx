/*
 *
 * Display
 *
 */

import * as React from 'react'
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
const styles = require('./Display.less')


interface IDisplayProps {
  onHideNavigator: () => void
}

interface IDisplayStates {
  editorWidth: number,
  editorHeight: number,
  editorPadding: string,
  scale: number,
  sliderValue: number,
  displayWidth: number,
  displayHeight: number,
  displayScale: string,
  gridDistance: number
}

export class Display extends React.Component<IDisplayProps, IDisplayStates> {
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

  private editor: any

  public componentDidMount () {
    this.props.onHideNavigator()
    window.addEventListener('resize', this.containerResize, false)
    // onHideNavigator 导致页面渲染
    setTimeout(() => {
      this.doScale(1)
    })
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.containerResize, false)
  }

  private containerResize = () => {
    this.sliderChange(this.state.sliderValue)
  }

  private sliderChange = (value) => {
    this.doScale(value / 40 + 0.5)
    this.setState({
      sliderValue: value
    })
  }

  private zoomIn = () => {
    if (this.state.sliderValue) {
      this.sliderChange(Math.max(this.state.sliderValue - 10, 0))
    }
  }

  private zoomOut = () => {
    if (this.state.sliderValue !== 100) {
      this.sliderChange(Math.min(this.state.sliderValue + 10, 100))
    }
  }

  private doScale = (times) => {
    const { displayWidth, displayHeight } = this.state
    const { offsetWidth, offsetHeight } = this.editor.container

    const editorWidth = Math.max(offsetWidth * times, offsetWidth)
    const editorHeight = Math.max(offsetHeight * times, offsetHeight)

    const scale = (displayWidth / displayHeight > editorWidth / editorHeight) ?
      // landscape
      (editorWidth - 64) / displayWidth * times :
      // portrait
      (editorHeight - 64) / displayHeight * times

    const leftRightPadding = Math.max((offsetWidth - displayWidth * scale) / 2, 32)
    const topBottomPadding = Math.max((offsetHeight - displayHeight * scale) / 2, 32)

    this.setState({
      editorWidth: Math.max(editorWidth, displayWidth * scale + 64),
      editorHeight: Math.max(editorHeight, displayHeight * scale + 64),
      editorPadding: `${topBottomPadding}px ${leftRightPadding}px`,
      scale
    })
  }

  private displaySizeChange = (width, height) => {
    this.setState({
      displayWidth: width,
      displayHeight: height
    }, () => {
      this.sliderChange(this.state.sliderValue)
    })
  }

  private displayScaleChange = (event) => {
    this.setState({
      displayScale: event.target.value
    })
  }

  private gridDistanceChange = (distance) => {
    this.setState({
      gridDistance: distance
    })
  }

  private abc = (e, d) => {
    console.log(e, d)
  }

  public render () {
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
        <DisplayHeader widgets={[]}/>
        <DisplayBody>
          <DisplayEditor
            key="editor"
            width={editorWidth}
            height={editorHeight}
            padding={editorPadding}
            scale={scale}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            ref={(f) => { this.editor = f }}
          >
            <Draggable
              grid={[gridDistance * scale, gridDistance * scale]}
              bounds="parent"
              scale={scale}
              onStop={this.abc}
            >
              <div style={{width: '192px', height: '192px', border: '1px solid #000'}}/>
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

const mapStateToProps = createStructuredSelector({
  Display: makeSelectDisplay()
})

function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Display)
