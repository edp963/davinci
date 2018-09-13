// /*
//  * <<
//  * Davinci
//  * ==
//  * Copyright (C) 2016 - 2017 EDP
//  * ==
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *      http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  * >>
//  */

// import * as React from 'react'
// import { connect } from 'react-redux'
// import { createStructuredSelector } from 'reselect'

// import VariableConfigForm from './VariableConfigForm'
// import MarkConfigForm from './MarkConfigForm'
// import WidgetForm from './WidgetForm'
// import SplitView from './SplitView'
// import { WrappedFormUtils } from 'antd/lib/form/Form'
// const Modal = require('antd/lib/modal')

// import { addWidget, editWidget } from '../actions'
// import { loadBizdatas, clearBizdatas } from '../../Bizlogic/actions'
// import { makeSelectBizdatas, makeSelectBizdatasLoading } from '../selectors'
// import { uuid } from '../../../utils/util'
// import { DEFAULT_SPLITER } from '../../../globalConstants'

// const styles = require('../Widget.less')

// interface IWorkbenchProps {
//   type: string,
//   widget: any,
//   bizlogics: any[],
//   widgetlibs: any[],
//   bizdatas?: { keys: any[] },
//   bizdatasLoading?: boolean,
//   onLoadBizdatas?: (id: any, sql: any, sorts: any, offset: any, limit: any) => void,
//   onClearBizdatas?: () => void,
//   onAddWidget?: (widget: object, resolve: any) => Promise<any>,
//   onEditWidget?: (widget: object, resolve: any) => Promise<any>,
//   onAfterSave?: () => void
// }

// interface IWorkbenchStates {
//   chartInfo: any,
//   chartParams: any,
//   queryInfo: any,
//   updateInfo: boolean,
//   updateConfig: object,
//   queryParams: any[],
//   updateParams: any[],
//   updateFields: object,
//   currentBizlogicId: number,
//   formSegmentControlActiveIndex: number,
//   adhocSql: string,

//   variableConfigModalVisible: boolean,
//   markConfigModalVisible: boolean,
//   variableConfigControl: object,

//   tableHeight: number
// }

// export class Workbench extends React.Component<IWorkbenchProps, IWorkbenchStates> {
//   constructor (props) {
//     super(props)
//     this.state = {
//       chartInfo: false,
//       chartParams: {},
//       queryInfo: false,
//       updateInfo: false,
//       updateConfig: {},
//       queryParams: [],
//       updateParams: [],
//       updateFields: {},
//       currentBizlogicId: 0,
//       formSegmentControlActiveIndex: 0,
//       adhocSql: props.type === 'edit' ? props.widget.adhoc_sql : '',

//       variableConfigModalVisible: false,
//       markConfigModalVisible: false,
//       variableConfigControl: {},

//       tableHeight: 0
//     }

//     this.refHandlers = {
//       widgetForm: (ref) => this.widgetForm = ref,
//       variableConfigForm: (ref) => this.variableConfigForm = ref
//     }
//   }

//   private markConfigForm: WrappedFormUtils
//   private refHandlers: { widgetForm: (ref: any) => void, variableConfigForm: (ref: any) => void }
//   private variableConfigForm: any
//   private widgetForm: any

//   public componentWillMount () {
//     if (this.props.type === 'edit') {
//       this.getDetail(this.props)
//     }
//   }

//   public componentDidMount () {
//     this.setState({
//       chartParams: this.decodeFieldsName(this.widgetForm.props.form.getFieldsValue())
//     })
//   }

//   public componentWillReceiveProps (nextProps) {
//     const type = nextProps.type
//     const widget = nextProps.widget || {}
//     const currentWidget = this.props.widget || {}

//     if (widget.id !== currentWidget.id && type === 'edit') {
//       this.getDetail(nextProps)
//     }
//   }

//   private getDetail = (props) => {
//     const { widget } = props
//     this.setState({
//       adhocSql: widget.adhoc_sql || ''
//     })

//     this.widgetTypeChange(widget.widgetlib_id)
//       .then(() => {
//         this.bizlogicChange(widget.flatTable_id)

//         const { chartInfo } = this.state
//         const configInfo = JSON.parse(widget.config)
//         const info = {
//           id: widget.id,
//           name: widget.name,
//           desc: widget.desc,
//           create_by: widget['create_by'],
//           flatTable_id: `${widget.flatTable_id}`,
//           widgetlib_id: `${widget.widgetlib_id}`,
//           useCache: configInfo.useCache,
//           expired: configInfo.expired
//         }

//         const params = JSON.parse(widget.chart_params)

//         delete params.widgetName
//         delete params.widgetType

//         const formValues = {...info, ...this.encodeFieldsName(chartInfo, params)}

//         if (widget.config) {
//           const config = JSON.parse(widget.config)
//           // FIXME 前期误将 update_params 和 update_fields 字段 stringify 后存入数据库，此处暂时做判断避免问题，保存时不再 stringify，下个大版本后删除判断语句
//           const updateParams = config['update_params']
//             ? typeof config['update_params'] === 'string'
//               ? JSON.parse(config['update_params'])
//               : config['update_params']
//             : []
//           const updateFields = config['update_fields']
//             ? typeof config['update_fields'] === 'string'
//               ? JSON.parse(config['update_fields'])
//               : config['update_fields']
//             : []
//           this.setState({
//             updateParams,
//             updateFields,
//             updateConfig: updateFields
//           })
//         }

//         this.setState({
//           chartParams: params,
//           // FIXME
//           queryParams: JSON.parse(widget.query_params)
//         })

//         this.widgetForm.props.form.setFieldsValue(formValues)
//       })
//   }

//   private getChartParamsFromChartInfo = (chartInfo) =>
//     chartInfo.params.reduce((params, section) => {
//       section.items.forEach((i) => {
//         if (i.default) {
//           params[i.name] = i.default
//         } else {
//           switch (i.component) {
//             case 'multiSelect':
//             case 'checkbox':
//               params[i.name] = []
//               break
//             case 'inputnumber':
//               params[i.name] = 0
//               break
//             default:
//               params[i.name] = void 0
//               break
//           }
//         }
//       })
//       return params
//     }, {})

//   private encodeFieldsName = (chartInfo, params) =>
//     Object.entries(params).reduce((p, arr) => {
//       p[`${chartInfo.name}${DEFAULT_SPLITER}${arr[0]}`] = arr[1]
//       return p
//     }, {})

//   private decodeFieldsName = (formValues) =>
//     Object.entries(formValues).reduce((params, arr) => {
//       params[arr[0].split(DEFAULT_SPLITER)[1]] = arr[1]
//       return params
//     }, {})

//   private getBizdatas = (id, adhoc, queryParams?: any) => {
//     let sql
//     let sorts
//     let offset
//     let limit

//     if (adhoc) {
//       sql = {}
//       sql.adHoc = adhoc
//     }

//     if (queryParams) {
//       const { filters, pagination } = queryParams
//       sql = sql || {}
//       sql.manualFilters = filters
//       sorts = pagination.sorts
//       offset = pagination.offset
//       limit = pagination.limit
//     }

//     this.props.onLoadBizdatas(id, sql, sorts, offset, limit)
//   }

//   private bizlogicChange = (val) => {
//     const sqlTemplate = this.props.bizlogics.find((bl) => bl.id === Number(val))
//     const queryArr = sqlTemplate.sql_tmpl.match(/query@var\s\$\w+\$/g) || []
//     const updateArr = sqlTemplate.update_sql ? (sqlTemplate.update_sql.match(/update@var\s\$\w+\$/g) || []) : []
//     this.setState({
//       currentBizlogicId: sqlTemplate.id,
//       queryInfo: queryArr.map((q) => q.substring(q.indexOf('$') + 1, q.lastIndexOf('$'))),
//       updateInfo: updateArr.map((q) => q.substring(q.indexOf('$') + 1, q.lastIndexOf('$'))),
//       queryParams: []
//     })
//     this.widgetForm.props.form.setFieldsValue({
//       richTextContent: '',
//       richTextEdited: ''
//     })

//     this.getBizdatas(val, this.state.adhocSql)
//   }

//   private adhocSqlQuery = () => {
//     const flatTableId = this.widgetForm.props.form.getFieldValue('flatTable_id')
//     if (flatTableId) {
//       this.getBizdatas(flatTableId, this.state.adhocSql)
//     }
//   }

//   private widgetTypeChange = (val) =>
//     new Promise((resolve) => {
//       const chartInfo = this.props.widgetlibs.find((wl) => wl.id === Number(val))
//       this.setState({
//         chartInfo,
//         chartParams: this.getChartParamsFromChartInfo(chartInfo)
//       }, () => {
//         resolve()
//       })
//     })

//   private formItemChange = (field) => (val) => {
//     this.setState({
//       chartParams: {
//         ...this.state.chartParams,
//         [field]: val
//       }
//     })
//   }

//   private formInputItemChange = (field) => (e) => {
//     this.setState({
//       chartParams: {
//         ...this.state.chartParams,
//         [field]: e.target.value
//       }
//     })
//   }

//   private saveWidget = () => new Promise((resolve, reject) => {
//     this.widgetForm.props.form.validateFieldsAndScroll((err, values) => {
//       if (!err) {
//         const { chartInfo, queryParams, adhocSql, updateParams, updateFields } = this.state

//         const id = values.id
//         const name = values.name
//         const desc = values.desc
//         const widgetlibId = Number(values.widgetlib_id)
//         const flatTableId = Number(values.flatTable_id)
//         const useCache = values.useCache
//         const expired = values.expired
//         const createBy = Number(values.create_by)

//         delete values.id
//         delete values.name
//         delete values.create_by
//         delete values.desc
//         delete values.widgetlib_id
//         delete values.flatTable_id
//         delete values.useCache
//         delete values.expired

//         values = this.decodeFieldsName(values)

//         const widget = {
//           name,
//           desc,
//           adhoc_sql: adhocSql,
//           publish: true,
//           trigger_type: '',
//           widgetlib_id: widgetlibId,
//           chart_params: JSON.stringify({
//             ...values,
//             widgetName: chartInfo.title,
//             widgetType: chartInfo.name
//           }),
//           query_params: JSON.stringify(queryParams),
//           trigger_params: '',
//           flatTable_id: flatTableId,
//           config: JSON.stringify({
//             useCache,
//             expired,
//             update_params: updateParams,
//             update_fields: updateFields
//           })
//         }

//         if (this.props.type === 'edit') {
//           widget['id'] = id
//           widget['create_by'] = createBy
//           this.props.onEditWidget(widget, () => {
//             resolve()
//             this.props.onAfterSave()
//           })
//         } else {
//           this.props.onAddWidget(widget, () => {
//             resolve()
//             this.props.onAfterSave()
//           })
//         }
//       } else {
//         reject()
//       }
//     })
//   })

//   private resetWorkbench = () => {
//     this.widgetForm.props.form.resetFields()
//     this.props.onClearBizdatas()
//     this.setState({
//       chartInfo: false,
//       chartParams: {},
//       queryInfo: false,
//       updateInfo: false,
//       queryParams: [],
//       updateParams: [],
//       adhocSql: ''
//     })
//   }

//   private adhocSqlInputChange = (event) => {
//     this.setState({
//       adhocSql: event.target.value
//     })
//   }

//   private formSegmentControlChange = (e) => {
//     this.setState({
//       formSegmentControlActiveIndex: e.target.value === '1' ? 0 : 1
//     })
//   }

//   private saveControl = (control) => {
//     const { queryParams } = this.state
//     const itemIndex = queryParams.findIndex((q) => q.id === control.id)

//     if (itemIndex >= 0) {
//       queryParams.splice(itemIndex, 1, control)

//       this.setState({
//         queryParams: queryParams.slice()
//       })
//     } else {
//       this.setState({
//         queryParams: queryParams.concat(control)
//       })
//     }
//   }

//   private deleteControl = (id) => () => {
//     this.setState({
//       queryParams: this.state.queryParams.filter((q) => q.id !== id)
//     })
//   }
//   private deleteMarkControl = (id) => () => {
//     this.setState({
//       updateParams: this.state.updateParams.filter((u) => u.id !== id)
//     })
//   }
//   private showVariableConfigTable = (id) => () => {
//     this.setState({
//       variableConfigModalVisible: true,
//       variableConfigControl: id
//         ? this.state.queryParams.find((q) => q.id === id)
//         : {}
//     })
//   }

//   private hideVariableConfigTable = () => {
//     this.setState({
//       variableConfigModalVisible: false,
//       variableConfigControl: {}
//     })
//   }
//   private resetVariableConfigForm = () => {
//     this.variableConfigForm.resetForm()
//   }
//   private showMarkConfigTable = (id) => () => {
//     const {updateParams} = this.state
//     const currentParams = updateParams.find((u) => u.id === id)
//     this.setState({
//       markConfigModalVisible: true
//     }, () => this.markConfigForm.setFieldsValue(currentParams))
//   }
//   private hideMarkConfigTable = () => {
//     this.setState({
//       markConfigModalVisible: false
//     })
//   }
//   private resetMarkConfigForm = () => {
//     this.markConfigForm.resetFields()
//   }
//   private markFieldsOptionsChange = (type, e) => {
//     const {updateFields} = this.state
//     const newFields = { ...updateFields }
//     newFields[type] = e
//     this.setState({
//       updateFields: newFields
//     })
//   }
//   private saveMarkConfig = () => {
//     const { updateParams } = this.state
//     this.markConfigForm.validateFieldsAndScroll((err, values) => {
//       if (!err) {
//         const id = values.id
//         const isHasNoRecord = updateParams.every((up) => up.id !== id)
//         let update = []
//         if (isHasNoRecord) {
//           update = updateParams.concat({
//             id: uuid(8, 16),
//             text: values['text'],
//             value: values['value']
//           })
//         } else {
//           update = updateParams.map((up) => {
//             if (up.id === id) {
//               return {
//                 id: up.id,
//                 text: values['text'],
//                 value: values['value']
//               }
//             } else {
//               return up
//             }
//           })
//         }
//         this.setState({
//           updateParams: update
//         }, this.hideMarkConfigTable)
//       }
//     })
//   }

//   private textEditorChange = (content) => {
//     const { chartInfo } = this.state

//     const deleteHtml = content.replace(/<\/?.+?>/g, '')
//     const deleteSpace = deleteHtml.replace(/ /g, '')
//     this.widgetForm.props.form.setFieldsValue(this.encodeFieldsName(chartInfo, {
//       richTextContent: deleteSpace,
//       richTextEdited: content
//     }))
//     const richTextObj = {
//       richTextContent: deleteSpace,
//       richTextEdited: content
//     }
//     this.setState({
//       chartParams: richTextObj
//     })
//   }

//   public render () {
//     const {
//       type,
//       bizlogics,
//       widgetlibs,
//       bizdatas,
//       bizdatasLoading
//     } = this.props
//     const {
//       chartInfo,
//       queryInfo,
//       updateInfo,
//       updateConfig,
//       chartParams,
//       queryParams,
//       updateParams,
//       updateFields,
//       currentBizlogicId,
//       formSegmentControlActiveIndex,
//       adhocSql,
//       variableConfigModalVisible,
//       markConfigModalVisible,
//       variableConfigControl
//     } = this.state

//     return (
//       <div className={`${styles.workbench} no-item-margin`}>
//         <WidgetForm
//           type={type}
//           bizlogics={bizlogics}
//           widgetlibs={widgetlibs}
//           dataColumns={bizdatas ? bizdatas.keys : []}
//           chartInfo={chartInfo}
//           queryInfo={queryInfo}
//           updateInfo={updateInfo}
//           updateConfig={updateConfig}
//           queryParams={queryParams}
//           updateParams={updateParams}
//           updateFields={updateFields}
//           segmentControlActiveIndex={formSegmentControlActiveIndex}
//           onBizlogicChange={this.bizlogicChange}
//           onWidgetTypeChange={this.widgetTypeChange}
//           onFormItemChange={this.formItemChange}
//           onMarkFieldsOptionsChange={this.markFieldsOptionsChange}
//           onFormInputItemChange={this.formInputItemChange}
//           onSegmentControlChange={this.formSegmentControlChange}
//           onShowVariableConfigTable={this.showVariableConfigTable}
//           onShowMarkConfigTable={this.showMarkConfigTable}
//           onDeleteControl={this.deleteControl}
//           onDeleteMarkControl={this.deleteMarkControl}
//           wrappedComponentRef={this.refHandlers.widgetForm}
//         />
//         <SplitView
//           data={bizdatas}
//           chartInfo={chartInfo}
//           updateConfig={updateConfig}
//           chartParams={chartParams}
//           updateParams={updateParams}
//           currentBizlogicId={currentBizlogicId}
//           tableLoading={bizdatasLoading}
//           adhocSql={adhocSql}
//           onSaveWidget={this.saveWidget}
//           onAdhocSqlInputChange={this.adhocSqlInputChange}
//           onAdhocSqlQuery={this.adhocSqlQuery}
//           onTextEditorChange={this.textEditorChange}
//         />
//         <Modal
//           title="QUERY变量配置"
//           wrapClassName="ant-modal-large"
//           visible={variableConfigModalVisible}
//           onCancel={this.hideVariableConfigTable}
//           afterClose={this.resetVariableConfigForm}
//           footer={false}
//           maskClosable={false}
//         >
//           <VariableConfigForm
//             queryInfo={queryInfo}
//             control={variableConfigControl}
//             columns={bizdatas ? bizdatas.keys : []}
//             onSave={this.saveControl}
//             onClose={this.hideVariableConfigTable}
//             wrappedComponentRef={this.refHandlers.variableConfigForm}
//           />
//         </Modal>
//         <Modal
//           title="UPDATE变量配置"
//           wrapClassName="ant-modal-large"
//           visible={markConfigModalVisible}
//           onCancel={this.hideMarkConfigTable}
//           afterClose={this.resetMarkConfigForm}
//           footer={false}
//           maskClosable={false}
//         >
//           <MarkConfigForm
//             onCancel={this.hideMarkConfigTable}
//             onSaveMarkConfigValue={this.saveMarkConfig}
//             ref={(f) => { this.markConfigForm = f }}
//           />
//         </Modal>
//       </div>
//     )
//   }
// }


// const mapStateToProps = createStructuredSelector({
//   bizdatas: makeSelectBizdatas(),
//   bizdatasLoading: makeSelectBizdatasLoading()
// })

// export function mapDispatchToProps (dispatch) {
//   return {
//     onLoadBizdatas: (id, sql, sorts, offset, limit) => dispatch(loadBizdatas(id, sql, sorts, offset, limit)),
//     onClearBizdatas: () => dispatch(clearBizdatas()),
//     onAddWidget: (widget, resolve) => dispatch(addWidget(widget, resolve)),
//     onEditWidget: (widget, resolve) => dispatch(editWidget(widget, resolve))
//   }
// }

// export default connect<{}, {}, IWorkbenchProps>(mapStateToProps, mapDispatchToProps, null, {withRef: true})(Workbench)
