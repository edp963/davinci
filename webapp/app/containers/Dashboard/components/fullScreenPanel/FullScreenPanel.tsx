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

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
const Memo = React.memo
import classnames from 'classnames'
import { Icon, Menu } from 'antd'
const styles = require('./fullScreenPanel.less')
import Widget from 'containers/Widget/components/Widget'
import GlobalControlPanel from 'components/Filters/FilterPanel'
import { IWidget } from 'containers/Widget/components/Workbench'
import DashboardItemControlForm from '../DashboardItemControlForm'
import { IViewModel } from 'containers/View/types'
import { getNativeQuery, getPagination } from 'containers/Viz/utils'
import { IGetChartData } from 'containers/Dashboard/components/DashboardItem'
import { IWidgetConfig } from 'containers/Widget/components/Widget'
import { IQueryConditions, IDashboardItem, IDashboardItemInfo } from 'containers/Dashboard/Grid'
import { OnGetControlOptions, IDistinctValueReqeustParams, IMapControlOptions, IMapItemControlRequestParams } from 'app/components/Filters/types'

type ICtrlType = 'local'|'global'
type IcurrentWidgetInFullScreen = (id: number) => any
type IisVisible = (data?: ICurrentDataInFullScreenProps) => void



interface IcurrentItemsInfo {
  [key: string] : IDashboardItemInfo
}

export interface ICurrentDataInFullScreenProps {
  model: IViewModel
  itemId: number
  widget: IWidget
  loading?: boolean
  renderType?: string
}


interface IFullScreenPanelProps {
  visible: boolean
  isVisible: IisVisible
  widgets: IWidget[]
  currentItems: IDashboardItem[]
  onGetChartData: IGetChartData
  currentItemsInfo: IcurrentItemsInfo
  monitoredSearchDataAction?: () => any
  onGetControlOptions: OnGetControlOptions
  onCurrentWidgetInFullScreen: IcurrentWidgetInFullScreen
  chartDetail: ICurrentDataInFullScreenProps
  currentDashboard: any
  mapOptions: IMapControlOptions
  onSearch: (requestParamsByItem: IMapItemControlRequestParams) => void
}

interface IFullScreenMenuProps {
  visible: boolean
  widgets: IWidget[]
  currentItems: IDashboardItem[]
  chartDetail: ICurrentDataInFullScreenProps
  onCurrentWidgetInFullScreen: IcurrentWidgetInFullScreen
}


interface IFullScreenChartProps {
  onGetChartData: IGetChartData
  currentItemsInfo: IcurrentItemsInfo
  chartDetail: ICurrentDataInFullScreenProps
}

interface IControlProps {
  hasLocalCtrl: boolean
  hasGlobalCtrl: boolean
  visible: boolean
  onGetOptions: OnGetControlOptions
  toggleControl: () => any
  currentItems: IDashboardItem[]
  onGetChartData: IGetChartData
  currentItemsInfo: IcurrentItemsInfo
  chartDetail: ICurrentDataInFullScreenProps
  monitoredSearchDataAction?: () => any
  currentDashboard: any
  mapOptions: IMapControlOptions
  onSearch: (requestParamsByItem: IMapItemControlRequestParams) => void
}


const FullScreenMenu: React.FC<IFullScreenMenuProps> = Memo(

  ({ visible, widgets, chartDetail, currentItems, onCurrentWidgetInFullScreen }) => {
    const itemId = useRef(null)
    const sideMenuClass = classnames({
      [styles.sideMenu]: true,
      [styles.hide]: !visible,
      [styles.show]: visible
    })
    const menus = useMemo(() => {
      if (chartDetail && chartDetail.itemId) {
        itemId.current = String(chartDetail.itemId)
      }
      return (
        <Menu theme="light" onClick={triggerWidget} selectedKeys={[itemId.current]}>
          {
            currentItems && currentItems.map(
              (item, i) => {
              const w = widgets.find((w) => w.id === item.widgetId)
              return (
                    <Menu.Item key={item.id}>
                      <i style={{marginRight: '8px'}}/>
                      {w.name}
                    </Menu.Item>
                )
              }
            )
          }
        </Menu>
      )
      function triggerWidget (e) {
        onCurrentWidgetInFullScreen && onCurrentWidgetInFullScreen(Number(e.key))
      }
    }, [chartDetail, widgets])

    return (
      <div className={sideMenuClass}>
        {menus}
      </div>
    )
  }
)

const FullScreenChart: React.FC<IFullScreenChartProps> = Memo(
  ({ chartDetail, currentItemsInfo, onGetChartData }) => {
    let itemInfoRef = useRef(null)
    let widgetPropsRef = useRef(null)

    if (chartDetail && chartDetail.widget) {
      try {
        widgetPropsRef.current = JSON.parse(chartDetail.widget.config)
        itemInfoRef.current = currentItemsInfo[chartDetail.itemId]
      } catch (err) {
        throw new Error(err)
      }
    }

    const data = useMemo(() => {
      if (itemInfoRef.current && itemInfoRef.current.datasource) {
        return itemInfoRef.current.datasource.resultList
      } else {
        return []
      }
    }, [itemInfoRef.current])

    const queryVariables = useMemo(() => {
      let queryVariables = {}
      if (itemInfoRef.current && itemInfoRef.current.queryConditions) {
        const { variables, linkageVariables, globalVariables } = itemInfoRef.current.queryConditions
        queryVariables = [...variables, ...linkageVariables, ...globalVariables]
          .reduce((obj, { name, value }) => {
            obj[`$${name}$`] = value
            return obj
          }, {})
      }
      return queryVariables
    }, [itemInfoRef.current])

    const renderType = useMemo(() => itemInfoRef.current && itemInfoRef.current.loading ? 'loading' : 'rerender'
    , [itemInfoRef.current])

    const loading = useMemo(() => itemInfoRef.current && itemInfoRef.current.loading ? itemInfoRef.current.loading : false
    , [itemInfoRef.current])

    const widgetProps = useMemo(() => {
      return getWidgetProps(chartDetail)
    }, [chartDetail])

    const paginationChange = useCallback((pageNo: number, pageSize: number, orders) => {
      if (chartDetail && chartDetail.itemId) {
        const itemId = chartDetail.itemId
        const widget = chartDetail.widget

        const { datasource } = currentItemsInfo[itemId]
        const nativeQuery = getNativeQuery(widgetProps)
        const pagination = {
          ...getPagination(widgetProps, datasource),
          pageNo,
          pageSize
        }
        onGetChartData('clear', itemId, widget.id, { pagination, nativeQuery, orders })
      }
    }, [chartDetail])

    const charts = useMemo(() => {
      return (
        <Widget
          {...widgetPropsRef.current}
          data={data}
          model={chartDetail.model}
          queryVariables={queryVariables}
          renderType={renderType}
          loading={ loading }
          onPaginationChange={paginationChange}
        />
      )
    }, [data, widgetPropsRef.current])

    return (
      <div className={styles.chartWrapper}>
        {charts}
      </div>
    )
  }
)
function getWidgetProps (chartDetail: ICurrentDataInFullScreenProps): IWidgetConfig {
  let widgetProps:IWidgetConfig
  if(chartDetail && chartDetail.widget) {
    try {
      widgetProps = JSON.parse(chartDetail.widget.config)
      return widgetProps
    } catch (error) {
      throw new Error(error)
    }
  }
}

const Control: React.FC<IControlProps> = Memo(
  ({ visible, chartDetail, onGetOptions, currentItemsInfo,
    monitoredSearchDataAction, onGetChartData, toggleControl,
    currentItems, currentDashboard, onSearch, mapOptions,
    hasGlobalCtrl, hasLocalCtrl
  }) => {

    const [ctrlType, setCtrlType] = useState('local')

    const checkCtrlStyle = useCallback((type: ICtrlType) => () => {
      setCtrlType(type)
    }, [ctrlType])

    useEffect(() => {
      if (!hasLocalCtrl && hasGlobalCtrl) {
        setCtrlType('global')
      }
    }, [hasGlobalCtrl, hasLocalCtrl])

    const controlClass = classnames({
      [styles.controlPanel]: true,
      [styles.controlHide]: !visible,
      [styles.controlShow]: visible
    })

    const widgetProps = useMemo(() => {
      return getWidgetProps(chartDetail)
    }, [chartDetail])

    const getControlSelectOptions = useCallback((
      controlKey: string,
      userOptions: boolean,
      paramsOrOptions: { [viewId: string]: IDistinctValueReqeustParams } | any[]
    ) => {
      if (chartDetail && chartDetail.itemId) {
        const itemId = chartDetail.itemId
        onGetOptions(controlKey, userOptions, paramsOrOptions, itemId)
      }
    }, [chartDetail]) 

    const controlSelectOptions = useMemo(() => {
      if (currentItemsInfo && chartDetail && chartDetail.itemId) {
        const itemId = chartDetail.itemId
        const options = currentItemsInfo[itemId]
        return options.controlSelectOptions
      }
    }, [chartDetail, currentItemsInfo])

    const onControlSearch = useCallback((queryConditions: Partial<IQueryConditions>) => {
      if (chartDetail && chartDetail.itemId) {
        const itemId = chartDetail.itemId
        const widget = chartDetail.widget
        const { datasource } = currentItemsInfo[itemId]
        const pagination = getPagination(widgetProps, datasource)
        const nativeQuery = getNativeQuery(widgetProps)
        onGetChartData('rerender', itemId, widget.id, { ...queryConditions, pagination, nativeQuery })
      }
      monitoredSearchDataAction && monitoredSearchDataAction()
    }, [chartDetail])

    const getItemId = useMemo(() => chartDetail && chartDetail.itemId ? chartDetail.itemId : undefined , [chartDetail])

    const ctrlLocalStyle = classnames({
      [styles.ctrl]: true,
      [styles.displayNone]: !hasLocalCtrl,
      [styles.unSelectControlTitleStyle]: ctrlType === 'global',
      [styles.selectControlTitleStyle]: ctrlType === 'local'
    })

    const ctrlGlobalStyle = classnames({
      [styles.ctrl]: true,
      [styles.displayNone]: !hasGlobalCtrl,
      [styles.unSelectControlTitleStyle]: ctrlType === 'local',
      [styles.selectControlTitleStyle]: ctrlType === 'global'
    })

    return (
      <div className={controlClass}>
        <div className={styles.controlHeader}>
          <div className={styles.headerTitle}>
            <div className={ctrlLocalStyle} onClick={checkCtrlStyle('local')}>本地控制器</div>
            <div className={ctrlGlobalStyle} onClick={checkCtrlStyle('global')}>全局控制器</div>
          </div>
        </div>
        <div className={styles.controlBody}>
          {
            ctrlType === 'local'
            ?
            <DashboardItemControlForm
              viewId={getItemId}
              isFullScreen={true}
              controls={widgetProps.controls}
              mapOptions={controlSelectOptions}
              onGetOptions={getControlSelectOptions}
              onSearch={onControlSearch}
              onHide={toggleControl}
            />
            :
            <GlobalControlPanel
              isFullScreen={true}
              currentDashboard={currentDashboard}
              currentItems={currentItems}
              onGetOptions={onGetOptions}
              mapOptions={mapOptions}
              onSearch={onSearch}
            />
          }    
        </div>
      </div>
    )
  }
)

const FullScreenPanel: React.FC<IFullScreenPanelProps> = Memo(
  ({ visible, isVisible, chartDetail, widgets, 
    currentItems, currentItemsInfo, onCurrentWidgetInFullScreen,
    onGetControlOptions, monitoredSearchDataAction, onGetChartData,
    currentDashboard, mapOptions, onSearch
  }) => {
    const fsClassName = classnames({
      [styles.fullScreen]: true,
      [styles.displayNone]: !visible,
      [styles.displayBlock]: visible
    })

    const [show, setShow] = useState(false)
    const [controlShow, setControlShow] = useState(false)
    const titleRef = useRef(null)
    const isShow = useCallback(() => setShow(!show), [show])

    const title = useMemo(() => {
      if (chartDetail && chartDetail.widget) {
        titleRef.current = chartDetail.widget.name
      }
      return titleRef.current
    }, [chartDetail])

    const hide = useCallback(() => isVisible && isVisible(), [])

    const toggleControl = useCallback(() => setControlShow(!controlShow), [controlShow])

    const hasLocalControl = useMemo(() => {
      let flag: boolean = false
      if (chartDetail && chartDetail.widget) {
        const widget = chartDetail.widget
        try {
          const config = JSON.parse(widget.config)
          flag = !!config.controls.length
        } catch (error) {
          throw new Error(error)
        }
      }
      return flag
    }, [chartDetail])

    const hasGlobalControl = useMemo(() => {
      let hasGlobalCtrl: boolean = false
      if (currentDashboard && currentDashboard.config) {
        try {
          const config = JSON.parse(currentDashboard.config)
          hasGlobalCtrl = !!(config && config.filters && config.filters.length)
        } catch (error) {
          throw new Error(error)
        }
      }
      return hasGlobalCtrl
    }, [currentDashboard])

    const controlClass = classnames({
      [styles.displayNone]: (!hasGlobalControl) && (!hasLocalControl)
    })

    return (
      <div className={fsClassName}>
        <div className={styles.container}>
          <nav className={styles.header}>
            <div className={styles.logo}>
              <Icon type={ show ? 'menu-fold' : 'menu-unfold'} onClick={isShow} style={{marginRight: '32px'}} />
              <span>{title}</span>
            </div>
            <ul className={styles.tools}>
              <li onClick={toggleControl} className={controlClass}>
                <Icon type="filter" /><span>控制器</span>
              </li>
              <li onClick={hide}>
                <Icon type="fullscreen-exit" /><span>退出全屏</span>
              </li>
            </ul>
          </nav>    
          <div className={styles.body}>
          <FullScreenMenu 
            visible={show}
            widgets={widgets}
            currentItems={currentItems}
            chartDetail={chartDetail}
            onCurrentWidgetInFullScreen={onCurrentWidgetInFullScreen}
          />
          <FullScreenChart
            chartDetail={chartDetail}
            onGetChartData={onGetChartData}                     
            currentItemsInfo={currentItemsInfo}                          
          />
          {
            (!hasGlobalControl) && (!hasLocalControl) 
            ?  
            ''
            :
            <Control
              visible={controlShow}
              onGetOptions={onGetControlOptions}
              currentItemsInfo={currentItemsInfo}     
              onGetChartData={onGetChartData}  
              toggleControl={toggleControl}                   
              chartDetail={chartDetail}  
              monitoredSearchDataAction={monitoredSearchDataAction}
              currentDashboard={currentDashboard}
              mapOptions={mapOptions}
              onSearch={onSearch}
              hasLocalCtrl={hasLocalControl}
              hasGlobalCtrl={hasGlobalControl}
              currentItems={currentItems}
            /> 
          }
          </div> 
        </div>
      </div>
    )
  }
)

export default FullScreenPanel



