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

import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'
import viewReducer from '../View/reducer'
import viewSaga from '../View/sagas'

import CopyWidgetForm from './components/CopyWidgetForm'
import Container from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from '../../components/SearchFilterDropdown'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { ButtonProps } from 'antd/lib/button/button'
import { SortOrder } from 'antd/lib/table'
import { Row, Col, Table, Button, Tooltip, Icon, Modal, Popconfirm, Breadcrumb } from 'antd'

import { loadWidgets, deleteWidget, addWidget } from './actions'
import { ViewActions } from '../View/actions'
const { loadViews } = ViewActions
import { makeSelectWidgets, makeSelectLoading } from './selectors'
import { makeSelectViews } from '../View/selectors'
import { makeSelectLoginUser } from '../App/selectors'
import { checkNameUniqueAction } from '../App/actions'
import {makeSelectCurrentProject} from '../Projects/selectors'
import ModulePermission from '../Account/components/checkModulePermission'
import { initializePermission } from '../Account/components/checkUtilPermission'
import { IProject } from '../Projects'

const styles = require('./Widget.less')
const utilStyles = require('assets/less/util.less')

interface IWidgetProps {
  widgets: any[]
  views: any[]
  loginUser: any
  loading: boolean
  router: any
  params: any
  currentProject: IProject
  onLoadWidgets: (projectId: number) => void
  onLoadViews: (projectId: number, resolve?: any) => void
  onDeleteWidget: (id: any) => () => void
  onAddWidget: (widget: object, resolve: any) => Promise<any>
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
}

interface IWidgetStates {
  workbenchType: string
  currentWidget: object
  workbenchVisible: boolean
  copyWidgetVisible: boolean
  filteredWidgets: any[]
  filteredWidgetsName: RegExp
  filteredWidgetsType: object
  filteredWidgetsTypeId: string
  pageSize: number
  currentPage: number
  screenWidth: number
  tableWidget: any[]
  nameFilterValue: string
  nameFilterDropdownVisible: boolean
  tableSortedInfo: {
    columnKey?: string,
    order?: SortOrder
  }
}

export class WidgetList extends React.Component<IWidgetProps, IWidgetStates> {
  constructor (props) {
    super(props)
    this.state = {
      workbenchType: '',
      currentWidget: null,
      workbenchVisible: false,
      copyWidgetVisible: false,
      filteredWidgets: null,
      filteredWidgetsName: null,
      filteredWidgetsType: undefined,
      filteredWidgetsTypeId: '',
      pageSize: 24,
      currentPage: 1,
      screenWidth: 0,
      tableWidget: [],
      nameFilterValue: '',
      nameFilterDropdownVisible: false,
      tableSortedInfo: {}
    }
  }

  private workbenchWrapper: any
  private copyWidgetForm: WrappedFormUtils

  public componentWillMount () {
    const {
      onLoadWidgets,
      onLoadViews,
      params
    } = this.props

    onLoadWidgets(params.pid)
    onLoadViews(params.pid)
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  public componentWillReceiveProps (nextProps) {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    if (nextProps.widgets) {
      this.setState({
        tableWidget: nextProps.widgets.map((g) => {
          g.key = g.id
          return g
        })
      })
    }
  }

  private toWorkbench = (widgetId) => () => {
    const { router, params } = this.props
    sessionStorage.removeItem('editWidgetFromDashboard')
    router.push(`/project/${params.pid}/widget/${widgetId}`)
  }

  private hideWorkbench = () => {
    this.setState({
      workbenchVisible: false,
      workbenchType: '',
      currentWidget: null
    })
  }

  private afterModalClose = () => {
    this.workbenchWrapper.wrappedInstance.resetWorkbench()
  }

  private onCopy = (type, widget) => (e) => {
    this.setState({
      workbenchType: type,
      currentWidget: widget,
      copyWidgetVisible: true
    }, () => {
      setTimeout(() => {
        const copyItem = (this.props.widgets as any[]).find((i) => i.id === widget.id)
        const { name, description, type, viewId, config, publish } = copyItem
        this.copyWidgetForm.setFieldsValue({
          name: `${name}_copy`,
          description: description || '',
          type,
          viewId,
          config,
          publish
        })
      }, 0)
    })
  }

  private hideForm = () => {
    this.setState({
      copyWidgetVisible: false,
      workbenchType: '',
      currentWidget: null
    })
  }

  private resetModal = () => this.copyWidgetForm.resetFields()

  private onModalOk = () => new Promise((resolve, reject) => {
    this.copyWidgetForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { params } = this.props

        const widgetValue = {
          ...values,
          projectId: Number(params.pid)
        }

        this.props.onAddWidget(widgetValue, () => {
          resolve()
          this.hideForm()
        })
      } else {
        reject()
      }
    })
  })

  private onChange = (page) => {
    this.setState({
      currentPage: page
    })
  }

  private onShowSizeChange = (current, pageSize) => {
    this.setState({
      currentPage: current,
      pageSize
    })
  }

  private onSearchInputChange = (e) => {
    this.setState({
      nameFilterValue: e.target.value
    })
  }

  private onSearch = () => {
    const val = this.state.nameFilterValue
    const reg = new RegExp(val, 'gi')

    this.setState({
      nameFilterDropdownVisible: false,
      tableWidget: (this.props.widgets as any[]).map((record) => {
        const match = record.name.match(reg)
        if (!match) {
          return null
        }
        return {
          ...record,
          name: (
            <span>
              {record.name.split(reg).map((text, i) => (
                i > 0 ? [<span key={i} className={utilStyles.highlight}>{match[0]}</span>, text] : text
              ))}
            </span>
          )
        }
      }).filter((record) => !!record)
    })
  }

  private handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      tableSortedInfo: sorter
    })
  }

  public render () {
    const {
      params,
      widgets,
      onDeleteWidget,
      onCheckUniqueName,
      loading,
      currentProject
    } = this.props

    const {
      workbenchType,
      currentWidget,
      copyWidgetVisible,
      filteredWidgets,
      currentPage,
      pageSize,
      filteredWidgetsTypeId,
      filteredWidgetsType,
      screenWidth,
      tableWidget,
      nameFilterValue,
      nameFilterDropdownVisible,
      tableSortedInfo
    } = this.state

    const EditButton = ModulePermission<ButtonProps>(currentProject, 'widget', false)(Button)
    const AdminButton = ModulePermission<ButtonProps>(currentProject, 'widget', true)(Button)

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="name"
          value={nameFilterValue}
          onChange={this.onSearchInputChange}
          onSearch={this.onSearch}
        />
      ),
      filterDropdownVisible: nameFilterDropdownVisible,
      onFilterDropdownVisibleChange: (visible) => this.setState({
        nameFilterDropdownVisible: visible
      }),
      sorter: (a, b) => a.name > b.name ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'name' ? tableSortedInfo.order : void 0
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    }, {
      title: '操作',
      key: 'action',
      width: 150,
      className: `${initializePermission(currentProject, 'widgetPermission') ? utilStyles.textAlignCenter : utilStyles.hide}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Tooltip title="修改">
            <EditButton icon="edit" shape="circle" type="ghost" onClick={this.toWorkbench(record.id)} />
          </Tooltip>
          <Tooltip title="复制">
            <AdminButton icon="copy" shape="circle" onClick={this.onCopy('copy', record)} />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteWidget(record.id)}
          >
            <Tooltip title="删除">
              <AdminButton icon="delete" shape="circle" />
            </Tooltip>
          </Popconfirm>
        </span>
      )
    }]

    const pagination = {
      simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 20,
      showSizeChanger: true
    }

    return (
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
                <Icon type="bars" />Widget List
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <AdminButton
                    type="primary"
                    icon="plus"
                    onClick={this.toWorkbench('add')}
                  />
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    dataSource={tableWidget}
                    columns={columns}
                    pagination={pagination}
                    loading={loading}
                    onChange={this.handleTableChange}
                    bordered
                  />
                </Col>
              </Row>
            </Box.Body>
          </Box>
        </Container.Body>
        <Modal
          title="复制 Widget"
          okText="保存"
          wrapClassName="ant-modal-small"
          visible={copyWidgetVisible}
          onCancel={this.hideForm}
          afterClose={this.resetModal}
          footer={[
            <Button
              key="cancel"
              size="large"
              type="ghost"
              onClick={this.hideForm}
            >
              取消
            </Button>,
            <Button
              key="submit"
              size="large"
              type="primary"
              onClick={this.onModalOk}
            >
              确认
            </Button>
          ]}
        >
          <CopyWidgetForm
            type={workbenchType}
            projectId={params.pid}
            onCheckUniqueName={onCheckUniqueName}
            ref={(f) => { this.copyWidgetForm = f }}
          />
        </Modal>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgets(),
  views: makeSelectViews(),
  loginUser: makeSelectLoginUser(),
  loading: makeSelectLoading(),
  currentProject: makeSelectCurrentProject()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadWidgets: (projectId) => dispatch(loadWidgets(projectId)),
    onLoadViews: (projectId, resolve) => dispatch(loadViews(projectId, resolve)),
    onDeleteWidget: (id) => () => dispatch(deleteWidget(id)),
    onAddWidget: (widget, resolve) => dispatch(addWidget(widget, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

const withConnect = connect<{}, {}, IWidgetProps>(mapStateToProps, mapDispatchToProps)

const withReducerWidget = injectReducer({ key: 'widget', reducer })
const withSagaWidget = injectSaga({ key: 'widget', saga })

const withReducerView = injectReducer({ key: 'view', reducer: viewReducer })
const withSagaView = injectSaga({ key: 'view', saga: viewSaga })

export default compose(
  withReducerWidget,
  withReducerView,
  withSagaView,
  withSagaWidget,
  withConnect
)(WidgetList)
