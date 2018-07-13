import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import * as classnames from 'classnames'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

const styles = require('../../../app/containers/Display/Display.less')

import { loadDisplay } from './actions'
import {
  makeSelectTitle,
  makeSelectDisplay,
  makeSelectSlide,
  makeSelectLayers,
  makeSelectWidgets,
  makeSelectDatasources,
  makeSelectLoadings,
  makeSelectLayersQueryParams
} from './selectors'

import widgetlibs from '../../../app/assets/json/widgetlib'
import Login from '../../components/Login/index'
import LayerItem from '../../../app/containers/Display/components/LayerItem'

interface IDisplayProps extends RouteComponentProps<{}, {}> {
  title: string
  display: any
  slide: any
  layers: any
  widgets: any
  datasources: any
  loadings: any
  layersQueryParams: any
  onLoadDisplay: (token, resolve, reject) => void
}

interface IDisplayStates {
  scale: number
}

export class Display extends React.Component<IDisplayProps, IDisplayStates> {

  public constructor (props) {
    super(props)
    this.state = {
      scale: 1
    }
  }

  public componentWillMount () {
    this.loadShareContent()
  }

  public componentWillReceiveProps (nextProps: IDisplayProps) {
    const { slide } = nextProps
    if (slide && this.props.slide !== slide) {
      const { slideParams } = JSON.parse(slide.config)
      const { scaleMode, width, height } = slideParams
      const { clientHeight, clientWidth } = document.body
      let nextScale = 1
      switch (scaleMode) {
        case 'scaleHeight':
          nextScale = clientHeight / height
          break
        case 'scaleWidth':
          nextScale = clientWidth / width
          break
      }
      if (this.state.scale !== nextScale) {
        this.setState({ scale: nextScale })
      }
    }
  }

  private getSlideStyle = (slideParams) => {
    const { scale } = this.state

    const {
      width,
      height,
      backgroundColor,
      opacity,
      backgroundImage
    } = slideParams

    let slideStyle: React.CSSProperties
    slideStyle  = {
      overflow: 'visible',
      width: `${width * scale}px`,
      height: `${height * scale}px`
    }

    if (backgroundColor) {
      const rgb = [...backgroundColor, (opacity / 100)].join()
      slideStyle.backgroundColor = `rgb(${rgb})`
    }
    if (backgroundImage) {
      slideStyle.backgroundImage = `url("${backgroundImage}")`
    }
    return slideStyle
  }

  private loadShareContent = () => {
    const { onLoadDisplay } = this.props
    const { shareInfo } = this.props.location.query
    onLoadDisplay(shareInfo, () => {}, () => {})
  }

  public render () {
    const {
      widgets,
      display,
      slide,
      layers,
      datasources,
      loadings,
      layersQueryParams
    } = this.props

    if (!display) { return null }

    const { scale } = this.state
    const slideStyle = this.getSlideStyle(JSON.parse(slide.config).slideParams)
    const layerItems =  Array.isArray(widgets) ? layers.map((layer) => {
      const widget = widgets.find((w) => w.id === layer.widgetId)
      const chartInfo = widget && widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
      const layerId = layer.id
      const data = datasources[layerId]
      const loading = loadings[layerId]
      const sql = layersQueryParams[layerId]

      return (
        <LayerItem
          pure={true}
          scale={scale}
          ref={(f) => this[`layerId_${layer.id}`]}
          itemId={layerId}
          widget={widget}
          chartInfo={chartInfo}
          data={data}
          key={layer.id}
          layer={layer}
          loading={loading}
          onGetChartData={this.getChartData}
          onRenderChart={this.renderChart}
        />
      )
    }) : null

    return (
      <div className={styles.preview}>
        <div className={styles.board} style={slideStyle}>
          {layerItems}
        </div>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  title: makeSelectTitle(),
  display: makeSelectDisplay(),
  slide: makeSelectSlide(),
  layers: makeSelectLayers(),
  widgets: makeSelectWidgets(),
  datasources: makeSelectDatasources(),
  loadings: makeSelectLoadings(),
  layersQueryParams: makeSelectLayersQueryParams()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDisplay: (token, resolve, reject) => dispatch(loadDisplay(token, resolve, reject))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'shareDisplay', reducer })
const withSaga = injectSaga({ key: 'shareDisplay', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Display)
