import * as React from 'react'
import Helmet from 'react-helmet'
import { Link, InjectedRouter } from 'react-router'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { compose } from 'redux'
import reducer from './reducer'
import reducerWidget from '../Widget/reducer'
import saga from './sagas'
import sagaWidget from '../Widget/sagas'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'

import Container from '../../components/Container'
import DisplayList from './components/DisplayList'
import DisplayForm from './components/DisplayForm'
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

const utilStyles = require('../../assets/less/util.less')
const styles = require('./Display.less')
const stylesDashboard = require('../Dashboard/Dashboard.less')

import { loadDisplays, deleteDisplay, addDisplay, editDisplay } from './actions'
import { makeSelectDisplays } from './selectors'
import { makeSelectLoginUser } from '../App/selectors'

interface IDisplayProps {
  router: InjectedRouter
  params: any
  displays: any[]
  loginUser: { id: number, admin: boolean }
  onLoadDisplays: (projectId: string) => void,
  onDeleteDisplay: (id: any) => void
  onAddDisplay: (display: any, resolve: () => void) => void
  onEditDisplay: (display: any, resolve: () => void) => void
}

interface IDisplayStates {
  modalLoading: boolean
  formType: 'add' | 'edit' | ''
  formVisible: boolean
  currentDisplay: object,
  kwDisplay: string
}

export class Display extends React.Component<IDisplayProps, IDisplayStates> {
  constructor (props) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: '',
      formVisible: false,
      currentDisplay: null,
      kwDisplay: ''
    }
  }

  private displayForm: WrappedFormUtils

  public componentWillMount () {
    const {
      params,
      onLoadDisplays
    } = this.props
    const { pid } = params
    onLoadDisplays(pid)
  }

  private goToDisplay = (display?: any) => () => {
    const { params } = this.props
    this.props.router.push(`/project/${params.pid}/display/${display ? display.id : -1}`)
  }

  private onCopy = (display) => (e) => {
    console.log(e) // @TODO
  }

  private onSearchDisplay = (value) => {
    this.setState({
      kwDisplay: value
    })
  }

  private getDisplays () {
    const {
      loginUser,
      displays
    } = this.props

    const {
      kwDisplay
    } = this.state

    if (!Array.isArray(displays)) {
      return []
    }

    const reg = new RegExp(kwDisplay, 'i')
    const filteredDisplays = displays.filter((d) => reg.test(d.name))
    return filteredDisplays
  }

  private showDisplayForm = (formType, display?) => (e) => {
    e.stopPropagation()
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (display) {
        this.displayForm.setFieldsValue(display)
      }
    })
  }

  private hideDisplayForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.displayForm.resetFields()
    })
  }

  private onModalOk = () => {
    this.displayForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        if (this.state.formType === 'add') {
          const { params } = this.props
          const projectId = params.pid
          this.props.onAddDisplay({
            ...values,
            projectId
          }, () => { this.hideDisplayForm() })
        } else {
          this.props.onEditDisplay(values, () => { this.hideDisplayForm() })
        }
      }
    })
  }

  public render () {
    const {
      params,
      displays,
      loginUser,
      onAddDisplay,
      onDeleteDisplay
    } = this.props
    const projectId = params.pid

    const {
      modalLoading,
      formType,
      formVisible,
      currentDisplay
    } = this.state

    const displaysFiltered = this.getDisplays()

    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={this.hideDisplayForm}
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
        <Col xl={2} lg={2} md={2} sm={2} xs={24} className={stylesDashboard.addCol}>
          <Tooltip placement="bottom" title="新增">
            <Button
              size="large"
              type="primary"
              icon="plus"
              onClick={this.showDisplayForm('add')}
            />
          </Tooltip>
        </Col>
      ) : ''

    const searchCol = loginUser.admin ? stylesDashboard.searchAdmin : stylesDashboard.searchUser

    return (
      <Container>
        <Helmet title="Display" />
        <Container.Title>
          <Row>
            <Col xl={18} lg={18} md={16} sm={12} xs={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="/">
                    Display
                  </Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
            <Col xl={6} lg={6} md={8} sm={12} xs={24}>
              <Row>
                <Col xl={22} lg={22} md={22} sm={22} xs={24} className={searchCol}>
                  <Search
                    size="large"
                    className={`${utilStyles.searchInput} ${loginUser.admin ? stylesDashboard.searchInputAdmin : ''}`}
                    placeholder="Display 名称"
                    onSearch={this.onSearchDisplay}
                  />
                </Col>
                {addButton}
              </Row>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body card>
          <DisplayList
            projectId={projectId}
            displays={displaysFiltered}
            onDisplayClick={this.goToDisplay}
            onAdd={onAddDisplay}
            onEdit={this.showDisplayForm}
            onCopy={this.onCopy}
            onDelete={onDeleteDisplay}
          />
        </Container.Body>
        <Modal
          title={`${formType === 'add' ? '新增' : '修改'} Display`}
          wrapClassName="ant-modal-small"
          visible={formVisible}
          footer={modalButtons}
          onCancel={this.hideDisplayForm}
        >
          <DisplayForm
            projectId={projectId}
            type={formType}
            ref={(f) => { this.displayForm = f }}
          />
        </Modal>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  displays: makeSelectDisplays(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDisplays: (projectId) => dispatch(loadDisplays(projectId)),
    onDeleteDisplay: (id) => () => dispatch(deleteDisplay(id)),
    onAddDisplay: (display, resolve) => dispatch(addDisplay(display, resolve)),
    onEditDisplay: (display, resolve) => dispatch(editDisplay(display, resolve))
  }
}

const withReducer = injectReducer({ key: 'display', reducer })
const withReducerWidget = injectReducer({ key: 'widget', reducer: reducerWidget })

const withSaga = injectSaga({ key: 'display', saga })
const withSagaWidget = injectSaga({ key: 'widget', saga: sagaWidget })

const withConnect = connect<{}, {}, IDisplayProps>(mapStateToProps, mapDispatchToProps)

export default compose(
  withReducer,
  withReducerWidget,
  withSaga,
  withSagaWidget,
  withConnect)(Display)

export interface ISlide {
  config: string
  id: number
  index: number
}

export interface ISlideConfig {
  slideParams: ISlideParams
}

export interface ISlideParams {
  backgroundColor: [number, number, number]
  backgroundImage: string
  height: number
  width: number
  opacity: number
  scaleMode: string
}

