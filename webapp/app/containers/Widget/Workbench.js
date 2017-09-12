/*-
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

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import VariableConfigForm from './VariableConfigForm'
import WidgetForm from './WidgetForm'
import SplitView from './SplitView'
import Modal from 'antd/lib/modal'

import { loadBizdatas } from '../Bizlogic/actions'
import { addWidget, editWidget } from './actions'
import { promiseDispatcher } from '../../utils/reduxPromisation'

import styles from './Widget.less'

export class Workbench extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: false,
      chartInfo: false,
      chartParams: {},
      queryInfo: false,
      queryParams: [],
      formSegmentControlActiveIndex: 0,
      tableLoading: false,
      adhocSql: props.type === 'edit' ? props.widget.adhoc_sql : '',

      variableConfigModalVisible: false,
      variableConfigControl: {},

      tableHeight: 0
    }
  }

  componentWillMount () {
    if (this.props.type === 'edit') {
      this.getDetail(this.props)
    }
  }

  componentDidMount () {
    this.setState({
      chartParams: this.widgetForm.getFieldsValue()
    })
  }

  componentWillUpdate (nextProps, ns) {
    const type = nextProps.type
    const widget = nextProps.widget || {}
    const currentWidget = this.props.widget || {}

    this.state.adhocSql = widget.adhoc_sql || ''

    if (widget.id !== currentWidget.id && type === 'edit') {
      this.getDetail(nextProps)
    }
  }

  getDetail = (props) => {
    const { widget } = props
    const { adhocSql } = this.state
    this.bizlogicChange(widget.flatTable_id, adhocSql)
    this.widgetTypeChange(widget.widgetlib_id)
      .then(() => {
        const info = {
          id: widget.id,
          name: widget.name,
          desc: widget.desc,
          flatTable_id: `${widget.flatTable_id}`,
          widgetlib_id: `${widget.widgetlib_id}`
        }

        const params = JSON.parse(widget.chart_params)

        delete params.widgetName
        delete params.widgetType

        const formValues = Object.assign({}, info, params)

        this.state.chartParams = formValues
        // FIXME
        this.state.queryParams = JSON.parse(widget.query_params)

        this.widgetForm.setFieldsValue(formValues)
      })
  }

  bizlogicChange = (val, sql) => {
    const sqlTemplate = this.props.bizlogics.find(bl => bl.id === Number(val)).sql_tmpl
    const queryArr = sqlTemplate.match(/query@var\s\$\w+\$/g) || []

    this.setState({
      tableLoading: true,
      queryInfo: queryArr.map(q => q.substring(q.indexOf('$') + 1, q.lastIndexOf('$'))),
      queryParams: []
    })

    this.props.onLoadBizdatas(val, { adHoc: sql })
      .then(resultset => {
        this.setState({
          data: resultset,
          tableLoading: false
        })
      })
  }

  adhocSqlQuery = () => {
    const flatTableId = this.widgetForm.getFieldValue('flatTable_id')
    if (flatTableId) {
      this.bizlogicChange(flatTableId, this.state.adhocSql)
    }
  }

  widgetTypeChange = (val) =>
    new Promise((resolve) => {
      this.setState({
        chartInfo: this.props.widgetlibs.find(wl => wl.id === Number(val))
      }, () => {
        resolve()
      })
    })

  formItemChange = (field) => (val) => {
    this.setState({
      chartParams: Object.assign({}, this.state.chartParams, { [field]: val })
    })
  }

  saveWidget = () => new Promise((resolve, reject) => {
    this.widgetForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { chartInfo, queryParams, adhocSql } = this.state

        let id = values.id
        let name = values.name
        let desc = values.desc
        let widgetlib_id = Number(values.widgetlib_id)  // eslint-disable-line
        let flatTable_id = Number(values.flatTable_id)  // eslint-disable-line

        delete values.id
        delete values.name
        delete values.desc
        delete values.widgetlib_id
        delete values.flatTable_id

        let widget = {
          name,
          desc,
          adhoc_sql: adhocSql,
          publish: true,
          trigger_type: '',
          widgetlib_id,
          chart_params: JSON.stringify(Object.assign({}, values, {
            widgetName: chartInfo.title,
            widgetType: chartInfo.name
          })),
          query_params: JSON.stringify(queryParams),
          trigger_params: '',
          flatTable_id
        }

        if (this.props.type === 'edit') {
          widget.id = id
          this.props.onEditWidget(widget).then(() => {
            resolve()
            this.props.onClose()
          })
        } else {
          this.props.onAddWidget(widget).then(() => {
            resolve()
            this.props.onClose()
          })
        }
      } else {
        reject()
      }
    })
  })

  resetWorkbench = () => {
    this.widgetForm.resetFields()
    this.setState({
      data: false,
      chartInfo: false,
      chartParams: {},
      queryInfo: false,
      queryParams: [],
      adhocSql: ''
    })
  }

  adhocSqlInputChange = (event) => {
    this.setState({
      adhocSql: event.target.value
    })
  }

  formSegmentControlChange = (e) => {
    this.setState({
      formSegmentControlActiveIndex: e.target.value === '1' ? 0 : 1
    })
  }

  saveControl = (control) => {
    const { queryParams } = this.state
    const itemIndex = queryParams.findIndex(q => q.id === control.id)

    if (itemIndex >= 0) {
      queryParams.splice(itemIndex, 1, control)

      this.setState({
        queryParams: queryParams.slice()
      })
    } else {
      this.setState({
        queryParams: queryParams.concat(control)
      })
    }
  }

  deleteControl = (id) => () => {
    this.setState({
      queryParams: this.state.queryParams.filter(q => q.id !== id)
    })
  }

  showVariableConfigTable = (id) => () => {
    this.setState({
      variableConfigModalVisible: true,
      variableConfigControl: id
        ? this.state.queryParams.find(q => q.id === id)
        : {}
    })
  }

  hideVariableConfigTable = () => {
    this.setState({
      variableConfigModalVisible: false,
      variableConfigControl: {}
    })
  }

  resetVariableConfigForm = () => {
    this.variableConfigForm.refs.wrappedComponent.refs.formWrappedComponent.resetForm()
  }

  render () {
    const {
      bizlogics,
      widgetlibs
    } = this.props
    const {
      data,
      chartInfo,
      queryInfo,
      chartParams,
      queryParams,
      formSegmentControlActiveIndex,
      tableLoading,
      adhocSql,
      variableConfigModalVisible,
      variableConfigControl
    } = this.state

    return (
      <div className={`${styles.workbench} no-item-margin`}>
        <WidgetForm
          bizlogics={bizlogics}
          widgetlibs={widgetlibs}
          dataSource={data ? data.dataSource : []}
          chartInfo={chartInfo}
          queryInfo={queryInfo}
          queryParams={queryParams}
          segmentControlActiveIndex={formSegmentControlActiveIndex}
          onBizlogicChange={this.bizlogicChange}
          onWidgetTypeChange={this.widgetTypeChange}
          onFormItemChange={this.formItemChange}
          onSegmentControlChange={this.formSegmentControlChange}
          onShowVariableConfigTable={this.showVariableConfigTable}
          onDeleteControl={this.deleteControl}
          ref={f => { this.widgetForm = f }}
        />
        <SplitView
          data={data}
          chartInfo={chartInfo}
          chartParams={chartParams}
          tableLoading={tableLoading}
          adhocSql={adhocSql}
          onSaveWidget={this.saveWidget}
          onAdhocSqlInputChange={this.adhocSqlInputChange}
          onAdhocSqlQuery={this.adhocSqlQuery}
        />
        <Modal
          title="变量配置"
          wrapClassName="ant-modal-large"
          visible={variableConfigModalVisible}
          onCancel={this.resetVariableConfigForm}
          footer={false}
          maskClosable={false}
        >
          <VariableConfigForm
            queryInfo={queryInfo}
            control={variableConfigControl}
            onSave={this.saveControl}
            onClose={this.hideVariableConfigTable}
            ref={f => { this.variableConfigForm = f }}
          />
        </Modal>
      </div>
    )
  }
}

Workbench.propTypes = {
  type: PropTypes.string,
  widget: PropTypes.object,
  bizlogics: PropTypes.array,
  widgetlibs: PropTypes.array,
  onLoadBizdatas: PropTypes.func,
  onAddWidget: PropTypes.func,
  onEditWidget: PropTypes.func,
  onClose: PropTypes.func
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadBizdatas: (id, sql) => promiseDispatcher(dispatch, loadBizdatas, id, sql, undefined, undefined, undefined),
    onAddWidget: (widget) => promiseDispatcher(dispatch, addWidget, widget),
    onEditWidget: (widget) => promiseDispatcher(dispatch, editWidget, widget)
  }
}

export default connect(null, mapDispatchToProps, null, {withRef: true})(Workbench)
