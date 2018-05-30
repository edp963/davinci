import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import { compose } from 'redux'
import reducer from './reducer'
import reducerWidget from '../Widget/reducer'
import saga from './sagas'
import sagaWidget from '../Widget/sagas'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'

import Container from '../../components/Container'
import Editor from './components/Editor'

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

const utilStyles = require('../../assets/less/util.less')
const styles = require('./Display.less')

import { loadDisplays, deleteDisplay } from './actions'
import { makeSelectDisplays } from './selectors'

interface IDisplayProps {
  displays: any[]
  onLoadDisplays: () => void,
  onDeleteDisplay: (id: any) => void
}

interface IDisplayStates {
  currentDisplay: object,
  displayVisible: boolean
}

export class DisplayList extends React.Component<IDisplayProps, IDisplayStates> {
  constructor (props) {
    super(props)
    this.state = {
      currentDisplay: null,
      displayVisible: false
    }
  }

  public componentWillMount () {
    const {
      onLoadDisplays
    } = this.props
    onLoadDisplays()
  }

  private showDisplay = (type, display?: any) => () => {
    this.setState({
      currentDisplay: display,
      displayVisible: true
    })
    console.log('showDisplay: ', type)
  }

  private hideDisplay = () => {
    this.setState({
      displayVisible: false
    })
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private onCopy = (display) => (e) => {
    console.log(e)
  }

  public render () {
    const {
      displays,
      onDeleteDisplay
    } = this.props

    const {
      currentDisplay,
      displayVisible
    } = this.state

    const cols = displays.map(((d, index) => {
      return (
        <Col
          xl={4}
          lg={6}
          md={8}
          sm={12}
          xs={24}
          key={d.id}
          onClick={this.showDisplay('edit', d)}
        >
          <div className={styles.display}>
            <h3 className={styles.title}>{d.name}</h3>
            <p className={styles.content}>{d.desc}</p>
            <i className={`${styles.pic} iconfont`} />
            <Tooltip title="复制">
              <Icon className={styles.copy} type="copy" onClick={this.onCopy(d)} />
            </Tooltip>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={onDeleteDisplay(d.id)}
            >
              <Tooltip title="删除">
                <Icon className={styles.delete} type="delete" onClick={this.stopPPG} />
              </Tooltip>
            </Popconfirm>
          </div>
        </Col>
      )
    }))

    return (
      <Container>
        <Helmet title="Display" />
        <Container.Title>
          <Col xl={18} lg={18} md={16} sm={12} xs={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="/">
                    Display
                  </Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
        </Container.Title>
        <Container.Body card>
          <Row gutter={20}>
            {cols}
          </Row>
        </Container.Body>
        <Modal
          wrapClassName={`ant-modal-xlarge ${styles.workbenchWrapper}`}
          visible={displayVisible}
          onCancel={this.hideDisplay}
          footer={false}
          maskClosable={false}
        >
          <Editor display={currentDisplay}/>
        </Modal>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  displays: makeSelectDisplays()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDisplays: () => dispatch(loadDisplays()),
    onDeleteDisplay: (id) => () => dispatch(deleteDisplay(id))
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
  withConnect)(DisplayList)
