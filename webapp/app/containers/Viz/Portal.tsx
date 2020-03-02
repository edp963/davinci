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

import React, { useEffect, useCallback, useState } from 'react'
import { createStructuredSelector } from 'reselect'
import { useDispatch, useSelector } from 'react-redux'
import {
  makeSelectDownloadList
} from 'containers/App/selectors'
import {
  makeSelectPortals,
  makeSelectCurrentPortal,
  makeSelectCurrentDashboards
} from './selectors'

import {
  hideNavigator,
  loadDownloadList,
  downloadFile
} from 'containers/App/actions'
import { VizActions } from './actions'

import { Route } from 'react-router-dom'
import { RouteComponentWithParams } from 'utils/types'

import {
  Layout,
  Result,
  PageHeader,
  Tree,
  Icon,
  Button,
  Menu,
  Dropdown
} from 'antd'
const { Header, Sider, Content } = Layout
const { DirectoryTree } = Tree
import SplitPane from 'components/SplitPane'
import DownloadList from 'components/DownloadList'
import useDashboardConfigMenu from './hooks/dashboardConfigMenu'
import { Grid } from 'containers/Dashboard/Loadable'
import useDashboardTreeNodes from './hooks/dashboardTreeNodes'
import { AntTreeNodeMouseEvent } from 'antd/lib/tree'

const mapStateToProps = createStructuredSelector({
  downloadList: makeSelectDownloadList(),
  portals: makeSelectPortals(),
  currentPortal: makeSelectCurrentPortal(),
  currentDashboards: makeSelectCurrentDashboards()
})

interface IVizPortalProps extends RouteComponentWithParams {}

const VizPortal: React.FC<IVizPortalProps> = (props) => {
  const dispatch = useDispatch()
  const {
    portals,
    currentPortal,
    currentDashboards,
    downloadList
  } = useSelector(mapStateToProps)
  const {
    history,
    match: { params }
  } = props
  const portalId = +params.portalId
  const projectId = +params.projectId

  useEffect(() => {
    dispatch(hideNavigator())
    if (!portals.length) {
      dispatch(VizActions.loadPortals(projectId))
    }
  }, [])

  useEffect(() => {
    dispatch(VizActions.loadPortalDashboards(portalId))
  }, [portalId])

  const goToViz = useCallback(() => {
    history.replace(`/project/${projectId}/vizs`)
  }, [])

  const onLoadDownloadList = useCallback(() => dispatch(loadDownloadList()), [])
  const onDownloadFile = useCallback((id) => dispatch(downloadFile(id)), [])

  const [dashboardTreeNodes, firstDashboardKey] = useDashboardTreeNodes(currentDashboards)
  const [dashboardMenuVisible, setDashboardMenuVisible] = useState(false)
  const [dashboardMenuStyle, setDashboardMenuStyle] = useState({})
  const dashboardConfigMenu = useDashboardConfigMenu(dashboardMenuStyle)

  const closeDashboardMenu = useCallback(() => {
    setDashboardMenuVisible(false)
  }, [])

  useEffect(() => {
    document.addEventListener('click', closeDashboardMenu, false)
    return () => {
      document.removeEventListener('click', closeDashboardMenu, false)
    }
  }, [])

  const showDashboardContextMenu = useCallback((options: AntTreeNodeMouseEvent) => {
    const { node, event } = options
    const { pageX, pageY } = event
    const menuStyle: React.CSSProperties = {
      position: 'absolute',
      left: pageX,
      top: pageY
    }
    setDashboardMenuStyle(menuStyle)
    setDashboardMenuVisible(true)
  }, [])

  return (
    <Layout>
      <PageHeader
        ghost={false}
        title={currentPortal.name}
        subTitle={currentPortal.description}
        onBack={goToViz}
        extra={
          <DownloadList
            downloadList={downloadList}
            onLoadDownloadList={onLoadDownloadList}
            onDownloadFile={onDownloadFile}
          />
        }
      />
      {dashboardMenuVisible && dashboardConfigMenu}
      {Array.isArray(currentDashboards) &&
        (currentDashboards.length ? (
          <SplitPane
            spliter
            className="ant-layout-content"
            type="horizontal"
            initialSize={150}
            minSize={150}
          >
            <DirectoryTree
              defaultExpandAll
              blockNode
              defaultSelectedKeys={firstDashboardKey}
              onRightClick={showDashboardContextMenu}
            >
              {dashboardTreeNodes}
            </DirectoryTree>
            <Route
              path="/project/:projectId/portal/:portalId/dashboard/:dashboardId"
              component={Grid}
            />
          </SplitPane>
        ) : (
          <Content
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Result
              icon={<img src={require('assets/images/noDashboard.png')} />}
              extra={
                <p>
                  请
                  <Button size="small" type="link">
                    创建文件夹
                  </Button>
                  或
                  <Button size="small" type="link">
                    创建 Dashboard
                  </Button>
                </p>
              }
            />
          </Content>
        ))}
    </Layout>
  )
}

export default VizPortal
