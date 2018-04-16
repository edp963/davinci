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
import CopyWidgetForm from './components/CopyWidgetForm'
import Container from '../../components/Container'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Button from 'antd/lib/button'
import Tooltip from 'antd/lib/tooltip'
import Icon from 'antd/lib/icon'
import Modal from 'antd/lib/modal'
import Popconfirm from 'antd/lib/popconfirm'
import Breadcrumb from 'antd/lib/breadcrumb'
import Input from 'antd/lib/input'
import Pagination from 'antd/lib/pagination'
import Select from 'antd/lib/select'
const Search = Input.Search

import widgetlibs from '../../assets/json/widgetlib'
import { promiseDispatcher } from '../../utils/reduxPromisation'
import { loadWidgets, deleteWidget, addWidget } from './actions'
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
      workbenchVisible: false,
      copyWidgetVisible: false,
      copyQueryInfo: null,
      filteredWidgets: null,
      filteredWidgetsName: '',
      filteredWidgetsType: undefined,
      filteredWidgetsTypeId: '',
      pageSize: 24,
      currentPage: 1
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

  onCopy = (type, widget) => (e) => {
    e.stopPropagation()
    this.setState({
      workbenchType: type,
      currentWidget: widget,
      copyWidgetVisible: true
    }, () => {
      const copyItem = this.props.widgets.find(i => i.id === widget.id)
      this.setState({
        copyQueryInfo: {
          widgetlib_id: copyItem.widgetlib_id,
          flatTable_id: copyItem.flatTable_id,
          adhoc_sql: copyItem.adhoc_sql,
          config: copyItem.config,
          chart_params: copyItem.chart_params,
          query_params: copyItem.query_params,
          publish: copyItem.publish
        }
      })

      this.copyWidgetForm.setFieldsValue({
        name: `${copyItem.name}_copy`,
        desc: copyItem.desc
      })
    })
  }

  hideForm = () => {
    this.setState({
      copyWidgetVisible: false,
      workbenchType: '',
      currentWidget: null
    })
  }

  resetModal = () => this.copyWidgetForm.resetFields()

  onModalOk = () => new Promise((resolve, reject) => {
    this.copyWidgetForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { copyQueryInfo } = this.state
        const widgetValue = Object.assign({}, values, copyQueryInfo)

        this.props.onAddWidget(widgetValue).then(() => {
          resolve()
          this.hideForm()
        })
      } else {
        reject()
      }
    })
  })

  onSearchWidgetName = (value) => {
    const { widgets } = this.props
    const { filteredWidgetsTypeId, filteredWidgetsType } = this.state
    const valReg = new RegExp(value, 'i')

    const filterLib = widgetlibs.find(i => i.id === Number(filteredWidgetsTypeId))

    this.setState({
      filteredWidgetsName: valReg,
      currentPage: 1,
      filteredWidgets: filteredWidgetsType
        ? widgets.filter(i => valReg.test(i.name) && JSON.parse(i.chart_params).widgetName.includes(filterLib.title))
        : valReg
          ? widgets.filter(i => valReg.test(i.name))
          : widgets
    })
  }

  onChange = (page) => {
    this.setState({
      currentPage: page
    })
  }

  onShowSizeChange = (current, pageSize) => {
    this.setState({
      currentPage: current,
      pageSize: pageSize
    })
  }

  onSearchWidgetType = (value) => {
    const { widgets } = this.props
    const { filteredWidgetsName } = this.state

    const filterLib = value ? widgetlibs.find(i => i.id === Number(value)) : ''

    this.setState({
      filteredWidgetsTypeId: value,
      filteredWidgetsType: filterLib.title,
      currentPage: 1,
      filteredWidgets: filteredWidgetsName
        ? value
          ? widgets.filter(i => filteredWidgetsName.test(i.name) && JSON.parse(i.chart_params).widgetName.includes(filterLib.title))
          : widgets.filter(i => filteredWidgetsName.test(i.name))
        : value
          ? widgets.filter(i => JSON.parse(i.chart_params).widgetType.includes(filterLib.name))
          : widgets
    })
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
      workbenchVisible,
      copyWidgetVisible,
      filteredWidgets,
      currentPage,
      pageSize,
      filteredWidgetsTypeId,
      filteredWidgetsType
    } = this.state

    const widgetsArr = filteredWidgets || widgets

    let {bizlogics} = this.props
    bizlogics = bizlogics ? bizlogics.filter(widget => widget['create_by'] === loginUser.id) : []
    // filter 非用户原创widget 不予显示
    const cols = widgetsArr
      ? widgetsArr
        .filter(widget => widget['create_by'] === loginUser.id)
        .map((w, index) => {
          const widgetType = JSON.parse(w.chart_params).widgetType

          const startCol = (currentPage - 1) * pageSize + 1
          const endCol = Math.min(currentPage * pageSize, widgetsArr.length)

          let colItems = ''
          if ((index + 1 >= startCol && index + 1 <= endCol) ||
            (startCol > widgetsArr.length)) {
            colItems = (
              <Col
                xl={4} lg={6} md={8} sm={12} xs={24}
                key={w.id}
                onClick={this.showWorkbench('edit', w)}
              >
                <div className={styles.widget}>
                  <h3 className={styles.title}>{w.name}</h3>
                  <p className={styles.content}>{w.desc}</p>
                  <i className={`${styles.pic} iconfont ${iconMapping[widgetType]}`} />
                  <Tooltip title="复制">
                    <Icon className={styles.copy} type="copy" onClick={this.onCopy('copy', w)} />
                  </Tooltip>
                  <Popconfirm
                    title="确定删除？"
                    placement="bottom"
                    onConfirm={onDeleteWidget(w.id)}
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

    const widgetlibOptions = widgetlibs.map(w => (
      <Select.Option key={w.id} value={`${w.id}`}>
        {w.title}
        {
          `${w.id}` !== filteredWidgetsTypeId
            ? (
              <i className={`iconfont ${iconMapping[w.name]} ${styles.chartSelectOption}`} />
          ) : ''
        }
      </Select.Option>
    ))

    return (
      <Container>
        <Helmet title="Widget" />
        <Container.Title>
          <Row>
            <Col xl={18} lg={18} md={16} sm={12} xs={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link>Widget</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
            <Col xl={6} lg={6} md={8} sm={12} xs={24}>
              <Row>
                <Col xl={11} lg={11} md={11} sm={11} xs={24} className={utilStyles.searchCol}>
                  <Select
                    size="large"
                    className={styles.searchSelect}
                    placeholder="Widget 类型"
                    onChange={this.onSearchWidgetType}
                    allowClear
                    value={filteredWidgetsType}
                  >
                    {widgetlibOptions}
                  </Select>
                </Col>
                <Col xl={11} lg={11} md={11} sm={11} xs={24} className={utilStyles.searchCol}>
                  <Search
                    size="large"
                    placeholder="Widget 名称"
                    onSearch={this.onSearchWidgetName}
                  />
                </Col>
                <Col xl={2} lg={2} md={2} sm={2} xs={24} className={utilStyles.addCol}>
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
            </Col>
          </Row>
        </Container.Title>
        <Container.Body card>
          <Row gutter={20}>
            {cols}
          </Row>
          <Row>
            <Pagination
              className={styles.paginationPosition}
              showSizeChanger
              onShowSizeChange={this.onShowSizeChange}
              onChange={this.onChange}
              total={widgetsArr.length}
              defaultPageSize={24}
              pageSizeOptions={['24', '48', '72', '96']}
              current={currentPage}
            />
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
            widget={currentWidget}
            ref={(f) => { this.copyWidgetForm = f }}
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
  onDeleteWidget: PropTypes.func,
  onAddWidget: PropTypes.func
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
    onDeleteWidget: (id) => () => promiseDispatcher(dispatch, deleteWidget, id),
    onAddWidget: (widget) => promiseDispatcher(dispatch, addWidget, widget)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Widget)
