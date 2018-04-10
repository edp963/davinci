import React, { PropTypes, PureComponent} from 'react'
import Icon from 'antd/lib/icon'
import Menu from 'antd/lib/menu'
import classnames from 'classnames'
import * as echarts from 'echarts/lib/echarts'
import DashboardItemControlForm from '../DashboardItemControlForm'
import {iconMapping, echartsOptionsGenerator} from '../../../Widget/components/chartUtil'
import Chart from '../Chart'
import {ECHARTS_RENDERER} from '../../../../globalConstants'
import styles from './fullScreenPanel.less'

class FullScreenPanel extends PureComponent {
  constructor (props) {
    super(props)
    this.chartInstance = false
  }
  state = {
    isShowMenu: false,
    controlPanelVisible: false
  }
  hide = () => {
    this.setState({
      controlPanelVisible: false
    })
    const {isVisible} = this.props
    if (isVisible) {
      isVisible()
    }
  }
  toggleControlPanel = () => {
    this.setState({
      controlPanelVisible: !this.state.controlPanelVisible
    })
  }
  triggerWidget = (e) => {
    const {onCurrentWidgetInFullScreen} = this.props
    let itemId = e.item.props.itemId
    onCurrentWidgetInFullScreen(itemId)
  }
  componentDidUpdate (prevProps, prevState) {
    const {chartInfo, widget, itemId} = this.props.currentDataInFullScreen
    const {currentDatasources, visible} = this.props
    const data = currentDatasources[itemId]
    const chartInstanceId = 'fsChartsWrapper'
    if (chartInfo && chartInfo.renderer !== ECHARTS_RENDERER) return
    if (itemId && visible) {
      if (this.chartInstance) {
        this.chartInstance.dispose()
      }
      this.chartInstance = echarts.init(document.getElementById(chartInstanceId), 'default')
      this.renderChart(this.chartInstance, itemId, widget, data.dataSource, chartInfo)
    }
  }

  renderChart = (chartInstance, itemId, widget, dataSource, chartInfo, interactIndex) => {
    echartsOptionsGenerator({
      dataSource,
      chartInfo,
      chartParams: Object.assign({
        id: widget.id,
        name: widget.name,
        desc: widget.desc,
        flatTable_id: widget.flatTable_id,
        widgetlib_id: widget.widgetlib_id
      }, JSON.parse(widget.chart_params)),
      interactIndex
    })
      .then(chartOptions => {
        chartInstance.setOption(chartOptions)
        chartInstance.hideLoading()
      })
  }
  isShowSideMenu = () => {
    this.setState({
      isShowMenu: !this.state.isShowMenu
    })
  }
  onControlSearch = (queryParams) => {
    const {currentDataInFullScreen} = this.props
    const {
      itemId,
      widget,
      onGetChartData
    } = currentDataInFullScreen
    onGetChartData('rerender', itemId, widget.id, queryParams)
  }
  render () {
    const {isShowMenu, controlPanelVisible} = this.state
    const {visible, currentDataInFullScreen, currentDatasources, currentDashboard, widgets, widgetlibs} = this.props
    const fsClassName = classnames({
      [styles.fullScreen]: true,
      [styles.displayNone]: !visible,
      [styles.displayBlock]: visible
    })
    let charts = ''
    let menus = ''
    let title = ''
    let renderType = ''
    let data = ''
    const chartClass = {
      chart: styles.chartBlock,
      table: styles.tableBlock,
      container: styles.block
    }
    const sideMenuClass = classnames({
      [styles.sideMenu]: true,
      [styles.hide]: !isShowMenu,
      [styles.show]: isShowMenu
    })
    const mainChartClass = classnames({
      [styles.chartWrapper]: true,
      [styles.marginLeftDefault]: !isShowMenu,
      [styles.marginLeftMenu]: isShowMenu
    })
    if (widgets) {
      let itemId = String(currentDataInFullScreen.itemId)
      if (itemId) {
        menus = (
          <Menu theme="light" onClick={this.triggerWidget} selectedKeys={[itemId]}>
            {
              currentDashboard && currentDashboard.widgets.map(
                (widget, i) => {
                  let w = widgets.find(w => w.id === widget.widget_id)
                  let iconName = widgetlibs.find(wl => wl.id === w['widgetlib_id'])['name']
                  return <Menu.Item key={widget.id} itemId={widget.id} >
                    <i className={`iconfont ${iconMapping[iconName]}`} style={{marginRight: '12px'}}></i>
                    {w['name']}
                  </Menu.Item>
                }
              )
            }
          </Menu>
        )
      }
    }

    if (Object.keys(currentDataInFullScreen).length > 0) {
      let c = currentDataInFullScreen
      title = c.widget.name
      renderType = c.chartInfo.renderer
      data = currentDatasources[c.itemId]
      charts = renderType !== 'echarts'
        ? <Chart
          id={`${c.itemId}`}
          w={c.w}
          h={c.h}
          title={c.widget.name}
          data={data || {}}
          loading={c.loading}
          chartInfo={c.chartInfo}
          chartParams={JSON.parse(c.widget.chart_params)}
          classNames={chartClass}
          />
        : (<div style={{width: '100%', height: '100%'}} id="fsChartsWrapper"></div>)
    }
    let isHasControl
    if (currentDataInFullScreen && currentDataInFullScreen.widget && currentDataInFullScreen.widget.query_params) {
      let queryParams = currentDataInFullScreen.widget.query_params
      isHasControl = !!JSON.parse(queryParams).length
    }
    const controls = currentDataInFullScreen && currentDataInFullScreen.widget && currentDataInFullScreen.widget.query_params
      ? JSON.parse(currentDataInFullScreen.widget.query_params).filter(c => c.type)
      : []
    const modalPanel = classnames({
      [styles.modalPanel]: true,
      [styles.displayNone]: !controlPanelVisible
    })
    const controlPanel = classnames({
      [styles.controlPanel]: true,
      [styles.displayNone]: !controlPanelVisible,
      [styles.showModalPanel]: controlPanelVisible,
      [styles.hideModalPanel]: !controlPanelVisible
    })
    return (
      <div className={fsClassName}>
        <div className={styles.container}>
          <nav className={styles.header}>
            <div className={styles.logo}>
              <Icon type={this.state.isShowMenu ? 'menu-fold' : 'menu-unfold'} onClick={this.isShowSideMenu} style={{marginRight: '32px'}} />
              <span>{title}</span>
            </div>
            <ul className={styles.tools}>
              {
                isHasControl ? <li onClick={this.toggleControlPanel}>
                  <Icon type={`${!controlPanelVisible ? 'down-square-o' : 'up-square-o'}`} /><span>控制器</span>
                </li> : ''
              }
              <li></li>
              <li onClick={this.hide}>
                <Icon type="shrink" /><span>退出全屏</span>
              </li>
            </ul>
          </nav>
          <div className={styles.body}>
            <div className={sideMenuClass}>
              {menus}
            </div>
            <div className={modalPanel} />
            <div className={controlPanel}>
              <div className={styles.formPanel}>
                <DashboardItemControlForm
                  controls={controls}
                  onSearch={this.onControlSearch}
                  onHide={this.toggleControlPanel}
                />
              </div>
            </div>
            <div className={mainChartClass}>
              {charts}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

FullScreenPanel.propTypes = {
  visible: PropTypes.bool,
  isVisible: PropTypes.func,
  currentDataInFullScreen: PropTypes.object,
  widgets: PropTypes.any,
  widgetlibs: PropTypes.array,
  currentDatasources: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentDashboard: PropTypes.object,
  onCurrentWidgetInFullScreen: PropTypes.func
}

export default FullScreenPanel
