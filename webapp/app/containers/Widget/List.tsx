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
import Container from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from 'app/components/SearchFilterDropdown'
import CopyModal from './components/CopyModal'

import utilStyles from 'assets/less/util.less'

import { useTablePagination } from 'utils/hooks'
import ModulePermission from 'containers/Account/components/checkModulePermission'
import { initializePermission } from 'containers/Account/components/checkUtilPermission'
import { IWidgetBase } from './types'

const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgets(),
  loading: makeSelectLoading(),
  currentProject: makeSelectCurrentProject()
})

const columns: Array<ColumnProps<IWidgetBase>> = [
  {
    title: '名称',
    dataIndex: 'name',
    sorter: (a, b) => (a.name > b.name ? 1 : -1)
  },
  {
    title: '描述',
    dataIndex: 'description'
  }
]

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

  const [tempFilterWidgetName, setTempFilterWidgetName] = useState('')
  const [filterWidgetName, setFilterWidgetName] = useState('')
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false)
  const [tableSorter, setTableSorter] = useState<SorterResult<IWidgetBase>>(
    null
  )
  const [copyModalVisible, setCopyModalVisible] = useState(false)
  const [copyFromWidget, setCopyFromWidget] = useState<IWidgetBase>(null)

  const filterWidgets = useMemo(() => {
    if (!Array.isArray(widgets) || !widgets.length) {
      return []
    }
    const regex = new RegExp(filterWidgetName, 'gi')
    const filterWidgets = widgets.filter(
      (v) => v.name.match(regex) || v.description.match(regex)
    )
    return filterWidgets
  }, [filterWidgetName, widgets])

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

  const filterWidgetNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempFilterWidgetName(e.target.value)
      setFilterWidgetName('')
    },
    []
  )
  const searchWidget = useCallback((value: string) => {
    setFilterWidgetName(value)
    setFilterDropdownVisible(false)
  }, [])

  const tableColumns = [...columns]
  tableColumns[0].filterDropdown = (
    <SearchFilterDropdown
      placeholder="名称"
      value={tempFilterWidgetName}
      onChange={filterWidgetNameChange}
      onSearch={searchWidget}
    />
  )
  tableColumns[0].filterDropdownVisible = filterDropdownVisible
  tableColumns[0].onFilterDropdownVisibleChange = useCallback(
    (visible: boolean) => setFilterDropdownVisible(visible),
    []
  )
  tableColumns[0].sortOrder =
    tableSorter && tableSorter.columnKey === 'name' ? tableSorter.order : void 0
  if (filterWidgetName) {
    const regex = new RegExp(`(${filterWidgetName})`, 'gi')
    tableColumns[0].render = (text: string) => (
      <span
        dangerouslySetInnerHTML={{
          __html: text.replace(
            regex,
            `<span class="${utilStyles.highlight}">$1</span>`
          )
        }}
      />
    )
  }
  if (widgetPermission) {
    tableColumns.push({
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
        <Container.Title>
          <Row>
            <Col xl={18} lg={16} md={12} sm={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">Widget</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body>
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
                    columns={tableColumns}
                    pagination={tablePagination}
                    loading={loading}
                    onChange={tableChange}
                  />
                </Col>
              </Row>
            </Box.Body>
          </Box>
        </Container.Body>
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
