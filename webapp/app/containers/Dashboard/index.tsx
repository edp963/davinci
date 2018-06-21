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
import { Link, InjectedRouter } from 'react-router'
import * as classnames from 'classnames'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from '../../components/Container'
import DashboardForm from './components/DashboardForm'
import { WrappedFormUtils } from 'antd/lib/form/Form'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')
const Modal = require('antd/lib/modal')
const Breadcrumb = require('antd/lib/breadcrumb')
const Popconfirm = require('antd/lib/popconfirm')
const Input = require('antd/lib/input')
const Pagination = require('antd/lib/pagination')
const Search = Input.Search

import { loadDashboards, addDashboard, editDashboard, deleteDashboard } from './actions'
import { makeSelectDashboards } from './selectors'
import { makeSelectLoginUser } from '../App/selectors'

const utilStyles = require('../../assets/less/util.less')
const styles = require('./Dashboard.less')
const widgetStyles = require('../Widget/Widget.less')

interface IDashboardProps {
  dashboards: IDashboard[]
  loginUser: { id: number, admin: boolean }
  router: InjectedRouter
  params: any
  onLoadDashboards: () => void
  onAddDashboard: (dashboard: IDashboard, resolve: () => void) => void
  onEditDashboard: (dashboard: IDashboard, resolve: () => void) => void
  onDeleteDashboard: (id: number) => void
}

interface IDashboardStates {
  modalLoading: boolean
  formType: 'add' | 'edit' | ''
  formVisible: boolean
  filteredDashboards: IDashboard[]
  currentPage: number
  pageSize: number
  screenWidth: number
}

export interface IDashboard {
  id?: number
  name: string
  pic: string
  desc: string
  linkage_detail: string
  config: string
  publish: boolean
}

export class Dashboard extends React.Component<IDashboardProps, IDashboardStates> {
  constructor (props) {
    super(props)
    this.state = {
      modalLoading: false,

      formType: '',
      formVisible: false,

      filteredDashboards: null,
      currentPage: 1,
      pageSize: 24,
      screenWidth: 0
    }
  }

  private dashboardForm: WrappedFormUtils

  public componentWillMount () {
    this.props.onLoadDashboards()
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  public componentWillReceiveProps () {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  private toGrid = (dashboard) => () => {
    const { params } = this.props
    this.props.router.push(`/project/${params.pid}/dashboard/${dashboard.id}`)
  }

  private showDashboardForm = (formType, dashboard?: IDashboard) => (e) => {
    e.stopPropagation()
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (dashboard) {
        this.dashboardForm.setFieldsValue(dashboard)
      }
    })
  }

  private hideDashboardForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.dashboardForm.resetFields()
    })
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private onModalOk = () => {
    this.dashboardForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        if (this.state.formType === 'add') {
          this.props.onAddDashboard({
            ...values,
            pic: `${Math.ceil(Math.random() * 19)}`,
            linkage_detail: '[]',
            config: '{}'
          }, () => { this.hideDashboardForm() })
        } else {
          this.props.onEditDashboard(values, () => { this.hideDashboardForm() })
        }
      }
    })
  }

  private onSearchDashboard = (value) => {
    const valReg = new RegExp(value, 'i')
    this.setState({
      filteredDashboards: this.props.dashboards.filter((i) => valReg.test(i.name)),
      currentPage: 1
    })
  }

  private onChange = (page) => {
    this.setState({
      currentPage: page
    })
  }

  private onShowSizeChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    })
  }

  public render () {
    const {
      dashboards,
      loginUser,
      onDeleteDashboard
    } = this.props

    const {
      modalLoading,
      formType,
      formVisible,
      filteredDashboards,
      currentPage,
      pageSize,
      screenWidth
    } = this.state

    const dashboardsArr = filteredDashboards || dashboards

    const userId = loginUser.id

    const dashboardItems = dashboardsArr
      ? dashboardsArr.map((d, index) => {
        let editButton = void 0
        let deleteButton = void 0

        if (loginUser.admin) {
          editButton = d['create_by'] === userId && (
            <Tooltip title="编辑">
              <Icon className={styles.edit} type="setting" onClick={this.showDashboardForm('edit', d)} />
            </Tooltip>
          )
          deleteButton = d['create_by'] === userId && (
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={onDeleteDashboard(d.id)}
            >
              <Tooltip title="删除">
                <Icon className={styles.delete} type="delete" onClick={this.stopPPG} />
              </Tooltip>
            </Popconfirm>
          )
        }

        const itemClass = classnames({
          [styles.unit]: true,
          [styles.editing]: !d.publish
        })

        const editHint = !d.publish && '(编辑中…)'

        const startCol = (currentPage - 1) * pageSize + 1
        const endCol = Math.min(currentPage * pageSize, dashboardsArr.length)

        let colItems = void 0

        if ((index + 1 >= startCol && index + 1 <= endCol) ||
          (startCol > dashboardsArr.length)) {
          colItems = (
            <Col
              key={d.id}
              xl={4}
              lg={6}
              md={8}
              sm={12}
              xs={24}
            >
              <div
                className={itemClass}
                style={{backgroundImage: `url(${require(`../../assets/images/bg${d.pic}.png`)})`}}
                onClick={this.toGrid(d)}
              >
                <header>
                  <h3 className={styles.title}>
                    {d.name} {editHint}
                  </h3>
                  <p className={styles.content}>
                    {d.desc}
                  </p>
                </header>
                {editButton}
                {deleteButton}
              </div>
            </Col>
          )
        }

        return colItems
      })
      : ''

    const pagination = dashboardsArr && (
      <Pagination
        simple={screenWidth < 768 || screenWidth === 768}
        className={widgetStyles.paginationPosition}
        showSizeChanger
        onShowSizeChange={this.onShowSizeChange}
        onChange={this.onChange}
        total={dashboardsArr.length}
        defaultPageSize={24}
        pageSizeOptions={['24', '48', '72', '96']}
        current={currentPage}
      />
    )

    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={this.hideDashboardForm}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onModalOk}
      >
        保 存
      </Button>
    )]

    const addButton = loginUser.admin
      ? (
        <Col xl={2} lg={2} md={2} sm={2} xs={24} className={styles.addCol}>
          <Tooltip placement="bottom" title="新增">
            <Button
              size="large"
              type="primary"
              icon="plus"
              onClick={this.showDashboardForm('add')}
            />
          </Tooltip>
        </Col>
      ) : ''

    const searchCol = loginUser.admin ? styles.searchAdmin : styles.searchUser

    return (
      <Container>
        <Helmet title="Dashboard" />
        <Container.Title>
          <Row>
            <Col xl={18} lg={18} md={16} sm={12} xs={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">
                    Dashboard
                  </Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
            <Col xl={6} lg={6} md={8} sm={12} xs={24}>
              <Row>
                <Col xl={22} lg={22} md={22} sm={22} xs={24} className={searchCol}>
                  <Search
                    size="large"
                    className={`${utilStyles.searchInput} ${loginUser.admin ? styles.searchInputAdmin : ''}`}
                    placeholder="Dashboard 名称"
                    onSearch={this.onSearchDashboard}
                  />
                </Col>
                {addButton}
              </Row>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body card>
          <Row gutter={20}>
            {dashboardItems}
          </Row>
          <Row>
            {pagination}
          </Row>
        </Container.Body>
        <Modal
          title={`${formType === 'add' ? '新增' : '修改'}Dashboard`}
          wrapClassName="ant-modal-small"
          visible={formVisible}
          footer={modalButtons}
          onCancel={this.hideDashboardForm}
        >
          <DashboardForm
            type={formType}
            ref={(f) => { this.dashboardForm = f }}
          />
        </Modal>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  dashboards: makeSelectDashboards(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboards: () => dispatch(loadDashboards()),
    onAddDashboard: (dashboard, resolve) => dispatch(addDashboard(dashboard, resolve)),
    onEditDashboard: (dashboard, resolve) => dispatch(editDashboard(dashboard, resolve)),
    onDeleteDashboard: (id) => () => dispatch(deleteDashboard(id))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'dashboard', reducer })
const withSaga = injectSaga({ key: 'dashboard', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Dashboard)
