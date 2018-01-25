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

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import VariableConfigForm from './VariableConfigForm'
import MarkConfigForm from './MarkConfigForm'
import WidgetForm from './WidgetForm'
import SplitView from './SplitView'
import Modal from 'antd/lib/modal'

import { loadBizdatas, clearBizdatas } from '../../Bizlogic/actions'
import { addWidget, editWidget } from '../actions'
import { makeSelectBizdatas, makeSelectBizdatasLoading } from '../selectors'
import { promiseDispatcher } from '../../../utils/reduxPromisation'
import { uuid } from '../../../utils/util'

import styles from '../Widget.less'

export class Workbench extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      chartInfo: false,
      chartParams: {},
      queryInfo: false,
      updateInfo: false,
      updateConfig: {},
      queryParams: [],
      updateParams: [],
      updateFields: {},
      currentBizlogicId: false,
      formSegmentControlActiveIndex: 0,
      adhocSql: props.type === 'edit' ? props.widget.adhoc_sql : '',

      variableConfigModalVisible: false,
      markConfigModalVisible: false,
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
      chartParams: this.widgetForm.props.form.getFieldsValue()
    })
  }

  componentWillUpdate (nextProps, ns) {
    const type = nextProps.type
    const widget = nextProps.widget || {}
    const currentWidget = this.props.widget || {}

    if (widget.id !== currentWidget.id && type === 'edit') {
      this.getDetail(nextProps)
    }
  }

  getDetail = (props) => {
    const { widget } = props
    this.state.adhocSql = widget.adhoc_sql || ''

    this.widgetTypeChange(widget.widgetlib_id)
      .then(() => {
        this.bizlogicChange(widget.flatTable_id)

        const configInfo = JSON.parse(widget.config)
        const info = {
          id: widget.id,
          name: widget.name,
          desc: widget.desc,
          create_by: widget['create_by'],
          flatTable_id: `${widget.flatTable_id}`,
          widgetlib_id: `${widget.widgetlib_id}`,
          useCache: configInfo.useCache,
          expired: configInfo.expired
        }

        const params = JSON.parse(widget.chart_params)

        if (widget && widget.config) {
          let updateParams = JSON.parse(widget.config)['update_params']
          let updateFields = JSON.parse(widget.config)['update_fields']
          this.state.updateParams = updateParams ? JSON.parse(updateParams) : []
          this.state.updateFields = updateFields ? JSON.parse(updateFields) : {}
          this.state.updateConfig = updateFields ? JSON.parse(updateFields) : {}
        }

        delete params.widgetName
        delete params.widgetType

        const formValues = Object.assign({}, info, params)

        this.state.chartParams = formValues
        // FIXME
        this.state.queryParams = JSON.parse(widget.query_params)

        this.widgetForm.props.form.setFieldsValue(formValues)
      })
  }

  getBizdatas = (id, adhoc, queryParams) => {
    let sql
    let sorts
    let offset
    let limit

    if (adhoc) {
      sql = {}
      sql.adHoc = adhoc
    }

    if (queryParams) {
      const { filters, pagination } = queryParams
      sql = sql || {}
      sql.manualFilters = filters
      sorts = pagination.sorts
      offset = pagination.offset
      limit = pagination.limit
    }

    this.props.onLoadBizdatas(id, sql, sorts, offset, limit)
  }

  bizlogicChange = (val) => {
    const sqlTemplate = this.props.bizlogics.find(bl => bl.id === Number(val))
    const queryArr = sqlTemplate.sql_tmpl.match(/query@var\s\$\w+\$/g) || []
    let updateArr = sqlTemplate.update_sql ? (sqlTemplate.update_sql.match(/update@var\s\$\w+\$/g) || []) : []
    this.setState({
      currentBizlogicId: sqlTemplate.id,
      queryInfo: queryArr.map(q => q.substring(q.indexOf('$') + 1, q.lastIndexOf('$'))),
      updateInfo: updateArr.map(q => q.substring(q.indexOf('$') + 1, q.lastIndexOf('$'))),
      queryParams: []
    })

    this.getBizdatas(val, this.state.adhocSql)
  }

  adhocSqlQuery = () => {
    const flatTableId = this.widgetForm.props.form.getFieldValue('flatTable_id')
    if (flatTableId) {
      this.getBizdatas(flatTableId, this.state.adhocSql)
    }
  }

  widgetTypeChange = (val) =>
    new Promise((resolve) => {
      this.setState({
        chartInfo: this.props.widgetlibs.find(wl => wl.id === Number(val))
      }, () => {
        this.setState({
          chartParams: this.widgetForm.props.form.getFieldsValue()
        })
        resolve()
      })
    })

  formItemChange = (field) => (val) => {
    this.setState({
      chartParams: Object.assign({}, this.state.chartParams, { [field]: val })
    })
  }

  formInputItemChange = (field) => (e) => {
    this.setState({
      chartParams: Object.assign({}, this.state.chartParams, { [field]: e.target.value })
    })
  }

  saveWidget = () => new Promise((resolve, reject) => {
    this.widgetForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { chartInfo, queryParams, adhocSql, updateParams, updateFields } = this.state

        let id = values.id
        let name = values.name
        let desc = values.desc
        let widgetlibId = Number(values.widgetlib_id)
        let flatTableId = Number(values.flatTable_id)
        let useCache = values.useCache
        let expired = values.expired
        let createBy = Number(values.create_by)

        delete values.id
        delete values.name
        delete values.create_by
        delete values.desc
        delete values.widgetlib_id
        delete values.flatTable_id
        delete values.useCache
        delete values.expired

        let widget = {
          name,
          desc,
          adhoc_sql: adhocSql,
          publish: true,
          trigger_type: '',
          widgetlib_id: widgetlibId,
          chart_params: JSON.stringify(Object.assign({}, values, {
            widgetName: chartInfo.title,
            widgetType: chartInfo.name
          })),
          query_params: JSON.stringify(queryParams),
          trigger_params: '',
          flatTable_id: flatTableId,
          config: JSON.stringify({
            useCache,
            expired,
            update_params: JSON.stringify(updateParams),
            update_fields: JSON.stringify(updateFields)
          })
        }

        if (this.props.type === 'edit') {
          widget.id = id
          widget.create_by = createBy
          this.props.onEditWidget(widget).then(() => {
            resolve()
            this.props.onAfterSave()
          })
        } else {
          this.props.onAddWidget(widget).then(() => {
            resolve()
            this.props.onAfterSave()
          })
        }
      } else {
        reject()
      }
    })
  })

  resetWorkbench = () => {
    this.widgetForm.props.form.resetFields()
    this.props.onClearBizdatas()
    this.setState({
      chartInfo: false,
      chartParams: {},
      queryInfo: false,
      updateInfo: false,
      queryParams: [],
      updateParams: [],
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
  deleteMarkControl = (id) => () => {
    this.setState({
      updateParams: this.state.updateParams.filter(u => u.id !== id)
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
    this.variableConfigForm.resetForm()
  }
  showMarkConfigTable = (id) => () => {
    const {updateParams} = this.state
    const currentParams = updateParams.find(u => u.id === id)
    this.setState({
      markConfigModalVisible: true
    }, () => this.markConfigForm.setFieldsValue(currentParams))
  }
  hideMarkConfigTable = () => {
    this.setState({
      markConfigModalVisible: false
    })
  }
  resetMarkConfigForm = () => {
    this.markConfigForm.resetFields()
  }
  markFieldsOptionsChange = (e, type) => {
    const {updateFields} = this.state
    let newFields = Object.assign({}, updateFields)
    newFields[type] = e
    this.setState({
      updateFields: newFields
    })
  }
  saveMarkConfig = () => {
    const { updateParams } = this.state
    this.markConfigForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let id = values.id
        let isHasNoRecord = updateParams.every(up => up.id !== id)
        let update = []
        if (isHasNoRecord) {
          update = updateParams.concat({
            id: uuid(8, 16),
            text: values['text'],
            value: values['value']
          })
        } else {
          update = updateParams.map(up => {
            if (up.id === id) {
              return {
                id: up.id,
                text: values['text'],
                value: values['value']
              }
            } else {
              return up
            }
          })
        }
        this.setState({
          updateParams: update
        }, this.hideMarkConfigTable())
      }
    })
  }
  render () {
    const {
      type,
      bizlogics,
      widgetlibs,
      bizdatas,
      bizdatasLoading
    } = this.props
    const {
      chartInfo,
      queryInfo,
      updateInfo,
      updateConfig,
      chartParams,
      queryParams,
      updateParams,
      updateFields,
      currentBizlogicId,
      formSegmentControlActiveIndex,
      adhocSql,
      variableConfigModalVisible,
      markConfigModalVisible,
      variableConfigControl
    } = this.state

    return (
      <div className={`${styles.workbench} no-item-margin`}>
        <WidgetForm
          type={type}
          bizlogics={bizlogics}
          widgetlibs={widgetlibs}
          dataSource={bizdatas ? bizdatas.dataSource : []}
          chartInfo={chartInfo}
          queryInfo={queryInfo}
          updateInfo={updateInfo}
          updateConfig={updateConfig}
          queryParams={queryParams}
          updateParams={updateParams}
          updateFields={updateFields}
          segmentControlActiveIndex={formSegmentControlActiveIndex}
          onBizlogicChange={this.bizlogicChange}
          onWidgetTypeChange={this.widgetTypeChange}
          onFormItemChange={this.formItemChange}
          onMarkFieldsOptionsChange={this.markFieldsOptionsChange}
          onFormInputItemChange={this.formInputItemChange}
          onSegmentControlChange={this.formSegmentControlChange}
          onShowVariableConfigTable={this.showVariableConfigTable}
          onShowMarkConfigTable={this.showMarkConfigTable}
          onShowMardConfigTable
          onDeleteControl={this.deleteControl}
          onDeleteMarkControl={this.deleteMarkControl}
          wrappedComponentRef={f => { this.widgetForm = f }}
        />
        <SplitView
          data={bizdatas}
          chartInfo={chartInfo}
          updateConfig={updateConfig}
          chartParams={chartParams}
          updateParams={updateParams}
          currentBizlogicId={currentBizlogicId}
          tableLoading={bizdatasLoading}
          adhocSql={adhocSql}
          onSaveWidget={this.saveWidget}
          onAdhocSqlInputChange={this.adhocSqlInputChange}
          onAdhocSqlQuery={this.adhocSqlQuery}
        />
        <Modal
          title="QUERY变量配置"
          wrapClassName="ant-modal-large"
          visible={variableConfigModalVisible}
          onCancel={this.hideVariableConfigTable}
          afterClose={this.resetVariableConfigForm}
          footer={false}
          maskClosable={false}
        >
          <VariableConfigForm
            queryInfo={queryInfo}
            control={variableConfigControl}
            onSave={this.saveControl}
            onClose={this.hideVariableConfigTable}
            wrappedComponentRef={f => { this.variableConfigForm = f }}
          />
        </Modal>
        <Modal
          title="UPDATE变量配置"
          wrapClassName="ant-modal-large"
          visible={markConfigModalVisible}
          onCancel={this.hideMarkConfigTable}
          afterClose={this.resetMarkConfigForm}
          footer={false}
          maskClosable={false}
        >
          <MarkConfigForm
            onCancel={this.hideMarkConfigTable}
            onSaveMarkConfigValue={this.saveMarkConfig}
            ref={f => { this.markConfigForm = f }}
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
  bizdatas: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  bizdatasLoading: PropTypes.bool,
  onLoadBizdatas: PropTypes.func,
  onClearBizdatas: PropTypes.func,
  onAddWidget: PropTypes.func,
  onEditWidget: PropTypes.func,
  onAfterSave: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  bizdatas: makeSelectBizdatas(),
  bizdatasLoading: makeSelectBizdatasLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadBizdatas: (id, sql, sorts, offset, limit) => dispatch(loadBizdatas(id, sql, sorts, offset, limit)),
    onClearBizdatas: () => dispatch(clearBizdatas()),
    onAddWidget: (widget) => promiseDispatcher(dispatch, addWidget, widget),
    onEditWidget: (widget) => promiseDispatcher(dispatch, editWidget, widget)
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(Workbench)
