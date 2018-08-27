import * as React from 'react'
import { FormComponentProps } from 'antd/lib/form/Form'

const Form = require('antd/lib/form')
const FormItem = Form.Item
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Checkbox = require('antd/lib/checkbox')
const Select = require('antd/lib/select')
const Option = Select.Option

const utilStyles = require('../../../../assets/less/util.less')
const styles = require('./filter.less')

import { spliter, prefixItem, prefixView } from './constants'
import { FilterTypeList, FilterTypesLocale, FilterTypesViewSetting } from './filterTypes'

interface IFilterFormProps {
  views: any[]
  widgets: any[]
  items: any[]
  filterItem: any
  onFilterTypeChange: () => void
  onFilterItemSave: (filterItem) => void
  onFilterItemNameChange: (key: string, name: string) => void
  onGetPreviewData: (viewId: number, fieldName: string, filterKey: string) => void
}

interface IFilterFormStates {
  usedViews: object
  mappingViewItems: object
  needSetView: boolean
  fieldList: any[]
}

export class FilterForm extends React.Component<IFilterFormProps  & FormComponentProps, IFilterFormStates> {

  constructor (props) {
    super(props)
    this.state = {
      usedViews: {},
      mappingViewItems: {},
      needSetView: false,
      fieldList: []
    }
  }

  public componentWillReceiveProps (nextProps: IFilterFormProps) {
    const { filterItem } = nextProps
    const previousFilterItem = this.props.filterItem
    if (filterItem && filterItem !== previousFilterItem) {
      if (previousFilterItem.key) {
        this.saveFilterItem()
      }
    }
  }

  private saveFilterItem = () => {
    const { form, onFilterItemSave } = this.props
    const fieldsValue = form.getFieldsValue()
    const filterItem = {
      relatedItems: [],
      relatedViews: {}
    }
    Object.keys(fieldsValue).forEach((name) => {
      const val = fieldsValue[name]
      if (!val) { return }
      if (name.indexOf(prefixItem) >= 0) {
        filterItem.relatedItems.push(+name.substr(prefixItem.length))
      } else if (name.indexOf(prefixView) >= 0) {
        filterItem.relatedViews[+name.substr(prefixView.length)] = val
      } else {
        filterItem[name] = val
      }
    })

    onFilterItemSave(filterItem)
  }

  public setFieldsValue = (filterItem) => {
    const { views, items } = this.props
    const { key, name, type } = filterItem
    const fieldsValue = {
      key,
      name,
      type
    }
    const { relatedViews, relatedItems } = filterItem
    views.forEach((view) => {
      const viewId = view.id
      fieldsValue[`${prefixView}${viewId}`] = relatedViews[viewId]
    })
    items.forEach((item) => {
      const itemId = item.id
      fieldsValue[`${prefixItem}${itemId}`] = relatedItems.indexOf(itemId) >= 0
    })
    this.props.form.setFieldsValue(fieldsValue)
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
        const modelObj = JSON.parse(model)
        usedViews[viewId] = {
          id,
          name,
          description,
          fields: Object.keys(modelObj).map((key) => ({
            key,
            visualType: modelObj[key].visualType
          })) ,
          vars: (sql.match(varReg) || []).map((qv) => qv.substring(qv.indexOf('$') + 1, qv.length - 1))
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
    return {
      usedViews,
      mappingViewItems
    }
  }

  private filterItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { onFilterItemNameChange, form, filterItem } = this.props
    const name = e.target.value
    onFilterItemNameChange(filterItem.key, name)
  }

  private renderConfigItem (viewId, usedViews, mappingViewItems) {
    const { form } = this.props
    const { getFieldDecorator } = form
    const view = usedViews[viewId]
    const items = mappingViewItems[viewId]

    return (
      <Row key={viewId} className={styles.configItem}>
        <Col span={12} className={styles.itemList}>
          {
            items.map((item) => (
              <Row key={item.id}>
                <Col span={24}>
                  <FormItem
                    label={item.name}
                    labelCol={{span: 20}}
                    wrapperCol={{span: 4}}
                  >
                    {getFieldDecorator(`${prefixItem}${item.id}`, {
                      valuePropName: 'checked'
                    })(
                      <Checkbox />
                    )}
                  </FormItem>
                </Col>
              </Row>
            ))
          }
        </Col>
        <Col span={12}>
          <FormItem
            label={view.name}
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
          >
            {getFieldDecorator(`${prefixView}${view.id}`)(
              <Select>
                {
                  view.fields.map((f) => (
                    <Option key={f.key} value={f.key}>{f.key}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
    )
  }

  private onFromViewChange = (viewId) => {
    const { views } = this.props
    const view = views.find((v) => v.id === +viewId)
    const fieldList = Object.entries(JSON.parse(view.model))
      .filter(([_, desc]) => (desc as any).modelType === 'category')
      .map(([key]) => key)
    this.setState({
      fieldList
    })
  }

  private onFromFieldChange = (fieldName) => {
    const { onGetPreviewData, form, filterItem } = this.props
    const viewId = form.getFieldValue('fromView')
    onGetPreviewData(viewId, fieldName, filterItem.key)
  }

  private filterTypeChange = (val) => {
    this.setState({
      needSetView: FilterTypesViewSetting[val]
    })
    const { onFilterTypeChange } = this.props
    onFilterTypeChange()
  }

  private renderConfigForm (usedViews, mappingViewItems) {
    const { form, onFilterTypeChange, views, filterItem } = this.props
    const { getFieldDecorator } = form
    const { needSetView, fieldList } = this.state

    return (
      <Form className={styles.filterForm}>
        <Row>
          <Col span={12}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('key', {})(<Input />)}
            </FormItem>
            <FormItem
              label="名称"
              labelCol={{span: 8}}
              wrapperCol={{span: 16}}
            >
              {
                getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: '不能为空'
                  }]
                })(
                  <Input onChange={this.filterItemNameChange} placeholder="筛选项名称" />
                )
              }
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="类型"
              labelCol={{span: 8}}
              wrapperCol={{span: 16}}
            >
              {
                getFieldDecorator('type', {
                  rules: [{
                    required: true,
                    message: '不能为空'
                  }]
                })(
                  <Select
                    onChange={this.filterTypeChange}
                  >
                    {
                      FilterTypeList.map((filterType) => (
                        <Option key={filterType} value={filterType}>{FilterTypesLocale[filterType]}</Option>
                      ))
                    }
                  </Select>
                )
              }
            </FormItem>
          </Col>
        </Row>
        {
          needSetView ? (
            <Row>
              <Col span={12}>
                  <FormItem
                    label="来源 View"
                    labelCol={{span: 8}}
                    wrapperCol={{span: 16}}
                  >
                    {
                      getFieldDecorator('fromView', {
                        rules: [{
                          required: true,
                          message: '不能为空'
                        }]
                      })(
                        <Select
                          onChange={this.onFromViewChange}
                        >
                          {
                            views.map((view) => (
                              <Option key={view.id} value={view.id.toString()}>{view.name}</Option>
                            ))
                          }
                        </Select>
                      )
                    }
                  </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                    label="来源字段"
                    labelCol={{span: 8}}
                    wrapperCol={{span: 16}}
                >
                  {
                    getFieldDecorator('fromField', {
                      rules: [{
                        required: true,
                        message: '不能为空'
                      }]
                    })(
                      <Select onChange={this.onFromFieldChange}>
                        {
                          fieldList.map((fieldName) => (
                            <Option key={fieldName} value={fieldName}>{fieldName}</Option>
                          ))
                        }
                      </Select>
                    )
                  }
                </FormItem>
              </Col>
            </Row>
          ) : void 0
        }
        <Row>
          <Col span={24}>
              {
                Object.keys(usedViews).map((viewId) => this.renderConfigItem(viewId, usedViews, mappingViewItems))
              }
          </Col>
        </Row>
      </Form>
    )
  }

  public render () {
    const { views, widgets, items } = this.props
    if (views && widgets && items) {
      const { usedViews, mappingViewItems } = this.initFormSetting(views, widgets, items)
      return this.renderConfigForm(usedViews, mappingViewItems)
    }
    return null
  }
}

export default Form.create()(FilterForm)
