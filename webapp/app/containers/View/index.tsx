
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

import React from 'react'
import { compose, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import memoizeOne from 'memoize-one'
import Helmet from 'react-helmet'
import { Link, RouteComponentProps } from 'react-router'

import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import sagas from './sagas'

import { ViewActions, ViewActionType } from './actions'
import { makeSelectViews, makeSelectLoading } from './selectors'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'

import ModulePermission from '../Account/components/checkModulePermission'
import { initializePermission } from '../Account/components/checkUtilPermission'

import { Table, Tooltip, Button, Row, Col, Breadcrumb, Icon, Popconfirm } from 'antd'
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/lib/table'
import { ButtonProps } from 'antd/lib/button'
import Container from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from 'components/SearchFilterDropdown'

import { IRouteParams } from 'app/routes'
import { IViewBase, IView, IViewLoading } from './types'
import { IProject } from '../Projects'

import utilStyles from 'assets/less/util.less'

interface IViewListStateProps {
  views: IViewBase[]
  currentProject: IProject
  loading: IViewLoading
}

interface IViewListDispatchProps {
  onLoadViews: (projectId: number) => void
  onDeleteView: (viewId: number, resolve: () => void) => void
}

type IViewListProps = IViewListStateProps & IViewListDispatchProps & RouteComponentProps<{}, IRouteParams>

interface IViewListStates {
  screenWidth: number
  tempFilterViewName: string
  filterViewName: string
  filterDropdownVisible: boolean
  tableSorter: SorterResult<IViewBase>
}

export class ViewList extends React.PureComponent<IViewListProps, IViewListStates> {

  public state: Readonly<IViewListStates> = {
    screenWidth: document.documentElement.clientWidth,
    tempFilterViewName: '',
    filterViewName: '',
    filterDropdownVisible: false,
    tableSorter: null
  }

  public componentWillMount () {
    const { onLoadViews, params } = this.props
    const { pid: projectId } = params
    if (projectId) {
      onLoadViews(+projectId)
    }
    window.addEventListener('resize', this.setScreenWidth, false)
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.setScreenWidth, false)
  }

  private setScreenWidth = () => {
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  private getFilterViews = memoizeOne((viewName: string, views: IViewBase[]) => {
    if (!Array.isArray(views) || !views.length) { return [] }
    const regex = new RegExp(viewName, 'gi')
    const filterViews = views.filter((v) => v.name.match(regex) || v.description.match(regex))
    return filterViews
  })

  private static getViewPermission = memoizeOne((project: IProject) => ({
    viewPermission: initializePermission(project, 'viewPermission'),
    AdminButton: ModulePermission<ButtonProps>(project, 'view', true)(Button),
    EditButton: ModulePermission<ButtonProps>(project, 'view', false)(Button)
  }))

  private getTableColumns = (
    { viewPermission, AdminButton, EditButton }: ReturnType<typeof ViewList.getViewPermission>
  ) => {
    const { views } = this.props
    const { tempFilterViewName, filterViewName, filterDropdownVisible, tableSorter } = this.state
    const sourceNames = views.map(({ sourceName }) => sourceName)

    const columns: Array<ColumnProps<IViewBase>> = [{
      title: '名称',
      dataIndex: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="名称"
          value={tempFilterViewName}
          onChange={this.filterViewNameChange}
          onSearch={this.searchView}
        />
      ),
      filterDropdownVisible,
      onFilterDropdownVisibleChange: (visible: boolean) => this.setState({ filterDropdownVisible: visible }),
      sorter: (a, b) => (a.name > b.name ? 1 : -1),
      sortOrder: tableSorter && tableSorter.columnKey === 'name' ? tableSorter.order : void 0
    }, {
      title: '描述',
      dataIndex: 'description'
    }, {
      title: 'Source',
      dataIndex: 'sourceName',
      filterMultiple: false,
      onFilter: (val, record) => record.sourceName === val,
      filters: sourceNames
        .filter((name, idx) => sourceNames.indexOf(name) === idx)
        .map((name) => ({ text: name, value: name }))
    }]

    if (filterViewName) {
      const regex = new RegExp(`(${filterViewName})`, 'gi')
      columns[0].render = (text: string) => (
        <span
          dangerouslySetInnerHTML={{
            __html: text.replace(regex, `<span class="${utilStyles.highlight}">$1</span>`)
          }}
        />
      )
    }

    if (viewPermission) {
      columns.push({
        title: '操作',
        width: 120,
        className: utilStyles.textAlignCenter,
        render: (_, record) => (
          <span className="ant-table-action-column">
            <Tooltip title="修改">
              <EditButton icon="edit" shape="circle" type="ghost" onClick={this.editView(record.id)} />
            </Tooltip>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={this.deleteView(record.id)}
            >
              <Tooltip title="删除">
                <AdminButton icon="delete" shape="circle" type="ghost" />
              </Tooltip>
            </Popconfirm>
          </span>
        )
      })
    }

    return columns
  }

  private tableChange = (_1, _2, sorter: SorterResult<IViewBase>) => {
    this.setState({ tableSorter: sorter })
  }

  private filterViewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      tempFilterViewName: e.target.value,
      filterViewName: ''
    })
  }

  private searchView = (value: string) => {
    this.setState({
      filterViewName: value,
      filterDropdownVisible: false
    })
    window.event.preventDefault()
  }

  private basePagination: PaginationConfig = {
    defaultPageSize: 20,
    showSizeChanger: true
  }

  private addView = () => {
    const { router, params } = this.props
    router.push(`/project/${params.pid}/view`)
  }

  private editView = (viewId: number) => () => {
    const { router, params } = this.props
    router.push(`/project/${params.pid}/view/${viewId}`)
  }

  private deleteView = (viewId: number) => () => {
    const { onDeleteView, onLoadViews, params: { pid: projectId } } = this.props
    onDeleteView(viewId, () => {
      onLoadViews(+projectId)
    })
  }

  public render () {
    const { currentProject, views, loading: { view: loadingView } } = this.props
    const { screenWidth, filterViewName } = this.state
    const { viewPermission, AdminButton, EditButton } = ViewList.getViewPermission(currentProject)
    const tableColumns = this.getTableColumns({ viewPermission, AdminButton, EditButton })
    const tablePagination: PaginationConfig = {
      ...this.basePagination,
      simple: screenWidth <= 768
    }
    const filterViews = this.getFilterViews(filterViewName, views)

    return (
      <Container>
        <Helmet title="View" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">View</Link>
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
                View List
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <AdminButton type="primary" icon="plus" onClick={this.addView} />
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    bordered
                    rowKey="id"
                    loading={loadingView}
                    dataSource={filterViews}
                    columns={tableColumns}
                    pagination={tablePagination}
                    onChange={this.tableChange}
                  />
                </Col>
              </Row>
            </Box.Body>
          </Box>
        </Container.Body>
      </Container>
    )
  }

}

const mapDispatchToProps = (dispatch: Dispatch<ViewActionType>) => ({
  onLoadViews: (projectId) => dispatch(ViewActions.loadViews(projectId)),
  onDeleteView: (viewId, resolve) => dispatch(ViewActions.deleteView(viewId, resolve))
})

const mapStateToProps = createStructuredSelector({
  views: makeSelectViews(),
  currentProject: makeSelectCurrentProject(),
  loading: makeSelectLoading()
})

const withConnect = connect<IViewListStateProps, IViewListDispatchProps, RouteComponentProps<{}, IRouteParams>>(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'view', reducer })
const withSaga = injectSaga({ key: 'view', saga: sagas })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(ViewList)
