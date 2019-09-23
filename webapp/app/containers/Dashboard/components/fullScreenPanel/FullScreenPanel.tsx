import React from 'react'
import memoizeOne from 'memoize-one'
import { Icon, Menu } from 'antd'
import * as classnames from 'classnames'
import DashboardItemControlForm from '../DashboardItemControlForm'
import { IQueryConditions } from 'containers/Dashboard/Grid'
import { IModel } from 'containers/Widget/components/Workbench/index'
import Widget from 'containers/Widget/components/Widget'
const styles = require('./fullScreenPanel.less')

interface IFullScreenPanelProps {
  visible: boolean
  isVisible: (currentChartData?: any) => any
  currentDataInFullScreen: {
    renderType?: string
    widget?: any
    model?: IModel
    itemId?: number
    onGetChartData?: any
  }
  currentItems?: any[]
  widgets: any[]
  currentItemsInfo: boolean | object
  currentDashboard: {
    widgets?: any[]
  }
  onCurrentWidgetInFullScreen: (id: number) => any
  onRenderChart?: any
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
    this.props.onCurrentWidgetInFullScreen(Number(e.key))
  }

  private isShowSideMenu = () => {
    this.setState({
      isShowMenu: !this.state.isShowMenu
    })
  }
  private onControlSearch = (queryConditions) => {
    const {currentDataInFullScreen} = this.props
    const {
      itemId,
      widget,
      onGetChartData
    } = currentDataInFullScreen
    onGetChartData('rerender', itemId, widget.id, queryConditions)
  }

  private getQueryVariables = memoizeOne((queryConditions: IQueryConditions) => {
    const { variables, linkageVariables, globalVariables } = queryConditions
    const queryVariables = [...variables, ...linkageVariables, ...globalVariables]
      .reduce((obj, { name, value }) => {
        obj[`$${name}$`] = value
        return obj
      }, {})
    return queryVariables
  })

  public render () {
    const {isShowMenu, controlPanelVisible} = this.state
    const {visible, currentDataInFullScreen, currentItemsInfo, currentDashboard, widgets, currentItems} = this.props
    const fsClassName = classnames({
      [styles.fullScreen]: true,
      [styles.displayNone]: !visible,
      [styles.displayBlock]: visible
    })

    let charts: any = null
    let menus: any
    let title: string = ''
    let itemInfo: any = null

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
              currentItems && currentItems.map(
                (item, i) => {
                  const w = widgets.find((w) => w.id === item.widgetId)
               // const iconName = widgetlibs.find((wl) => wl.id === w['widgetlib_id'])['name']
                  return <Menu.Item key={item.id}>
                    <i style={{marginRight: '8px'}}/>
                    {w.name}
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
      itemInfo = currentItemsInfo[c.itemId]
      const widgetProps = JSON.parse(currentDataInFullScreen.widget.config)
      const queryVariables = this.getQueryVariables(itemInfo.queryConditions)
      charts = (
        <Widget
          {...widgetProps}
          data={itemInfo && itemInfo.datasource ? itemInfo.datasource.resultList : []}
          model={currentDataInFullScreen.model}
          queryVariables={queryVariables}
          renderType={itemInfo && itemInfo.loading ? 'loading' : 'rerender'}
          loading={itemInfo && itemInfo.loading ? itemInfo.loading : false}
        />
      )
    }
    let controlTypes = []
    let isHasControl = false
    if (currentDataInFullScreen && currentDataInFullScreen.widget) {
      const controls = currentDataInFullScreen.widget.controls
        ? JSON.parse(currentDataInFullScreen.widget.controls)
        : []
      isHasControl = !!controls.length
      controlTypes = controls.filter((c) => c.type)
    }
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
                  controls={controlTypes}
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
