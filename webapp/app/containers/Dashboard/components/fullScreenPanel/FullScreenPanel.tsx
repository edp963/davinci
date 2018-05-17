import * as React from 'react'
const Icon = require('antd/lib/icon')
const Menu = require('antd/lib/menu/')
import * as classnames from 'classnames'
import * as echarts from 'echarts/lib/echarts'
import DashboardItemControlForm from '../DashboardItemControlForm'
import {iconMapping, echartsOptionsGenerator} from '../../../Widget/components/chartUtil'
import Chart from '../Chart'
import {ECHARTS_RENDERER} from '../../../../globalConstants'
const styles = require('./fullScreenPanel.less')

interface IFullScreenPanelProps {
  visible: boolean
  isVisible: (currentChartData?: any) => any
  currentDataInFullScreen: {
    w?: any
    h?: any
    loading?: any
    chartInfo?: {
      renderer?: string
    }
    widget?: any
    itemId?: number
    onGetChartData?: any
  }
  widgets: any
  widgetlibs: any[]
  currentDatasources: boolean | object
  currentDashboard: {
    widgets?: any[]
  }
  onCurrentWidgetInFullScreen: (id: number) => any
}

interface IFullScreenPanelStates {
  isShowMenu: boolean,
  controlPanelVisible: boolean
}

class FullScreenPanel extends React.PureComponent<IFullScreenPanelProps, IFullScreenPanelStates > {
  private chartInstance: any
  constructor (props) {
    super(props)
    this.chartInstance = false
    this.state = {
      isShowMenu: false,
      controlPanelVisible: false
    }
  }
  private hide = () => {
    this.setState({
      controlPanelVisible: false
    })
    const {isVisible} = this.props
    if (isVisible) {
      isVisible()
    }
  }
  private toggleControlPanel = () => {
    this.setState({
      controlPanelVisible: !this.state.controlPanelVisible
    })
  }
  private triggerWidget = (e) => {
    const {onCurrentWidgetInFullScreen} = this.props
    const itemId = e.item.props.itemId
    onCurrentWidgetInFullScreen(itemId)
  }
  public componentDidUpdate (prevProps, prevState) {
    const {chartInfo, widget, itemId} = this.props.currentDataInFullScreen
    const {currentDatasources, visible} = this.props
    const data = currentDatasources[itemId]
    const chartInstanceId = 'fsChartsWrapper'
    if (chartInfo && chartInfo.renderer !== ECHARTS_RENDERER) {
      return false
    }
    if (itemId && visible) {
      if (this.chartInstance) {
        this.chartInstance.dispose()
      }
      this.chartInstance = echarts.init(document.getElementById(chartInstanceId), 'default')
      this.renderChart(this.chartInstance, itemId, widget, data.dataSource, chartInfo)
    }
  }

  private renderChart = (chartInstance, itemId, widget, dataSource, chartInfo, interactIndex?: any) => {
    echartsOptionsGenerator({
      dataSource,
      chartInfo,
      chartParams: {
        ...JSON.parse(widget.chart_params),
        id: widget.id,
        name: widget.name,
        desc: widget.desc,
        flatTable_id: widget.flatTable_id,
        widgetlib_id: widget.widgetlib_id
      },
      interactIndex
    })
      .then((chartOptions) => {
        chartInstance.setOption(chartOptions)
        chartInstance.hideLoading()
      })
  }
  private isShowSideMenu = () => {
    this.setState({
      isShowMenu: !this.state.isShowMenu
    })
  }
  private onControlSearch = (queryParams) => {
    const {currentDataInFullScreen} = this.props
    const {
      itemId,
      widget,
      onGetChartData
    } = currentDataInFullScreen
    onGetChartData('rerender', itemId, widget.id, queryParams)
  }
  public render () {
    const {isShowMenu, controlPanelVisible} = this.state
    const {visible, currentDataInFullScreen, currentDatasources, currentDashboard, widgets, widgetlibs} = this.props
    const fsClassName = classnames({
      [styles.fullScreen]: true,
      [styles.displayNone]: !visible,
      [styles.displayBlock]: visible
    })
    let charts: any
    let menus: any
    let title: string = ''
    let renderType: string = ''
    let data: string = ''
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
      const itemId = String(currentDataInFullScreen.itemId)
      if (itemId) {
        menus = (
          <Menu theme="light" onClick={this.triggerWidget} selectedKeys={[itemId]}>
            {
              currentDashboard && currentDashboard.widgets.map(
                (widget, i) => {
                  const w = widgets.find((w) => w.id === widget.widget_id)
                  const iconName = widgetlibs.find((wl) => wl.id === w['widgetlib_id'])['name']
                  return <Menu.Item key={widget.id} itemId={widget.id} >
                    <i className={`iconfont ${iconMapping[iconName]}`} style={{marginRight: '12px'}}/>
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
      const c = currentDataInFullScreen
      title = c.widget.name
      renderType = c.chartInfo.renderer
      data = currentDatasources[c.itemId]
      charts = renderType !== 'echarts'
        ?
        (
          <Chart
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
        )
        :
        (
          <div style={{width: '100%', height: '100%'}} id="fsChartsWrapper"/>
        )
    }
    let isHasControl: any
    if (currentDataInFullScreen && currentDataInFullScreen.widget && currentDataInFullScreen.widget.query_params) {
      const queryParams = currentDataInFullScreen.widget.query_params
      isHasControl = !!JSON.parse(queryParams).length
    }
    const controls = currentDataInFullScreen && currentDataInFullScreen.widget && currentDataInFullScreen.widget.query_params
      ? JSON.parse(currentDataInFullScreen.widget.query_params).filter((c) => c.type)
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
                </li> : ''}
              <li/>
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

export default FullScreenPanel
