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
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import Workbench from './components/Workbench'
import Container from '../../components/Container'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Button from 'antd/lib/button'
import Tooltip from 'antd/lib/tooltip'
import Icon from 'antd/lib/icon'
import Modal from 'antd/lib/modal'
import Popconfirm from 'antd/lib/popconfirm'
import Breadcrumb from 'antd/lib/breadcrumb'

import widgetlibs from '../../assets/json/widgetlib'
import { promiseDispatcher } from '../../utils/reduxPromisation'
import { loadWidgets, deleteWidget } from './actions'
import { makeSelectWidgets } from './selectors'
import { loadBizlogics } from '../Bizlogic/actions'
import { makeSelectBizlogics } from '../Bizlogic/selectors'
import { makeSelectLoginUser } from '../App/selectors'
import { iconMapping } from './components/chartUtil'

import styles from './Widget.less'
import utilStyles from '../../assets/less/util.less'

export class Widget extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      workbenchType: '',
      currentWidget: null,
      workbenchVisible: false
    }
  }

  componentWillMount () {
    const {
      onLoadWidgets,
      onLoadBizlogics
    } = this.props

    onLoadWidgets()
    onLoadBizlogics()
  }

  showWorkbench = (type, widget) => () => {
    this.setState({
      workbenchType: type,
      currentWidget: widget,
      workbenchVisible: true
    })
  }

  hideWorkbench = () => {
    this.setState({
      workbenchVisible: false,
      workbenchType: '',
      currentWidget: null
    })
  }

  afterModalClose = () => {
    this.workbenchWrapper.refs.wrappedInstance.resetWorkbench()
  }

  stopPPG = (e) => {
    e.stopPropagation()
  }

  render () {
    const {
      widgets,
      loginUser,
      onDeleteWidget
    } = this.props
    const {
      workbenchType,
      currentWidget,
      workbenchVisible
    } = this.state

    let {bizlogics} = this.props
    bizlogics = bizlogics ? bizlogics.filter(widget => widget['create_by'] === loginUser.id) : []
    // filter 非用户原创widget 不予显示
    const cols = widgets
      ? widgets
        .filter(widget => widget['create_by'] === loginUser.id)
        .map(w => {
          const widgetType = JSON.parse(w.chart_params).widgetType
          return (
            <Col
              xl={4} lg={6} md={8} sm={12} xs={24}
              key={w.id}
              onClick={this.showWorkbench('edit', w)}
          >
              <div className={styles.widget}>
                <h3 className={styles.title}>{w.name}</h3>
                <p className={styles.content}>{w.desc}</p>
                <i className={`${styles.pic} iconfont ${iconMapping[widgetType]}`} />
                <Popconfirm
                  title="确定删除？"
                  placement="bottom"
                  onConfirm={onDeleteWidget(w.id)}
              >
                  <Icon className={styles.delete} type="delete" onClick={this.stopPPG} />
                </Popconfirm>
              </div>
            </Col>
          )
        })
      : ''

    return (
      <Container>
        <Helmet title="Widget" />
        <Container.Title>
          <Row>
            <Col span={18}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link>Widget</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
            <Col span={6} className={utilStyles.textAlignRight}>
              <Tooltip placement="bottom" title="新增">
                <Button
                  size="large"
                  type="primary"
                  icon="plus"
                  onClick={this.showWorkbench('add')}
                />
              </Tooltip>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body card>
          <Row gutter={20}>
            {cols}
          </Row>
        </Container.Body>
        <Modal
          title={`${workbenchType === 'add' ? '新增' : '修改'} Widget`}
          wrapClassName={`ant-modal-xlarge ${styles.workbenchWrapper}`}
          visible={workbenchVisible}
          onCancel={this.hideWorkbench}
          afterClose={this.afterModalClose}
          footer={false}
          maskClosable={false}
        >
          <Workbench
            type={workbenchType}
            widget={currentWidget}
            bizlogics={bizlogics || []}
            widgetlibs={widgetlibs}
            onAfterSave={this.hideWorkbench}
            ref={f => { this.workbenchWrapper = f }}
          />
        </Modal>
      </Container>
    )
  }
}

Widget.propTypes = {
  widgets: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  bizlogics: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool
  ]),
  loginUser: PropTypes.object,
  onLoadWidgets: PropTypes.func,
  onLoadBizlogics: PropTypes.func,
  onDeleteWidget: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgets(),
  bizlogics: makeSelectBizlogics(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadWidgets: () => promiseDispatcher(dispatch, loadWidgets),
    onLoadBizlogics: () => promiseDispatcher(dispatch, loadBizlogics),
    onDeleteWidget: (id) => () => promiseDispatcher(dispatch, deleteWidget, id)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Widget)
