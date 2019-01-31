import React from 'react'
import classnames from 'classnames'
import moment from 'moment'
import { FormComponentProps } from 'antd/lib/form/Form'

import Form from 'antd/lib/form'
const FormItem = Form.Item
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Checkbox from 'antd/lib/checkbox'
import Select from 'antd/lib/select'
import Radio from 'antd/lib/radio'
const Option = Select.Option
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
import Switch from 'antd/lib/switch'

const utilStyles = require('../../assets/less/util.less')
const styles = require('./filter.less')

import { prefixItem, prefixView, prefixOther } from './constants'
import { OperatorTypes } from 'utils/operatorTypes'
import { FilterTypeList, FilterTypesLocale, FilterTypesViewSetting, FilterTypesOperatorSetting, FilterTypes } from './filterTypes'

import { IModel, IFilterItem, IModelItem, renderDate } from './'
import DatePickerFormats, { DatePickerFormatsLocale, DatePickerDefaultValuesLocales, DatePickerDefaultValues } from './datePickerFormats'

interface IFilterModelItem extends IModelItem {
  name: string
}

interface IFilterFormProps {
  form: any
  views: any[]
  widgets: any[]
  items: any[]
  filterItem: IFilterItem
  onFilterTypeChange: (key: string, filterType: FilterTypes) => void
  onFilterItemSave: (filterItem) => void
  onFilterItemNameChange: (key: string, name: string) => void
  onFilterMultipleSelectChange: (key: string, multiple: boolean) => void
  onFilterDateFormatChange: (key: string, dateFormat: DatePickerFormats) => void
  onPreviewControl: (filterItem: IFilterItem) => void
}

interface IFilterFormStates {
  usedViews: {
    [viewId: number]: {
      id: number
      name: string
      description: string
      model: [{
        key: string
        visualType: string
        sqlType: string
      }]
      variables: string[]
    }

  }
  mappingViewItems: object
  needSetView: boolean
  needSetParentModel: boolean
  showDefaultValue: boolean
  modelItems: IFilterModelItem[]
  modelOrVariable: object
  availableOperatorTypes: OperatorTypes[]
  checkAll: boolean
}

export class FilterForm extends React.Component<IFilterFormProps & FormComponentProps, IFilterFormStates> {

  constructor (props) {
    super(props)
    this.state = {
      usedViews: {},
      mappingViewItems: {},
      needSetView: false,
      needSetParentModel: false,
      showDefaultValue: false,
      modelItems: [],
      modelOrVariable: {},
      availableOperatorTypes: [],
      checkAll: false
    }
  }

  public componentWillMount () {
    const { form, views, widgets, items } = this.props
    if (views && widgets && items) {
      this.initFormSetting(views, widgets, items)
    }
    this.initCheckAll(form, items)
  }

  public componentWillReceiveProps (nextProps: IFilterFormProps) {
    const { form, views, widgets, items, filterItem } = nextProps

    if (
      views && widgets && items
        && views !== this.props.views
        && widgets !== this.props.widgets
        && items !== this.props.items
    ) {
      this.initFormSetting(views, widgets, items)
    }

    const previousFilterItem = this.props.filterItem
    if (filterItem && filterItem !== previousFilterItem) {
      if (previousFilterItem && previousFilterItem.key) {
        this.saveFilterItem()
      }
    }

    this.initCheckAll(form, items)
  }

  private initCheckAll = (form, items) => {
    this.setState({
      checkAll: items.every((item) => form.getFieldValue(`${prefixItem}${item.id}`))
    })
  }

  private saveFilterItem = (resolve?: (err?) => void) => {
    const { form, onFilterItemSave, views } = this.props
    const { usedViews, mappingViewItems } = this.state

    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        if (resolve) {
          resolve(err)
        }
        return
      }

      const filterItem = {
        relatedViews: {}
      }

      Object.keys(fieldsValue)
        .filter((name) => fieldsValue[name] && name.indexOf(prefixView) >= 0)
        .forEach((name) => {
          const val = fieldsValue[name]
          const viewId = +name.substr(prefixView.length)
          const isVariable = !!fieldsValue[prefixOther + viewId]
          const sqlType = isVariable ? undefined : usedViews[viewId].model.find((m) => m.key === val).sqlType
          filterItem.relatedViews[viewId] = {
            key: val,
            name: val,
            isVariable,
            sqlType,
            items: mappingViewItems[viewId].filter((item) => fieldsValue[prefixItem + item.id]).map((item) => item.id)
          }
        })

      Object.keys(fieldsValue)
        .filter((name) => [prefixItem, prefixView, prefixOther].every((prefix) => name.indexOf(prefix) < 0))
        .forEach((name) => {
          if (name === 'defaultValue' && [FilterTypes.Date, FilterTypes.DateRange].includes(fieldsValue.type)) {
            filterItem[name] = fieldsValue[name] && fieldsValue[name].format(fieldsValue.dateFormat)
          } else {
            filterItem[name] = fieldsValue[name]
          }
        })

      // console.log('saved... ', JSON.parse(JSON.stringify(filterItem)))

      onFilterItemSave(filterItem)
      if (resolve) {
        resolve()
      }
    })
  }

  public setFieldsValue = (filterItem: IFilterItem) => {
    const { views, widgets, items } = this.props
    const { type, multiple, fromView, fromModel, dynamicDefaultValue, defaultValue } = filterItem
    const fieldsValue = {
      ...filterItem,
      defaultValue: [FilterTypes.Date, FilterTypes.DateRange].includes(type) && defaultValue
        ? moment(defaultValue)
        : defaultValue,
      relatedViews: undefined
    }
    if (fromView) {
      this.onFromViewChange(fromView, fromModel)
    }
    const { relatedViews } = filterItem
    const modelOrVariable = {}
    views.forEach((view) => {
      const viewId = view.id
      if (relatedViews[viewId]) {
        fieldsValue[`${prefixView}${viewId}`] = relatedViews[viewId].key
        fieldsValue[`${prefixOther}${viewId}`] = relatedViews[viewId].isVariable
      } else {
        const model = JSON.parse(view.model)
        const defaultKey = Object.keys(model)[0]
        fieldsValue[`${prefixView}${viewId}`] = defaultKey
        fieldsValue[`${prefixOther}${viewId}`] = false
      }
    })
    items.forEach((item) => {
      const itemId = item.id
      const widget = widgets.find((w) => w.id === item.widgetId)
      const { viewId } = widget
      if (relatedViews[viewId]) {
        fieldsValue[`${prefixItem}${itemId}`] = relatedViews[viewId].items.indexOf(itemId) >= 0
        modelOrVariable[viewId] = relatedViews[viewId].isVariable
      } else {
        fieldsValue[`${prefixItem}${itemId}`] = false
        modelOrVariable[viewId] = false
      }
    })
    this.setState({
      needSetView: !!FilterTypesViewSetting[type],
      needSetParentModel: type === FilterTypes.TreeSelect,
      availableOperatorTypes: this.getOperatorType(type, multiple),
      showDefaultValue: dynamicDefaultValue === DatePickerDefaultValues.Custom,
      modelOrVariable
    }, () => {
      const { form } = this.props
      form.setFieldsValue(fieldsValue)
    })
  }

  private getOperatorType = (type: FilterTypes, multiple: boolean): OperatorTypes[] => {
    const operatorTypes = FilterTypesOperatorSetting[type]
    if (type === FilterTypes.Select) {
      return multiple ? operatorTypes['multiple'] : operatorTypes['normal']
    }
    return operatorTypes as OperatorTypes[]
  }

  private initFormSetting (views, widgets, items) {
    const varReg = /query@var\s+\$(\w+)\$/g
    const usedViews = {}
    const mappingViewItems = {}
    items.forEach((item) => {
      const { widgetId } = item
      const widget = widgets.find((w) => w.id === widgetId)
      const { viewId } = widget
      if (!usedViews[viewId]) {
        const view = views.find((v) => v.id === viewId)
        const { id, name, description, model, sql } = view
        const modelObj = JSON.parse(model) as IModel
        usedViews[viewId] = {
          id,
          name,
          description,
          model: Object.entries(modelObj).map(([key, { sqlType, visualType }]) => ({
            key,
            visualType,
            sqlType
          })),
          variables: (sql.match(varReg) || []).map((qv) => qv.substring(qv.indexOf('$') + 1, qv.length - 1))
        }
      }
      if (!mappingViewItems[viewId]) {
        mappingViewItems[viewId] = []
      }
      mappingViewItems[viewId].push({
        id: item.id,
        name: widget.name
      })
    })
    this.setState({
      usedViews,
      mappingViewItems
    })
  }

  private filterItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { onFilterItemNameChange, filterItem } = this.props
    const name = e.target.value
    onFilterItemNameChange(filterItem.key, name)
  }

  private modelOrVariableChange = (viewId) => (e) => {
    const { modelOrVariable, usedViews } = this.state
    const { variables, model } = usedViews[viewId]
    const isVariable = e.target.value
    const options = isVariable ? variables : model
    const newVal = options.length <= 0 ? null : (isVariable ? variables[0] : model[0].key)
    this.setState({
      modelOrVariable: {
        ...modelOrVariable,
        [viewId]: isVariable
      }
    }, () => {
      this.props.form.setFieldsValue({ [`${prefixView}${viewId}`]: newVal })
    })
  }

  private renderConfigItem (usedViews, mappingViewItems) {
    const { form } = this.props
    const { modelOrVariable } = this.state
    const { getFieldDecorator } = form

    // const view = usedViews[viewId]
    // const items = mappingViewItems[viewId]

    let widgetCheckboxes = []
    let viewVariableSelects = []

    Object.entries(usedViews).forEach(([viewId, view]: [string, any]) => {
      widgetCheckboxes = widgetCheckboxes.concat(
        mappingViewItems[viewId].map((item) => (
          <FormItem className={styles.item} key={item.id}>
            {getFieldDecorator(`${prefixItem}${item.id}`, {
              valuePropName: 'checked'
            })(
              <Checkbox>{item.name}</Checkbox>
            )}
          </FormItem>
        ))
      )
      viewVariableSelects = viewVariableSelects.concat(
        <Row key={viewId}>
          <Col span={24}>
            <h3>{`${view.name}：`}</h3>
          </Col>
          <Col span={7} offset={2}>
            <FormItem>
              {getFieldDecorator(`${prefixOther}${view.id}`, {
                initialValue: false
              })(
                <RadioGroup size="small" onChange={this.modelOrVariableChange(viewId)}>
                  <RadioButton value={false}>字段</RadioButton>
                  <RadioButton value={true}>变量</RadioButton>
                </RadioGroup>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem>
              {getFieldDecorator(`${prefixView}${view.id}`)(
                <Select size="small" dropdownMatchSelectWidth={false}>
                  {
                    modelOrVariable[viewId] ? (
                      view.variables.map((p) => (
                        <Option key={p} value={p}>{p}</Option>
                      ))
                    ) : (
                      view.model.map((m) => (
                        <Option key={m.key} value={m.key}>{m.key}</Option>
                      ))
                    )
                  }
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      )
    })

    return (
      <Row className={styles.configItem}>
        <Col className={styles.itemList}>
          {widgetCheckboxes}
        </Col>
        <Col className={styles.viewSet}>
          {viewVariableSelects}
        </Col>
      </Row>
    )
  }

  private onFromViewChange = (viewId, fromModel) => {
    const { views } = this.props
    const view = views.find((v) => v.id === +viewId)
    const modelItems = Object.entries(JSON.parse(view.model))
      .filter(([k, v]: [string, IModelItem]) => v.modelType === 'category')
      .map(([k, v]: [string, IModelItem]) => ({
        name: k,
        ...v
      }))
    this.setState({
      modelItems
    }, () => {
      const { form } = this.props
      if (!fromModel || modelItems.findIndex((item) => item.name === fromModel) < 0) {
        const defaultItem = modelItems[0]
        form.setFieldsValue({
          fromModel: defaultItem.name,
          fromText: defaultItem.name,
          fromSqlType: defaultItem.sqlType,
          fromParent: null
          // fromChild: null
        })
      }
    })
  }

  private onFromModelChange = (fromModel) => {
    const modelItem = this.state.modelItems.find((item) => item.name === fromModel)
    this.props.form.setFieldsValue({
      fromModel,
      fromText: fromModel,
      fromSqlType: modelItem.sqlType
    })
  }

  private filterTypeChange = (val) => {
    const { filterItem, onFilterTypeChange } = this.props
    onFilterTypeChange(filterItem.key, val)
    this.setState({
      needSetView: FilterTypesViewSetting[val],
      needSetParentModel: val === FilterTypes.TreeSelect,
      availableOperatorTypes: this.getOperatorType(val, filterItem.multiple)
    }, () => {
      const { form } = this.props
      const { availableOperatorTypes } = this.state
      const operator = form.getFieldValue('operator')
      if (availableOperatorTypes.indexOf(operator) < 0) {
        form.setFieldsValue({ operator: availableOperatorTypes[0] })
      }
      if (val === FilterTypes.Date || val === FilterTypes.DateRange) {
        form.setFieldsValue({ dateFormat: DatePickerFormats.Date })
      }
      if (val === FilterTypes.Select) {
        form.setFieldsValue({ multiple: filterItem.multiple || false })
      }
    })
  }

  private filterMultipleSelectChange = (e) => {
    const multiple = e.target.checked
    const { filterItem,  onFilterMultipleSelectChange} = this.props
    onFilterMultipleSelectChange(filterItem.key, multiple)
    this.setState({
      availableOperatorTypes: this.getOperatorType(filterItem.type, multiple)
    }, () => {
      const { form } = this.props
      const { availableOperatorTypes } = this.state
      const operator = form.getFieldValue('operator')
      if (availableOperatorTypes.indexOf(operator) < 0) {
        form.setFieldsValue({ operator: availableOperatorTypes[0] })
      }
    })
  }

  private filterDateFormatChange = (val) => {
    const { filterItem,  onFilterDateFormatChange} = this.props
    onFilterDateFormatChange(filterItem.key, val)
  }

  private toggleCheckAll = () => {
    const { form, items } = this.props
    const { checkAll } = this.state
    form.setFieldsValue(items.reduce((values, item) => {
      values[`${prefixItem}${item.id}`] = !checkAll
      return values
    }, {}))
  }

  private changeDefaultValueVisible = (val) => {
    this.setState({
      showDefaultValue: val === DatePickerDefaultValues.Custom
    })
  }

  private renderDefaultValueComponent = () => {
    const { form, filterItem } = this.props
    const { showDefaultValue } = this.state
    const { getFieldDecorator } = form
    const { type } = filterItem

    let dynamicDefaultValueOptions
    let container

    switch (type) {
      case FilterTypes.Date:
        dynamicDefaultValueOptions = Object.entries(DatePickerDefaultValuesLocales)
          .map(([value, label]) => ({ label, value }))
        container = (
          <>
            <Col span={6}>
              <FormItem label="默认值">
                {getFieldDecorator('dynamicDefaultValue', {})(
                  <Select
                    size="small"
                    placeholder="默认值"
                    allowClear
                    onChange={this.changeDefaultValueVisible}
                  >
                    {
                      dynamicDefaultValueOptions.map((d) => (
                        <Option key={d.value} value={d.value}>{d.label}</Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={6} className={classnames({[utilStyles.hide]: !showDefaultValue})}>
              <FormItem label=" " colon={false}>
                {getFieldDecorator('defaultValue', {})(
                  renderDate(filterItem, () => void 0, {size: 'small'})
                )}
              </FormItem>
            </Col>
          </>
        )
        break
    }

    return container
  }

  private renderConfigForm (usedViews, mappingViewItems) {
    const { form, filterItem, views } = this.props
    const { getFieldDecorator } = form
    const {
      needSetView,
      needSetParentModel,
      modelItems,
      availableOperatorTypes,
      checkAll
    } = this.state

    let filterTypeRelatedInput = null
    if (filterItem) {
      switch (filterItem.type) {
        case FilterTypes.Date:
        case FilterTypes.DateRange:
          filterTypeRelatedInput = (
            <Col span={6}>
              <FormItem label="日期格式">
                {getFieldDecorator('dateFormat', {})(
                  <Select size="small" onChange={this.filterDateFormatChange}>
                    {
                      Object.entries(DatePickerFormatsLocale).map(([format, title]) => (
                        <Option key={title} value={format}>{title}</Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
          )
          break
        case FilterTypes.Select:
          filterTypeRelatedInput = (
            <Col span={6}>
              <FormItem label="功能">
                {getFieldDecorator('multiple', {
                  valuePropName: 'checked'
                })(
                  <Checkbox onChange={this.filterMultipleSelectChange}>多选</Checkbox>
                )}
              </FormItem>
            </Col>
          )
        default:
          break
      }
    }

    return (
      <Form className={styles.filterForm}>
        <div className={styles.controlConfig}>
          <div className={styles.title}>
            <h2>筛选控件配置</h2>
          </div>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator('key', {})(<Input />)}
              </FormItem>
              <FormItem label="名称">
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: '不能为空'
                  }]
                })(
                  <Input size="small" onChange={this.filterItemNameChange} placeholder="筛选项名称" />
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="类型">
                {getFieldDecorator('type', {
                  rules: [{
                    required: true,
                    message: '不能为空'
                  }]
                })(
                  <Select size="small" onChange={this.filterTypeChange}>
                    {
                      FilterTypeList.map((filterType) => (
                        <Option key={filterType} value={filterType}>{FilterTypesLocale[filterType]}</Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
            {
              availableOperatorTypes.length <= 0 ? null : (
                <Col span={6}>
                    <FormItem label="对应关系">
                      {getFieldDecorator('operator', {
                        rules: [{
                          required: true,
                          message: '不能为空'
                        }]
                      })(
                        <Select size="small">
                          {
                            availableOperatorTypes.map((operatorType) => (
                              <Option key={operatorType} value={operatorType}>{operatorType}</Option>
                            ))
                          }
                        </Select>
                      )}
                    </FormItem>
                </Col>
              )
            }
            {filterTypeRelatedInput}
          </Row>
          <Row gutter={8}>
            {
              !needSetView ? null : (
                <>
                  <Col span={6}>
                    <FormItem label="来源 View">
                      {getFieldDecorator('fromView', {
                        rules: [{
                          required: true,
                          message: '不能为空'
                        }]
                      })(
                        <Select size="small" dropdownMatchSelectWidth={false} onChange={this.onFromViewChange}>
                          {
                            views.map((view) => (
                              <Option key={view.id} value={view.id.toString()}>{view.name}</Option>
                            ))
                          }
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label="值字段">
                      {getFieldDecorator('fromModel', {
                        rules: [{
                          required: true,
                          message: '不能为空'
                        }]
                      })(
                        <Select size="small" dropdownMatchSelectWidth={false} onChange={this.onFromModelChange}>
                          {
                            modelItems.map((item) => (
                              <Option key={item.name} value={item.name}>{item.name}</Option>
                            ))
                          }
                        </Select>
                      )}
                    </FormItem>
                    <FormItem className={utilStyles.hide}>
                      {getFieldDecorator('fromSqlType', {})(
                        <Input />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label="文本字段">
                      {getFieldDecorator('fromText', {
                        rules: [{
                          required: true,
                          message: '不能为空'
                        }]
                      })(
                        <Select size="small" dropdownMatchSelectWidth={false}>
                          {
                            modelItems.map((item) => (
                              <Option key={item.name} value={item.name}>{item.name}</Option>
                            ))
                          }
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  {
                    !needSetParentModel ? null : (
                      <>
                        {/* <Col span={6}>
                          <FormItem label="子级字段">
                            {getFieldDecorator('fromChild', {
                              rules: [{
                                required: true,
                                message: '不能为空'
                              }, {
                                validator: (_, value: string, callback) => {
                                  const fromParent = this.props.form.getFieldValue('fromParent')
                                  value === fromParent ? callback('子级字段不能与父级字段相同') : callback()
                                }
                              }]
                            })(
                              <Select size="small">
                                {
                                  modelItems.map((item) => (
                                    <Option key={item.name} value={item.name}>{item.name}</Option>
                                  ))
                                }
                              </Select>
                            )}
                          </FormItem>
                        </Col> */}
                        <Col span={6}>
                          <FormItem label="父级字段">
                            {getFieldDecorator('fromParent', {
                              rules: [{
                                required: true,
                                message: '不能为空'
                              }, {
                                // validator: (_, value: string, callback) => {
                                //   const fromChild = this.props.form.getFieldValue('fromChild')
                                //   value === fromChild ? callback('父级字段不能与子级字段相同') : callback()
                                // }
                              }]
                            })(
                              <Select size="small" dropdownMatchSelectWidth={false}>
                                {
                                  modelItems.map((item) => (
                                    <Option key={item.name} value={item.name}>{item.name}</Option>
                                  ))
                                }
                              </Select>
                            )}
                          </FormItem>
                        </Col>
                      </>
                    )
                  }
                </>
              )
            }
          </Row>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem label="宽度">
                {getFieldDecorator('width', {})(
                  <Select size="small">
                    <Option value={0}>自动适应</Option>
                    <Option value={24}>100%</Option>
                    <Option value={12}>50%</Option>
                    <Option value={8}>33.33% (1/3)</Option>
                    <Option value={6}>25%</Option>
                    <Option value={4}>16.67% (1/6)</Option>
                    <Option value={3}>12.5% (1/8)</Option>
                    <Option value={2}>8.33% (1/12)</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            {this.renderDefaultValueComponent()}
          </Row>
        </div>
        <div className={styles.widgetConfig}>
          <div className={`${styles.title} ${styles.widgetConfigTitle}`}>
            <h2>
              关联图表
              <Checkbox
                className={styles.checkAll}
                checked={checkAll}
                onChange={this.toggleCheckAll}
              >
                全选
              </Checkbox>
            </h2>
            <h2>参与筛选的字段或变量</h2>
          </div>
          {this.renderConfigItem(usedViews, mappingViewItems)}
        </div>
      </Form>
    )
  }

  public render () {
    const { views, widgets, items } = this.props
    if (views && widgets && items) {
      const { usedViews, mappingViewItems } = this.state
      return this.renderConfigForm(usedViews, mappingViewItems)
    }
    return null
  }
}

export default Form.create<IFilterFormProps>({
  onValuesChange: (props: IFilterFormProps, changedValues, allValues) => {
    // const changedKeys = ['type', 'name', 'fromModel', 'fromText', 'fromParent', 'fromChild']
    const changedKeys = ['type', 'name', 'fromModel', 'fromText', 'fromParent']
    const refreshPreview = Object.keys(changedValues).some((key) => changedKeys.includes(key))
    if (!refreshPreview) { return }
    const { onPreviewControl } = props
    onPreviewControl(allValues as IFilterItem)
  }
})(FilterForm)
