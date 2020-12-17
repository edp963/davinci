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

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { RouteComponentWithParams } from 'utils/types'

import { makeSelectWidgets, makeSelectLoading } from './selectors'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'
import { checkNameUniqueAction } from 'containers/App/actions'
import { WidgetActions } from './actions'

import Helmet from 'react-helmet'
import { Link } from 'react-router-dom'
import {
  Row,
  Col,
  Breadcrumb,
  Icon,
  Button,
  Table,
  Tooltip,
  Popconfirm
} from 'antd'
import { ButtonProps } from 'antd/lib/button'
import { ColumnProps, SorterResult } from 'antd/lib/table'
import Container, { ContainerTitle, ContainerBody } from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from 'app/components/SearchFilterDropdown'
import CopyModal from './components/CopyModal'

import utilStyles from 'assets/less/util.less'

import { useTablePagination } from 'utils/hooks'
import ModulePermission from 'containers/Account/components/checkModulePermission'
import { initializePermission } from 'containers/Account/components/checkUtilPermission'
import { IWidgetBase, IWidgetFormed } from './types'
import widgetlibs from './config'
import { IWidgetConfigBase } from './components/Widget'

const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgets(),
  loading: makeSelectLoading(),
  currentProject: makeSelectCurrentProject()
})

const columnTitle = {
  name: 'Widget名称',
  viewName: 'View名称'
}

const WidgetList: React.FC<RouteComponentWithParams> = (props) => {
  const dispatch = useDispatch()
  const tablePagination = useTablePagination(0)

  const { match, history } = props
  useEffect(() => {
    const projectId = +match.params.projectId
    if (projectId) {
      dispatch(WidgetActions.loadWidgets(projectId))
    }
  }, [])

  const { widgets, loading, currentProject } = useSelector(mapStateToProps)

  const onCheckName = useCallback(
    (widgetName: string, resolve: () => void, reject: (err: string) => void) =>
      dispatch(
        checkNameUniqueAction(
          'widget',
          { name: widgetName, projectId: currentProject.id },
          resolve,
          reject
        )
      ),
    [currentProject]
  )

  const openCopyModal = useCallback(
    (widget: IWidgetBase) => () => {
      setCopyFromWidget(widget)
      setCopyModalVisible(true)
    },
    []
  )
  const copyWidget = useCallback((widget: IWidgetBase) => {
    dispatch(
      WidgetActions.copyWidget(widget, () => {
        setCopyModalVisible(false)
      })
    )
  }, [])
  const cancelCopy = useCallback(() => {
    setCopyModalVisible(false)
  }, [])

  const toWorkbench = useCallback(
    (widgetId?: number) => () => {
      sessionStorage.removeItem('editWidgetFromDashboard')
      const workbenchUrl = `/project/${match.params.projectId}/widget`
      history.push(widgetId ? `${workbenchUrl}/${widgetId}` : workbenchUrl)
    },
    []
  )

  const onDeleteWidget = useCallback(
    (widgetId: number) => () => {
      dispatch(WidgetActions.deleteWidget(widgetId))
    },
    []
  )

  const [filterText, setFilterText] = useState('')
  const [filterColumnKey, setFilterColumnKey] = useState('')
  const [tableSorter, setTableSorter] = useState<SorterResult<IWidgetBase>>(
    null
  )
  const [copyModalVisible, setCopyModalVisible] = useState(false)
  const [copyFromWidget, setCopyFromWidget] = useState<IWidgetBase>(null)

  const filterWidgets = useMemo(() => {
    if (!Array.isArray(widgets) || !widgets.length) {
      return []
    }
    const regex = new RegExp(filterText, 'gi')
    const filterWidgets = widgets.filter(
      (v) => v.name.match(regex) || v.viewName.match(regex) || v.description.match(regex)
    )
    return filterWidgets
  }, [filterText, widgets])

  const { widgetPermission, AdminButton, EditButton } = useMemo(
    () => ({
      widgetPermission: initializePermission(
        currentProject,
        'widgetPermission'
      ),
      AdminButton: ModulePermission<ButtonProps>(
        currentProject,
        'widget',
        true
      )(Button),
      EditButton: ModulePermission<ButtonProps>(
        currentProject,
        'widget',
        false
      )(Button)
    }),
    [currentProject]
  )

  const searchWidget = useCallback((value: string, dataIndex: string) => {
    setFilterText(value)
    setFilterColumnKey(dataIndex)
  }, [])

  const getFilterProps = (dataIndex: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys }) => (
      <SearchFilterDropdown
        placeholder={columnTitle[dataIndex]}
        value={selectedKeys[0]}
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onSearch={() => searchWidget(selectedKeys[0], dataIndex)}
      />
    ),
    sortOrder: tableSorter && tableSorter.columnKey === dataIndex ? tableSorter.order : void 0,
    render: (text: string) => {
      const regex = new RegExp(`(${filterText})`, 'gi')
      return (filterText && filterColumnKey === dataIndex ? (
        <span
          dangerouslySetInnerHTML={{
            __html: text.replace(
              regex,
              `<span class="${utilStyles.highlight}">$1</span>`
            )
          }}
        />
      ) : (
          text
        ))
    }
  });

  const mappingIcon = (widgetConfig: IWidgetConfigBase) => {
    const selectedChart = widgetConfig.selectedChart
    const mode = widgetlibs[widgetConfig.mode]
    return mode[selectedChart - 1].icon
  }

  const columns: Array<ColumnProps<IWidgetFormed>> = [
    {
      title: columnTitle.name,
      dataIndex: 'name',
      sorter: (a, b) => (a.name > b.name ? 1 : -1),
      ...getFilterProps('name'),
      render: (_, record) => (
        <div>
          <i className={`iconfont ${mappingIcon(record.config)}`}></i>
          <span style={{marginLeft: 8}}>{record.name}</span>
        </div>
      )
    },
    {
      title: columnTitle.viewName,
      dataIndex: 'viewName',
      sorter: (a, b) => (a.name > b.name ? 1 : -1),
      ...getFilterProps('viewName')
    },
    {
      title: '描述',
      dataIndex: 'description'
    }
  ]

  if (widgetPermission) {
    columns.push({
      title: '操作',
      key: 'action',
      align: 'center',
      width: 145,
      render: (_, record) => (
        <span className="ant-table-action-column">
          <Tooltip title="复制">
            <EditButton
              icon="copy"
              shape="circle"
              type="ghost"
              onClick={openCopyModal(record)}
            />
          </Tooltip>
          <Tooltip title="修改" trigger="hover">
            <EditButton
              icon="edit"
              shape="circle"
              type="ghost"
              onClick={toWorkbench(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteWidget(record.id)}
          >
            <Tooltip title="删除">
              <AdminButton icon="delete" shape="circle" type="ghost" />
            </Tooltip>
          </Popconfirm>
        </span>
      )
    })
  }

  const tableChange = useCallback(
    (_1, _2, sorter: SorterResult<IWidgetBase>) => {
      setTableSorter(sorter)
    },
    []
  )

  return (
    <>
      <Container>
        <Helmet title="Widget" />
        <ContainerTitle>
          <Row>
            <Col span={24} className={utilStyles.shortcut}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">Widget</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
              <Link to={`/account/organization/${currentProject.orgId}`}>
                <i className='iconfont icon-organization' />
              </Link>
            </Col>
          </Row>
        </ContainerTitle>
        <ContainerBody>
          <Box>
            <Box.Header>
              <Box.Title>
                <Icon type="bars" />
                Widget List
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <AdminButton
                    type="primary"
                    icon="plus"
                    onClick={toWorkbench()}
                  />
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    rowKey="id"
                    bordered
                    dataSource={filterWidgets}
                    columns={columns}
                    pagination={tablePagination}
                    loading={loading}
                    onChange={tableChange}
                  />
                </Col>
              </Row>
            </Box.Body>
          </Box>
        </ContainerBody>
      </Container>
      <CopyModal
        visible={copyModalVisible}
        loading={false}
        fromWidget={copyFromWidget}
        onCheckUniqueName={onCheckName}
        onCopy={copyWidget}
        onCancel={cancelCopy}
      />
    </>
  )
}

export default WidgetList
