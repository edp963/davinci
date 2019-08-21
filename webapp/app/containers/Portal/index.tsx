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
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from 'components/Container'
import { Row, Col, Button, Icon, Tooltip, Modal, Breadcrumb, Popconfirm, Input, Pagination } from 'antd'
const Search = Input.Search
import AntdFormType from 'antd/lib/form/Form'

import { loadPortals, addPortal, editPortal, deletePortal } from './actions'
import { makeSelectPortals } from './selectors'

const utilStyles = require('assets/less/util.less')
const styles = require('./Portal.less')
const widgetStyles = require('../Widget/Widget.less')

interface IPortalProps {
  portals: IPortal[]
  loginUser: { id: number, admin: boolean }
  router: InjectedRouter
  params: any
  onLoadPortals: (projectId: number) => void
  onAddPortal: (portal: IPortal, resolve: () => void) => void
  onEditPortal: (portal: IPortal, resolve: () => void) => void
  onDeletePortal: (id: number) => void
}

interface IPortalStates {
  modalLoading: boolean
  formType: 'add' | 'edit' | ''
  formVisible: boolean
  filteredPortals: IPortal[]
  currentPage: number
  pageSize: number
  screenWidth: number
}

export interface IPortal {
  projectId?: number
  id?: number
  name?: string
  avatar?: string
  publish?: boolean
  description?: string
}

export class Portal extends React.Component<IPortalProps, IPortalStates> {
  constructor (props) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: '',
      formVisible: false,

      filteredPortals: null,
      currentPage: 1,
      pageSize: 24,
      screenWidth: 0
    }
  }

  private portalForm: AntdFormType = null
  private refHandlers = {
    portalForm: (ref) => this.portalForm = ref
  }

  public componentWillMount () {
    this.props.onLoadPortals(this.props.params.pid)
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  public componentWillReceiveProps () {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  private showPortalForm = (formType, portal?: IPortal) => (e) => {
    e.stopPropagation()
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (portal) {
        this.portalForm.props.form.setFieldsValue(portal)
      }
    })
  }

  private hidePortalForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.portalForm.props.form.resetFields()
    })
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private onModalOk = () => {
    this.portalForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { formType } = this.state
        const { id, name, description, publish, avatar } = values
        const val = {
          description,
          name,
          publish,
          projectId:  this.props.params.pid,
          avatar: formType === 'add' ? `${Math.ceil(Math.random() * 19)}` : avatar
        }
        if (formType === 'add') {
          this.props.onAddPortal(val, () => {
            this.hidePortalForm()
          })
        } else {
          this.props.onEditPortal({ ...val, id }, () => {
            this.hidePortalForm()
          })
        }
      }
    })
  }

  private onSearchPortal = (value) => {
    const valReg = new RegExp(value, 'i')
    this.setState({
      filteredPortals: this.props.portals.filter((i) => valReg.test(i.name)),
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

  private deletePortal = (d) => (e) => {
    this.props.onDeletePortal(d.id)
  }

  private toDashboard = (d) => (e) => {
    const { params, router } = this.props
    router.push(`/project/${params.pid}/portal/${d.id}/portalName/${d.name}`)
  }

  public render () {
    const {
      params,
      portals
    } = this.props

    const {
      modalLoading,
      formType,
      formVisible,
      filteredPortals,
      currentPage,
      pageSize,
      screenWidth
    } = this.state

    const portalsArr = filteredPortals || portals

    const portalItems = portalsArr
      ? portalsArr.map((d, index) => {
        const itemClass = classnames({
          [styles.unit]: true,
          [styles.editing]: !d.publish
        })

        const editHint = !d.publish && '(编辑中…)'

        const startCol = (currentPage - 1) * pageSize + 1
        const endCol = Math.min(currentPage * pageSize, portalsArr.length)

        let colItems = void 0

        if ((index + 1 >= startCol && index + 1 <= endCol) ||
          (startCol > portalsArr.length)) {
          colItems = (
            <Col
              key={d.id}
              xxl={4}
              xl={6}
              lg={8}
              md={12}
              sm={24}
            >
              <div
                className={itemClass}
                style={{backgroundImage: `url(${require(`assets/images/bg${d.avatar}.png`)})`}}
                onClick={this.toDashboard(d)}
              >
                <header>
                  <h3 className={styles.title}>
                    {d.name} {editHint}
                  </h3>
                  <p className={styles.content}>
                    {d.description}
                  </p>
                </header>
                <Tooltip title="编辑">
                  <Icon className={styles.edit} type="setting" onClick={this.showPortalForm('edit', d)} />
                </Tooltip>
                  <Popconfirm
                    title="确定删除？"
                    placement="bottom"
                    onConfirm={this.deletePortal(d)}
                  >
                    <Tooltip title="删除">
                      <Icon className={styles.delete} type="delete" onClick={this.stopPPG} />
                    </Tooltip>
                  </Popconfirm>
              </div>
            </Col>
          )
        }

        return colItems
      })
      : ''

    const pagination = portalsArr && (
      <Pagination
        simple={screenWidth < 768 || screenWidth === 768}
        className={widgetStyles.paginationPosition}
        showSizeChanger
        onShowSizeChange={this.onShowSizeChange}
        onChange={this.onChange}
        total={portalsArr.length}
        defaultPageSize={24}
        pageSizeOptions={['24', '48', '72', '96']}
        current={currentPage}
      />
    )

    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={this.hidePortalForm}
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

    const searchCol = styles.searchAdmin

    return (
      <Container>
        <Helmet title="Portal" />
        <Container.Title>
          <Row>
            <Col xl={18} lg={16} md={12} sm={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">
                    Dashboard Portal
                  </Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
            <Col xl={6} lg={8} md={12} sm={24}>
              <Row>
                <Col md={22} sm={24} className={searchCol}>
                  <Search
                    size="large"
                    className={`${utilStyles.searchInput} ${styles.searchInputAdmin}`}
                    placeholder="Dashboard Portal 名称"
                    onSearch={this.onSearchPortal}
                  />
                </Col>
                <Col md={2} sm={24} className={styles.addCol}>
                  <Tooltip placement="bottom" title="新增">
                    <Button
                      size="large"
                      type="primary"
                      icon="plus"
                      onClick={this.showPortalForm('add')}
                    />
                  </Tooltip>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body card>
          <Row gutter={20}>
            {portalItems}
          </Row>
          <Row>
            {pagination}
          </Row>
        </Container.Body>
        <Modal
          title={`${formType === 'add' ? '新增' : '修改'} Portal`}
          wrapClassName="ant-modal-small"
          visible={formVisible}
          footer={modalButtons}
          onCancel={this.hidePortalForm}
        >
          {/* <PortalForm
            projectId={params.pid}
            type={formType}
            wrappedComponentRef={this.refHandlers.portalForm}
          /> */}
        </Modal>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  portals: makeSelectPortals()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadPortals: (projectId) => dispatch(loadPortals(projectId)),
    onAddPortal: (values, resolve) => dispatch(addPortal(values, resolve)),
    onEditPortal: (values, resolve) => dispatch(editPortal(values, resolve)),
    onDeletePortal: (id) => dispatch(deletePortal(id))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'portal', reducer })
const withSaga = injectSaga({ key: 'portal', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Portal)
